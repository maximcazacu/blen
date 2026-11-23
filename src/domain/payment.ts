export type OrderState = "pending"|"paid"|"failed"|"cancelled"|"refunded";
export type PaymentSignal = "paid"|"failed"|"cancelled"|"refunded";
export function nextState(current:OrderState,signal:PaymentSignal):OrderState {
  if(current==="refunded" || signal==="refunded") return "refunded";
  if(current==="paid" || signal==="paid") return "paid";
  return current==="pending" ? signal : current;
}
