import { z } from "zod";
import { account } from "@/server/auth";
import { artifact } from "@/server/artifact";
import { transaction } from "@/server/store";
import { version } from "@/domain/workflow";
export async function GET(_:Request,{params}:{params:Promise<{id:string}>}) {
  const user=await account();
  if(!user) return new Response(null,{status:401});
  const {id}=await params;
  if(!z.uuid().safeParse(id).success) return new Response(null,{status:404});
  const zip=transaction(connection=>{
    const order=connection.prepare("SELECT graph FROM orders WHERE id=? AND owner=? AND status='paid' AND artifact_version=?").get(id,user.id,version);
    if(!order) return null;
    const bytes=artifact(JSON.parse(String(order.graph)));
    connection.prepare("INSERT INTO downloads (owner,order_id) VALUES (?,?)").run(user.id,id);
    return bytes;
  });
  if(!zip) return new Response(null,{status:404});
  return new Response(Uint8Array.from(zip),{headers:{
    "Content-Type":"application/zip","Content-Disposition":"attachment; filename=blen-office-script.zip","Cache-Control":"private, no-store",
  }});
}
