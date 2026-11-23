import { template, type Template } from "./workflow.ts";
export type Locale = "en" | "ro";
export type Copy = readonly [string,string];
export const copy = (locale:Locale, values:Copy) => values[locale==="ro"?1:0];
export const currency = (locale:Locale, amount:number, code:string) => new Intl.NumberFormat(locale==="ro"?"ro-RO":"en-IE",{style:"currency",currency:code}).format(amount/100);

export const productStates=["draft","demo","custom","coming-soon","archived"] as const;
export type Product = {id:string;slug:string;title:Copy;description:Copy;category:string;icon:string;prices:{EUR:number;RON:number};status:typeof productStates[number];version:string;template:Template};
export const catalog:readonly Product[] = [
  {id:"cleanup",template:"cleanup",slug:"excel-data-cleanup",title:["Excel Data Cleanup","Curățare date Excel"],description:["Remove duplicate orders, sort the rows and create a structured table from a used range.","Elimină comenzile duplicate, sortează rândurile și creează un tabel din zona utilizată."],category:"Excel",icon:"layers",prices:{EUR:1200,RON:5900},status:"demo",version:"1.0.0"},
  {id:"formatting",template:"formatting",slug:"spreadsheet-formatting",title:["Spreadsheet Formatting","Formatare foi Excel"],description:["Give raw exports readable headers, fitted columns and a styled Excel table.","Adaugă antete lizibile, ajustează coloanele și creează un tabel Excel formatat."],category:"Office Scripts",icon:"grid",prices:{EUR:800,RON:3900},status:"demo",version:"1.0.0"},
  {id:"reporting",template:"reporting",slug:"basic-reporting",title:["Basic Reporting","Raport de bază"],description:["Sort your source sheet and generate a separate report with the data row count.","Sortează foaia sursă și generează un raport separat cu numărul de rânduri."],category:"Reporting",icon:"chart",prices:{EUR:1500,RON:7400},status:"demo",version:"1.0.0"},
];
export const productWorkflow = (product:Product) => template(product.template,product.title[0]);
export function statusLabel(locale:Locale,status:Product["status"]) {
  const labels:Record<Product["status"],Copy>={draft:["Draft","Ciornă"],demo:["Demo","Demo"],custom:["Custom quote","Ofertă la comandă"],"coming-soon":["Coming soon","În pregătire"],archived:["Archived","Arhivat"]};
  return copy(locale,labels[status]);
}
export const spreadsheetIcon = "/tools/spreadsheet.svg";

export const services = [
  {
    slug:"copilot-studio",title:["AI assistants for your team","Asistenți AI pentru echipa ta"],
    technology:["Copilot Studio","Copilot Studio"],icon:"/tools/ai-assistant.svg",tone:"violet",
    description:["We help you build assistants that answer from approved documents and pass uncertain requests to your team.","Te ajutăm să construiești asistenți care răspund pe baza documentelor aprobate și trimit solicitările neclare către echipă."],
    example:["A policy assistant that cites sources and hands off uncertain requests.","Un asistent care citează procedurile interne și trimite cererile neclare către echipă."],
  },
  {
    slug:"excel-automation",title:["Automated reporting","Raportare automatizată"],
    technology:["Excel and Office Scripts","Excel și Office Scripts"],icon:spreadsheetIcon,tone:"green",
    description:["We help you clean recurring exports and generate reports with a consistent structure.","Te ajutăm să cureți datele din exporturile recurente și să generezi rapoarte cu o structură consecventă."],
    example:["Prepare weekly sales exports for reporting with a consistent column and table structure.","Pregătește exporturile săptămânale de vânzări cu o structură consecventă de coloane și tabele."],
  },
  {
    slug:"power-automate",title:["Approval workflows","Fluxuri de aprobare"],
    technology:["Power Automate","Power Automate"],icon:"/tools/workflow.svg",tone:"blue",
    description:["We help you send requests to the right approver, notify your team and record each decision.","Te ajutăm să trimiți cererile către persoana potrivită, să notifici echipa și să înregistrezi fiecare decizie."],
    example:["Route an internal request to the right approver and record the outcome.","Trimite o cerere internă către aprobatorul potrivit și înregistrează rezultatul."],
  },
  {
    slug:"n8n",title:["App and data integrations","Integrări între aplicații"],
    technology:["n8n","n8n"],icon:"/tools/integration.svg",tone:"pink",
    description:["We help you connect the tools you use and sync records across approved systems.","Te ajutăm să conectezi aplicațiile pe care le folosești și să sincronizezi înregistrările între sistemele aprobate."],
    example:["Synchronize request metadata between two approved systems using scoped credentials.","Sincronizează metadatele cererilor între două sisteme aprobate, cu acces limitat."],
  },
] as const;
