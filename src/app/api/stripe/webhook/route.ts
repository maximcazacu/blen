import type Stripe from "stripe";
import { stripe,paymentEvent } from "@/server/commerce";
import { stripeEnabled } from "@/server/config";
import type { PaymentSignal } from "@/domain/payment";
export const runtime="nodejs";
export async function POST(request:Request) {
  if(!stripeEnabled()) return new Response(null,{status:404});
  const signature=request.headers.get("stripe-signature");
  if(!signature) return new Response(null,{status:400});
  let event:Stripe.Event;
  try {event=stripe().webhooks.constructEvent(await request.text(),signature,process.env.STRIPE_WEBHOOK_SECRET!);}
  catch {return new Response(null,{status:400});}
  if(event.livemode) return new Response(null,{status:400});
  if(event.type==="checkout.session.completed" || event.type==="checkout.session.async_payment_succeeded" ||
     event.type==="checkout.session.async_payment_failed" || event.type==="checkout.session.expired") {
    const session=event.data.object;
    const signal:PaymentSignal|undefined=session.payment_status==="paid"?"paid":event.type==="checkout.session.expired"?"cancelled":
      event.type==="checkout.session.async_payment_failed"?"failed":undefined;
    if(signal && session.metadata?.orderId && session.client_reference_id===session.metadata.orderId &&
       session.mode==="payment" && session.amount_total!==null && session.currency) {
      paymentEvent(event.id,session.metadata.orderId,event.type,signal,"stripe-test",{
        session:session.id,amount:session.amount_total,currency:session.currency,
        payment:typeof session.payment_intent==="string"?session.payment_intent:undefined,
      });
    }
  }
  if(event.type==="charge.refunded") {
    const charge=event.data.object;
    if(charge.refunded && typeof charge.payment_intent==="string") {
      const intent=await stripe().paymentIntents.retrieve(charge.payment_intent);
      if(!intent.livemode && intent.metadata.orderId) paymentEvent(event.id,intent.metadata.orderId,event.type,"refunded","stripe-test",{
        amount:intent.amount,currency:intent.currency,payment:intent.id,
      });
    }
  }
  return Response.json({received:true});
}
