import { z } from "zod";

export const operations = ["worksheet", "range", "dedupe", "sort", "table", "format", "summary"] as const;
export const version = "1.0.0";
const sheet = z.string().trim().min(1).max(31).regex(/^[^\\/?*\[\]:\x00-\x1f]+$/).refine(name => !name.startsWith("'") && !name.endsWith("'"));
const column = z.number().int().min(0).max(16383);
const id = z.string().regex(/^[a-zA-Z0-9_-]{1,70}$/);
const position = z.object({x:z.number().min(-10000).max(10000),y:z.number().min(-10000).max(10000)});
const base = {id, position};
export const nodeSchema = z.discriminatedUnion("type", [
  z.object({...base, type:z.literal("worksheet"), name:sheet}),
  z.object({...base, type:z.literal("range")}),
  z.object({...base, type:z.literal("dedupe"), column}),
  z.object({...base, type:z.literal("sort"), column, ascending:z.boolean()}),
  z.object({...base, type:z.literal("table")}),
  z.object({...base, type:z.literal("format")}),
  z.object({...base, type:z.literal("summary"), name:sheet}),
]);
export const workflowSchema = z.object({
  name:z.string().trim().min(1).max(100),
  nodes:z.array(nodeSchema).max(12),
  edges:z.array(z.object({source:id,target:id})).max(16),
});
export type Workflow = z.infer<typeof workflowSchema>;
export type Step = Workflow["nodes"][number];
export type Operation = Step["type"];
type Issue = {node?:string; code:string};
export function validate(input: unknown): {workflow?:Workflow; ordered:Step[]; issues:Issue[]} {
  const parsed = workflowSchema.safeParse(input);
  if (!parsed.success) return {ordered:[],issues:parsed.error.issues.map(issue => ({
    node: issue.path[0] === "nodes" && typeof issue.path[1] === "number" ?
      (input as Workflow).nodes[issue.path[1]]?.id : undefined,
    code: issue.path[0] === "nodes" ? "config" : "schema",
  }))};
  const workflow = parsed.data;
  const {nodes,edges} = workflow;
  const byId = new Map(nodes.map(node => [node.id,node]));
  const outgoing = new Map<string,string>();
  const incoming = new Set<string>();
  const issues:Issue[] = [];
  if (!nodes.length) issues.push({code:"empty"});
  if (byId.size !== nodes.length) issues.push({code:"duplicate"});
  for (const {source,target} of edges) {
    if (!byId.has(source) || !byId.has(target) || outgoing.has(source) || incoming.has(target)) {
      issues.push({node:target,code:"edge"});
      continue;
    }
    outgoing.set(source,target);
    incoming.add(target);
  }
  const visited = new Set<string>();
  for (const node of nodes) {
    const chain = new Set<string>();
    for (let current:string|undefined = node.id; current && !visited.has(current); current = outgoing.get(current)) {
      if (chain.has(current)) {issues.push({node:current,code:"cycle"}); break;}
      chain.add(current);
    }
    for (const member of chain) visited.add(member);
  }
  if (issues.length) return {ordered:[],issues};
  const roots = nodes.filter(node=>!incoming.has(node.id));
  const ordered:Step[] = [];
  if (roots.length === 1) {
    for (let next:Step|undefined = roots[0]; next; next = byId.get(outgoing.get(next.id) ?? "")) ordered.push(next);
  }
  if (ordered.length !== nodes.length) issues.push({code:"connected"});
  const [first,second,...rest] = ordered;
  if (first?.type !== "worksheet" || second?.type !== "range" || !rest.length) issues.push({code:"start"});
  const used = new Set<Operation>();
  for (const [index,node] of ordered.entries()) {
    if (used.has(node.type) || (used.has("table") && node.type === "dedupe") ||
        (node.type === "summary" && (index !== ordered.length - 1 ||
          (first?.type === "worksheet" && first.name.toLowerCase() === node.name.toLowerCase())))) {
      issues.push({node:node.id,code:"order"});
    }
    used.add(node.type);
  }
  return {workflow,ordered,issues};
}

export function compile(input:unknown):string {
  const {ordered,issues} = validate(input);
  if (issues.length) throw new Error(issues.map(issue=>issue.code).join(", "));
  const checks = ordered.flatMap(node => {
    if(node.type === "dedupe" || node.type === "sort") return [`if (range.getColumnCount() <= ${node.column}) throw new Error("Column index is outside the data range.");`];
    if(node.type === "summary") return [
      `const summaryName = ${JSON.stringify(node.name)};`,
      'if (workbook.getWorksheet(summaryName)) throw new Error("Summary worksheet already exists.");',
    ];
    return [];
  });
  const lines = ordered.flatMap(node => {
    switch(node.type) {
      case "worksheet": return [`const sheet = workbook.getWorksheet(${JSON.stringify(node.name)});`, 'if (!sheet) throw new Error("Source worksheet not found.");'];
      case "range": return ["let range = sheet.getUsedRange(true);", 'if (!range || range.getRowCount() < 2) throw new Error("Use a header row followed by data.");',...checks];
      case "dedupe": return [
        "const originalRows = range.getRowCount();",
        `const removed = range.removeDuplicates([${node.column}], true).getRemoved();`,
        "range = sheet.getRangeByIndexes(range.getRowIndex(), range.getColumnIndex(), originalRows - removed, range.getColumnCount());",
      ];
      case "sort": return [
        `range.getSort().apply([{ key: ${node.column}, ascending: ${node.ascending} }], false, true);`,
      ];
      case "table": return ["const table = sheet.addTable(range, true);", 'table.setPredefinedTableStyle("TableStyleMedium2");'];
      case "format": return ['range.getRow(0).getFormat().getFont().setBold(true);','range.getFormat().autofitColumns();'];
      case "summary": return [
        'workbook.addWorksheet(summaryName).getRange("A1:B2").setValues([["Metric", "Value"], ["Data rows", range.getRowCount() - 1]]);',
      ];
    }
  });
  return `// blen. compiler ${version}\nfunction main(workbook: ExcelScript.Workbook) {\n${lines.map(line=>"  "+line).join("\n")}\n}\n`;
}

const sample = [["Order","Region","Units"],["A-104","Cluj",14],["A-102","Iași",8],["A-104","Cluj",14],["A-101","Brașov",21],["A-103","București",12]];
export function preview(input:unknown) {
  const {ordered,issues} = validate(input);
  if (issues.length) throw new Error("Invalid workflow.");
  const [header,...rows] = sample;
  let after = [...rows];
  const notes:string[] = [];
  for (const node of ordered) {
    if ((node.type === "sort" || node.type === "dedupe") && node.column >= header.length) {
      notes.push("sampleColumn");
      continue;
    }
    if (node.type === "dedupe") {
      const seen = new Set<string|number>();
      after = after.filter(row=>{ const key = row[node.column]; if(seen.has(key)) return false; seen.add(key); return true; });
    }
    if (node.type === "sort") after.sort((a,b)=>{
      const left = a[node.column], right = b[node.column];
      const result = typeof left === "number" && typeof right === "number" ? left-right : String(left).localeCompare(String(right),"en");
      return node.ascending ? result : -result;
    });
    if (node.type === "table" || node.type === "format" || node.type === "summary") notes.push(node.type);
  }
  return {before:sample,after:[header,...after],notes};
}

export function newStep(type:Operation, id:string, index:number):Step {
  const base = {id,position:{x:35+(index%3)*214,y:48+Math.floor(index/3)*106}};
  if(type==="worksheet") return {...base,type,name:"Data"};
  if(type==="summary") return {...base,type,name:"Summary"};
  if(type==="dedupe") return {...base,type,column:0};
  if(type==="sort") return {...base,type,column:0,ascending:true};
  return {...base,type};
}
export const templates = {
  cleanup:["worksheet","range","dedupe","sort","table"],
  formatting:["worksheet","range","format","table"],
  reporting:["worksheet","range","sort","summary"],
} as const satisfies Record<string,readonly Operation[]>;
export type Template = keyof typeof templates;
export function template(key:Template,name:string):Workflow {
  const nodes = templates[key].map((op,index)=>newStep(op,"step-"+(index+1),index));
  return {name,nodes,edges:nodes.slice(1).map((node,index)=>({source:nodes[index].id,target:node.id}))};
}
