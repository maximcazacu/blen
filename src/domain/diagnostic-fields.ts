import type { Copy } from "./catalog.ts";
export type Field={name:string;label:Copy;options?:Record<string,Copy>;type?:"textarea"|"number"|"checks";max?:number};
export const diagnosticGroups:{title:Copy;fields:Field[]}[]=[
  {title:["Business context","Contextul firmei"],fields:[
    {name:"industry",label:["Industry","Domeniu de activitate"],max:100},
    {name:"size",label:["Company size","Dimensiunea firmei"],options:{"1-9":["1–9 employees","1–9 angajați"],"10-49":["10–49 employees","10–49 de angajați"],"50-249":["50–249 employees","50–249 de angajați"],"250+":["250+ employees","Peste 250 de angajați"]}},
    {name:"people",label:["People involved in the process","Persoane implicate în proces"],type:"number",max:100000},
    {name:"activity",label:["Main business activities","Activități principale"],type:"textarea",max:350},
  ]},
  {title:["Current process","Procesul actual"],fields:[
    {name:"process",label:["Which process takes the most time?","Ce proces consumă cel mai mult timp?"],type:"textarea",max:450},
    {name:"departments",label:["Departments involved","Departamente implicate"],max:140},
    {name:"frequency",label:["How often does it run?","Cât de des se desfășoară?"],options:{daily:["Daily","Zilnic"],weekly:["Weekly","Săptămânal"],monthly:["Monthly","Lunar"],occasional:["Occasionally","Ocazional"]}},
    {name:"documented",label:["Are the steps documented?","Pașii sunt documentați?"],options:{yes:["Yes","Da"],partly:["Partly","Parțial"],no:["No","Nu"]}},
    {name:"approvals",label:["Who approves decisions?","Cine aprobă deciziile?"],max:140},
  ]},
  {title:["Current tools","Instrumentele folosite"],fields:[
    {name:"tools",label:["Select the tools involved","Selectează instrumentele folosite"],type:"checks",options:{
      excel:["Microsoft Excel","Microsoft Excel"],m365:["Microsoft 365","Microsoft 365"],sharepoint:["SharePoint","SharePoint"],erp:["ERP","ERP"],crm:["CRM","CRM"],sql:["SQL databases","Baze de date SQL"],other:["Other software","Alte aplicații"],paper:["Paper or manual documents","Documente pe hârtie sau completate manual"],
    }},
  ]},
  {title:["Operational challenges","Probleme operaționale"],fields:[
    {name:"challenges",label:["What makes the work harder?","Ce îngreunează activitatea?"],type:"checks",options:{
      entry:["Repeated manual entry","Introducere manuală repetată"],duplicates:["Duplicate information","Informații duplicate"],errors:["Human errors","Erori umane"],reporting:["Reporting delays","Întârzieri în raportare"],availability:["Hard-to-access data","Date greu de găsit"],ownership:["Unclear responsibilities","Responsabilități neclare"],systems:["Disconnected systems","Sisteme deconectate"],
    }},
  ]},
  {title:["Improvement objectives","Obiective de îmbunătățire"],fields:[
    {name:"objectives",label:["What would you like to improve?","Ce vrei să îmbunătățești?"],type:"checks",options:{
      accuracy:["Reduce errors","Reducerea erorilor"],speed:["Work faster","Creșterea vitezei"],centralize:["Centralize information","Centralizarea informațiilor"],automate:["Automate repetitive steps","Automatizarea pașilor repetitivi"],reporting:["Improve reporting","Îmbunătățirea raportării"],governance:["Clarify responsibilities","Clarificarea responsabilităților"],ai:["Evaluate possible AI uses","Evaluarea utilizărilor posibile ale AI"],
    }},
    {name:"budget",label:["Approximate budget","Buget aproximativ"],options:{undecided:["Undecided","Nehotărât"],"under-1000":["Under €1,000","Sub 1.000 EUR"],"1000-5000":["€1,000–€5,000","1.000–5.000 EUR"],"over-5000":["Over €5,000","Peste 5.000 EUR"]}},
    {name:"timeline",label:["Desired timeline","Calendar dorit"],options:{exploring:["Exploring","Încă analizez"],"this-month":["This month","Luna aceasta"],"this-quarter":["This quarter","Trimestrul acesta"],later:["Later","Mai târziu"]}},
  ]},
];
