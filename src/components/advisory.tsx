import Link from "next/link";
import { ArrowRight,ArrowUpRight,ChartNoAxesCombined,ClipboardList,Database,GitBranch,Route,ScanSearch } from "lucide-react";
import { copy,type Copy,type Locale } from "@/domain/catalog";
import { advisoryServices,advisoryEngagements } from "@/domain/advisory";
import { engagementCopy,serviceCopy } from "@/domain/advisory-copy";
import { AdvisoryPanels,ProcessModel } from "./advisory-interactions";
import { Intro } from "./marketing";
import { ConsultingGrid } from "./consulting-grid";

export const advisoryTitle:Copy=["Business Consulting","Consultanță de business"];
export const diagnosticTitle:Copy=["Business Process Diagnostic","Diagnostic de procese de business"];

const outputs:{title:Copy;icon:typeof Route;items:Copy[]}[]=[
  {title:["AS-IS process map","Hartă AS-IS"],icon:GitBranch,items:[["Email intake","Primire prin e-mail"],["Manual copy","Copiere manuală"],["Wait for approval","Așteptare aprobare"]]},
  {title:["TO-BE process map","Hartă TO-BE"],icon:Route,items:[["Form intake","Primire prin formular"],["Validate & assign","Validare și atribuire"],["Approve or escalate","Aprobare sau escaladare"]]},
  {title:["Data architecture","Arhitectură de date"],icon:Database,items:[["Customer record","Fișă client"],["Order record","Fișă comandă"],["Order items","Poziții comandă"]]},
  {title:["Opportunity matrix","Matrice de oportunități"],icon:ScanSearch,items:[["Validation → rule","Validare → regulă"],["Extraction → evaluate AI","Extragere → evaluare AI"],["Exceptions → human review","Excepții → verificare umană"]]},
  {title:["Implementation roadmap","Plan de implementare"],icon:ClipboardList,items:[["Map and agree scope","Mapare și arie de lucru"],["Pilot with one team","Pilot cu o echipă"],["Review before rollout","Revizuire înainte de lansare"]]},
  {title:["KPI dashboard concept","Concept de tablou KPI"],icon:ChartNoAxesCombined,items:[["Time to approval","Timp până la aprobare"],["Open requests","Cereri deschise"],["Exception rate","Rata excepțiilor"]]},
];

export function AdvisoryLanding({locale}:{locale:Locale}) {
  const t=(en:string,ro:string)=>copy(locale,[en,ro]);
  const base=`/${locale}/consulting`;
  const consultation=`/${locale}/contact?advisory=1`;
  return <>
    <section className="hero advisory-hero">
      <div className="hero-content stack"><p className="eyebrow hero-kicker"><span/>blen.</p>
        <h1>{t("Understand the process.","Înțelege procesul.")}<br/><em>{t("Then improve it.","Apoi îmbunătățește-l.")}</em></h1>
        <p className="lede">{t("Start with a paid audit of one business process. We map how work happens today, then review the findings and agree which improvements to prioritize on a discovery call.","Începe cu un audit contra cost al unui proces de business. Cartografiem modul de lucru actual, apoi discutăm concluziile și stabilim într-un apel ce îmbunătățiri au prioritate.")}</p>
        <div className="button-row"><Link className="button button-primary" href={consultation}>{t("Request a process audit","Solicită un audit de proces")}<ArrowRight size={17}/></Link><Link className="button button-secondary" href={base+"/business-diagnostic"}>{t("Assess your business processes","Evaluează procesele firmei")}</Link></div>
      </div>
      <ProcessModel locale={locale}/>
    </section>
    <section className="section compact"><div className="section-heading"><h2>{t("Does your business work harder than it needs to?","Muncește echipa ta mai mult decât este nevoie?")}</h2><p>{t("Choose a problem to see where an investigation could start.","Alege o problemă ca să vezi de unde poate începe analiza.")}</p></div><AdvisoryPanels locale={locale} kind="problems"/></section>
    <section className="section"><div className="section-heading"><h2>{t("How we work","Cum lucrăm")}</h2></div><AdvisoryPanels locale={locale} kind="method"/></section>
    <section className="section" id="advisory-services"><div className="section-heading"><h2>{t("Consulting services","Servicii de consultanță")}</h2></div>
      <ConsultingGrid locale={locale}/>
    </section>
    <section className="section"><div className="section-heading"><h2>{t("What the work can produce","Ce poate rezulta din proiect")}</h2><p>{t("Illustrative examples from a fictional purchase approval process.","Exemple ilustrative dintr-un proces fictiv de aprobare a achizițiilor.")}</p></div>
      <div className="pillar-grid">{outputs.map(({title,icon:Icon,items})=><article className="glass form-panel stack advisory-output" key={title[0]}><span className="visual-icon"><Icon size={19}/></span><h3>{copy(locale,title)}</h3><ol>{items.map(item=><li key={item[0]}>{copy(locale,item)}</li>)}</ol></article>)}</div>
    </section>
    <section className="section"><div className="section-heading"><h2>{t("Ways to work together","Forme de colaborare")}</h2><p>{t("Each quote separates consulting, implementation, third-party licenses, hosting and optional maintenance.","Fiecare ofertă separă consultanța, implementarea, licențele terțe, găzduirea și mentenanța opțională.")}</p></div>
      <div className="pillar-grid">{advisoryEngagements.map(engagement=><article key={engagement} className="glass form-panel stack"><h3>{copy(locale,engagementCopy[engagement].title)}</h3><p>{copy(locale,engagementCopy[engagement].body)}</p><Link className="button button-secondary" href={consultation+"&engagement="+engagement}>{t("Request a quote","Solicită o ofertă")}<ArrowUpRight size={16}/></Link></article>)}</div>
    </section>
  </>;
}
export function AdvisoryService({locale,slug}:{locale:Locale;slug:typeof advisoryServices[number]}) {
  const t=(en:string,ro:string)=>copy(locale,[en,ro]);
  const service=serviceCopy[slug];
  const details=[
    [t("Common signs","Semne frecvente"),service.signs],[t("Our approach","Cum abordăm proiectul"),service.approach],
    [t("Possible deliverables","Livrabile posibile"),service.deliverables],[t("Your responsibilities","Responsabilitățile clientului"),service.client],
    [t("Tools we may consider","Instrumente pe care le putem evalua"),service.tools],[t("Illustrative example","Exemplu ilustrativ"),service.example],
  ] as const;
  return <><Intro tag="blen." title={copy(locale,service.title)} description={copy(locale,service.summary)}/>
    <div className="advisory-facts">{details.map(([heading,body])=><section key={heading} className="glass form-panel stack"><h2>{heading}</h2><p>{copy(locale,body)}</p></section>)}</div>
    <div className="section compact button-row"><Link className="button button-primary" href={`/${locale}/contact?advisory=1&service=${slug}`}>{slug==="process-audit"?t("Request a process audit","Solicită un audit de proces"):t("Discuss this service","Discută despre acest serviciu")}<ArrowRight size={17}/></Link><Link className="button button-secondary" href={`/${locale}/consulting/business-diagnostic`}>{t("Start the diagnostic","Începe diagnosticul")}</Link></div>
  </>;
}
