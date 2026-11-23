import { defineConfig } from "@playwright/test";
import { resolve } from "node:path";
import { randomUUID } from "node:crypto";
const port=process.env.TEST_PORT || "3100";
const baseURL="http://127.0.0.1:"+port;
const database=resolve(".flowelix","test-"+randomUUID()+".sqlite");
export default defineConfig({
  testDir:"tests/e2e", workers:1, timeout:90000,
  use:{baseURL,channel:process.env.PLAYWRIGHT_CHANNEL || "msedge",trace:"retain-on-failure"},
  webServer:{command:"npm run dev",url:baseURL+"/ro",timeout:180000,env:{
    PORT:port,FLOWELIX_E2E:"1",FLOWELIX_DB:database,STRIPE_SECRET_KEY:"",STRIPE_WEBHOOK_SECRET:"",SUPABASE_URL:"",SUPABASE_PUBLISHABLE_KEY:"",
  }},
});
