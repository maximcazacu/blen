import assert from "node:assert/strict";
import test from "node:test";
import { runInNewContext } from "node:vm";
import { compile, preview, template, validate } from "../src/domain/workflow.ts";
import { nextState } from "../src/domain/payment.ts";
for(const key of ["cleanup","formatting","reporting"] as const) {
  test(key+" is valid and deterministic",()=>{
    const graph=template(key,key);
    assert.deepEqual(validate(graph).issues,[]);
    assert.equal(compile(graph),compile(JSON.parse(JSON.stringify(graph))));
    assert.match(compile(graph),/function main\(workbook: ExcelScript.Workbook\)/);
    assert.equal(preview(graph).after.length,key==="cleanup"?5:6);
  });
}
test("rejects missing config, cycles, repeated nodes, incomplete flows and invalid order",()=>{
  const graph=template("cleanup","test");
  assert.equal(validate(null).issues[0].code,"schema");
  assert.equal(validate({...graph,nodes:[null]}).issues[0].code,"config");
  assert.equal(validate({...graph,nodes:[...graph.nodes,graph.nodes[0]]}).issues[0].code,"duplicate");
  assert.ok(validate({...graph,edges:[...graph.edges,{source:"step-5",target:"step-1"}]}).issues.some(issue=>issue.code==="cycle"));
  assert.ok(validate({...graph,edges:[...graph.edges,{source:"step-2",target:"step-4"}]}).issues.some(issue=>issue.code==="edge"));
  assert.ok(validate({...graph,edges:[]}).issues.some(issue=>issue.code==="connected"));
  assert.ok(validate({...graph,edges:[{source:"step-1",target:"step-2"},{source:"step-2",target:"step-4"},{source:"step-4",target:"step-5"},{source:"step-5",target:"step-3"}]}).issues.some(issue=>issue.code==="order"));
  const sheet=graph.nodes[0];
  assert.equal(sheet.type,"worksheet");
  if(sheet.type!=="worksheet")throw new Error("Expected worksheet.");
  sheet.name=" ";
  assert.throws(()=>compile(graph),/config/);
  sheet.name='Data"); throw Error("bad';
  const script=compile(graph);
  assert.ok(script.includes(JSON.stringify(sheet.name)));
});
for(const key of ["cleanup","formatting","reporting"] as const) {
  test("generated "+key+" script calls the supported workbook operations in order",()=>{
    const called:string[]=[];
    const range={
      getRowCount:()=>6,getColumnCount:()=>3,getRowIndex:()=>2,getColumnIndex:()=>4,
      removeDuplicates:(columns:number[],headers:boolean)=>{called.push("dedupe:"+columns+":"+headers);return {getRemoved:()=>1};},
      getSort:()=>({apply:(_:unknown,match:boolean,headers:boolean)=>called.push("sort:"+match+":"+headers)}),
      getRow:(index:number)=>{assert.equal(index,0);return {getFormat:()=>({getFont:()=>({setBold:()=>called.push("bold")})})};},
      getFormat:()=>({autofitColumns:()=>called.push("fit")}),
    };
    const worksheet={
      getUsedRange:(valuesOnly:boolean)=>{assert.equal(valuesOnly,true);called.push("range");return range;},
      getRangeByIndexes:(...bounds:number[])=>{assert.deepEqual(bounds,[2,4,5,3]);called.push("resize");return range;},
      addTable:(area:unknown,headers:boolean)=>{assert.equal(area,range);assert.equal(headers,true);return {setPredefinedTableStyle:()=>called.push("table")};},
    };
    const workbook={
      getWorksheet:(name:string)=>name==="Data"?worksheet:undefined,
      addWorksheet:(name:string)=>{assert.equal(name,"Summary");return {getRange:()=>({setValues:(values:unknown[][])=>{assert.equal(values[1][1],5);called.push("summary");}})};},
    };
    runInNewContext(compile(template(key,key)).replace(": ExcelScript.Workbook","")+"\nmain(workbook);",{workbook});
    assert.deepEqual(called,key==="cleanup"?["range","dedupe:0:true","resize","sort:false:true","table"]:key==="formatting"?["range","bold","fit","table"]:["range","sort:false:true","summary"]);
  });
}
test("confirmed payment wins over stale failure and refund is terminal",()=>{
  assert.equal(nextState("pending","cancelled"),"cancelled");
  assert.equal(nextState("pending","failed"),"failed");
  assert.equal(nextState("failed","paid"),"paid");
  assert.equal(nextState("paid","failed"),"paid");
  assert.equal(nextState("paid","refunded"),"refunded");
  assert.equal(nextState("refunded","paid"),"refunded");
});
