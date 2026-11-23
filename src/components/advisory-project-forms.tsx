"use client";

import { useActionState } from "react";
import { saveAdvisoryProject,submitAdvisorySupport } from "@/app/actions";
import { copy,type Locale } from "@/domain/catalog";
import { advisoryServices } from "@/domain/advisory";
import { serviceCopy } from "@/domain/advisory-copy";

export type ProjectDetails={assigned_service:string;notes:string;milestones:string;deliverable_title:string;deliverable_body:string;approved:number};
const initial={ok:false,code:"",id:undefined as string|undefined};
export function AdvisoryProjectForm({locale,id,project}:{locale:Locale;id:string;project?:ProjectDetails}) {
  const t=(en:string,ro:string)=>copy(locale,[en,ro]);
  const [state,action,pending]=useActionState(saveAdvisoryProject,initial);
  return <form className="stack" action={action}>
    <input type="hidden" name="locale" value={locale}/><input type="hidden" name="id" value={id}/>
    <label>{t("Assigned service","Serviciu atribuit")}<select name="assigned" defaultValue={project?.assigned_service??""}>
      <option value="">{t("Unassigned","Neatribuit")}</option>{advisoryServices.map(slug=><option value={slug} key={slug}>{copy(locale,serviceCopy[slug].title)}</option>)}
    </select></label>
    <label>{t("Internal follow-up notes","Note interne de urmărire")}<textarea name="notes" rows={3} maxLength={2000} defaultValue={project?.notes}/></label>
    <label>{t("Milestones visible to the customer","Etape vizibile pentru client")}<textarea name="milestones" rows={3} maxLength={2000} defaultValue={project?.milestones}/></label>
    <label>{t("Deliverable title","Titlul livrabilului")}<input name="title" maxLength={120} defaultValue={project?.deliverable_title}/></label>
    <label>{t("Deliverable text","Textul livrabilului")}<textarea name="body" rows={5} maxLength={6000} defaultValue={project?.deliverable_body}/></label>
    <label className="advisory-checkbox"><input type="checkbox" name="approved" value="yes" defaultChecked={Boolean(project?.approved)}/>{t("Approve and show this deliverable in the customer account","Aprobă și afișează livrabilul în contul clientului")}</label>
    {state.code&&<p className={state.ok?"notice success":"notice error"} role={state.ok?"status":"alert"}>{state.ok?t("Project details saved.","Detaliile proiectului au fost salvate."):t("Check the fields. An approved deliverable requires a title and text.","Verifică câmpurile. Un livrabil aprobat trebuie să aibă titlu și text.")}</p>}
    <button className="button button-secondary" disabled={pending}>{t("Save project details","Salvează detaliile proiectului")}</button>
  </form>;
}
export function AdvisorySupportForm({locale,id,token}:{locale:Locale;id:string;token:string}) {
  const t=(en:string,ro:string)=>copy(locale,[en,ro]);
  const [state,action,pending]=useActionState(submitAdvisorySupport,initial);
  if(state.ok)return <p className="notice success" role="status">{t("Support request saved. Refresh to submit another.","Cererea de suport a fost salvată. Reîncarcă pagina pentru a trimite alta.")}</p>;
  return <form className="stack" action={action}>
    <input type="hidden" name="id" value={id}/><input type="hidden" name="token" value={token}/><input type="hidden" name="locale" value={locale}/>
    <label>{t("Describe what you need help with","Descrie cu ce ai nevoie de ajutor")}<textarea name="message" minLength={10} maxLength={1500} rows={3} required/></label>
    {state.code&&<p className="notice error" role="alert">{t("The request could not be saved. Check the message and try again.","Cererea nu a putut fi salvată. Verifică mesajul și încearcă din nou.")}</p>}
    <button className="button button-secondary" disabled={pending}>{t("Send support request","Trimite cererea de suport")}</button>
  </form>;
}
