import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { configuredAuth, previewEnabled } from "./config";
import { db } from "./store";
export type Account = { id:string; email:string; role:"customer"|"admin"; kind:string };
const cookie = "flowelix_demo";
const hash = (value:string) => createHash("sha256").update(value).digest("hex");
const sessionAge = 60*60*12;
export async function supabase() {
  if (!previewEnabled() || !configuredAuth()) return null;
  const jar=await cookies();
  return createServerClient(process.env.SUPABASE_URL!,process.env.SUPABASE_PUBLISHABLE_KEY!,{
    cookies:{getAll:()=>jar.getAll(),setAll(values){try{for(const {name,value,options} of values) jar.set(name,value,options);} catch { /* Route handlers and actions can refresh cookies. */ }}},
  });
}
export async function account():Promise<Account|undefined> {
  if (!previewEnabled()) return;
  const jar=await cookies();
  const token=jar.get(cookie)?.value;
  if (token) {
    const result=db().prepare(`SELECT a.id,a.email,a.role,a.kind FROM accounts a JOIN sessions s ON s.owner=a.id WHERE s.token=? AND s.expires>?`).get(hash(token),Date.now());
    if(result) return result as Account;
  }
  const client=await supabase();
  if (!client) return;
  const {data:{user}}=await client.auth.getUser();
  if (!user?.email) return;
  const id="sb:"+user.id;
  db().prepare("INSERT INTO accounts (id,email,kind) VALUES (?,?, 'supabase') ON CONFLICT(id) DO UPDATE SET email=excluded.email").run(id,user.email);
  return db().prepare("SELECT id,email,role,kind FROM accounts WHERE id=?").get(id) as Account;
}
export function passwordHash(password:string) {
  const salt=randomBytes(16).toString("hex");
  return salt+":"+scryptSync(password,salt,64).toString("hex");
}
export function matches(password:string,stored?:string) {
  const [salt,digest]=(stored??"0".repeat(32)+":"+"0".repeat(128)).split(":");
  const verified=timingSafeEqual(scryptSync(password,salt,64),Buffer.from(digest,"hex"));
  return Boolean(stored) && verified;
}
export async function openSession(id:string) {
  const jar=await cookies();
  const previous=jar.get(cookie)?.value;
  if(previous) db().prepare("DELETE FROM sessions WHERE token=?").run(hash(previous));
  db().prepare("DELETE FROM sessions WHERE expires<?").run(Date.now());
  const token=randomBytes(32).toString("hex");
  db().prepare("INSERT INTO sessions VALUES (?,?,?)").run(hash(token),id,Date.now()+sessionAge*1000);
  jar.set(cookie,token,{httpOnly:true,sameSite:"strict",maxAge:sessionAge,path:"/"});
}
export async function closeSession() {
  const jar=await cookies();
  const token=jar.get(cookie)?.value;
  if(token) db().prepare("DELETE FROM sessions WHERE token=?").run(hash(token));
  jar.delete(cookie);
  await (await supabase())?.auth.signOut();
}
