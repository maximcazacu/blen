import type { Metadata } from "next";
import { randomUUID } from "node:crypto";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowRight, Boxes, Check, FileSpreadsheet, LockKeyhole } from "lucide-react";
import { catalog, copy, currency, services, statusLabel, type Locale, type Copy } from "@/domain/catalog";
import { template, templates, type Template, type Workflow } from "@/domain/workflow";
import { account } from "@/server/auth";
import { db } from "@/server/store";
import { configuredAuth, contact, contactPhone, previewEnabled, stripeEnabled } from "@/server/config";
import { prices } from "@/server/commerce";
import { publicProducts } from "@/server/catalog";
import { Builder } from "@/components/builder";
import { AuthForm, CheckoutForm, RequestForm } from "@/components/forms";
import { Home,Intro,Methodology,PillarGrid,ServiceGrid,SolutionGrid } from "@/components/marketing";
import { Market } from "@/components/market";
import { WorkflowVisual } from "@/components/workflow-visual";
import { CheckoutStatus,Workspace } from "@/components/workspace";
import { CopilotDemo } from "@/components/copilot-demo";
import { AdvisoryLanding,AdvisoryService,advisoryTitle,diagnosticTitle } from "@/components/advisory";
import { BusinessDiagnostic,ConsultationForm } from "@/components/advisory-forms";
import { advisoryEngagements,advisoryServices } from "@/domain/advisory";
import { serviceCopy } from "@/domain/advisory-copy";
import { brand, indexingEnabled, opsName, publicPaths, siteDescription, siteOrigin, tagline } from "@/domain/site-config";
import { pillars } from "@/domain/service-pillars";
type PageProps={params:Promise<{locale:string;section?:string[]}>;searchParams:Promise<Record<string,string|string[]|undefined>>};
const legal:Record<string,{title:Copy;summary:Copy}> = {
  privacy:{title:["Privacy policy","Politica de confidențialitate"],summary:["This preview stores local test account details, synthetic workflows, requests, orders and download events. Before launch, confirm the controller, purposes, lawful bases, providers, transfers, retention and rights procedure.","Previzualizarea stochează local datele conturilor de test, fluxurile fictive, cererile, comenzile și descărcările. Înainte de lansare, confirmă operatorul, scopurile, temeiurile, furnizorii, transferurile, retenția și procedura pentru exercitarea drepturilor."]},
  cookies:{title:["Cookie policy","Politica privind modulele cookie"],summary:["The local demo uses a session cookie for sign-in. Configured Supabase Auth uses its session cookies. The site includes no analytics or advertising tags.","Demo-ul local folosește un cookie de autentificare. Supabase Auth, dacă este configurat, folosește cookie-uri de sesiune. Site-ul nu include taguri de analiză sau publicitate."]},
  terms:{title:["Terms and conditions","Termeni și condiții"],summary:["The preview is for evaluation with synthetic data. Orders are tests. Before commercial use, confirm the seller, contract steps, pricing, license terms and applicable consumer protections.","Previzualizarea se evaluează cu date fictive. Comenzile sunt de test. Înainte de utilizarea comercială, confirmă vânzătorul, etapele contractului, prețurile, licențele și protecțiile aplicabile consumatorului."]},
  delivery:{title:["Digital products and delivery","Produse digitale și livrare"],summary:["A test order unlocks an account-owned ZIP with TypeScript, workflow JSON and installation instructions. Verify commercial delivery terms and technical compatibility before launch.","O comandă de test deblochează o arhivă ZIP în cont, cu TypeScript, JSON și instrucțiuni de instalare. Verifică livrarea comercială și compatibilitatea tehnică înainte de lansare."]},
  refunds:{title:["Withdrawal and refunds","Retragere și rambursări"],summary:["Simulated payments create no charge. Real withdrawal, remedies and refund terms require approval before enabling commercial checkout.","Plățile simulate nu generează încasări. Termenii pentru retragere, remedii și rambursări necesită aprobare înainte de activarea plății comerciale."]},
  provider:{title:["Provider information","Datele prestatorului"],summary:["The legal entity, registration, business address and tax identifiers are pending confirmation. The email below is a provisional project contact.","Entitatea juridică, înregistrarea, sediul și datele fiscale sunt în așteptarea confirmării. Adresa de e-mail de mai jos este contactul provizoriu al proiectului."]},
  licensing:{title:["Licensing disclosures","Informații despre licențe"],summary:["Office Scripts availability depends on your Microsoft license, Excel environment and tenant policies. Customer deployments of Power Automate, Copilot Studio or n8n require a separate licensing and hosting review.","Disponibilitatea Office Scripts depinde de licența Microsoft, mediul Excel și politicile organizației. Proiectele Power Automate, Copilot Studio și n8n necesită verificarea separată a licențelor și găzduirii."]},
  complaints:{title:["Contact and complaints","Contact și reclamații"],summary:["Use the provisional email for questions about the demonstration. The commercial complaints process and provider details require confirmation.","Folosește adresa provizorie pentru întrebări despre demonstrație. Procedura comercială pentru reclamații și datele prestatorului necesită confirmare."]},
};
const pageNames:Record<string,Copy>={services:["Services","Servicii"],solutions:["Solutions","Soluții"],builder:["Automation Builder","Editor de automatizări"],marketplace:["Automation Marketplace","Catalog de automatizări"],"custom-automation":["Custom Automation","Automatizare la comandă"],ops:[opsName,opsName],"how-it-works":["How it works","Cum funcționează"],about:["About","Despre"],contact:["Contact","Contact"],faq:["FAQ","Întrebări frecvente"],login:["Sign in","Autentificare"],register:["Register","Înregistrare"],"forgot-password":["Password recovery","Recuperare parolă"],dashboard:["Workspace","Contul meu"],admin:["Administration","Administrare"],checkout:["Test checkout","Plată de test"]};
export async function generateMetadata({params}:PageProps):Promise<Metadata>{
  const {locale,section=[]}=await params;
  const lang=locale==="ro"?"ro":"en";
  const [root,slug]=section;
  const advisory=advisoryServices.find(item=>item===slug);
  const implementation=root==="services"?services.find(item=>item.slug===slug):undefined;
  const pillar=root==="services"?pillars.find(item=>item.slug===slug):undefined;
  const product=root==="marketplace"&&slug?publicProducts().find(item=>item.slug===slug):undefined;
  const label=root==="consulting"?(advisory?serviceCopy[advisory].title:slug==="business-diagnostic"?diagnosticTitle:advisoryTitle):
    product?.title??pillar?.title??implementation?.title??legal[root]?.title??pageNames[root];
  const title=label?copy(lang,label):copy(lang,tagline);
  const description=copy(lang,product?.description??pillar?.intro??implementation?.description??(advisory?serviceCopy[advisory].summary:siteDescription));
  const suffix=section.length?"/"+section.join("/"):"";
  const canonical=siteOrigin()+"/"+lang+suffix;
  const index=indexingEnabled()&&publicPaths.includes(suffix);
  const socialTitle=label?title+" | "+brand:brand+" — "+title;
  const image={url:"/social-card.png",width:1200,height:630,alt:brand};
  return {
    title:root?title:{absolute:socialTitle},
    description,
    alternates:{canonical,languages:{en:"/en"+suffix,ro:"/ro"+suffix,"x-default":"/ro"+suffix}},
    robots:{index,follow:index},
    openGraph:{type:"website",siteName:brand,url:canonical,title:socialTitle,description,locale:lang==="ro"?"ro_RO":"en_GB",alternateLocale:[lang==="ro"?"en_GB":"ro_RO"],images:[image]},
    twitter:{card:"summary_large_image",title:socialTitle,description,images:[image.url]},
  };
}
export default async function Page({params,searchParams}:PageProps) {
  const {locale:value,section=[]}=await params;
  if(value!=="en"&&value!=="ro")notFound();
  const locale:Locale=value;
  const t=(en:string,ro:string)=>copy(locale,[en,ro]);
  const query=await searchParams;
  const [root,slug,...rest]=section;
  if(rest.length)notFound();
  if(!root)return <Home locale={locale}/>;
  const href=(page:string)=>`/${locale}/${page}`;
  const link=(page:string,label:string)=> <Link href={href(page)} className="button button-primary">{label}<ArrowRight size={17}/></Link>;
  if(root==="consulting") {
    if(!slug)return <AdvisoryLanding locale={locale}/>;
    const service=advisoryServices.find(item=>item===slug);
    if(service)return <AdvisoryService locale={locale} slug={service}/>;
    if(slug!=="business-diagnostic")notFound();
    const user=await account();
    return <><Intro tag="blen." title={copy(locale,diagnosticTitle)} description={t("Describe one process in five steps to get a preliminary assessment. Use fictional information for local testing.","Descrie un proces în cinci pași pentru a primi o evaluare preliminară. Folosește informații fictive pentru testarea locală.")}>
      {!user&&previewEnabled()&&<p className="advisory-intro-link"><Link href={href("login?next="+encodeURIComponent(href("consulting/business-diagnostic")))}>{t("Sign in before starting to track your submission in your account","Intră în cont înainte de a începe ca să urmărești evaluarea trimisă")}</Link></p>}
    </Intro><BusinessDiagnostic locale={locale} token={randomUUID()} tracking={Boolean(user)} enabled={previewEnabled()} inboxEmail={contact()}/></>;
  }
  if(root==="solutions"&&!slug) return <>
    <Intro tag="blen." title={t("Solutions","Soluții")} description={t("Explore interactive tools, reusable templates and pilot concepts.","Explorează instrumente interactive, șabloane reutilizabile și concepte de pilot.")}/>
    <SolutionGrid locale={locale}/>
  </>;
  if(root==="services") {
    if(!slug)return <>
      <Intro tag="blen." title={t("Services","Servicii")} description={t("We help businesses, independent professionals and individuals define what needs to change and build practical solutions.","Ajutăm firmele, profesioniștii independenți și persoanele fizice să stabilească ce trebuie schimbat și să construiască soluții practice.")}/>
      <PillarGrid locale={locale}/>
      <section className="section blen-section" id="implementation"><div className="section-heading"><h2>{t("What we can build for your team","Ce putem construi pentru echipa ta")}</h2></div><ServiceGrid locale={locale}/></section>
      <div className="section compact button-row">{link("contact",t("Let's talk","Hai să discutăm"))}<Link className="button button-secondary" href={href("consulting")}>{t("Explore process consulting","Vezi opțiunile de consultanță")}</Link></div>
    </>;
    const pillar=pillars.find(item=>item.slug===slug);
    if(pillar)return <>
      <Intro tag="blen." title={copy(locale,pillar.title)} description={copy(locale,pillar.intro)}/>
      <div className="split">
        <section className="glass form-panel stack"><h2>{t("How we help","Cum te ajutăm")}</h2><p>{copy(locale,pillar.approach)}</p>
          <ul className="checks">{pillar.capabilities.map(item=><li key={item[0]}><Check size={16} aria-hidden/>{copy(locale,item)}</li>)}</ul>
        </section>
        <aside className="glass form-panel stack"><h2>{t("Example project","Exemplu de proiect")}</h2><p>{copy(locale,pillar.example)}</p>
          {link(slug==="business-consulting"?"contact":"contact?engagement=implementation",slug==="business-consulting"?t("Request a process audit","Solicită un audit de proces"):t("Discuss a project","Discută un proiect"))}
          {slug==="business-consulting"&&<Link className="text-link" href={href("consulting/business-diagnostic")}>{t("Try the process diagnostic","Încearcă diagnosticul de proces")}</Link>}
        </aside>
      </div>
      {slug!=="business-consulting"&&<section className="section blen-section"><div className="section-heading"><h2>{t("Implementation examples","Exemple de implementare")}</h2></div><ServiceGrid locale={locale}/></section>}
    </>;
    const service=services.find(item=>item.slug===slug);
    if(!service)notFound();
    return <><Intro tag={t("CUSTOM DEVELOPMENT","DEZVOLTARE LA COMANDĂ")} title={copy(locale,service.title)} description={copy(locale,service.description)}>
      <p className="implementation-technology" data-tone={service.tone}>{t("Built with","Folosim")} <strong>{copy(locale,service.technology)}</strong></p>
    </Intro>
      <div className="glass form-panel stack tool-example" data-tone={service.tone}><div className="example-label"><span className="tool-icon"><Image src={service.icon} alt="" fill sizes="44px" unoptimized/></span><p className="eyebrow">{t("EXAMPLE PROJECT","EXEMPLU DE PROIECT")}</p></div><h2>{copy(locale,service.example)}</h2><p>{t("We begin with the process, its rules and responsibilities, then agree scope, licensing and acceptance criteria for this implementation.","Pornim de la proces, reguli și responsabilități, apoi stabilim scopul, licențele și criteriile de acceptare pentru implementare.")}</p>{link("contact?engagement=implementation",t("Discuss your workflow","Discută despre fluxul tău"))}<Link href={href("consulting")}>{t("Review the process before choosing a tool","Analizează procesul înainte să alegi un instrument")}</Link></div>
      {slug==="copilot-studio"&&<CopilotDemo locale={locale} scenario={query.scenariu}/>}</>;
  }
  if(root==="marketplace") {
    const listed=publicProducts();
    if(!slug)return <><Intro tag={t("blen. / CATALOG","blen. / CATALOG")} title={t("Automations ready to explore.","Automatizări gata de explorat.")} description={t("Browse demonstration Office Scripts for everyday Excel work. Prices and checkout are for testing.","Explorează scripturi Office demonstrative pentru munca în Excel. Prețurile și plata sunt de test.")}/><Market locale={locale} products={listed.map(product=>({...product,displayPrice:prices(product.id)}))}/></>;
    const product=listed.find(item=>item.slug===slug);
    if(!product)notFound();
    if(product.status!=="demo")return <><Intro tag={statusLabel(locale,product.status)} title={copy(locale,product.title)} description={copy(locale,product.description)}/><div className="glass form-panel">{link("custom-automation",t("Discuss a custom project","Discută un proiect la comandă"))}</div></>;
    const user=await account();
    const price=prices(product.id);
    return <><Intro tag={product.category+" / DEMO / v"+product.version} title={copy(locale,product.title)} description={copy(locale,product.description)}/>
      <div className="split"><section className="glass form-panel stack"><div className="product-image" data-tone="green"><FileSpreadsheet size={52} strokeWidth={1.2}/></div>
      <h2>{t("What’s inside","Ce conține")}</h2><ul className="checks">{[t("Office Script, workflow JSON and installation guide","Script Office, flux JSON și ghid de instalare"),t("Requires Excel with the Automate tab enabled","Necesită Excel cu fila Automatizare activă"),t("Sample data and self-guided setup","Date fictive și instalare ghidată")].map(item=><li key={item}><Check size={16}/>{item}</li>)}</ul>
      <Link className="button button-secondary" href={href("builder?template="+product.template)}>{t("Preview in builder","Previzualizează în editor")}<ArrowRight size={16}/></Link></section>
      <aside className="glass form-panel stack"><p className="eyebrow">{stripeEnabled()?"STRIPE TEST":t("LOCAL SIMULATION","SIMULARE LOCALĂ")}</p><h2>{t("Get the demo package","Obține pachetul demo")}</h2>
      {price&&<p>{currency(locale,price.EUR,"EUR")} · {currency(locale,price.RON,"RON")}</p>}<p>{t("The local ZIP is available after test confirmation. No commercial support commitment applies.","Arhiva ZIP locală este disponibilă după confirmarea testului. Pachetul nu include suport comercial.")}</p>
      <CheckoutForm locale={locale} product={product.id} prices={price} enabled={Boolean(user)} redirectTo={href("marketplace/"+slug)}/></aside></div>
      <section className="section compact"><h2>{t("Related automations","Automatizări similare")}</h2><div className="button-row">{listed.filter(other=>other!==product).map(other=><Link key={other.id} className="button button-secondary" href={href("marketplace/"+other.slug)}>{copy(locale,other.title)}</Link>)}</div></section></>;
  }
  if(root==="builder"&&!slug) {
    const user=await account();
    const selection=typeof query.template==="string" && Object.hasOwn(templates,query.template)?query.template as Template:"cleanup";
    const key=typeof query.workflow==="string"?query.workflow:undefined;
    const row=key&&user?db().prepare("SELECT graph FROM workflows WHERE id=? AND owner=?").get(key,user.id):null;
    if(key&&!row)notFound();
    const initialGraph=row?JSON.parse(String(row.graph)) as Workflow:template(selection,copy(locale,catalog.find(product=>product.id===selection)!.title));
    return <><Intro tag={t("blen. / WORKFLOW STUDIO","blen. / STUDIO DE FLUXURI")} title={t("Automation Builder","Editor de automatizări")} description={t("Connect Excel operations, validate the workflow and preview the generated script with synthetic data.","Conectează operațiuni Excel, validează fluxul și previzualizează scriptul generat cu date fictive.")}/>
      <Builder key={key??selection} locale={locale} initialGraph={initialGraph} id={key} loggedIn={Boolean(user)} resume={query.resume==="1"} prices={prices("builder")}/></>;
  }
  if(root==="ops"&&!slug)return <><Intro tag={t("FluxClar Ops by blen. / RETAIL PILOT","FluxClar Ops by blen. / PILOT RETAIL")} title={opsName} description={t("A pilot concept for equipment incidents across three fictional stores. Explore classification, handoffs and escalation with human review.","Concept de pilot pentru incidente de echipament în trei magazine fictive. Explorează clasificarea, atribuirea și escaladarea cu verificare umană.")}/>
    <div className="split"><WorkflowVisual locale={locale} ops/><div className="glass form-panel stack"><p className="eyebrow">{t("ILLUSTRATIVE PILOT","PILOT ILUSTRATIV")}</p><h2>{t("From report to owner","De la sesizare la responsabil")}</h2><p>{t("A store records an equipment problem. The proposed workflow categorizes the issue, assigns an owner and prompts a human review before escalation.","Un magazin raportează o problemă de echipament. Fluxul propus clasifică incidentul, desemnează un responsabil și solicită verificare umană înainte de escaladare.")}</p><p>{t("Teams notifications, SharePoint records and Microsoft 365 permissions can be scoped for a pilot.","Notificările Teams, evidența în SharePoint și permisiunile Microsoft 365 pot fi definite pentru un pilot.")}</p>{link("custom-automation?pilot=ops",t("Request an Ops pilot","Solicită un pilot Ops"))}</div></div></>;
  if(root==="contact"&&!slug&&query.pilot!=="ops") {
    const user=await account();
    const requestedService=advisoryServices.find(item=>item===query.service);
    const requestedEngagement=advisoryEngagements.find(item=>item===query.engagement);
    const audit=(!requestedService||requestedService==="process-audit")&&(!requestedEngagement||requestedEngagement==="discovery");
    const email=contact();
    return <><Intro tag="blen."
      title={audit?t("Request a process audit","Solicită un audit de proces"):t("Discuss a project","Discută un proiect")}
      description={audit?t("Tell us which process you want to improve. We’ll follow up by email to agree the scope and price before the audit begins.","Spune-ne ce proces vrei să îmbunătățești. Revenim prin e-mail pentru a stabili ce analizăm și cât costă înainte de a începe auditul."):t("Describe the workflow and the outcome you need. We’ll follow up by email to discuss the scope.","Descrie fluxul de lucru și rezultatul dorit. Revenim prin e-mail pentru a discuta ce presupune proiectul.")}/>
      <div className="split"><ConsultationForm locale={locale} token={randomUUID()} tracking={Boolean(user)} enabled={previewEnabled()} inboxEmail={email} service={audit?"process-audit":requestedService} engagement={audit?"discovery":requestedEngagement}/>
        <aside className="glass form-panel stack">
          {audit&&<><h2>{t("What happens next","Ce urmează")}</h2>
            <p>{t("The paid audit maps the current workflow and pinpoints bottlenecks. On the discovery call, we review the findings and agree what to standardize first.","Auditul contra cost cartografiază fluxul actual și identifică blocajele. În apelul de după audit, discutăm concluziile și stabilim ce standardizăm mai întâi.")}</p></>}
          <h2>{t("Contact blen.","Contactează blen.")}</h2>
          <a href={`mailto:${email}`}>{email}</a>
          <a href={contactPhone.href}>{contactPhone.display}</a>
          <p>{t("The form prepares a draft in your email app. Use only information needed to discuss your project.","Formularul pregătește o ciornă în aplicația ta de e-mail. Include doar informațiile necesare pentru a discuta proiectul.")} <Link className="text-link" href={href("privacy")}>{t("Privacy","Confidențialitate")}</Link></p>
          {audit&&<Link className="text-link" href={href("contact?engagement=implementation")}>{t("Discuss a different project","Discută un alt proiect")}</Link>}
          <Link className="button button-secondary" href={href("consulting/business-diagnostic")}>{t("Start the diagnostic","Începe diagnosticul")}</Link>
          {!user&&previewEnabled()&&<Link href={href("login?next="+encodeURIComponent(href("contact?advisory=1")))}>{t("Sign in to track a test request","Intră în cont pentru a urmări o cerere de test")}</Link>}
        </aside></div></>;
  }
  if((root==="custom-automation"||root==="contact")&&!slug) {
    const ops=query.pilot==="ops";
    const user=await account();
    return <><Intro tag={t("blen. / PROJECT INQUIRIES","blen. / CERERI DE PROIECT")} title={ops?t("Request a FluxClar Ops pilot","Solicită un pilot FluxClar Ops"):t("Tell us what needs to flow.","Ce proces vrei să simplifici?")} description={t("Describe the steps you follow today and what a better outcome would look like.","Descrie pașii pe care îi urmezi acum și rezultatul pe care vrei să îl obții.")}/>
    <div className="split"><RequestForm locale={locale} token={randomUUID()} ops={ops} contact={contact()} tracking={Boolean(user)}/><aside className="glass form-panel stack"><p className="eyebrow">{t("NEXT STEPS","PAȘII URMĂTORI")}</p><h2>{t("From request to project scope","De la cerere la definirea proiectului")}</h2><p>{t("The preview saves a test record for administrative review. Project delivery begins after a separate scope and quotation.","Previzualizarea salvează o înregistrare de test pentru analiză. Proiectul începe după definirea și ofertarea separată.")}</p><Link href={href("contact")}>{t("Need help defining the process? Request a consultation.","Ai nevoie să definești procesul? Solicită o consultație.")}</Link><a href={`mailto:${contact()}`}>{contact()}</a>{!user&&<Link href={href("login")}>{t("Sign in to track your request","Intră în cont pentru a urmări cererea")}</Link>}</aside></div></>;
  }
  if(["login","register","forgot-password"].includes(root)&&!slug) {
    const next=typeof query.next==="string"?query.next:"";
    const configured=configuredAuth();
    const mode=root==="forgot-password"?(query.recovery==="1"?"password":"reset"):root;
    return <><Intro tag={t("blen. / ACCOUNT","blen. / CONT")} title={copy(locale,pageNames[root])} description={configured?t("Use credentials created for this Supabase test environment.","Folosește date de autentificare create pentru acest mediu Supabase de test."):t("Use a synthetic address or start a local demo session.","Folosește o adresă fictivă sau pornește o sesiune demo locală.")}/>
    <div className="glass form-panel auth-panel stack"><AuthForm locale={locale} mode={mode} next={next} configured={configured}/>
      {root==="login"&&previewEnabled()&&<AuthForm locale={locale} mode="demo" next={next} configured={configured}/>}
      <div className="button-row"><Link href={href((root==="login"?"register":"login")+(next?"?next="+encodeURIComponent(next):""))}>{root==="login"?t("Create a test account","Creează cont de test"):t("Back to sign in","Înapoi la autentificare")}</Link>{root==="login"&&<Link href={href("forgot-password")}>{t("Forgot password?","Ai uitat parola?")}</Link>}</div></div></>;
  }
  if(root==="dashboard"||root==="admin") {
    const allowed=root==="admin"?["products","orders","customers","requests","consulting","quotes","automations","settings"]:["automations","orders","downloads","requests","consulting","settings"];
    if(slug&&!allowed.includes(slug))notFound();
    return <Workspace locale={locale} admin={root==="admin"} tab={slug}/>;
  }
  if(root==="checkout"&&slug) {
    const view=await CheckoutStatus({locale,id:slug,cancelled:query.cancelled==="1"});
    if(!view)notFound();
    return view;
  }
  if(!slug&&Object.hasOwn(legal,root)){
    const section=legal[root];
    return <><Intro tag={t("LEGAL / REVIEW DRAFT","JURIDIC / PROIECT PENTRU REVIZUIRE")} title={copy(locale,section.title)+" | blen."} description={t("Local demonstration. Approval is required before commercial use.","Demonstrație locală. Utilizarea comercială necesită aprobare.")}/><article className="glass form-panel stack"><LockKeyhole size={22}/><p>{copy(locale,section.summary)}</p>
      {root==="privacy"&&<>
        <p>{t("The email draft opens in your email app with your contact details, selected service, engagement and message. Review and send it from that app.","Ciorna se deschide în aplicația ta de e-mail cu datele de contact, serviciul ales, tipul colaborării și mesajul. Verifică și trimite mesajul din acea aplicație.")}</p>
        <p>{t("Saving a test request stores the form and any included assessment in the local database. Administrators can review test requests. Signed-in testers can also see their own requests. Use fictional information for tests.","Salvarea unei cereri de test înregistrează formularul și eventuala evaluare în baza de date locală. Administratorii pot verifica cererile de test, iar utilizatorii autentificați își pot vedea propriile cereri. Folosește informații fictive la testare.")}</p>
      </>}
      {root==="provider"&&<dl className="provider-fields">
        {[[t("Legal name","Denumire legală"),process.env.BLEN_PROVIDER_NAME],[t("Registration and tax details","Înregistrare și date fiscale"),process.env.BLEN_PROVIDER_REGISTRATION],[t("Business address","Sediu profesional"),process.env.BLEN_PROVIDER_ADDRESS],[t("Privacy contact","Contact pentru confidențialitate"),process.env.BLEN_PRIVACY_CONTACT]].map(([label,value])=>
          <div key={label}><dt>{label}</dt><dd>{value||t("Pending confirmation","În așteptarea confirmării")}</dd></div>)}
      </dl>}
      {["provider","complaints"].includes(root)&&<a href={`mailto:${contact()}`}>{contact()}</a>}</article></>;
  }
  if(!slug&&["how-it-works","faq","about"].includes(root)){
    const content:Record<string,[Copy,Copy][]> = {
      "how-it-works":[
        [["1. Audit one process","1. Audităm un proces"],["After we agree the scope and fee by email, we map the current steps, systems, handoffs and recurring problems. You receive a process map and a prioritized list of issues.","După ce stabilim prin e-mail ce analizăm și cât costă, documentăm pașii, sistemele, transferurile și problemele recurente. Primești o hartă a procesului și o listă de probleme în ordinea priorității."]],
        [["2. Review findings on a discovery call","2. Discutăm concluziile într-un apel"],["We walk through the findings together and agree what to standardize first, from approval rules to reporting definitions.","Parcurgem împreună concluziile și stabilim ce standardizăm mai întâi, de la regulile de aprobare la datele folosite în rapoarte."]],
        [["3. Standardize the workflow","3. Standardizăm modul de lucru"],["If you want to move forward, we define shared rules, owners, handoffs and how to handle exceptions. The team gets a documented way of working.","Dacă vrei să continuăm, definim regulile comune, responsabilii, transferurile și modul de tratare a excepțiilor. Echipa primește un proces documentat."]],
        [["4. Implement automation where it fits","4. Implementăm automatizarea unde are sens"],["For a defined process, we can scope and test suitable tools, integrations and AI assistance. Implementation is quoted separately.","Pentru un proces definit, putem stabili ce implementăm și testa instrumentele, integrările și asistența AI potrivite. Implementarea se ofertează separat."]],
      ],
      faq:[[["What does the audit cost?","Cât costă auditul?"],["We quote the fee by email once we know which process you want reviewed. You can decide whether to proceed after receiving the quote.","Comunicăm prețul prin e-mail după ce aflăm ce proces vrei să analizăm. Poți decide dacă vrei să continuăm după ce primești oferta."]],[["When does the discovery call happen?","Când are loc apelul?"],["After the audit, we review the findings with you and agree on next priorities.","După audit, discutăm concluziile împreună și stabilim ce are prioritate."]],[["What if I need integrations?","Dacă am nevoie de integrări?"],["We can scope implementation after the process and its rules are clear.","Putem stabili ce integrăm după ce sunt clare procesul și regulile lui."]]],
      about:[
        [["Our focus","Direcția noastră"],["At blen. we turn operational questions into clear requirements, defined responsibilities and systems people can use.","La blen. transformăm întrebările operaționale în cerințe clare, responsabilități definite și sisteme pe care oamenii le pot folosi."]],
        [["From process to implementation","De la proces la implementare"],["Automation is the implementation stage. We can use Excel, Microsoft 365, Power Automate, Copilot Studio, n8n and AI where they fit the agreed workflow.","Automatizarea este etapa de implementare. Putem folosi Excel, Microsoft 365, Power Automate, Copilot Studio, n8n și AI acolo unde se potrivesc fluxului definit."]],
        [["Who it’s for","Cui se adresează"],["We work with businesses, teams, independent professionals and individuals. Romania is our first market. We work in Romanian and English.","Lucrăm cu firme, echipe, profesioniști independenți și persoane fizice. România este prima noastră piață. Lucrăm în română și engleză."]],
      ],
    };
    if(root==="faq")content.faq.unshift(
      [["Can I start with consulting alone?","Pot începe doar cu o etapă de consultanță?"],["Yes. Start with a paid process audit. If the findings call for further standardization, we can quote that work separately.","Da. Poți începe cu un audit de proces contra cost. Dacă analiza arată că e nevoie de standardizare suplimentară, putem oferta acea etapă separat."]],
      [["How do you decide where AI fits?","Cum decideți unde se potrivește AI?"],["We review the process, rules, available data, human oversight and costs, then assess which steps suit conventional automation or AI assistance.","Analizăm procesul, regulile, datele disponibile, verificarea umană și costurile, apoi evaluăm ce pași se potrivesc automatizării clasice sau asistenței AI."]],
    );
    return <><Intro tag="blen." title={copy(locale,pageNames[root])} description={t("Business process consulting and standardization, followed by automation and AI where they fit.","Consultanță și standardizare de procese de business, urmate de automatizare și AI acolo unde sunt potrivite.")}/>{root==="how-it-works"&&<div className="section compact"><Methodology locale={locale}/></div>}<div className="stack">{content[root].map(([title,body])=><article className="glass form-panel stack" key={title[0]}><Boxes size={20}/><h2>{copy(locale,title)}</h2><p>{copy(locale,body)}</p></article>)}</div><div className="section compact button-row">{link("contact",t("Request a process audit","Solicită un audit de proces"))}<Link className="button button-secondary" href={href("consulting/business-diagnostic")}>{t("Assess your process","Evaluează procesul tău")}</Link></div></>;
  }
  notFound();
}
