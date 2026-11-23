import { randomUUID } from "node:crypto";
import Link from "next/link";
import { db } from "@/server/store";
import { copy,currency,type Locale,type Copy } from "@/domain/catalog";
import { costKeys,type Assessment,type CostKey,type Diagnostic,type advisoryEngagements,type advisoryServices } from "@/domain/advisory";
import { costLabels,engagementCopy,serviceCopy } from "@/domain/advisory-copy";
import { requestStates } from "@/domain/requests";
import { manageAdvisorySupport,manageRequest } from "@/app/actions";
import { QuoteForm } from "./forms";
import { AssessmentSummary } from "./assessment-summary";
import { AdvisoryProjectForm,AdvisorySupportForm,type ProjectDetails } from "./advisory-project-forms";

type Lead={id:string;status:string;payload:string;created:string};
type Submission={name:string;email:string;company:string;service:typeof advisoryServices[number]|"";engagement:typeof advisoryEngagements[number]|"";message:string;assessment?:{answers:Diagnostic;result:Assessment}};
type Quote={id:number;revision:number;scope:string;milestones:string;exclusions:string;amount:number;currency:string;state:string;costs:string|null};
type Support={id:string;message:string;state:"open"|"reviewing"|"resolved"};
const supportStates:Record<Support["state"],Copy>={open:["Open","Deschisă"],reviewing:["In review","În analiză"],resolved:["Resolved","Rezolvată"]};

export function AdvisoryWorkspace({locale,owner,admin,labelStatus}:{locale:Locale;owner:string;admin:boolean;labelStatus:(status:string)=>string}) {
  const t=(en:string,ro:string)=>copy(locale,[en,ro]);
  const connection=db();
  const leads=(admin?connection.prepare("SELECT id,status,payload,created FROM requests WHERE source='advisory' ORDER BY created DESC,rowid DESC LIMIT 100").all():
    connection.prepare("SELECT id,status,payload,created FROM requests WHERE source='advisory' AND owner=? ORDER BY created DESC,rowid DESC LIMIT 100").all(owner)) as Lead[];
  if(!leads.length)return <div className="glass form-panel stack"><p>{t("No consultation requests yet.","Nu există încă cereri de consultanță.")}</p>
    {!admin&&<Link href={`/${locale}/consulting`} className="button button-secondary">{t("Explore consulting","Explorează consultanța")}</Link>}</div>;
  return <div className="stack">{leads.map(lead=>{
    const submission=JSON.parse(lead.payload) as Submission;
    const project=connection.prepare("SELECT * FROM advisory_projects WHERE request_id=?").get(lead.id) as ProjectDetails|undefined;
    const quotes=(admin?
      connection.prepare("SELECT q.*, c.costs FROM quotes q LEFT JOIN advisory_quote_costs c ON q.id=c.quote_id WHERE q.request_id=? ORDER BY q.revision DESC"):
      connection.prepare("SELECT q.*, c.costs FROM quotes q LEFT JOIN advisory_quote_costs c ON q.id=c.quote_id WHERE q.request_id=? AND q.state<>'draft' ORDER BY q.revision DESC")
    ).all(lead.id) as Quote[];
    const tickets=connection.prepare("SELECT id,message,state FROM advisory_support WHERE request_id=? ORDER BY created DESC,rowid DESC LIMIT 100").all(lead.id) as Support[];
    return <article className="glass form-panel stack" key={lead.id}>
      <div className="button-row"><span className="chip">{labelStatus(lead.status)}</span><span className="mono advisory-reference">{lead.id} · {lead.created} UTC</span></div>
      <h2>{submission.assessment?t("Business diagnostic","Diagnostic de business"):t("Consultation request","Cerere de consultație")} · {submission.company}</h2>
      {admin&&<p>{submission.name} · {submission.email}</p>}
      <dl className="advisory-facts">
        <div><dt>{t("Requested service","Serviciu solicitat")}</dt><dd>{submission.service?copy(locale,serviceCopy[submission.service].title):t("To be discussed","De discutat")}</dd></div>
        <div><dt>{t("Engagement","Colaborare")}</dt><dd>{submission.engagement?copy(locale,engagementCopy[submission.engagement].title):t("To be discussed","De discutat")}</dd></div>
        {project?.assigned_service&&<div><dt>{t("Assigned service","Serviciu atribuit")}</dt><dd>{copy(locale,serviceCopy[project.assigned_service as typeof advisoryServices[number]].title)}</dd></div>}
      </dl>
      {submission.message&&<p className="advisory-preline">{submission.message}</p>}
      {submission.assessment&&<details><summary>{t("Submitted assessment","Evaluare trimisă")}</summary><AssessmentSummary locale={locale} result={submission.assessment.result} answers={submission.assessment.answers}/></details>}
      {admin&&<><form action={manageRequest} className="button-row">
        <input type="hidden" name="id" value={lead.id}/><input type="hidden" name="locale" value={locale}/>
        <label>{t("Lead or project status","Stare cerere sau proiect")}<select name="status" defaultValue={lead.status}>{requestStates.map(status=><option key={status} value={status}>{labelStatus(status)}</option>)}</select></label>
        <button className="button button-secondary">{t("Update status","Actualizează starea")}</button>
      </form>
      <details><summary>{t("Manage project details and deliverable","Gestionează proiectul și livrabilul")}</summary><AdvisoryProjectForm locale={locale} id={lead.id} project={project?{...project}:undefined}/></details>
      <details><summary>{t("Draft a quotation revision","Creează o revizie de ofertă")}</summary><QuoteForm locale={locale} id={lead.id} advisory/></details></>}
      {project?.milestones&&<div><h3>{t("Project milestones","Etapele proiectului")}</h3><p className="advisory-preline">{project.milestones}</p></div>}
      {project?.approved===1&&<details><summary>{t("Approved deliverable","Livrabil aprobat")} · {project.deliverable_title}</summary><p className="advisory-preline">{project.deliverable_body}</p></details>}
      {quotes.map(quote=>{
        const costs=quote.costs?JSON.parse(quote.costs) as Record<CostKey,number>:undefined;
        return <details key={quote.id}><summary>{t("Quotation","Ofertă")} {quote.revision} · {labelStatus(quote.state)} · {currency(locale,quote.amount,quote.currency)}</summary><div className="stack">
          <p>{quote.scope}</p><p>{quote.milestones}</p>{quote.exclusions&&<p>{quote.exclusions}</p>}
          {costs&&<dl className="advisory-facts">{costKeys.map(key=><div key={key}><dt>{copy(locale,costLabels[key])}</dt><dd>{currency(locale,costs[key],quote.currency)}</dd></div>)}</dl>}
        </div></details>;
      })}
      <details><summary>{t("Support requests","Cereri de suport")} ({tickets.length})</summary>
        <div className="stack">{tickets.map(ticket=><div className="glass form-panel stack" key={ticket.id}><p className="advisory-preline">{ticket.message}</p>
          <span className="chip">{copy(locale,supportStates[ticket.state])}</span>
          {admin&&<form action={manageAdvisorySupport} className="button-row"><input type="hidden" name="id" value={ticket.id}/><input type="hidden" name="locale" value={locale}/>
            <label>{t("Support status","Stare suport")}<select name="state" defaultValue={ticket.state}>{Object.entries(supportStates).map(([key,label])=><option key={key} value={key}>{copy(locale,label)}</option>)}</select></label>
            <button className="button button-secondary">{t("Update support status","Actualizează starea cererii de suport")}</button>
          </form>}
        </div>)}
        {!admin&&<AdvisorySupportForm locale={locale} id={lead.id} token={randomUUID()}/>}</div>
      </details>
    </article>;
  })}</div>;
}
