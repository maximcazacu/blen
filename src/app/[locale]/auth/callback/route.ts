import { NextResponse } from "next/server";
import { origin } from "@/server/config";
import { supabase } from "@/server/auth";
export async function GET(request:Request,{params}:{params:Promise<{locale:string}>}) {
  const lang=(await params).locale==="ro"?"ro":"en";
  const query=new URL(request.url).searchParams;
  const code=query.get("code");
  const client=await supabase();
  if(code && client) {
    const response=await client.auth.exchangeCodeForSession(code);
    if(!response.error) return NextResponse.redirect(origin()+`/${lang}/${query.get("recovery")==="1"?"forgot-password?recovery=1":"dashboard"}`);
  }
  return NextResponse.redirect(origin()+`/${lang}/login?callback=failed`);
}
