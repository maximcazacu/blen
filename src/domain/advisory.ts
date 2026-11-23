import { z } from "zod";

export const advisoryServices = ["process-audit","process-optimization","data-architecture","ai-readiness","systems-integration","continuous-improvement"] as const;
export const advisoryEngagements = ["discovery","architecture","implementation"] as const;
export const toolIds = ["excel","m365","sharepoint","erp","crm","sql","other","paper"] as const;
export const challengeIds = ["entry","duplicates","errors","reporting","availability","ownership","systems"] as const;
export const objectiveIds = ["accuracy","speed","centralize","automate","reporting","governance","ai"] as const;

export const diagnosticSteps = [
  z.object({industry:z.string().trim().min(2).max(100),size:z.enum(["1-9","10-49","50-249","250+"]),people:z.coerce.number().int().min(1).max(100000),activity:z.string().trim().min(5).max(350)}),
  z.object({process:z.string().trim().min(5).max(450),departments:z.string().trim().min(2).max(140),frequency:z.enum(["daily","weekly","monthly","occasional"]),documented:z.enum(["yes","partly","no"]),approvals:z.string().trim().min(2).max(140)}),
  z.object({tools:z.array(z.enum(toolIds)).min(1).max(toolIds.length)}),
  z.object({challenges:z.array(z.enum(challengeIds)).min(1).max(challengeIds.length)}),
  z.object({objectives:z.array(z.enum(objectiveIds)).min(1).max(objectiveIds.length),budget:z.enum(["undecided","under-1000","1000-5000","over-5000"]),timeline:z.enum(["exploring","this-month","this-quarter","later"])}),
] as const;

export const diagnosticSchema = z.object(Object.assign({}, ...diagnosticSteps.map(step=>step.shape)) as
  typeof diagnosticSteps[0]["shape"] & typeof diagnosticSteps[1]["shape"] & typeof diagnosticSteps[2]["shape"] &
  typeof diagnosticSteps[3]["shape"] & typeof diagnosticSteps[4]["shape"]);
export type Diagnostic = z.infer<typeof diagnosticSchema>;

export const diagnosticAreas = ["standardization","data","automation","reporting","integration","governance","ai"] as const;
export type Area = typeof diagnosticAreas[number];
export const diagnosticVersion = "1.0";
export const areaService:Record<Area,typeof advisoryServices[number]> = {
  standardization:"process-optimization", data:"data-architecture", automation:"process-optimization",
  reporting:"data-architecture", integration:"systems-integration", governance:"process-audit", ai:"ai-readiness",
};

export function assess(answers:Diagnostic) {
  const challenges=new Set(answers.challenges), objectives=new Set(answers.objectives), tools=new Set(answers.tools);
  const signals:Record<Area,string[]> = {
    standardization:[...answers.documented!=="yes"?["documentation"]:[],...challenges.has("errors")?["errors"]:[],...objectives.has("accuracy")?["accuracy"]:[]],
    data:[...challenges.has("duplicates")?["duplicates"]:[],...challenges.has("availability")?["availability"]:[],...objectives.has("centralize")?["centralize"]:[]],
    automation:[...challenges.has("entry")?["entry"]:[],...objectives.has("automate")?["automate"]:[],...challenges.has("entry")&&(answers.frequency==="daily"||answers.frequency==="weekly")?["frequency"]:[]],
    reporting:[...challenges.has("reporting")?["reporting"]:[],...objectives.has("reporting")?["reporting-goal"]:[]],
    integration:[...challenges.has("systems")?["systems"]:[],...challenges.has("systems")&&[...tools].filter(tool=>tool!=="paper").length>=2?["multiple-tools"]:[]],
    governance:[...challenges.has("ownership")?["ownership"]:[],...answers.documented!=="yes"?["documentation"]:[],...objectives.has("governance")?["governance-goal"]:[]],
    ai:objectives.has("ai")?["ai-goal"]:[],
  };
  const areas = diagnosticAreas.map(area=>({area,signals:signals[area]}))
    .filter(item=>item.signals.length>0)
    .sort((a,b)=>Number(a.area==="ai")-Number(b.area==="ai") || b.signals.length-a.signals.length);
  return {version:diagnosticVersion,areas,recommended:areas[0]?areaService[areas[0].area]:"process-audit"} as const;
}
export type Assessment = ReturnType<typeof assess>;
export const costKeys=["consulting","implementation","licenses","hosting","maintenance"] as const;
export type CostKey = typeof costKeys[number];
