import Link from "next/link";
import { ArrowUpRight, Download } from "lucide-react";
import { account } from "@/server/auth";
import { db } from "@/server/store";
import { copy,currency,statusLabel,type Locale } from "@/domain/catalog";
import { products } from "@/server/catalog";
import { type Order } from "@/server/commerce";
import { configuredAuth, previewEnabled, stripeEnabled } from "@/server/config";
import { signOut,manageRequest,simulate } from "@/app/actions";
import { requestStates } from "@/domain/requests";
import { Intro } from "./marketing";
import { AuthForm,ProductForm,QuoteForm } from "./forms";
import { AdvisoryWorkspace } from "./advisory-workspace";

const states:Record<string,string>={new:"nouă",reviewing:"în analiză",quoted:"ofertată",accepted:"acceptată",awaiting_deposit:"așteaptă avans",in_progress:"în lucru",testing:"în testare",delivered:"livrată",completed:"finalizată",rejected:"respinsă",cancelled:"anulată",pending:"în așteptare",paid:"plătită",failed:"eșuată",refunded:"rambursată",draft:"ciornă",proposed:"propusă"};
const stateLabel=(locale:Locale,state:string)=>locale==="ro"?(states[state]??state):state.replaceAll("_"," ");
type RequestRow={id:string;owner:string|null;status:string;source:string;payload:string;created:string};
type Quote={request_id:string;revision:number;scope:string;milestones:string;exclusions:string;amount:number;currency:string;state:string};
function Empty({locale}:{locale:Locale}) {return <p className="empty glass">{copy(locale,["Nothing here yet.","Nu există înregistrări încă."])}</p>;}
function Badge({locale,status}:{locale:Locale;status:string}) {return <span className={"chip state-"+status}>{stateLabel(locale,status)}</span>;}
function OrderList({locale,orders,download=false,admin=false}:{locale:Locale;orders:Order[];download?:boolean;admin?:boolean}) {
  if(!orders.length)return <Empty locale={locale}/>;
  const t=(en:string,ro:string)=>copy(locale,[en,ro]);
  return <div className="stack">{orders.map(order=><article className="glass row-card" key={order.id}><div><strong>{JSON.parse(order.graph).name}</strong><p>{currency(locale,order.amount,order.currency)} · {order.mode==="simulation"?t("Simulation","Simulare"):"Stripe test"} · {order.created} UTC</p>{admin&&<p className="mono">{order.id} · {order.provider_session??"—"} · {order.payment??"—"}</p>}</div>
  <div className="button-row"><Badge locale={locale} status={order.status}/>{download?<a className="button button-secondary" href={`/api/download/${order.id}`}><Download size={15}/>{t("Download ZIP","Descarcă ZIP")}</a>:!admin&&<Link className="button button-secondary" href={`/${locale}/checkout/${order.id}`}>{t("Open","Deschide")}<ArrowUpRight size={15}/></Link>}</div></article>)}</div>;
}
export async function CheckoutStatus({locale,id,cancelled}:{locale:Locale;id:string;cancelled:boolean}) {
  const user=await account();
  const t=(en:string,ro:string)=>copy(locale,[en,ro]);
  const order=user?db().prepare("SELECT * FROM orders WHERE id=? AND owner=?").get(id,user.id) as Order|undefined:undefined;
  if(!order)return null;
  return <><Intro tag={t("CHECKOUT / TEST","PLATĂ / TEST")} title={JSON.parse(order.graph).name} description={order.mode==="simulation"?t("Local checkout simulation. No payment is collected.","Simulare locală. Nu se încasează nicio sumă."):t("Stripe test checkout. Payment confirmation comes from the verified webhook.","Plată de test Stripe. Confirmarea vine de la webhookul verificat.")}/>
    <article className="glass form-panel stack"><div className="button-row"><strong>{currency(locale,order.amount,order.currency)}</strong><Badge locale={locale} status={order.status}/></div>
    {cancelled&&order.status==="pending"&&<p>{t("You left Stripe Checkout. The order remains pending until Stripe reports a result.","Ai părăsit pagina Stripe Checkout. Comanda rămâne în așteptare până la confirmarea Stripe.")}</p>}
    {order.status==="pending" && order.mode==="simulation" && <form className="button-row" action={simulate}><input type="hidden" name="locale" value={locale}/><input type="hidden" name="id" value={order.id}/>
      <button className="button button-primary" name="status" value="paid">{t("Simulate payment success","Simulează plata reușită")}</button>
      <button className="button button-secondary" name="status" value="failed">{t("Simulate failure","Simulează eșecul")}</button>
      <button className="button button-secondary" name="status" value="cancelled">{t("Cancel simulation","Anulează simularea")}</button></form>}
    {order.status==="paid"&&<a className="button button-primary" href={`/api/download/${order.id}`}><Download size={17}/>{t("Download Office Script ZIP","Descarcă scriptul Office ZIP")}</a>}
    <Link href={`/${locale}/dashboard/orders`}>{t("View order history","Vezi istoricul comenzilor")}</Link></article></>;
}
export async function Workspace({locale,admin=false,tab}:{locale:Locale;admin?:boolean;tab?:string}) {
  const t=(en:string,ro:string)=>copy(locale,[en,ro]);
  const user=await account();
  const type=admin?"admin":"dashboard";
  if(!user || (admin&&user.role!=="admin"))return <>
    <Intro tag={admin?t("blen. / Administration","blen. / Administrare"):t("blen. / Workspace","blen. / Spațiu de lucru")} title={admin?t("Administration","Administrare"):t("Your workspace","Spațiul tău de lucru")}
      description={admin?t("Local administrative records require an administrator session.","Înregistrările administrative necesită o sesiune de administrator."):t("Sign in to reopen workflows, see test orders and track project requests.","Intră în cont pentru fluxuri salvate, comenzi de test și urmărirea cererilor.")}/>
    <div className="glass form-panel stack">{admin?<><p>{t("The local admin demo can read and edit all synthetic records on this machine.","Demo-ul admin local poate citi și edita toate înregistrările fictive de pe acest dispozitiv.")}</p>{previewEnabled()&&<AuthForm mode="admin-demo" locale={locale} next="" configured={false}/>}</>:<Link className="button button-primary" href={`/${locale}/login`}>{t("Sign in","Intră în cont")}</Link>}</div></>;
  const subpages=admin?[["",t("Overview","Prezentare")],["products",t("Products","Produse")],["orders",t("Orders","Comenzi")],["customers",t("Customers","Clienți")],["requests",t("Requests","Cereri")],["quotes",t("Quotes","Oferte")],["automations",t("Automations","Automatizări")],["settings",t("Settings","Setări")]]:
    [["",t("Overview","Prezentare")],["automations",t("Automations","Automatizări")],["orders",t("Orders","Comenzi")],["downloads",t("Downloads","Descărcări")],["requests",t("Requests","Cereri")],["settings",t("Settings","Setări")]];
  subpages.splice(subpages.findIndex(([key])=>key==="requests")+1,0,["consulting",t("Consulting","Consultanță")]);
  const connection=db();
  const orders=(admin?connection.prepare("SELECT * FROM orders ORDER BY created DESC LIMIT 100").all():connection.prepare("SELECT * FROM orders WHERE owner=? ORDER BY created DESC LIMIT 100").all(user.id)) as Order[];
  const requests=(admin?connection.prepare("SELECT * FROM requests WHERE source<>'advisory' ORDER BY created DESC LIMIT 100").all():connection.prepare("SELECT * FROM requests WHERE source<>'advisory' AND owner=? ORDER BY created DESC LIMIT 100").all(user.id)) as RequestRow[];
  const workflows=admin?connection.prepare("SELECT * FROM workflows ORDER BY updated DESC LIMIT 100").all():connection.prepare("SELECT * FROM workflows WHERE owner=? ORDER BY updated DESC LIMIT 100").all(user.id);
  let content:React.ReactNode;
  if(tab==="consulting")content=<AdvisoryWorkspace locale={locale} owner={user.id} admin={admin} labelStatus={status=>stateLabel(locale,status)}/>;
  else if(tab==="orders" || tab==="downloads")content=<OrderList locale={locale} admin={admin} download={tab==="downloads"} orders={tab==="downloads"?orders.filter(order=>order.status==="paid"):orders}/>;
  else if(tab==="automations")content=<div className="stack">{workflows.length?workflows.map(row=><article className="glass row-card" key={String(row.id)}><div><strong>{JSON.parse(String(row.graph)).name}</strong><p>{String(row.updated)} UTC {admin?"· "+String(row.owner):""}</p></div>{!admin&&<Link className="button button-secondary" href={`/${locale}/builder?workflow=${row.id}`}>{t("Reopen","Redeschide")}<ArrowUpRight size={15}/></Link>}</article>):<Empty locale={locale}/>}
    {!admin&&<Link className="button button-primary" href={`/${locale}/builder`}>{t("Open builder","Deschide editorul")}</Link>}</div>;
  else if(tab==="requests" || tab==="quotes")content=<div className="stack">{requests.length?requests.map(row=>{
    const body=JSON.parse(row.payload) as Record<string,string>;
    const quotes=connection.prepare("SELECT * FROM quotes WHERE request_id=? ORDER BY revision DESC").all(row.id) as Quote[];
    const visible=admin?quotes:quotes.filter(quote=>quote.state!=="draft");
    return <article className="glass form-panel stack" key={row.id}><div className="button-row"><Badge locale={locale} status={row.status}/><span className="mono">{row.source.toUpperCase()} · {row.id}</span></div>
      <strong>{body.workflow}</strong><p>{body.outcome}</p>{admin&&<p>{[body.name,body.email,body.company,body.service,body.budget,body.timeline,body.details].filter(Boolean).join(" · ")}</p>}
      {tab==="requests" && admin&&<form className="button-row" action={manageRequest}><input type="hidden" name="id" value={row.id}/><input type="hidden" name="locale" value={locale}/><select aria-label={t("Request status","Starea cererii")} name="status" defaultValue={row.status}>{requestStates.map(status=><option key={status} value={status}>{stateLabel(locale,status)}</option>)}</select><button className="button button-secondary">{t("Update status","Actualizează starea")}</button></form>}
      {tab==="quotes"&&admin&&<details><summary>{t("Add quotation revision","Adaugă o revizie a ofertei")}</summary><QuoteForm locale={locale} id={row.id}/></details>}
      {visible.map(quote=><details key={quote.revision}><summary>{t("Revision","Revizia")} {quote.revision} · {currency(locale,quote.amount,quote.currency)} · {stateLabel(locale,quote.state)}</summary><p>{quote.scope}</p><p>{quote.milestones}</p><p>{quote.exclusions}</p></details>)}</article>;
  }):<Empty locale={locale}/>}</div>;
  else if(tab==="customers"&&admin)content=<div className="stack">{connection.prepare("SELECT id,email,kind FROM accounts WHERE role='customer' ORDER BY id LIMIT 100").all().map(row=><article className="glass row-card" key={String(row.id)}><strong>{String(row.email)}</strong><span className="chip">{String(row.kind)}</span></article>)}</div>;
  else if(tab==="products"&&admin)content=<div className="stack">
    <details className="glass form-panel"><summary>{t("Create product","Creează produs")}</summary><ProductForm locale={locale}/></details>
    {products().map(product=><details className="glass form-panel" key={product.id}><summary>{copy(locale,product.title)} · {statusLabel(locale,product.status)} · v{product.version}</summary><ProductForm locale={locale} product={product}/></details>)}
  </div>;
  else if(tab==="settings")content=<div className="glass form-panel stack"><p><strong>{user.email}</strong> · {user.kind}</p><p>{stripeEnabled()?"Stripe test":t("Local simulation","Simulare locală")} · {t("Automatic email off","E-mail automat dezactivat")}</p>
    {user.kind==="supabase"&&<Link href={`/${locale}/forgot-password?recovery=1`}>{t("Change password","Schimbă parola")}</Link>}
    <form action={signOut}><input type="hidden" name="locale" value={locale}/><button className="button button-secondary">{t("Sign out","Ieși din cont")}</button></form></div>;
  else {
    const totals=admin?[
      [t("Requests","Cereri"),"requests","1=1"],[t("New requests","Cereri noi"),"requests","status='new'"],
      [t("Test orders","Comenzi de test"),"orders","1=1"],[t("Saved automations","Automatizări salvate"),"workflows","1=1"],
    ].map(([label,table,where])=>[label,Number(connection.prepare(`SELECT COUNT(*) AS total FROM ${table} WHERE ${where}`).get()?.total)]):
      [[t("Saved automations","Automatizări salvate"),workflows.length],[t("Test orders","Comenzi de test"),orders.length],[t("Project requests","Cereri de proiect"),requests.length]];
    content=<div className="stats">{totals.map(([label,value])=><article className="glass stat" key={label}><span>{value}</span><strong>{label}</strong></article>)}</div>;
  }
  return <><Intro tag={admin?t("blen. / Administration","blen. / Administrare"):t("blen. / Workspace","blen. / Spațiu de lucru")} title={subpages.find(([key])=>key===(tab??""))?.[1]??""}
    description={admin?t("Administrative workspace for local demonstration data.","Spațiu administrativ pentru datele fictive locale."):t("Workflows, downloads and project updates in one place.","Fluxuri, descărcări și proiecte într-un singur loc.")}/>
    <nav className="tabs" aria-label={t("Workspace sections","Secțiunile contului")}>{subpages.map(([key,label])=><Link key={key} aria-current={key===(tab??"")?"page":undefined} href={`/${locale}/${type}${key?"/"+key:""}`}>{label}</Link>)}</nav>{content}</>;
}
