"use client";

import { useState } from "react";
import { ArrowDown, Database, GitPullRequest, Layers3, Workflow } from "lucide-react";
import { copy, type Locale } from "@/domain/catalog";

const nodes = [
  { Icon: Database, label:["Inputs","Date de intrare"], title:["Requests & records","Cereri și înregistrări"], note:["Collect complete information from the systems people already use.","Colectăm informații complete din sistemele pe care oamenii le folosesc deja."] },
  { Icon: Workflow, label:["Process","Proces"], title:["Rules & routing","Reguli și distribuire"], note:["Apply agreed rules and route each request to the right owner.","Aplicăm regulile stabilite și trimitem fiecare cerere responsabilului potrivit."] },
  { Icon: GitPullRequest, label:["Review","Verificare"], title:["Human decisions","Decizii umane"], note:["Give people the context to resolve exceptions and approve decisions.","Oferim oamenilor contextul necesar pentru a trata excepțiile și a aproba decizii."] },
  { Icon: Layers3, label:["Output","Rezultat"], title:["Shared reporting","Raportare comună"], note:["Record outcomes in one place so teams can see what happened.","Înregistrăm rezultatele într-un singur loc, ca echipa să poată urmări ce s-a întâmplat."] },
] as const;

export function SystemsVisual({ locale }: { locale: Locale }) {
  const [selected, setSelected] = useState(1);
  return <section className="systems-visual" aria-label={copy(locale, ["Illustrative business system", "Exemplu de sistem operațional"])}>
    <div className="systems-top"><span>{copy(locale, ["Connected workflow", "Flux de lucru conectat"])}</span><span className="systems-badge">{copy(locale, ["Illustration", "Exemplu"])}</span></div>
    <div className="systems-nodes">
      {nodes.map(({ Icon, label, title }, index) => <div className="systems-step" key={label[0]}>
        {index > 0 && <ArrowDown className="systems-connector" size={15} aria-hidden />}
        <button type="button" aria-pressed={index === selected} onClick={() => setSelected(index)}>
          <span className="systems-icon"><Icon size={18} aria-hidden /></span>
          <span><small>{copy(locale, label)}</small><strong>{copy(locale, title)}</strong></span>
          <span className="systems-dot" aria-hidden />
        </button>
      </div>)}
    </div>
    <p className="systems-note" role="status">{copy(locale, nodes[selected].note)}</p>
  </section>;
}
