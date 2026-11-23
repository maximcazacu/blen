"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { ReactFlow, Background, Controls, Handle, Position, MarkerType, applyNodeChanges, type Node, type NodeProps, type Connection, type Edge, type ReactFlowInstance, type XYPosition } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ArrowRight, CheckCircle2, Code2, Download, Layers3, Play, Plus, Redo2, Save, Trash2, Undo2 } from "lucide-react";
import { compile, newStep, operations, preview, template, templates, validate, version, workflowSchema, type Operation, type Step, type Template, type Workflow } from "@/domain/workflow";
import { copy, type Copy, type Locale } from "@/domain/catalog";
import { saveWorkflow } from "@/app/actions";
import { CheckoutForm, Status,initial } from "./forms";

export const operationLabels:Record<Operation,Copy>={
  worksheet:["Select worksheet","Selectează foaia"],range:["Used range","Zonă utilizată"],dedupe:["Remove duplicates","Elimină duplicate"],sort:["Sort rows","Sortează rândurile"],
  table:["Create table","Creează tabel"],format:["Format columns","Formatează coloanele"],summary:["Summary sheet","Foaie de sinteză"],
};
const templateLabels:Record<Template,Copy>={cleanup:["Excel Data Cleanup","Curățare date Excel"],formatting:["Spreadsheet Formatting","Formatare foi Excel"],reporting:["Basic Reporting","Raport de bază"]};
const issueLabels:Record<string,Copy>={
  empty:["Add steps to begin.","Adaugă pași pentru a începe."],edge:["Use one incoming and one outgoing connection per step.","Folosește cel mult o conexiune de intrare și una de ieșire per pas."],
  cycle:["Remove the circular dependency.","Elimină conexiunea circulară."],connected:["Connect all steps in a single chain.","Conectează toți pașii într-un singur lanț."],duplicate:["Step identifiers must be unique.","Identificatorii pașilor trebuie să fie unici."],
  start:["Start with Worksheet → Used range, then add an operation.","Începe cu Foaie → Zonă utilizată, apoi adaugă o operațiune."],
  order:["Use each operation once. Remove duplicates before creating a table. End with a distinct summary sheet.","Folosește fiecare operațiune o singură dată. Elimină duplicatele înainte de a crea tabelul. Încheie cu o foaie de sinteză distinctă."],
  config:["Check the selected step configuration.","Verifică setările pasului."],schema:["Check the workflow name and size.","Verifică numele și dimensiunea fluxului."],
  sampleColumn:["The sample contains three columns. This column operation was skipped in the simulation.","Exemplul are trei coloane. Operațiunea a fost omisă în simulare."],
};
type GraphNode=Node<{label:string;kind:Operation;invalid:boolean},"operation">;
function OperationNode({data,selected}:NodeProps<GraphNode>) {
  return <div className={"flow-node"+(selected?" selected":"")+(data.invalid?" invalid":"")}>
    <Handle type="target" position={Position.Left}/><Layers3 size={15}/><span><strong>{data.label}</strong><small>{data.kind.toUpperCase()}</small></span><Handle type="source" position={Position.Right}/>
  </div>;
}
const nodeTypes={operation:OperationNode};
type History={past:Workflow[];current:Workflow;future:Workflow[]};
const draftKey="flowelix-builder-sign-in";
export function Builder({locale,initialGraph,id,loggedIn,resume,prices}:{locale:Locale;initialGraph:Workflow;id?:string;loggedIn:boolean;resume:boolean;prices?:{EUR:number;RON:number}}) {
  const t=(en:string,ro:string)=>copy(locale,[en,ro]);
  const [history,setHistory]=useState<History>({past:[],current:initialGraph,future:[]});
  const graph=history.current;
  const [selected,setSelected]=useState<string|undefined>(initialGraph.nodes[0]?.id);
  const [dragging,setDragging]=useState<GraphNode[]|null>(null);
  const measured=useRef(new Map<string,GraphNode["measured"]>());
  const [canvas,setCanvas]=useState<ReactFlowInstance<GraphNode,Edge>>();
  const [show,setShow]=useState<"none"|"preview"|"export">("none");
  const [workflowId,setWorkflowId]=useState(id);
  const [saved,setSaved]=useState(id?JSON.stringify(initialGraph):"");
  const [state,setState]=useState(initial);
  const [isSaving,startSaving]=useTransition();
  const [connectTo,setConnectTo]=useState("");
  const [connectionMessage,setConnectionMessage]=useState("");
  useEffect(()=>{
    if(!loggedIn || !resume || id)return;
    try {
      const raw=sessionStorage.getItem(draftKey);
      sessionStorage.removeItem(draftKey);
      if(!raw)return;
      const restored=workflowSchema.safeParse(JSON.parse(raw));
      if(restored.success){
        setHistory({past:[],current:restored.data,future:[]});
        setSelected(restored.data.nodes[0]?.id);
      }
    } catch { /* The editor can still open a default template when storage is unavailable. */ }
  },[id,loggedIn,resume]);
  const {issues}=validate(graph);
  const valid=issues.length===0;
  const active=graph.nodes.find(node=>node.id===selected);
  const nodes:GraphNode[]=graph.nodes.map(step=>({id:step.id,position:step.position,type:"operation",selected:step.id===selected,measured:measured.current.get(step.id),
    data:{label:copy(locale,operationLabels[step.type]),kind:step.type,invalid:issues.some(issue=>issue.node===step.id)},
  }));
  const edges:Edge[]=graph.edges.map(({source,target})=>({id:source+"-"+target,source,target,markerEnd:{type:MarkerType.ArrowClosed,color:"#6254D9"},style:{stroke:"var(--accent)",strokeWidth:1.6}}));
  const dirty=JSON.stringify(graph)!==saved;
  const signIn=`/${locale}/login?next=${encodeURIComponent(`/${locale}/builder?resume=1`)}`;
  function carryDraft() {try{sessionStorage.setItem(draftKey,JSON.stringify(graph));}catch{/* Storage may be disabled. */}}
  function commit(next:Workflow) {
    setDragging(null);setConnectionMessage("");
    setHistory(({past,current})=>({past:[...past.slice(-39),current],current:next,future:[]}));
  }
  function undo(){
    setHistory(({past,current,future})=>past.length?{past:past.slice(0,-1),current:past[past.length-1],future:[current,...future]}:{past,current,future});
  }
  function redo(){
    setHistory(({past,current,future})=>future.length?{past:[...past,current],current:future[0],future:future.slice(1)}:{past,current,future});
  }
  function add(type:Operation,position?:XYPosition) {
    if(graph.nodes.length>=12)return;
    const step=newStep(type,crypto.randomUUID(),graph.nodes.length);
    commit({...graph,nodes:[...graph.nodes,position?{...step,position}:step]});setSelected(step.id);
  }
  function update(step:Step) {commit({...graph,nodes:graph.nodes.map(node=>node.id===step.id?step:node)});}
  function remove(step:Step) {
    commit({...graph,nodes:graph.nodes.filter(node=>node.id!==step.id),edges:graph.edges.filter(edge=>edge.source!==step.id&&edge.target!==step.id)});
    setSelected(undefined);
  }
  function connect({source,target}:Pick<Connection,"source"|"target">){
    const next={...graph,edges:[...graph.edges,{source,target}]};
    const topology={...next,name:"Connection",nodes:next.nodes.map((node,index)=>newStep(node.type,node.id,index))};
    const issue=validate(topology).issues.find(item=>item.code==="edge" || item.code==="cycle");
    if(issue){setConnectionMessage(copy(locale,issueLabels[issue.code]));return;}
    commit(next);setConnectTo("");
  }
  function save() {
    startSaving(async()=>{
      const response=await saveWorkflow(graph,workflowId);
      setState({...response,id:response.id});
      if(response.ok&&response.id){setWorkflowId(response.id);setSaved(JSON.stringify(graph));window.history.replaceState(null,"",`/${locale}/builder?workflow=${response.id}`);}
    });
  }
  const data=valid&&show==="preview"?preview(graph):null;
  return <div className="builder glass">
    <div className="builder-toolbar">
      <label className="builder-name"><span>{t("WORKFLOW NAME","NUME FLUX")}</span><input value={graph.name} maxLength={100} onChange={event=>commit({...graph,name:event.target.value})}/></label>
      <div className="builder-buttons">
        <button className="icon-button" title={t("Undo","Anulează")} aria-label={t("Undo","Anulează")} disabled={!history.past.length} onClick={undo}><Undo2 size={17}/></button>
        <button className="icon-button" title={t("Redo","Refă")} aria-label={t("Redo","Refă")} disabled={!history.future.length} onClick={redo}><Redo2 size={17}/></button>
        <button className="button button-quiet" onClick={()=>setShow("preview")}><CheckCircle2 size={16}/>{t("Validate","Validează")}</button>
        <button className="button button-quiet" onClick={()=>setShow("preview")}><Play size={16}/>{t("Preview","Previzualizează")}</button>
        {loggedIn?<button className="button button-quiet" disabled={!valid || !dirty || isSaving} onClick={save}><Save size={16}/>{t("Save","Salvează")}</button>:
          <Link className="button button-quiet" onClick={carryDraft} href={signIn}><Save size={16}/>{t("Sign in to save","Intră în cont pentru salvare")}</Link>}
        <button className="button button-primary" disabled={!valid} onClick={()=>setShow("export")}><Download size={16}/>{t("Export","Exportă")}</button>
      </div>
    </div>
    <div className="builder-workspace">
      <aside className="builder-side">
        <p className="eyebrow">{t("TEMPLATES","ȘABLOANE")}</p>
        {Object.keys(templates).map(key=><button key={key} className="tool-item" onClick={()=>{const next=template(key as Template,copy(locale,templateLabels[key as Template]));commit(next);setSelected(next.nodes[0].id);}}><Layers3 size={15}/>{copy(locale,templateLabels[key as Template])}</button>)}
        <button className="tool-item" onClick={()=>{commit({name:t("Untitled workflow","Flux fără nume"),nodes:[],edges:[]});setSelected(undefined);}}><Plus size={15}/>{t("Blank workflow","Flux gol")}</button>
        <p className="eyebrow">{t("OPERATIONS","OPERAȚIUNI")}</p>
        {operations.map(type=><button key={type} draggable onDragStart={event=>{event.dataTransfer.setData("application/flowelix",type);event.dataTransfer.effectAllowed="copy"}} className="tool-item" disabled={graph.nodes.length>=12} onClick={()=>add(type)}><Plus size={15}/>{copy(locale,operationLabels[type])}</button>)}
      </aside>
      <div className="editor" onDragOver={event=>{if(event.dataTransfer.types.includes("application/flowelix"))event.preventDefault();}} onDrop={event=>{
        const value=event.dataTransfer.getData("application/flowelix") as Operation;
        if(operations.includes(value)){event.preventDefault();add(value,canvas?.screenToFlowPosition({x:event.clientX,y:event.clientY}));}
      }}>
        <ReactFlow nodes={dragging??nodes} edges={edges} nodeTypes={nodeTypes} onInit={setCanvas} fitView fitViewOptions={{padding:.2}} minZoom={.25} maxZoom={1.4} colorMode="light" deleteKeyCode={null}
          onNodeClick={(_,node)=>{setSelected(node.id);setConnectTo("");}}
          onNodesChange={changes=>{
            for(const change of changes) if(change.type==="dimensions"&&change.dimensions) measured.current.set(change.id,change.dimensions);
            const keyboard=changes.find(change=>change.type==="position"&&change.position&&change.dragging===undefined);
            if(keyboard?.type==="position"&&keyboard.position) {
              const step=graph.nodes.find(node=>node.id===keyboard.id);
              if(step)update({...step,position:keyboard.position});
            } else if(changes.some(change=>change.type==="position")) {
              setDragging(current=>applyNodeChanges(changes,current??nodes.map(node=>({...node,measured:measured.current.get(node.id)}))));
            }
          }}
          onNodeDragStop={(_,node)=>update({...graph.nodes.find(step=>step.id===node.id)!,position:node.position})}
          onConnect={connect} ariaLabelConfig={locale==="ro"?{
            "node.a11yDescription.default":"Apasă Enter sau Spațiu pentru a selecta pasul. Folosește săgețile pentru a-l deplasa.",
            "node.a11yDescription.keyboardDisabled":"Apasă Enter sau Spațiu pentru a selecta pasul.",
            "node.a11yDescription.ariaLiveMessage":({x,y})=>"Pas mutat la poziția "+x+", "+y,
            "edge.a11yDescription.default":"Apasă Enter sau Spațiu pentru a selecta conexiunea.",
            "controls.ariaLabel":"Comenzi pentru diagramă",
            "controls.zoomIn.ariaLabel":"Mărește diagrama",
            "controls.zoomOut.ariaLabel":"Micșorează diagrama",
            "controls.fitView.ariaLabel":"Încadrează diagrama",
            "handle.ariaLabel":"Punct de conectare",
          }:undefined} proOptions={{hideAttribution:true}}><Background color="#CBD2E4" gap={20}/><Controls showInteractive={false}/></ReactFlow>
      </div>
      <aside className="builder-side inspector">
        <p className="eyebrow">{t("INSPECTOR","INSPECTOR")}</p>
        <label>{t("Select a step","Alege un pas")}<select value={active?.id??""} onChange={event=>{setSelected(event.target.value);setConnectTo("");}}><option value="">{t("Select…","Alege…")}</option>{graph.nodes.map((step,i)=><option key={step.id} value={step.id}>{i+1}. {copy(locale,operationLabels[step.type])}</option>)}</select></label>
        {active&&<div className="stack">
          <h3>{copy(locale,operationLabels[active.type])}</h3>
          {(active.type==="worksheet"||active.type==="summary")&&<label>{t("Worksheet name","Numele foii")}<input value={active.name} maxLength={31} onChange={event=>update({...active,name:event.target.value})}/></label>}
          {(active.type==="sort"||active.type==="dedupe")&&<label>{t("Column index (0 = first)","Index coloană (0 = prima)")}<input type="number" value={Number.isNaN(active.column)?"":active.column} min={0} max={16383} onChange={event=>update({...active,column:event.target.valueAsNumber})}/></label>}
          {active.type==="sort"&&<label>{t("Sort direction","Direcție")}<select value={String(active.ascending)} onChange={event=>update({...active,ascending:event.target.value==="true"})}><option value="true">{t("Ascending","Crescător")}</option><option value="false">{t("Descending","Descrescător")}</option></select></label>}
          <label>{t("Connect to","Conectează la")}<select value={connectTo} onChange={event=>setConnectTo(event.target.value)}><option value="">{t("Choose a step","Alege un pas")}</option>{graph.nodes.filter(step=>step.id!==active.id).map((step,i)=><option key={step.id} value={step.id}>{i+1}. {copy(locale,operationLabels[step.type])}</option>)}</select></label>
          <button className="tool-item" disabled={!connectTo} onClick={()=>connect({source:active.id,target:connectTo})}><ArrowRight size={15}/>{t("Connect","Conectează")}</button>
          {graph.edges.some(edge=>edge.source===active.id)&&<button className="tool-item" onClick={()=>commit({...graph,edges:graph.edges.filter(edge=>edge.source!==active.id)})}>{t("Remove outgoing connection","Șterge conexiunea de ieșire")}</button>}
          <button className="tool-item danger" onClick={()=>remove(active)}><Trash2 size={15}/>{t("Remove step","Șterge pasul")}</button>
        </div>}
      </aside>
    </div>
    <div className="builder-result">
      <p className="eyebrow" aria-live="polite">{valid?t("✓ WORKFLOW VALID","✓ FLUX VALID"):t("WORKFLOW NEEDS ATTENTION","FLUXUL NECESITĂ MODIFICĂRI")} <span>· v{version}</span></p>
      {connectionMessage&&<p role="alert" className="notice error">{connectionMessage}</p>}
      {issues.length>0&&<ul>{issues.map((issue,i)=><li key={i}>{issue.node&&graph.nodes.find(step=>step.id===issue.node)?copy(locale,operationLabels[graph.nodes.find(step=>step.id===issue.node)!.type])+" — ":""}{copy(locale,issueLabels[issue.code]??issueLabels.schema)}</li>)}</ul>}
      <Status locale={locale} state={state}/>
      {data&&<div className="stack"><h2>{t("Synthetic data preview","Previzualizare cu date fictive")}</h2><p>{t("This simulation uses a fixed sample. Test the generated script on a workbook copy in Excel.","Simularea folosește un exemplu fix. Testează scriptul generat pe o copie a registrului în Excel.")}</p>
        <div className="form-grid">{[data.before,data.after].map((rows,i)=><div key={i}><h3>{i?t("After","După"):t("Before","Înainte")}</h3><div className="table-scroll"><table><thead><tr>{rows[0].map(cell=><th key={cell}>{cell}</th>)}</tr></thead><tbody>{rows.slice(1).map((row,j)=><tr key={j}>{row.map((cell,k)=><td key={k}>{cell}</td>)}</tr>)}</tbody></table></div></div>)}</div>
        {data.notes.includes("sampleColumn")&&<p>{copy(locale,issueLabels.sampleColumn)}</p>}
        <h3><Code2 size={18}/> Office Scripts TypeScript</h3><pre>{compile(graph)}</pre></div>}
      {show==="export"&&valid&&<div className="stack"><h2>{t("Export Office Script","Exportă scriptul Office")}</h2><p>{t("Includes script, workflow JSON, compiler version and installation steps. Office Scripts availability depends on your Excel environment.","Include scriptul, fluxul JSON, versiunea compilatorului și pașii de instalare. Disponibilitatea depinde de mediul Excel.")}</p>
        {!loggedIn?<Link href={signIn} onClick={carryDraft} className="button button-primary">{t("Sign in to export","Intră în cont pentru export")}<ArrowRight size={16}/></Link>:
          dirty?<p>{t("Save the current workflow before test checkout.","Salvează fluxul curent înainte de plata de test.")}</p>:<CheckoutForm locale={locale} product="builder" prices={prices} enabled workflow={workflowId} redirectTo={`/${locale}/builder`}/>}</div>}
    </div>
  </div>;
}
