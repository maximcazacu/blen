import test from "node:test";
import assert from "node:assert/strict";
import { assess,diagnosticSchema } from "../src/domain/advisory.ts";

const baseline={
  industry:"Distribution",size:"10-49",people:"8",activity:"Distribute spare parts",
  process:"Prepare a weekly order report",departments:"Sales and finance",frequency:"weekly",
  documented:"yes",approvals:"Finance manager",tools:["excel","erp"],challenges:["duplicates","availability","reporting"],
  objectives:["centralize","reporting","ai"],budget:"undecided",timeline:"this-quarter",
};

test("ranks data and reporting with traceable reasons and keeps AI as an evaluation",()=>{
  const answers=diagnosticSchema.parse(baseline);
  const result=assess(answers);
  assert.equal(result.version,"1.0");
  assert.equal(result.recommended,"data-architecture");
  assert.deepEqual(result.areas,[
    {area:"data",signals:["duplicates","availability","centralize"]},
    {area:"reporting",signals:["reporting","reporting-goal"]},
    {area:"ai",signals:["ai-goal"]},
  ]);
  assert.deepEqual(assess({...answers,challenges:[...answers.challenges].reverse()}),result);
});

test("repeated selections cannot inflate a score and AI is never inferred from tools",()=>{
  const answers=diagnosticSchema.parse({...baseline,challenges:["entry","entry","entry","entry"],objectives:["automate"]});
  const result=assess(answers);
  assert.equal(result.recommended,"process-optimization");
  assert.deepEqual(result.areas,[{area:"automation",signals:["entry","automate","frequency"]}]);
});

test("rejects incomplete, out-of-range and unknown questionnaire values",()=>{
  for(const changes of [{people:0},{people:1.5},{tools:[]},{challenges:["unknown"]},{approvals:" "},{timeline:"now"}]){
    assert.equal(diagnosticSchema.safeParse({...baseline,...changes}).success,false);
  }
});
