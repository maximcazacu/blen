import Link from "next/link";
import { ArrowUpRight, ChartNoAxesCombined, Database, Layers3, Network, Route, ScanSearch } from "lucide-react";
import { advisoryServices } from "@/domain/advisory";
import { serviceCopy } from "@/domain/advisory-copy";
import { copy, type Locale } from "@/domain/catalog";

const appearance = {
  "process-audit": { icon: ScanSearch, tone: "violet" },
  "process-optimization": { icon: Route, tone: "teal" },
  "data-architecture": { icon: Database, tone: "blue" },
  "ai-readiness": { icon: Layers3, tone: "pink" },
  "systems-integration": { icon: Network, tone: "amber" },
  "continuous-improvement": { icon: ChartNoAxesCombined, tone: "green" },
};

export function ConsultingGrid({ locale, services = advisoryServices }: {
  locale: Locale;
  services?: readonly typeof advisoryServices[number][];
}) {
  return <div className="pillar-grid">{services.map(service => {
    const {icon:Icon,tone}=appearance[service];
    return <Link key={service} href={`/${locale}/consulting/${service}`} className="pillar glass" data-tone={tone}>
      <div><span className="visual-icon"><Icon size={20}/></span><ArrowUpRight size={17}/></div>
      <h3>{copy(locale, serviceCopy[service].title)}</h3>
      <p>{copy(locale, serviceCopy[service].summary)}</p>
    </Link>;
  })}</div>;
}
