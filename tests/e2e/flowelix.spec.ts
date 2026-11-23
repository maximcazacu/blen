import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { unzipSync,strFromU8 } from "fflate";

test("bilingual home, reduced motion, responsive layout and legacy Ops handoff",async({page},testInfo)=>{
  const errors:string[]=[];
  page.on("pageerror",error=>errors.push(error.message));
  await page.emulateMedia({reducedMotion:"reduce"});
  for(const width of [390,768,1440]){
    await page.setViewportSize({width,height:900});
    await page.goto("/en");
    await expect(page.getByRole("heading",{level:1})).toContainText("Smarter systems.");
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await page.getByRole("button",{name:/Human decisions/}).click();
    await expect(page.getByRole("status")).toContainText("resolve exceptions");
    await expect(page.locator(".hero .button-primary")).toHaveAttribute("href","/en/services");
    await expect(page.locator(".hero .button-primary")).toHaveText("Explore our services");
    await expect(page.locator("#services a.pillar")).toHaveCount(3);
    await expect(page.getByRole("navigation",{name:"Local demos"}).getByRole("link",{name:"Automation Builder"})).toHaveAttribute("href","/en/builder");
    await expect(page.locator("#main-nav a").first()).toHaveAttribute("href","/en");
    if(width!==768){await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:testInfo.outputPath("home-"+width+".png")});}
    if(width===390) {
      await page.getByRole("button",{name:"Menu",exact:true}).click();
      await expect(page.getByRole("navigation",{name:"Main"}).getByRole("link",{name:"Solutions"})).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(page.getByRole("navigation",{name:"Main"})).toBeHidden();
    }
    await page.goto("/ro/builder");
    await expect(page.getByRole("heading",{level:1})).toHaveText("Editor de automatizări");
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    if(width===1440)await page.screenshot({path:testInfo.outputPath("builder-1440.png")});
  }
  await page.goto("/ro");
  await expect(page.getByRole("heading",{level:1})).toHaveText("Sisteme mai inteligente. Afaceri mai eficiente.");
  await expect(page.locator(".hero .button-primary")).toHaveAttribute("href","/ro/services");
  await page.getByRole("button",{name:/Decizii umane/}).click();
  await page.evaluate(()=>window.scrollTo(0,0));
  await page.screenshot({path:testInfo.outputPath("home-ro-1440.png")});
  await page.goto("/ro/services");
  const assistantCard=page.locator("#implementation").getByRole("link",{name:/Asistenți AI pentru echipa ta/});
  await expect(assistantCard.getByText("Copilot Studio",{exact:true})).toBeVisible();
  await assistantCard.click();
  await expect(page).toHaveURL(/\/ro\/services\/copilot-studio$/);
  await expect(page.getByRole("heading",{level:1})).toHaveText("Asistenți AI pentru echipa ta");
  await expect(page.locator(".implementation-technology")).toHaveText("Folosim Copilot Studio");
  await page.goto("/fluxclar-ops.html");
  await expect(page).toHaveURL(/\/ro\/ops/);
  await page.getByRole("link",{name:"Solicită un pilot Ops"}).click();
  await expect(page.getByRole("combobox",{name:"Serviciu",exact:true})).toHaveValue("workflows");
  await expect(page.locator("html")).toHaveAttribute("lang","ro");
  await page.goto("/index.html?pilot=ops#contact");
  await expect(page.getByRole("combobox",{name:"Serviciu",exact:true})).toHaveValue("workflows");
  await page.goto("/index.html?scenariu=fara-sursa");
  await expect(page.getByText("Sursă indisponibilă",{exact:true})).toBeVisible();
  await page.goto("/ro/contact");
  await expect(page.getByRole("heading",{name:"Solicită un audit de proces"})).toBeVisible();
  await expect(page.getByRole("link",{name:"Deschide ciorna de e-mail"})).toBeVisible();
  await page.goto("/ro/how-it-works");
  await expect(page.getByRole("heading",{name:"2. Discutăm concluziile într-un apel"})).toBeVisible();
  await expect(page.getByRole("heading",{name:"3. Standardizăm modul de lucru"})).toBeVisible();
  await page.goto("/ro/about");
  await expect(page.getByText(/La blen. transformăm întrebările operaționale/)).toBeVisible();
  expect(errors).toEqual([]);
});

test("builder validation, undo, persistence, protected simulator ZIP and account isolation",async({page,browser})=>{
  await page.goto("/en/login?next=/en/builder");
  await page.getByRole("button",{name:"Start a demo session"}).click();
  await expect(page).toHaveURL(/\/en\/builder$/);
  await page.getByRole("button",{name:"Preview",exact:true}).click();
  await expect(page.getByRole("heading",{name:"Synthetic data preview"})).toBeVisible();
  await expect(page.locator("pre")).toContainText("removeDuplicates");
  await page.getByLabel("Select a step").selectOption("step-5");
  await page.getByLabel("Connect to").selectOption("step-1");
  await page.getByRole("button",{name:"Connect",exact:true}).click();
  await expect(page.locator(".builder").getByRole("alert")).toContainText("circular");
  await page.getByRole("button",{name:"Remove step"}).click();
  await page.getByRole("button",{name:"Undo",exact:true}).click();
  await expect(page.getByLabel("Select a step").locator("option")).toHaveCount(6);
  await page.getByLabel("Workflow name").fill("QA workflow");
  await page.getByRole("button",{name:"Save",exact:true}).click();
  await expect(page).toHaveURL(/workflow=/);
  const workflowURL=page.url();
  await page.reload();
  await expect(page.getByLabel("Workflow name")).toHaveValue("QA workflow");
  await page.getByRole("button",{name:"Export",exact:true}).click();
  await page.getByRole("button",{name:"Continue to test checkout"}).click();
  await expect(page).toHaveURL(/\/checkout\//);
  const orderId=page.url().split("/").at(-1);
  expect((await page.request.get("/api/download/"+orderId)).status()).toBe(404);
  await page.getByRole("button",{name:"Simulate payment success"}).click();
  const downloaded=page.waitForEvent("download");
  await page.getByRole("link",{name:"Download Office Script ZIP"}).click();
  const download=await downloaded;
  const path=await download.path();
  const files=unzipSync(await readFile(path));
  expect(Object.keys(files).sort()).toEqual(["README.md","automation.ts","version.json","workflow.json"]);
  expect(strFromU8(files["automation.ts"])).toContain("removeDuplicates");
  expect(JSON.parse(strFromU8(files["workflow.json"])).name).toBe("QA workflow");
  const other=await browser.newPage();
  try {
    expect((await other.request.get("/api/download/"+orderId)).status()).toBe(401);
    await other.goto("/en/login");
    await other.getByRole("button",{name:"Start a demo session"}).click();
    await expect(other).toHaveURL(/dashboard/);
    expect((await other.request.get("/api/download/"+orderId)).status()).toBe(404);
    await other.goto(workflowURL);
    await expect(other.getByRole("heading",{name:"Page unavailable"})).toBeVisible();
  } finally {await other.close();}
});

test("market filters, cancellation and simulated failure",async({page})=>{
  await page.goto("/en/marketplace");
  await page.getByRole("textbox",{name:"Search products"}).fill("formatting");
  await expect(page.getByRole("status")).toHaveText("1 results");
  await page.getByRole("link",{name:/Spreadsheet Formatting/}).click();
  await page.getByRole("link",{name:"Sign in for test checkout"}).click();
  await page.getByRole("button",{name:"Start a demo session"}).click();
  await expect(page).toHaveURL(/spreadsheet-formatting$/);
  for(const [button,status] of [["Cancel simulation","cancelled"],["Simulate failure","failed"]]){
    await page.getByRole("button",{name:"Continue to test checkout"}).click();
    await page.getByRole("button",{name:button}).click();
    await expect(page.locator(".state-"+status)).toBeVisible();
    await expect(page.getByRole("link",{name:"Download Office Script ZIP"})).toHaveCount(0);
    await page.goto("/en/marketplace/spreadsheet-formatting");
  }
});

test("request inbox, status tracking, quotations and account separation",async({page,browser})=>{
  await page.goto("/en/login");
  await page.getByRole("button",{name:"Start a demo session"}).click();
  await expect(page).toHaveURL(/dashboard/);
  await page.goto("/en/custom-automation?pilot=ops");
  await page.getByLabel("Test reply email").fill("qa-retail@example.invalid");
  await page.getByLabel("Desired outcome").fill("Assign every equipment issue to a store owner.");
  await page.getByRole("button",{name:"Save test request"}).click();
  await expect(page.getByText("Saved to the local inbox.")).toBeVisible();
  await expect(page.getByRole("link",{name:"Open email draft"})).toHaveAttribute("href",/^mailto:/);
  await page.getByRole("link",{name:"Track request"}).click();
  await expect(page.getByText("Assign every equipment issue to a store owner.")).toBeVisible();
  const admin=await browser.newPage();
  try {
    await admin.goto("/en/admin/requests");
    await expect(admin.getByText("qa-retail@example.invalid")).toHaveCount(0);
    await admin.getByRole("button",{name:"Open local admin demo"}).click();
    await admin.getByRole("link",{name:"Requests",exact:true}).click();
    const record=admin.locator("article").filter({hasText:"qa-retail@example.invalid"});
    await record.getByLabel("Request status").selectOption("reviewing");
    await record.getByRole("button",{name:"Update status"}).click();
    await expect(record.locator(".state-reviewing")).toBeVisible();
    await admin.getByRole("link",{name:"Quotes",exact:true}).click();
    await record.getByText("Add quotation revision").click();
    await record.getByLabel("Scope").fill("Synthetic pilot for equipment issue intake.");
    await record.getByLabel("Milestones").fill("Review, build and test.");
    await record.getByLabel("Amount in minor units").fill("20000");
    await record.getByLabel("Quote status").selectOption("proposed");
    await record.getByRole("button",{name:"Save revision"}).click();
    await expect(record.getByText(/Revision 1/)).toBeVisible();
    await page.reload();
    await expect(page.locator(".state-reviewing")).toBeVisible();
    await expect(page.getByText(/Revision 1/)).toBeVisible();
  } finally {await admin.close();}
});

test("admin catalog hides drafts, publishes demo offers, and displays localized prices",async({page})=>{
  await page.goto("/en/admin");
  await page.getByRole("button",{name:"Open local admin demo"}).click();
  await page.getByRole("link",{name:"Products",exact:true}).click();
  await page.getByText("Create product",{exact:true}).click();
  const form=page.locator("details").filter({hasText:"Create product"});
  await form.getByLabel("Product slug").fill("qa-product");
  await form.getByLabel("English title").fill("QA spreadsheet");
  await form.getByLabel("Romanian title").fill("Foaie de test");
  await form.getByLabel("English description").fill("Test only spreadsheet product.");
  await form.getByLabel("Romanian description").fill("Produs fictiv pentru testare.");
  await form.getByLabel("EUR test price in cents").fill("900");
  await form.getByLabel("RON test price in bani").fill("4500");
  await form.getByRole("button",{name:"Save product"}).click();
  await expect(page.getByText("QA spreadsheet · Draft · v1.0.0")).toBeVisible();
  await page.goto("/en/marketplace");
  await expect(page.getByRole("link",{name:/QA spreadsheet/})).toHaveCount(0);
  await page.goto("/en/admin/products");
  const item=page.locator("details").filter({hasText:"QA spreadsheet"});
  await item.locator("summary").click();
  await item.getByLabel("Publication status").selectOption("demo");
  await item.getByRole("button",{name:"Save product"}).click();
  await expect(item.locator("summary")).toContainText("Demo");
  await page.goto("/ro/marketplace/qa-product");
  await expect(page.getByRole("heading",{name:"Foaie de test"})).toBeVisible();
  await expect(page.getByLabel("Preț de test").locator("option[value=RON]")).toContainText("45");
});

test("local account registration, sign out, and sign in",async({page})=>{
  await page.goto("/en/register");
  await page.getByLabel("Test email").fill("account-test@example.invalid");
  await page.getByLabel("Password",{exact:true}).fill("Sample only 123");
  await page.getByRole("button",{name:"Create test account"}).click();
  await page.getByRole("link",{name:"Settings",exact:true}).click();
  await expect(page.getByText("account-test@example.invalid")).toBeVisible();
  await page.getByRole("button",{name:"Sign out"}).click();
  await page.goto("/en/login");
  await page.getByLabel("Test email").fill("account-test@example.invalid");
  await page.getByLabel("Password",{exact:true}).fill("Sample only 123");
  await page.getByRole("button",{name:"Sign in",exact:true}).click();
  await expect(page).toHaveURL(/dashboard/);
});

test("drop and reposition nodes, then carry a valid draft through sign-in",async({page})=>{
  const errors:string[]=[];
  page.on("pageerror",error=>errors.push(error.message));
  page.on("console",message=>{if(message.type()==="warning"&&message.text().includes("[React Flow]"))errors.push(message.text());});
  await page.setViewportSize({width:1440,height:900});
  await page.goto("/en/builder");
  const node=page.locator(".react-flow__node").filter({hasText:"Select worksheet"});
  await expect(node).toBeVisible();
  const original=await node.boundingBox();
  expect(original).not.toBeNull();
  const x=original!.x+original!.width/2, y=original!.y+original!.height/2;
  await page.mouse.move(x,y);
  await page.mouse.down();
  await page.mouse.move(x+45,y+30,{steps:8});
  await page.mouse.up();
  await expect.poll(async()=>Math.round((await node.boundingBox())!.x)).toBeGreaterThan(Math.round(original!.x)+20);
  const canvas=page.locator(".editor");
  await page.getByRole("button",{name:"Summary sheet",exact:true}).dragTo(canvas,{targetPosition:{x:230,y:85}});
  await expect(page.getByLabel("Select a step").locator("option")).toHaveCount(7);
  await page.getByRole("button",{name:"Undo",exact:true}).click();
  await expect(page.getByLabel("Select a step").locator("option")).toHaveCount(6);
  await page.getByRole("button",{name:"Redo",exact:true}).click();
  await expect(page.getByLabel("Select a step").locator("option")).toHaveCount(7);
  await page.getByRole("button",{name:"Undo",exact:true}).click();
  await page.getByLabel("Workflow name").fill("Draft before sign in");
  await page.getByRole("link",{name:"Sign in to save"}).click();
  await page.getByRole("button",{name:"Start a demo session"}).click();
  await expect(page.getByLabel("Workflow name")).toHaveValue("Draft before sign in");
  expect(errors).toEqual([]);
});
