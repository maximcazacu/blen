"use client";
import { useActionState,useRef,useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { submitConsultation } from "@/app/actions";
import { advisoryEngagements,advisoryServices,assess,diagnosticSchema,diagnosticSteps,type Diagnostic } from "@/domain/advisory";
import { engagementCopy,serviceCopy } from "@/domain/advisory-copy";
import { diagnosticGroups } from "@/domain/diagnostic-fields";
import { copy,type Locale } from "@/domain/catalog";
import { AssessmentSummary } from "./assessment-summary";

type InquiryProps = {locale:Locale;token:string;tracking:boolean;enabled:boolean;inboxEmail:string};

export function ConsultationForm({locale,token,tracking,enabled,inboxEmail,answers,service,engagement}:{answers?:Diagnostic;service?:string;engagement?:string}&InquiryProps) {
  const t=(en:string,ro:string)=>copy(locale,[en,ro]);
  const [state,action,pending]=useActionState(submitConsultation,{ok:false,code:"",id:undefined as string|undefined});
  const [fields,setFields]=useState({name:"",email:"",company:"",service:service??"",engagement:engagement??"",message:""});
  const form=useRef<HTMLFormElement>(null);
  const audit=!answers&&service==="process-audit"&&engagement==="discovery";
  function edit(event:React.ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>) {
    const {name,value}=event.currentTarget;
    setFields(current=>({...current,[name]:value}));
  }
  const selectedService=advisoryServices.find(key=>key===fields.service);
  const selectedEngagement=advisoryEngagements.find(key=>key===fields.engagement);
  const subject=selectedService==="process-audit"?t("blen. process audit request","Cerere de audit de proces blen."):t("blen. project inquiry","Cerere de proiect blen.");
  const body=[
    `${t("Contact name","Nume de contact")}: ${fields.name.trim()}`,
    `${t("Email","E-mail")}: ${fields.email.trim()}`,
    `${t("Company","Companie")}: ${fields.company.trim()}`,
    selectedService?`${t("Service","Serviciu")}: ${copy(locale,serviceCopy[selectedService].title)}`:"",
    selectedEngagement?`${t("Engagement","Colaborare")}: ${copy(locale,engagementCopy[selectedEngagement].title)}`:"",
    fields.message.trim()?`\r\n${fields.message.trim()}`:"",
  ].filter(Boolean).join("\r\n");
  const draft=`mailto:${inboxEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  if(state.ok)return <div className="glass form-panel stack" role="status"><h2>{answers?t("Assessment sent","Evaluare trimisă"):audit?t("Test audit request saved","Cerere de audit de test salvată"):t("Consultation request received","Cerere de consultație primită")}</h2>
    <p>{t("Saved in the local workspace. Reference","Salvată în spațiul local. Referință")}: <code className="advisory-reference">{state.id}</code></p>
    {tracking&&<Link className="button button-secondary" href={`/${locale}/dashboard/consulting`}>{t("Track your consultation","Urmărește consultația")}</Link>}
  </div>;
  return <form ref={form} action={action} onSubmit={enabled?undefined:event=>{event.preventDefault();window.location.href=draft;}} className="glass form-panel stack">
    <input type="hidden" name="locale" value={locale}/><input type="hidden" name="token" value={token}/>
    <input type="hidden" name="answers" value={answers?JSON.stringify(answers):""}/>
    <label hidden>Website<input name="website" tabIndex={-1} autoComplete="off"/></label>
    <h2>{answers?t("Contact us about your assessment","Discută cu noi despre evaluare"):audit?t("Tell us about your process","Spune-ne despre procesul tău"):t("Request a process consultation","Solicită o consultație de proces")}</h2>
    <p>{t("The email draft includes your contact details, selected service, engagement and message. Review it in your email app and select Send.","Ciorna include datele de contact, serviciul ales, tipul colaborării și mesajul. Verific-o în aplicația de e-mail și apasă Trimite.")}{" "}{answers&&t("Add any assessment details you want to share to the draft.","Adaugă în ciornă detaliile din evaluare pe care vrei să le comunici.")}</p>
    <div className="form-grid"><label>{t("Contact name","Nume de contact")}<input name="name" value={fields.name} onChange={edit} maxLength={100} required autoComplete="name"/></label>
    <label>{t("Email","E-mail")}<input name="email" value={fields.email} onChange={edit} type="email" maxLength={160} required autoComplete="email"/></label></div>
    <label>{t("Company","Companie")} <small>{t("(optional)","(opțional)")}</small><input name="company" value={fields.company} onChange={edit} maxLength={120} autoComplete="organization"/></label>
    <label>{t("Consulting service","Serviciu de consultanță")}<select name="service" value={fields.service} onChange={edit}><option value="">{t("Help me choose","Ajută-mă să aleg")}</option>{advisoryServices.map(slug=><option key={slug} value={slug}>{copy(locale,serviceCopy[slug].title)}</option>)}</select></label>
    <label>{t("Type of engagement","Tipul colaborării")}<select name="engagement" value={fields.engagement} onChange={edit}><option value="">{t("To be discussed","De discutat")}</option>{advisoryEngagements.map(key=><option key={key} value={key}>{copy(locale,engagementCopy[key].title)}</option>)}</select></label>
    <label>{answers?t("Anything else? (optional)","Alte detalii (opțional)"):audit?t("What process would you like to audit?","Ce proces vrei să analizăm?"):t("What would you like to discuss?","Ce ai vrea să discutăm?")}<textarea name="message" value={fields.message} onChange={edit} rows={4} maxLength={1200} minLength={answers?undefined:10} required={!answers}/></label>
    {enabled&&<p>{t("To test the form, use fictional data and save a test request in the local workspace.","Pentru a testa formularul, folosește date fictive și salvează o cerere de test în spațiul local.")}{" "}{answers&&t("The local test also saves all five steps of answers and the preliminary result.","Testul local salvează și răspunsurile din cei cinci pași, împreună cu evaluarea preliminară.")}</p>}
    <p><Link href={`/${locale}/privacy`}>{t("Privacy information","Informații privind confidențialitatea")}</Link></p>
    {state.code&&<p className="notice error" role="alert">{state.code==="rate"?t("Please wait before trying again.","Așteaptă înainte să încerci din nou."):state.code==="requestConflict"?t("This request has already been sent. Reload the page to start another one.","Cererea a fost deja trimisă. Reîncarcă pagina pentru a începe alta."):t("The request could not be saved. Review the fields and try again.","Cererea nu a putut fi salvată. Verifică datele și încearcă din nou.")}</p>}
    <div className="button-row">
      <a className="button button-primary" href={draft} onClick={event=>{if(!form.current?.reportValidity())event.preventDefault();}}>{t("Open email draft","Deschide ciorna de e-mail")}<ArrowRight size={17}/></a>
      {enabled&&<button type="submit" className="button button-secondary" disabled={pending}>{pending?t("Saving…","Se salvează…"):answers?t("Send my assessment","Trimite evaluarea"):audit?t("Save test audit request","Salvează cererea de audit de test"):t("Save test consultation request","Salvează cererea de consultație de test")}</button>}
    </div>
  </form>;
}

export function BusinessDiagnostic({locale,token,tracking,enabled,inboxEmail}:InquiryProps) {
  const t=(en:string,ro:string)=>copy(locale,[en,ro]);
  const [step,setStep]=useState(0);
  const [draft,setDraft]=useState<Record<string,unknown>>({});
  const [error,setError]=useState<string[]>([]);
  const [answers,setAnswers]=useState<Diagnostic>();
  const heading=useRef<HTMLHeadingElement>(null);
  function move(next:number){setStep(next);setError([]);requestAnimationFrame(()=>heading.current?.focus());}
  const group=diagnosticGroups[step];
  if(answers){
    const result=assess(answers);
    return <div className="split diagnostic-layout">
      <section className="glass form-panel stack"><h2 tabIndex={-1} ref={heading}>{t("Your assessment","Evaluarea ta")}</h2><AssessmentSummary locale={locale} answers={answers} result={result}/>
        <div className="button-row"><button type="button" className="button button-secondary" onClick={()=>{setAnswers(undefined);move(4);}}>{t("Edit my answers","Editează răspunsurile")}</button><Link href={`/${locale}/consulting/${result.recommended}`}>{t("Explore the recommended service","Vezi serviciul recomandat")}</Link></div>
      </section>
      <ConsultationForm locale={locale} token={token} tracking={tracking} enabled={enabled} inboxEmail={inboxEmail} answers={answers} service={result.recommended}/>
    </div>;
  }
  return <div className="glass form-panel stack diagnostic-layout">
    <ol className="diagnostic-steps" aria-label={t("Diagnostic progress","Progresul diagnosticului")}>{diagnosticGroups.map((group,index)=><li key={group.title[0]} aria-current={index===step?"step":undefined}><span className="mono">0{index+1}</span>{copy(locale,group.title)}</li>)}</ol>
    <h2 tabIndex={-1} ref={heading}>{copy(locale,group.title)}</h2>
    <form key={step} className="stack" onSubmit={event=>{
      event.preventDefault();
      const values=new FormData(event.currentTarget);
      const stage=Object.fromEntries(group.fields.map(field=>[field.name,field.type==="checks"?values.getAll(field.name):values.get(field.name)]));
      const check=diagnosticSteps[step].safeParse(stage);
      const next={...draft,...stage};
      setDraft(next);
      if(!check.success){setError(check.error.issues.map(issue=>String(issue.path[0])));return;}
      if(step<diagnosticGroups.length-1){move(step+1);return;}
      const complete=diagnosticSchema.safeParse(next);
      if(complete.success){setAnswers(complete.data);requestAnimationFrame(()=>heading.current?.focus());}
    }}>
      {group.fields.map(field=>{
        const previous=draft[field.name];
        const label=copy(locale,field.label);
        if(field.type==="checks")return <fieldset key={field.name} className="diagnostic-options"><legend>{label}</legend>
          {Object.entries(field.options??{}).map(([value,option])=><label className="glass" key={value}><input name={field.name} type="checkbox" value={value} defaultChecked={Array.isArray(previous)&&previous.includes(value)}/>{copy(locale,option)}</label>)}
        </fieldset>;
        return <label key={field.name}>{label}{field.type==="textarea"?<textarea name={field.name} defaultValue={String(previous??"")} maxLength={field.max} rows={3} required/>:field.options?<select name={field.name} defaultValue={String(previous??"")} required>
          <option value="" disabled>{t("Choose an option","Alege o opțiune")}</option>{Object.entries(field.options).map(([value,option])=><option key={value} value={value}>{copy(locale,option)}</option>)}
        </select>:<input name={field.name} type={field.type==="number"?"number":"text"} min={field.type==="number"?1:undefined} max={field.type==="number"?field.max:undefined} maxLength={field.type==="number"?undefined:field.max} defaultValue={String(previous??"")} required/>}</label>;
      })}
      {error.length>0&&<p className="notice error" role="alert">{t("Complete or check these fields: ","Completează sau verifică aceste câmpuri: ")}{group.fields.filter(field=>error.includes(field.name)).map(field=>copy(locale,field.label)).join(" · ")}</p>}
      <div className="button-row">{step>0&&<button type="button" className="button button-secondary" onClick={event=>{
        const values=new FormData(event.currentTarget.form!);
        setDraft({...draft,...Object.fromEntries(group.fields.map(field=>[field.name,field.type==="checks"?values.getAll(field.name):values.get(field.name)]))});
        move(step-1);
      }}>{t("Back","Înapoi")}</button>}
        <button className="button button-primary">{step===diagnosticGroups.length-1?t("View my assessment","Vezi evaluarea"):t("Continue","Continuă")}<ArrowRight size={17}/></button></div>
    </form>
  </div>;
}
