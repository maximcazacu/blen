import Link from "next/link";
import { BookOpen, ShieldQuestion } from "lucide-react";
import { copy,type Locale,type Copy } from "@/domain/catalog";
const scenarios:{id:string;title:Copy;answer:Copy;source?:Copy;excerpt?:Copy}[]=[
  {id:"factura",title:["How do I submit an invoice for approval?","Cum trimit o factură spre aprobare?"],
   answer:["Put the invoice in the approval folder, enter the vendor, amount and cost centre, then send it to the budget owner.","Adaugă factura în folderul de aprobare, completează furnizorul, suma și centrul de cost, apoi trimite cererea responsabilului de buget."],
   source:["Purchasing procedure § 2","Procedura de achiziții § 2"],
   excerpt:["The requester submits the completed invoice to the budget owner, who reviews the document and updates the request.","Solicitantul trimite factura completată responsabilului de buget, care verifică documentul și actualizează cererea."]},
  {id:"lucru-la-distanta",title:["How do I request a remote work day?","Cum solicit o zi de lucru de la distanță?"],
   answer:["Agree the date with the team manager, record the request in the shared calendar and update your work location after approval.","Discută data cu managerul echipei, înregistrează cererea în calendarul comun și actualizează locul de lucru după confirmare."],
   source:["Team guide § 4","Ghidul echipei § 4"],
   excerpt:["Discuss remote work days with the team manager and record the request in the shared calendar.","Discută zilele de lucru la distanță cu managerul și înregistrează cererea în calendarul comun."]},
  {id:"fara-sursa",title:["What is next year’s team budget?","Care este bugetul echipei pentru anul viitor?"],
   answer:["The sample documents do not cover next year’s budget. Ask the budget owner for a confirmed amount.","Documentele fictive nu acoperă bugetul pentru anul viitor. Cere responsabilului de buget o sumă confirmată."]},
];
export function CopilotDemo({locale,scenario}:{locale:Locale;scenario:unknown}) {
  const t=(en:string,ro:string)=>copy(locale,[en,ro]);
  const active=scenarios.find(item=>item.id===scenario)??scenarios[0];
  return <section className="section compact">
    <div className="glass form-panel stack">
      <p className="eyebrow">{t("SCRIPTED AGENT DEMO","DEMO AGENT CU RĂSPUNSURI PREGĂTITE")}</p>
      <h2>{t("See how an answer uses a source.","Vezi cum un răspuns folosește o sursă.")}</h2>
      <p>{t("Choose an example to see a scripted response based on fictional documents.","Alege un exemplu pentru a vedea un răspuns pregătit pe baza unor documente fictive.")}</p>
      <nav className="tabs" aria-label={t("Example questions","Întrebări exemplu")}>{scenarios.map(item=><Link scroll={false} key={item.id} aria-current={item.id===active.id?"page":undefined} href={`/${locale}/services/copilot-studio?scenariu=${item.id}`}>{copy(locale,item.title)}</Link>)}</nav>
      <div className="stack" aria-live="polite"><span className="chip">{active.source?t("Source found","Sursă găsită"):t("Source unavailable","Sursă indisponibilă")}</span><p>{copy(locale,active.answer)}</p>
        {active.source&&active.excerpt?<details><summary><BookOpen size={15} className="inline"/> {copy(locale,active.source)}</summary><p>{copy(locale,active.excerpt)}</p></details>:<ShieldQuestion size={22} aria-hidden/>}
      </div>
    </div>
  </section>;
}
