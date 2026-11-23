"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Check, FileSpreadsheet, GitBranch, Layers3, Play, Sparkles } from "lucide-react";
import { copy,type Locale } from "@/domain/catalog";
import { usePresentationMotion } from "./motion/use-presentation-motion";
export function WorkflowVisual({locale,ops=false}:{locale:Locale;ops?:boolean}) {
  const t=(en:string,ro:string)=>copy(locale,[en,ro]);
  const [step,setStep]=useState(-1);
  const [playing,setPlaying]=useState(false);
  const {ref,active,reduced}=usePresentationMotion<HTMLDivElement>();
  const started=useRef(false);
  function run(){
    if(playing)return;
    started.current=true;
    setStep(0);setPlaying(true);
    if(window.matchMedia("(prefers-reduced-motion: reduce)").matches){setStep(4);setPlaying(false);return}
  }
  useEffect(()=>{
    if(!active || reduced || started.current)return;
    started.current=true;
    setStep(0);
    setPlaying(true);
  },[active,reduced]);
  useEffect(()=>{
    if(!playing || !active)return;
    if(reduced){setStep(4);setPlaying(false);return;}
    const timer=window.setTimeout(()=>{
      setStep(step+1);
      if(step>=3)setPlaying(false);
    },1100);
    return ()=>window.clearTimeout(timer);
  },[active,reduced,playing,step]);
  const labels=ops?[t("Store report","Sesizare magazin"),t("Classify issue","Clasifică incidentul"),t("Route to owner","Atribuie responsabil"),t("Human review","Verificare umană"),t("Escalation ready","Escaladare pregătită")]:
  [t("Excel source","Sursă Excel"),t("Clean rows","Curăță rânduri"),t("Apply rules","Aplică reguli"),t("Generate report","Generează raport"),t("Ready to export","Pregătit pentru export")];
  const icons=[FileSpreadsheet,Layers3,GitBranch,Sparkles,Check];
  return <div ref={ref} className="visual motion-workflow" data-active={active&&!reduced} data-running={playing}>
    <div className="visual-head"><div><span className="window-dots"><i/><i/><i/></span><span className="visual-title">{ops?"retail_incident.flow":"sales_cleanup.flow"}</span></div><span className="visual-badge"><span/>{t("SIMULATION","SIMULARE")}</span></div>
    <div className={"visual-canvas"+(playing?" playing":"")} data-progress={step}>
      <svg className="wires" viewBox="0 0 600 390" preserveAspectRatio="none" aria-hidden>
        <path d="M 140 92 C 140 155 260 80 260 163 S 450 160 450 175 M450 176 C450 238 213 170 213 256 S390 239 390 320"/>
        <path className="wire-lit" d="M 140 92 C 140 155 260 80 260 163 S 450 160 450 175 C450 238 213 170 213 256 S390 239 390 320"/>
      </svg>
      <div className="diagram-coordinate">{t("FLOW","FLUX")} / 0{ops?2:1}</div>
      {labels.map((label,index)=>{const Icon=icons[index];return <div key={label} className={"visual-node node-"+index+(index<=step?" done":"")+(index===step?" node-current":"")} style={{"--node-index":index} as React.CSSProperties}>
        <span className="visual-icon"><Icon size={17}/></span><span><strong>{label}</strong><small>{index<4?t("STEP","PAS")+" 0"+(index+1):t("OUTPUT","REZULTAT")}</small></span>{index===4?<ArrowUpRight className="node-arrow" size={14}/>:null}
      </div>})}
    </div>
    <div className="visual-footer"><span role="status"><span className={"signal"+(step===4?" signal-done":"")}/>{step===4?t("Simulation complete","Simulare finalizată"):playing?labels[step]:t("Synthetic workflow preview","Exemplu cu date fictive")}</span><button type="button" onClick={run} disabled={playing}><Play size={12}/>{t("Play flow","Rulează fluxul")}</button></div>
  </div>;
}
