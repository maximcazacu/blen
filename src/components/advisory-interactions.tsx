"use client";
import { useEffect,useId,useRef,useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, Database, GitBranch, Layers3, Network, Repeat2, Workflow } from "lucide-react";
import { copy,spreadsheetIcon,type Copy,type Locale } from "@/domain/catalog";
import { serviceCopy } from "@/domain/advisory-copy";
import type { advisoryServices } from "@/domain/advisory";
import { usePresentationMotion } from "./motion/use-presentation-motion";

type Service = typeof advisoryServices[number];
const problems:[Copy,Copy,Service][] = [
  [["Too many Excel files","Prea multe fișiere Excel"],["Agree which file or system owns each record and define how copies should be handled.","Stabilește fișierul sau sistemul de referință pentru fiecare înregistrare și ce se întâmplă cu copiile."],"data-architecture"],
  [["Manual data entry","Introducere manuală de date"],["Follow one entry from source to destination and find where the same values are typed again.","Urmărește o înregistrare de la sursă la destinație și vezi unde se tastează din nou aceleași valori."],"process-audit"],
  [["Recurring errors","Erori operaționale recurente"],["Look at when mistakes appear and agree on checks at the point of entry.","Analizează când apar erorile și stabilește verificări chiar la introducerea datelor."],"process-optimization"],
  [["Unclear ownership","Responsabilități neclare"],["Give each step an owner and agree who handles exceptions and escalations.","Desemnează un responsabil pentru fiecare pas și stabilește cine preia excepțiile și escaladările."],"process-optimization"],
  [["Disconnected software","Aplicații deconectate"],["Check whether the systems can exchange records safely and how failed transfers would be recovered.","Verifică dacă sistemele pot schimba date în siguranță și cum se reiau transferurile eșuate."],"systems-integration"],
  [["Slow reporting","Raportare lentă"],["Map how the report is prepared and which sources or checks delay publication.","Identifică pașii de pregătire a raportului și sursele sau verificările care întârzie publicarea."],"data-architecture"],
  [["Unstructured information","Informații nestructurate"],["Agree what needs a structured record, who maintains it, and how it is validated.","Stabilește ce informații trebuie structurate, cine le întreține și cum sunt validate."],"data-architecture"],
  [["Repetitive admin work","Sarcini administrative repetitive"],["Compare a simpler process, rules-based automation and AI assistance where judgment is involved.","Compară un proces simplificat, automatizarea pe bază de reguli și asistența AI acolo unde este nevoie de interpretare."],"ai-readiness"],
  [["Difficult approvals","Aprobări dificile"],["Define approval criteria, substitutes and a clear path for exceptions.","Definește criteriile de aprobare, înlocuitorii și traseul pentru excepții."],"process-optimization"],
  [["No automation strategy","Lipsa unei strategii de automatizare"],["Prioritize processes by business need, readiness and the effort required to change them.","Prioritizează procesele după nevoia de business, pregătire și efortul de schimbare."],"process-audit"],
];

const phases:{title:Copy;objective:Copy;details:Copy[]}[]=[
  {title:["Audit","Audităm"],objective:["Map the current workflow and review the findings together.","Cartografiem fluxul actual și discutăm concluziile împreună."],details:[
    ["Observe work, interview stakeholders and trace a real handoff.","Observăm activitatea, discutăm cu echipa și urmărim un transfer între roluri."],
    ["AS-IS map and a list of issues to validate.","Hartă AS-IS și o listă de probleme de verificat."],
    ["Nominate an owner and provide access to relevant people.","Desemnează un responsabil și facilitează discuțiile cu persoanele relevante."],
    ["After the paid audit, review the findings on a discovery call and agree which changes to prioritize.","După auditul contra cost, discutăm concluziile într-un apel și stabilim ce schimbări au prioritate."],
  ]},
  {title:["Design","Proiectăm"],objective:["Define a simpler future workflow and reliable data.","Definim un flux viitor mai simplu și date de încredere."],details:[
    ["Clarify roles, decision rules, data definitions and exceptions.","Clarificăm rolurile, regulile de decizie, definițiile datelor și excepțiile."],
    ["TO-BE map, responsibilities and rollout plan.","Hartă TO-BE, responsabilități și plan de implementare."],
    ["Review the proposed process and approve its key rules.","Revizuiește procesul propus și aprobă regulile esențiale."],
    ["Continue once owners, inputs and acceptance criteria are clear.","Continuăm când responsabilii, datele de intrare și criteriile de acceptare sunt clare."],
  ]},
  {title:["Automate","Automatizăm"],objective:["Implement the steps that benefit from automation.","Implementăm automatizarea acolo unde aduce valoare."],details:[
    ["Select tools, pilot the workflow and test exceptions with users.","Alegem instrumentele, rulăm un pilot și testăm excepțiile cu utilizatorii."],
    ["Tested workflow, operating instructions and a rollback plan.","Flux testat, instrucțiuni de operare și plan de revenire."],
    ["Approve permissions and take part in acceptance testing.","Aprobă permisiunile și participă la testele de acceptare."],
    ["Proceed to rollout when the pilot meets the agreed checks.","Lansăm după ce pilotul trece verificările convenite."],
  ]},
  {title:["Optimize","Îmbunătățim"],objective:["Keep the process reliable as the business changes.","Menținem procesul fiabil pe măsură ce afacerea se schimbă."],details:[
    ["Review exceptions and usage, update documentation and prioritize changes.","Revizuim excepțiile și utilizarea, actualizăm documentația și prioritizăm schimbările."],
    ["Review notes, monitoring plan and improvement backlog.","Note de revizuire, plan de monitorizare și listă de îmbunătățiri."],
    ["Assign an operational owner and agree how issues are handled.","Desemnează un responsabil operațional și stabilește cum sunt tratate problemele."],
    ["Agree support terms and the next review date with the owner.","Stabilim condițiile de suport și data următoarei revizuiri cu responsabilul."],
  ]},
];
const phaseFields:Copy[]=[["Activities","Activități"],["Potential deliverables","Livrabile posibile"],["Client responsibilities","Responsabilitățile clientului"],["When to proceed","Când continuăm"]];
export function AdvisoryPanels({locale,kind}:{locale:Locale;kind:"problems"|"method"}) {
  const [selected,setSelected]=useState(0);
  const panel=useId();
  const t=(value:Copy)=>copy(locale,value);
  if(kind==="problems"){
    const [,body,service]=problems[selected];
    return <div className="advisory-interaction"><div className="advisory-selectors problem-options">{problems.map(([title],index)=>
      <button key={title[0]} className="glass" aria-pressed={selected===index} aria-controls={panel} onClick={()=>setSelected(index)}><span className="mono">{String(index+1).padStart(2,"0")}</span>{t(title)}</button>)}</div>
      <article className="glass form-panel stack advisory-response" id={panel} aria-live="polite">
        <p className="eyebrow">{t(["WHERE TO START","DE UNDE ÎNCEPEM"])}</p><h3>{t(problems[selected][0])}</h3><p>{t(body)}</p>
        <Link href={`/${locale}/consulting/${service}`} className="button button-secondary">{t(serviceCopy[service].title)}<ArrowUpRight size={16}/></Link>
      </article>
    </div>;
  }
  const phase=phases[selected];
  return <div className="glass form-panel stack"><div className="advisory-selectors method-options">{phases.map((item,index)=>
    <button key={item.title[0]} className="glass" aria-pressed={selected===index} aria-controls={panel} onClick={()=>setSelected(index)}><span className="mono">0{index+1}</span>{t(item.title)}</button>)}</div>
    <div id={panel} aria-live="polite" className="advisory-phase stack" key={selected}><h3>{t(phase.objective)}</h3><dl className="advisory-facts">
      {phase.details.map((detail,index)=><div key={detail[0]}><dt>{t(phaseFields[index])}</dt><dd>{t(detail)}</dd></div>)}
    </dl></div>
  </div>;
}

const before:Copy[]=[["Separate spreadsheets","Fișiere separate"],["Repeated entry","Introducere repetată"],["Unclear approvals","Aprobări neclare"],["Duplicate records","Înregistrări duplicate"],["Delayed reporting","Raportare întârziată"],["Isolated apps","Aplicații izolate"]];
const after:Copy[]=[["Shared data source","Sursă de date comună"],["Defined steps","Pași definiți"],["Named owner","Responsabil desemnat"],["Validated records","Înregistrări validate"],["Scheduled reporting","Raportare programată"],["Connected systems","Sisteme conectate"]];
const icons=[Layers3,Repeat2,GitBranch,Database,Workflow,Network];
const currentTones=["green","amber","pink","amber","pink","violet"];
const futureTones=["teal","blue","violet","green","green","blue"];
export function ProcessModel({locale}:{locale:Locale}) {
  const [connected,setConnected]=useState(false);
  const [stage,setStage]=useState(0);
  const [playing,setPlaying]=useState(false);
  const started=useRef(false);
  const {ref,active,reduced}=usePresentationMotion<HTMLDivElement>();
  const pathColor=useId();
  useEffect(()=>{
    if(!active||reduced||started.current)return;
    started.current=true;
    setPlaying(true);
  },[active,reduced]);
  useEffect(()=>{
    if(!playing||!active)return;
    if(reduced){setPlaying(false);return;}
    const timer=window.setTimeout(()=>{
      if(stage<2)setStage(stage+1);
      else {setConnected(true);setPlaying(false);}
    },1300);
    return ()=>window.clearTimeout(timer);
  },[active,reduced,playing,stage]);
  const t=(value:Copy)=>copy(locale,value);
  return <div ref={ref} className="glass advisory-model motion-process" data-active={active&&!reduced} data-stage={stage}>
    <div className="advisory-model-header"><p className="eyebrow">{t(["PROCESS LAB / ILLUSTRATION","LABORATOR DE PROCESE / ILUSTRAȚIE"])}</p><span className="chip process-state" data-tone={connected?"green":"amber"}>{connected?"TO-BE":"AS-IS"}</span></div>
    <div className={`advisory-map ${connected?"is-connected":""}`}>
      <svg viewBox="0 0 600 330" preserveAspectRatio="none" aria-hidden="true">
        <defs><linearGradient id={pathColor}><stop stopColor="#14866f"/><stop offset=".5" stopColor="#387fe3"/><stop offset="1" stopColor="#7961df"/></linearGradient></defs>
        <path className="advisory-map-fragments" d="M100 55v30m0 28v25m0 27h50m85 0h60m55 0h75m75 0v40m0 20v50M100 275h85m55 0h60m0-220h70m50 0h80"/>
        <path className="advisory-map-path" stroke={`url(#${pathColor})`} d="M100 55H500Q520 55 520 75V145Q520 165 500 165H100Q80 165 80 185V255Q80 275 100 275H500"/>
      </svg>
      {(connected?after:before).map((label,index)=>{
        const Icon=icons[index];
        return <div className="advisory-node" data-tone={(connected?futureTones:currentTones)[index]} key={index} style={{"--node-index":index} as React.CSSProperties}>
          <div className="process-node-icon">
            {!connected&&index===0?<Image src={spreadsheetIcon} alt="" width={24} height={24} unoptimized/>:<Icon size={20} aria-hidden="true"/>}
          </div>
          <span key={connected?"connected":"fragmented"}>{t(label)}</span>
        </div>;
      })}
    </div>
    <div className="advisory-model-footer"><span role="status">{connected?t(["Proposed future state","Flux viitor propus"]):t(["Fragmented current state","Proces actual fragmentat"])}</span>
      <button type="button" className="button button-secondary" onClick={()=>{started.current=true;setPlaying(false);setConnected(value=>!value);setStage(2);}}>
        {connected?t(["Show current state","Arată fluxul actual"]):t(["Show connected workflow","Arată fluxul conectat"])}<ArrowRight size={16}/>
      </button>
    </div>
  </div>;
}
