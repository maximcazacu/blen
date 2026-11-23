import "server-only";
import Stripe from "stripe";
import { randomUUID } from "node:crypto";
import { productWorkflow } from "@/domain/catalog";
import { validate, version } from "@/domain/workflow";
import { nextState, type OrderState, type PaymentSignal } from "@/domain/payment";
import { db,transaction } from "./store";
import { origin,stripeEnabled } from "./config";
import { publicProducts } from "./catalog";
export type Order = {id:string;owner:string;product:string;graph:string;currency:"EUR"|"RON";amount:number;mode:"simulation"|"stripe-test";status:OrderState;provider_session:string|null;payment:string|null;artifact_version:string|null;created:string};
export const stripe = () => {
  if(!stripeEnabled()) throw new Error("Stripe test mode is disabled.");
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
};
export function prices(id:string):{EUR:number;RON:number}|undefined {
  const product=publicProducts().find(item=>item.id===id && item.status==="demo");
  const fallback=product?.prices ?? (id==="builder"?{EUR:1900,RON:9400}:undefined);
  if(!fallback || !stripeEnabled()) return fallback;
  const key=id.toUpperCase().replaceAll("-","_");
  const eur=process.env["FLOWELIX_PRICE_"+key+"_EUR"];
  const ron=process.env["FLOWELIX_PRICE_"+key+"_RON"];
  if(!eur || !ron || !/^\d{2,7}$/.test(eur) || !/^\d{2,7}$/.test(ron) || +eur<50 || +ron<200) return;
  return {EUR:+eur,RON:+ron};
}
export async function startOrder(owner:string,productId:string,currency:"EUR"|"RON",locale:string,workflowId?:string) {
  const product=publicProducts().find(item=>item.id===productId && item.status==="demo");
  const graph=product ? productWorkflow(product) :
    workflowId && productId==="builder" ?
      JSON.parse(String(db().prepare("SELECT graph FROM workflows WHERE id=? AND owner=?").get(workflowId,owner)?.graph ?? "null")) : null;
  const validated=validate(graph);
  const amount=prices(productId)?.[currency];
  if(!amount || !validated.workflow || validated.issues.length) throw new Error("Product or workflow unavailable.");
  const id=randomUUID();
  const mode=stripeEnabled()?"stripe-test":"simulation";
  db().prepare("INSERT INTO orders (id,owner,product,graph,currency,amount,mode,status,artifact_version) VALUES (?,?,?,?,?,?,?,'pending',?)")
    .run(id,owner,productId,JSON.stringify(validated.workflow),currency,amount,mode,version);
  if(mode==="simulation") return `/${locale}/checkout/${id}`;
  const checkout=`${origin()}/${locale}/checkout/${id}`;
  try {
    const session=await stripe().checkout.sessions.create({
      mode:"payment",success_url:checkout,cancel_url:checkout+"?cancelled=1",
      client_reference_id:id,metadata:{orderId:id},payment_intent_data:{metadata:{orderId:id}},
      line_items:[{quantity:1,price_data:{currency:currency.toLowerCase(),unit_amount:amount,product_data:{name:validated.workflow.name+" (blen. test)"}}}],
    },{idempotencyKey:id});
    if (!session.url || !session.url.startsWith("https://checkout.stripe.com/")) throw new Error("Missing hosted checkout.");
    db().prepare("UPDATE orders SET provider_session=? WHERE id=?").run(session.id,id);
    return session.url;
  } catch(error) {
    db().prepare("UPDATE orders SET status='failed' WHERE id=? AND status='pending'").run(id);
    throw error;
  }
}
export function paymentEvent(id:string,orderId:string,type:string,signal:PaymentSignal,mode:Order["mode"],details?:{session?:string;amount:number;currency:string;payment?:string},owner?:string) {
  return transaction(connection=>{
    const order=connection.prepare("SELECT * FROM orders WHERE id=?").get(orderId) as Order|undefined;
    if (!order || order.mode!==mode || (owner && owner!==order.owner)) return false;
    if(details && (order.amount!==details.amount || order.currency.toLowerCase()!==details.currency.toLowerCase() ||
      (details.session && order.provider_session && order.provider_session!==details.session) ||
      (details.payment && order.payment && order.payment!==details.payment))) return false;
    if(mode==="simulation" && order.status!=="pending") return false;
    if(!connection.prepare("INSERT OR IGNORE INTO payment_events (id,order_id,type) VALUES (?,?,?)").run(id,orderId,type).changes) return true;
    const next=nextState(order.status,signal);
    connection.prepare("UPDATE orders SET status=?,provider_session=coalesce(provider_session,?),payment=coalesce(payment,?) WHERE id=?")
      .run(next,details?.session??null,details?.payment??null,orderId);
    return true;
  });
}
