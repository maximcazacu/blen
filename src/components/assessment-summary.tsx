import { copy,type Locale } from "@/domain/catalog";
import { type Assessment,type Diagnostic } from "@/domain/advisory";
import { areaLabels,serviceCopy,signalLabels } from "@/domain/advisory-copy";
import { diagnosticGroups } from "@/domain/diagnostic-fields";

export function AssessmentSummary({locale,result,answers}:{locale:Locale;result:Assessment;answers:Diagnostic}) {
  const t=(en:string,ro:string)=>copy(locale,[en,ro]);
  const primary=result.areas.slice(0,2).map(item=>copy(locale,areaLabels[item.area]));
  return <div className="stack">
    <p className="eyebrow">{t("PRELIMINARY ASSESSMENT","EVALUARE PRELIMINARĂ")} · v{result.version}</p>
    <p>{primary.length?t("Areas to investigate first: ","Domenii de analizat cu prioritate: ")+primary.join(" · "):t("Start by mapping the current process with its owner.","Începe prin a mapa procesul actual împreună cu responsabilul.")}</p>
    <p>{t("These are suggestions based on your answers. An investigation is needed to confirm causes.","Aceste sugestii se bazează pe răspunsurile tale. Cauzele pot fi confirmate printr-o analiză a procesului.")}</p>
    <dl className="advisory-facts">{result.areas.map(item=><div key={item.area}><dt>{copy(locale,areaLabels[item.area])}</dt><dd>{item.signals.map(signal=>copy(locale,signalLabels[signal])).join(" · ")}</dd></div>)}</dl>
    <p><strong>{t("Recommended next step","Pasul următor recomandat")}:</strong> {copy(locale,serviceCopy[result.recommended].title)}. {copy(locale,serviceCopy[result.recommended].summary)}</p>
    <details><summary>{t("Review all answers","Vezi toate răspunsurile")}</summary><dl className="advisory-facts">
      {diagnosticGroups.flatMap(group=>group.fields.map(field=>{
        const value=answers[field.name as keyof Diagnostic];
        const display=(value:string|number)=>field.options?.[String(value)]?copy(locale,field.options[String(value)]):String(value);
        return <div key={field.name}><dt>{copy(locale,field.label)}</dt><dd>{Array.isArray(value)?value.map(display).join(", "):display(value)}</dd></div>;
      }))}
    </dl></details>
  </div>;
}
