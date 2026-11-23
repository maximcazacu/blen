"use server";
import { randomUUID, createHash } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { account, closeSession, matches, openSession, passwordHash, supabase } from "@/server/auth";
import { allow, db, transaction } from "@/server/store";
import { origin, previewEnabled, stripeEnabled } from "@/server/config";
import { paymentEvent, startOrder } from "@/server/commerce";
import { requestStates } from "@/domain/requests";
import { productStates, type Product } from "@/domain/catalog";
import { products } from "@/server/catalog";
import { validate } from "@/domain/workflow";
import { advisoryEngagements,advisoryServices,assess,costKeys,diagnosticSchema } from "@/domain/advisory";

type Result = {ok:boolean;code:string;id?:string};
const result=(code:string,ok=false,id?:string):Result=>({ok,code,id});
const locale=(data:FormData)=>data.get("locale")==="ro"?"ro":"en";
const uuid=z.uuid();
const email=z.email().max(160).transform(value=>value.toLowerCase());
const credentials=z.object({email,password:z.string().min(10).max(128)});
const path=(value:unknown,lang:string)=>typeof value==="string" && new RegExp("^/"+lang+"/(?:builder(?:\\?(?:resume=1|template=(?:cleanup|formatting|reporting)))?|marketplace(?:/[a-z0-9-]+)?|dashboard(?:/[a-z-]+)?|consulting/business-diagnostic|contact\\?advisory=1)$").test(value) ? value : `/${lang}/dashboard`;

export async function authenticate(_:Result,data:FormData) {
  if(!previewEnabled()) return result("disabled");
  const lang=locale(data), mode=data.get("mode");
  if (!allow("authentication",24,60000)) return result("rate");
  if(mode==="demo" || mode==="admin-demo") {
    await closeSession();
    const admin=mode==="admin-demo";
    const id=admin?"demo-admin":randomUUID();
    db().prepare("INSERT OR IGNORE INTO accounts (id,email,kind,role) VALUES (?,?,'demo',?)").run(id,id+"@flowelix.invalid",admin?"admin":"customer");
    await openSession(id);
    redirect(admin?`/${lang}/admin`:path(data.get("next"),lang));
  }
  const service=await supabase();
  if (mode==="reset") {
    const address=email.safeParse(data.get("email"));
    if(!address.success) return result("invalid");
    if(!service) return result("emailOff");
    const response=await service.auth.resetPasswordForEmail(address.data,{redirectTo:origin()+`/${lang}/auth/callback?recovery=1`});
    return result(response.error?"auth":"reset",!response.error);
  }
  if(mode==="password") {
    const password=z.string().min(10).max(128).safeParse(data.get("password"));
    if(!service || !password.success || !(await service.auth.getUser()).data.user) return result("auth");
    const response=await service.auth.updateUser({password:password.data});
    if(response.error) return result("auth");
    redirect(`/${lang}/dashboard/settings`);
  }
  if(mode!=="register" && mode!=="login") return result("invalid");
  const parsed=credentials.safeParse({email:data.get("email"),password:data.get("password")});
  if(!parsed.success) return result("invalid");
  const {email:address,password}=parsed.data;
  if(service) {
    await closeSession();
    const response=mode==="register" ? await service.auth.signUp({email:address,password,options:{emailRedirectTo:origin()+`/${lang}/auth/callback`}}) :
      await service.auth.signInWithPassword({email:address,password});
    if(response.error) return result("auth");
    if(!response.data.session) return result("confirm",true);
  } else if(mode==="register") {
    const id=randomUUID();
    if(!db().prepare("INSERT OR IGNORE INTO accounts (id,email,password,kind) VALUES (?,?,?,'local')").run(id,address,passwordHash(password)).changes) return result("auth");
    await openSession(id);
  } else {
    const row=db().prepare("SELECT id,password FROM accounts WHERE email=? AND kind='local'").get(address);
    if(!matches(password,row?.password as string|undefined) || !row) return result("auth");
    await openSession(String(row.id));
  }
  redirect(path(data.get("next"),lang));
}
export async function signOut(data:FormData) {
  if(previewEnabled()) await closeSession();
  redirect(`/${locale(data)}`);
}
export async function saveWorkflow(input:unknown,id?:string):Promise<Result> {
  const user=await account();
  if(!user) return result("login");
  if(!allow("save:"+user.id,60,60000)) return result("rate");
  const {workflow,issues}=validate(input);
  if(!workflow || issues.length || (id && !uuid.safeParse(id).success)) return result("invalid");
  if(id) {
    const changed=db().prepare("UPDATE workflows SET graph=?,updated=CURRENT_TIMESTAMP WHERE id=? AND owner=?").run(JSON.stringify(workflow),id,user.id).changes;
    if(!changed) return result("missing");
  } else {
    id=randomUUID();
    db().prepare("INSERT INTO workflows (id,owner,graph) VALUES (?,?,?)").run(id,user.id,JSON.stringify(workflow));
  }
  return result("saved",true,id);
}

export async function checkout(_:Result,data:FormData) {
  const user=await account();
  if(!user) return result("login");
  if(!allow("checkout:"+user.id,15,60000)) return result("rate");
  const parsed=z.object({product:z.string().regex(/^[a-z0-9-]{1,60}$/),currency:z.enum(["EUR","RON"]),workflow:uuid.optional()}).safeParse({
    product:data.get("product"),currency:data.get("currency"),workflow:data.get("workflow")??undefined,
  });
  if(!parsed.success) return result("invalid");
  const {product,currency,workflow}=parsed.data;
  let target:string;
  try {target=await startOrder(user.id,product,currency,locale(data),workflow);}
  catch {return result("checkoutOff");}
  redirect(target);
}
export async function simulate(data:FormData) {
  const user=await account();
  const id=uuid.safeParse(data.get("id"));
  const status=z.enum(["paid","cancelled","failed"]).safeParse(data.get("status"));
  if(!user || stripeEnabled() || !id.success || !status.success) return;
  paymentEvent("simulation:"+id.data,id.data,"simulation."+status.data,status.data,"simulation",undefined,user.id);
  revalidatePath(`/${locale(data)}/checkout/${id.data}`);
}

const requestSchema=z.object({
  token:uuid,name:z.string().trim().max(100),email,customer:z.enum(["individual","business"]),
  company:z.string().trim().max(120),service:z.enum(["copilot","excel","workflows","n8n","other"]),
  workflow:z.string().trim().min(15).max(2200),outcome:z.string().trim().min(5).max(1400),
  budget:z.enum(["undecided","under-500","500-2000","2000-plus"]),timeline:z.string().trim().max(120),
  details:z.string().trim().max(1000),website:z.literal(""),source:z.enum(["web","ops"]),
}).refine(input=>input.customer!=="business" || Boolean(input.company));
export async function submitRequest(_:Result,data:FormData) {
  if(!previewEnabled()) return result("disabled");
  const user=await account();
  const parsed=requestSchema.safeParse(Object.fromEntries(data));
  if(!parsed.success) return result("requestInvalid");
  const {token,website,source,...payload}=parsed.data;
  return storeRequest(token,user?.id??null,source,payload);
}

function storeRequest(token:string,owner:string|null,source:string,payload:{email:string}) {
  const stored=JSON.stringify(payload);
  return transaction(connection=>{
    const existing=connection.prepare("SELECT owner,payload,source FROM requests WHERE id=?").get(token);
    if(existing) return existing.owner===owner && existing.payload===stored && existing.source===source ? result("received",true,token) : result("requestConflict");
    const key=createHash("sha256").update(payload.email).digest("hex");
    if(!allow("request-global",30,60000) || !allow("request:"+key,4,15*60000)) return result("rate");
    connection.prepare("INSERT INTO requests (id,owner,source,payload) VALUES (?,?,?,?)").run(token,owner,source,stored);
    return result("received",true,token);
  });
}

const consultationSchema=z.object({
  token:uuid, name:z.string().trim().min(2).max(100),email,
  company:z.string().trim().max(120),website:z.literal(""),
  service:z.union([z.enum(advisoryServices),z.literal("")]),engagement:z.union([z.enum(advisoryEngagements),z.literal("")]),
  message:z.string().trim().max(1200),answers:z.string().max(10000),
});
export async function submitConsultation(_:Result,data:FormData) {
  if(!previewEnabled())return result("disabled");
  const parsed=consultationSchema.safeParse(Object.fromEntries(data));
  if(!parsed.success)return result("invalid");
  const {token,website,answers:raw,...contactFields}=parsed.data;
  let assessment;
  if(raw){
    try {
      const checked=diagnosticSchema.safeParse(JSON.parse(raw));
      if(!checked.success)return result("invalid");
      assessment={answers:checked.data,result:assess(checked.data)};
    } catch {return result("invalid");}
  } else if(contactFields.message.length<10)return result("invalid");
  const user=await account();
  const payload={...contactFields,workflow:assessment?.answers.process??contactFields.message,outcome:"",locale:locale(data),assessment};
  return storeRequest(token,user?.id??null,"advisory",payload);
}

export async function manageRequest(data:FormData) {
  const user=await account();
  const id=uuid.safeParse(data.get("id"));
  if(user?.role!=="admin" || !id.success) return;
  const status=z.enum(requestStates).safeParse(data.get("status"));
  if(!status.success) return;
  transaction(connection=>{
    if(connection.prepare("UPDATE requests SET status=? WHERE id=?").run(status.data,id.data).changes) {
      connection.prepare("INSERT INTO audit (actor,subject,action) VALUES (?,?,?)").run(user.id,id.data,"request."+status.data);
    }
  });
  revalidatePath(`/${locale(data)}/admin/requests`);
  revalidatePath(`/${locale(data)}/admin/consulting`);
}
export async function saveQuote(_:Result,data:FormData) {
  const user=await account();
  if(user?.role!=="admin") return result("disabled");
  const input=z.object({
    id:uuid,scope:z.string().trim().min(10).max(2000),milestones:z.string().trim().min(5).max(1500),
    exclusions:z.string().trim().max(1500),amount:z.coerce.number().int().min(0).max(100000000).optional(),
    currency:z.enum(["EUR","RON"]),state:z.enum(["draft","proposed","accepted","rejected"]),
  }).safeParse(Object.fromEntries(data));
  if(!input.success) return result("invalid");
  const quote=input.data;
  const saved=transaction(connection=>{
    const request=connection.prepare("SELECT source FROM requests WHERE id=?").get(quote.id);
    if(!request) return "missing";
    const advisory=request.source==="advisory";
    const item=z.string().regex(/^\d{1,9}$/).transform(Number).pipe(z.number().max(100000000));
    const costs=advisory?costKeys.map(key=>item.safeParse(data.get(key))):[];
    if(costs.some(cost=>!cost.success))return "quoteAmount";
    const total=advisory?costs.reduce((sum,cost)=>sum+(cost.data??0),0):quote.amount??0;
    if(total<1||total>100000000)return "quoteAmount";
    const revision=Number(connection.prepare("SELECT COALESCE(MAX(revision),0)+1 AS next FROM quotes WHERE request_id=?").get(quote.id)?.next);
    const inserted=connection.prepare("INSERT INTO quotes (request_id,revision,scope,milestones,exclusions,amount,currency,state) VALUES (?,?,?,?,?,?,?,?)").run(quote.id,revision,quote.scope,quote.milestones,quote.exclusions,total,quote.currency,quote.state);
    if(advisory)connection.prepare("INSERT INTO advisory_quote_costs (quote_id,costs) VALUES (?,?)").run(inserted.lastInsertRowid,JSON.stringify(Object.fromEntries(costKeys.map((key,index)=>[key,costs[index].data]))));
    connection.prepare("INSERT INTO audit (actor,subject,action) VALUES (?,?,?)").run(user.id,quote.id,"quote."+quote.state);
    return "saved";
  });
  revalidatePath(`/${locale(data)}/admin/quotes`);
  revalidatePath(`/${locale(data)}/admin/consulting`);
  return result(saved,saved==="saved");
}

export async function saveAdvisoryProject(_:Result,data:FormData) {
  const user=await account();
  if(user?.role!=="admin")return result("disabled");
  const parsed=z.object({
    id:uuid,assigned:z.union([z.enum(advisoryServices),z.literal("")]),
    notes:z.string().trim().max(2000),milestones:z.string().trim().max(2000),
    title:z.string().trim().max(120),body:z.string().trim().max(6000),
    approved:z.literal("yes").optional(),
  }).refine(item=>!item.approved || Boolean(item.title&&item.body)).safeParse(Object.fromEntries(data));
  if(!parsed.success)return result("invalid");
  const {id,assigned,notes,milestones,title,body,approved}=parsed.data;
  const saved=transaction(connection=>{
    if(!connection.prepare("SELECT id FROM requests WHERE id=? AND source='advisory'").get(id))return false;
    connection.prepare(`INSERT INTO advisory_projects VALUES (?,?,?,?,?,?,?) ON CONFLICT(request_id) DO UPDATE SET
      assigned_service=excluded.assigned_service,notes=excluded.notes,milestones=excluded.milestones,
      deliverable_title=excluded.deliverable_title,deliverable_body=excluded.deliverable_body,approved=excluded.approved`)
      .run(id,assigned,notes,milestones,title,body,approved?1:0);
    connection.prepare("INSERT INTO audit (actor,subject,action) VALUES (?,?,'advisory.project')").run(user.id,id);
    return true;
  });
  revalidatePath(`/${locale(data)}/admin/consulting`);
  return saved?result("saved",true):result("missing");
}

export async function submitAdvisorySupport(_:Result,data:FormData) {
  const user=await account();
  if(!user)return result("login");
  const parsed=z.object({id:uuid,token:uuid,message:z.string().trim().min(10).max(1500)}).safeParse(Object.fromEntries(data));
  if(!parsed.success)return result("invalid");
  const {id,token,message}=parsed.data;
  const response=transaction(connection=>{
    if(!connection.prepare("SELECT id FROM requests WHERE id=? AND source='advisory' AND owner=?").get(id,user.id))return result("missing");
    const previous=connection.prepare("SELECT request_id,message FROM advisory_support WHERE id=?").get(token);
    if(previous)return previous.request_id===id&&previous.message===message?result("saved",true):result("requestConflict");
    if(!allow("advisory-support:"+user.id,8,60000))return result("rate");
    connection.prepare("INSERT INTO advisory_support (id,request_id,message) VALUES (?,?,?)").run(token,id,message);
    return result("saved",true);
  });
  revalidatePath(`/${locale(data)}/dashboard/consulting`);
  return response;
}

export async function manageAdvisorySupport(data:FormData) {
  const user=await account();
  if(user?.role!=="admin")return;
  const parsed=z.object({id:uuid,state:z.enum(["open","reviewing","resolved"])}).safeParse(Object.fromEntries(data));
  if(!parsed.success)return;
  transaction(connection=>{
    if(connection.prepare("UPDATE advisory_support SET state=? WHERE id=?").run(parsed.data.state,parsed.data.id).changes)
      connection.prepare("INSERT INTO audit (actor,subject,action) VALUES (?,?,?)").run(user.id,parsed.data.id,"advisory.support."+parsed.data.state);
  });
  revalidatePath(`/${locale(data)}/admin/consulting`);
}
export async function saveProduct(_:Result,data:FormData) {
  const user=await account();
  if(user?.role!=="admin") return result("disabled");
  const identifier=z.string().regex(/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/).max(60);
  const input=z.object({
    id:z.union([identifier,z.literal("")]),slug:identifier,
    en:z.string().trim().min(3).max(90),ro:z.string().trim().min(3).max(90),
    descEn:z.string().trim().min(10).max(350),descRo:z.string().trim().min(10).max(350),
    category:z.enum(["Excel","Office Scripts","Reporting","Custom"]),
    version:z.string().regex(/^\d{1,3}\.\d{1,3}\.\d{1,3}$/), status:z.enum(productStates),
    template:z.enum(["cleanup","formatting","reporting"]),
    eur:z.coerce.number().int().min(50).max(1000000),ron:z.coerce.number().int().min(200).max(1000000),
  }).safeParse(Object.fromEntries(data));
  if(!input.success) return result("invalid");
  const form=input.data;
  const saved=transaction(connection=>{
    const records=products();
    const previous=records.find(item=>item.id===form.id);
    if((form.id&&!previous) || form.slug==="builder" || (previous && previous.slug!==form.slug) ||
       records.some(item=>item.id!==form.id && (item.slug===form.slug || item.id===form.slug))) return false;
    const product:Product={id:previous?.id??form.slug,slug:form.slug,title:[form.en,form.ro],description:[form.descEn,form.descRo],
      category:form.category,version:form.version,status:form.status,template:form.template,icon:form.template==="reporting"?"chart":form.template==="formatting"?"grid":"layers",
      prices:{EUR:form.eur,RON:form.ron}};
    connection.prepare("INSERT INTO catalog_overrides VALUES (?,?) ON CONFLICT(id) DO UPDATE SET product=excluded.product").run(product.id,JSON.stringify(product));
    connection.prepare("INSERT INTO audit (actor,subject,action) VALUES (?,?,?)").run(user.id,product.id,"catalog."+product.status);
    return true;
  });
  revalidatePath(`/${locale(data)}/admin/products`);
  return saved?result("saved",true):result("invalid");
}
