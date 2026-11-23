"use client";
import { useActionState, useState } from "react";
import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";
import { costKeys } from "@/domain/advisory";
import { costLabels } from "@/domain/advisory-copy";
import { authenticate, checkout, saveProduct, saveQuote, submitRequest } from "@/app/actions";
import { copy, currency, productStates, statusLabel, type Locale, type Copy, type Product } from "@/domain/catalog";
const messages:Record<string,Copy>={
  disabled:["This feature requires the local demo server.","Funcția necesită serverul local de test."],
  rate:["Please wait before trying again.","Așteaptă înainte de a încerca din nou."],
  invalid:["Check the fields and try again.","Verifică datele și încearcă din nou."],
  auth:["The account operation could not be completed.","Operațiunea de cont nu a putut fi finalizată."],
  emailOff:["Reset email requires configured Supabase Auth.","Resetarea prin e-mail necesită configurarea Supabase Auth."],
  confirm:["Check the confirmation inbox configured for this test environment.","Verifică inboxul de confirmare configurat pentru mediul de test."],
  reset:["If the test account exists, check the configured recovery inbox.","Dacă există contul de test, verifică inboxul configurat pentru recuperare."],
  checkoutOff:["Checkout could not start. Verify the workflow and test price configuration.","Sesiunea de test nu a putut porni. Verifică fluxul și prețurile de test."],
  login:["Sign in to continue.","Autentifică-te pentru a continua."],
  saved:["Saved.","Salvat."],
  quoteAmount:["Enter a positive total using valid minor-unit amounts.","Introdu un total pozitiv folosind sume valide în unități minore."],
  missing:["This record is unavailable.","Această înregistrare nu este disponibilă."],
  requestInvalid:["Check the email, company and workflow details.","Verifică e-mailul, compania și detaliile fluxului."],
  requestConflict:["This reference was used with different details. Reload to start a new request.","Această referință a fost folosită cu alte detalii. Reîncarcă pagina pentru o cerere nouă."],
};
export const initial={ok:false,code:"",id:undefined as string|undefined};
export function Status({locale,state}:{locale:Locale;state:{ok:boolean;code:string}}) {
  if(!state.code)return null;
  return <p className={"notice"+(state.ok?" success":" error")} role={state.ok?"status":"alert"}>{copy(locale,messages[state.code]??messages.invalid)}</p>;
}
export function AuthForm({locale,mode,next,configured}:{locale:Locale;mode:string;next:string;configured:boolean}) {
  const [state,action,pending]=useActionState(authenticate,initial);
  const t=(en:string,ro:string)=>copy(locale,[en,ro]);
  const isDemo=mode==="demo" || mode==="admin-demo";
  return <form className={isDemo?"demo-form":"stack"} action={action}>
    <input type="hidden" name="locale" value={locale}/><input type="hidden" name="mode" value={mode}/><input type="hidden" name="next" value={next}/>
    {!isDemo && mode!=="password" && <label>{t("Test email","E-mail de test")}<input name="email" type="email" autoComplete="email" placeholder={configured?"test@example.com":"test@example.invalid"} required maxLength={160}/></label>}
    {!isDemo && mode!=="reset" && <label>{t("Password","Parolă")}<input name="password" type="password" minLength={10} maxLength={128} autoComplete={mode==="login"?"current-password":"new-password"} required/></label>}
    <button className={"button "+(isDemo?"button-secondary":"button-primary")} disabled={pending}>{pending?t("Working…","Se procesează…"):mode==="demo"?t("Start a demo session","Pornește o sesiune demo"):mode==="admin-demo"?t("Open local admin demo","Deschide demo admin"):mode==="reset"?t("Send recovery link","Trimite link de recuperare"):mode==="password"?t("Update password","Schimbă parola"):mode==="register"?t("Create test account","Creează cont de test"):t("Sign in","Intră în cont")}<ArrowRight size={15}/></button>
    <Status state={state} locale={locale}/>
  </form>;
}
export function CheckoutForm({locale,product,prices,workflow,enabled,redirectTo}:{locale:Locale;product:string;prices?:{EUR:number;RON:number};workflow?:string;enabled:boolean;redirectTo:string}) {
  const [state,action,pending]=useActionState(checkout,initial);
  const t=(en:string,ro:string)=>copy(locale,[en,ro]);
  if(!prices)return <p className="notice">{t("Test prices are unconfigured.","Prețurile de test nu sunt configurate.")}</p>;
  if(!enabled)return <Link className="button button-primary" href={`/${locale}/login?next=${encodeURIComponent(redirectTo)}`}>{t("Sign in for test checkout","Intră în cont pentru plata de test")}<ArrowRight size={16}/></Link>;
  return <form className="stack" action={action}>
    <input type="hidden" name="locale" value={locale}/><input type="hidden" name="product" value={product}/>{workflow&&<input type="hidden" name="workflow" value={workflow}/>}
    <label>{t("Test price","Preț de test")}<select name="currency">{(["EUR","RON"] as const).map(code=><option key={code} value={code}>{currency(locale,prices[code],code)} · {code}</option>)}</select></label>
    <button className="button button-primary" disabled={pending}>{t("Continue to test checkout","Continuă la plata de test")}<ArrowRight size={16}/></button>
    <Status locale={locale} state={state}/>
  </form>;
}
export function RequestForm({locale,token,contact,ops,tracking}:{locale:Locale;token:string;contact:string;ops:boolean;tracking:boolean}) {
  const [state,action,pending]=useActionState(submitRequest,initial);
  const [customer,setCustomer]=useState("individual");
  const [mailBody,setMailBody]=useState("");
  const t=(en:string,ro:string)=>copy(locale,[en,ro]);
  const draft=`mailto:${contact}?subject=${encodeURIComponent(ops?t("FluxClar Ops by blen. — Pilot","FluxClar Ops by blen. — Pilot"):t("blen. — Project inquiry","blen. — Cerere de proiect"))}&body=${encodeURIComponent(mailBody)}`;
  if(state.ok)return <div className="glass form-panel" role="status"><p className="eyebrow">{t("RECEIVED","PRIMITĂ")}</p><h2>{t("Saved to the local inbox.","Cererea a fost salvată local.")}</h2><p>{t("Reference","Referință")} <code>{state.id}</code></p><p>{t("Email delivery is disabled. You can send the draft from your email app.","Trimiterea automată este dezactivată. Poți trimite ciorna din aplicația ta de e-mail.")}</p><div className="button-row"><a className="button button-secondary" href={draft}><Mail size={16}/>{t("Open email draft","Deschide ciorna")}</a>{tracking&&<Link href={`/${locale}/dashboard/requests`} className="button button-primary">{t("Track request","Urmărește cererea")}</Link>}</div></div>;
  return <form className="glass form-panel stack" action={action} onChange={event=>{
    const data=new FormData(event.currentTarget);
    setMailBody(["name","email","company","service","workflow","outcome","budget","timeline","details"].map(name=>String(data.get(name)??"")).filter(Boolean).join("\n\n"));
  }}>
    <input type="hidden" name="locale" value={locale}/><input type="hidden" name="token" value={token}/><input type="hidden" name="source" value={ops?"ops":"web"}/>
    <label hidden aria-hidden>Website<input name="website" tabIndex={-1} autoComplete="off"/></label>
    <div className="form-grid"><label>{t("Contact name (optional)","Nume de contact (opțional)")}<input name="name" maxLength={100}/></label><label>{t("Test reply email","E-mail de răspuns pentru test")}<input name="email" type="email" placeholder="test@example.invalid" maxLength={160} required/></label></div>
    <div className="form-grid"><label>{t("Customer type","Tip de client")}<select name="customer" value={customer} onChange={event=>setCustomer(event.target.value)}><option value="individual">{t("Individual","Persoană fizică")}</option><option value="business">{t("Business","Companie")}</option></select></label><label>{t("Company","Companie")}<input name="company" required={customer==="business"} maxLength={120}/></label></div>
    <div className="form-grid"><label>{t("Service","Serviciu")}<select name="service" defaultValue={ops?"workflows":"copilot"}><option value="copilot">Copilot Studio</option><option value="excel">Excel / Office Scripts</option><option value="workflows">Power Automate / FluxClar Ops</option><option value="n8n">n8n</option><option value="other">{t("Other","Alt serviciu")}</option></select></label><label>{t("Estimated budget","Buget estimat")}<select name="budget"><option value="undecided">{t("Undecided","Nehotărât")}</option><option value="under-500">&lt; €500</option><option value="500-2000">€500–€2,000</option><option value="2000-plus">€2,000+</option></select></label></div>
    <label>{t("Current workflow","Fluxul actual")}<textarea name="workflow" required minLength={15} maxLength={2200} rows={3} defaultValue={ops?t("Retail pilot for equipment incident routing.","Pilot retail pentru distribuirea incidentelor de echipament."):""}/></label>
    <label>{t("Desired outcome","Rezultat dorit")}<textarea name="outcome" required minLength={5} maxLength={1400} rows={2}/></label>
    <label>{t("Timeline (optional)","Calendar (opțional)")}<input name="timeline" maxLength={120}/></label>
    <label>{t("Additional details (optional)","Detalii suplimentare (opțional)")}<textarea name="details" maxLength={1000} rows={2}/></label>
    <p className="muted">{t("Use fictional data only. Leave out passwords, confidential information and access tokens.","Folosește doar date fictive. Omite parolele, informațiile confidențiale și tokenurile de acces.")} <Link href={`/${locale}/privacy`}>{t("Privacy draft","Proiect de confidențialitate")}</Link></p>
    <div className="button-row"><button className="button button-primary" disabled={pending}>{pending?t("Saving…","Se salvează…"):t("Save test request","Salvează cererea de test")}<ArrowRight size={16}/></button><a className="button button-secondary" href={draft}><Mail size={16}/>{t("Open email draft","Deschide ciorna")}</a></div>
    <Status locale={locale} state={state}/>
  </form>;
}
export function QuoteForm({locale,id,advisory=false}:{locale:Locale;id:string;advisory?:boolean}) {
  const [state,action,pending]=useActionState(saveQuote,initial);
  const t=(en:string,ro:string)=>copy(locale,[en,ro]);
  return <form action={action} className="stack">
    <input type="hidden" name="id" value={id}/><input type="hidden" name="locale" value={locale}/>
    <label>{t("Scope","Obiectiv")}<textarea name="scope" required minLength={10} maxLength={2000}/></label>
    <label>{t("Milestones","Etape")}<textarea name="milestones" required minLength={5} maxLength={1500}/></label>
    <label>{t("Exclusions","Excluderi")}<textarea name="exclusions" maxLength={1500}/></label>
    {advisory&&<p>{t("Enter each cost in cents or bani. Use zero for items outside the quote.","Introdu fiecare cost în cenți sau bani. Folosește zero pentru elementele din afara ofertei.")}</p>}
    <div className="form-grid">{advisory?costKeys.map(key=><label key={key}>{copy(locale,costLabels[key])}<input type="number" name={key} min={0} max={100000000} defaultValue={0} required/></label>):<label>{t("Amount in minor units","Sumă în unități minore")}<input type="number" name="amount" min={1} max={100000000} required/></label>}<label>{t("Currency","Monedă")}<select name="currency"><option>EUR</option><option>RON</option></select></label></div>
    <label>{t("Quote status","Starea ofertei")}<select name="state"><option value="draft">{t("Draft","Ciornă")}</option><option value="proposed">{t("Proposed","Propusă")}</option><option value="accepted">{t("Accepted","Acceptată")}</option><option value="rejected">{t("Rejected","Respinsă")}</option></select></label>
    <button className="button button-secondary" disabled={pending}>{t("Save revision","Salvează revizia")}</button><Status locale={locale} state={state}/>
  </form>;
}
export function ProductForm({locale,product}:{locale:Locale;product?:Product}) {
  const [state,action,pending]=useActionState(saveProduct,initial);
  const t=(en:string,ro:string)=>copy(locale,[en,ro]);
  return <form className="stack" action={action}>
    <input type="hidden" name="locale" value={locale}/><input type="hidden" name="id" value={product?.id??""}/>
    <div className="form-grid">
      <label>{t("Product slug","Identificator produs")}<input name="slug" defaultValue={product?.slug} readOnly={Boolean(product)} pattern="[a-z][a-z0-9]*(?:-[a-z0-9]+)*" maxLength={60} required/></label>
      <label>{t("Version","Versiune")}<input name="version" defaultValue={product?.version??"1.0.0"} pattern="[0-9]+\.[0-9]+\.[0-9]+" required/></label>
      <label>{t("English title","Titlu engleză")}<input name="en" defaultValue={product?.title[0]} minLength={3} maxLength={90} required/></label>
      <label>{t("Romanian title","Titlu română")}<input name="ro" defaultValue={product?.title[1]} minLength={3} maxLength={90} required/></label>
      <label>{t("English description","Descriere engleză")}<textarea name="descEn" defaultValue={product?.description[0]} minLength={10} maxLength={350} required/></label>
      <label>{t("Romanian description","Descriere română")}<textarea name="descRo" defaultValue={product?.description[1]} minLength={10} maxLength={350} required/></label>
      <label>{t("Category","Categorie")}<select name="category" defaultValue={product?.category??"Excel"}>{["Excel","Office Scripts","Reporting","Custom"].map(value=><option value={value} key={value}>{value==="Reporting"?t("Reporting","Raportare"):value==="Custom"?t("Custom","La comandă"):value}</option>)}</select></label>
      <label>{t("Deliverable template","Șablon pentru livrare")}<select name="template" defaultValue={product?.template??"cleanup"}><option value="cleanup">{t("Cleanup","Curățare")}</option><option value="formatting">{t("Formatting","Formatare")}</option><option value="reporting">{t("Reporting","Raportare")}</option></select></label>
      <label>{t("EUR test price in cents","Preț de test în eurocenți")}<input type="number" name="eur" defaultValue={product?.prices.EUR} min={50} max={1000000} required/></label>
      <label>{t("RON test price in bani","Preț de test în bani")}<input type="number" name="ron" defaultValue={product?.prices.RON} min={200} max={1000000} required/></label>
    </div>
    <label>{t("Publication status","Starea publicării")}<select name="status" defaultValue={product?.status??"draft"}>{productStates.map(value=><option key={value} value={value}>{statusLabel(locale,value)}</option>)}</select></label>
    <button className="button button-secondary" disabled={pending}>{t("Save product","Salvează produsul")}</button><Status locale={locale} state={state}/>
  </form>;
}
