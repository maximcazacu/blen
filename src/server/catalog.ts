import "server-only";
import { catalog, type Product } from "@/domain/catalog";
import { previewEnabled } from "./config";
import { db } from "./store";
export function products() {
  if(!previewEnabled()) return [...catalog];
  const overrides=db().prepare("SELECT product FROM catalog_overrides ORDER BY rowid").all().map(row=>JSON.parse(String(row.product)) as Product);
  const byId=new Map(catalog.map(item=>[item.id,item]));
  for(const item of overrides)byId.set(item.id,item);
  return [...byId.values()];
}
export const publicProducts=()=>products().filter(item=>["demo","custom","coming-soon"].includes(item.status));
