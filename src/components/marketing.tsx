import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, Boxes, Braces, ClipboardList, Layers3, Route, Workflow } from "lucide-react";
import { copy, services, type Locale } from "@/domain/catalog";
import { method, pillars } from "@/domain/service-pillars";
import { opsName, tagline } from "@/domain/site-config";
import { SystemsVisual } from "./systems-visual";

export function Intro({ tag, title, description, children }: { tag: string; title: string; description: string; children?: React.ReactNode }) {
  return <section className="page-intro"><p className="eyebrow">{tag}</p><h1>{title}</h1><p className="lede">{description}</p>{children}</section>;
}

export function ServiceGrid({ locale }: { locale: Locale }) {
  return <div className="service-grid">{services.map(service => <Link key={service.slug} className="service-card glass" href={`/${locale}/services/${service.slug}`}>
    <div className="service-top"><span className="tool-icon"><Image src={service.icon} alt="" fill sizes="58px" unoptimized /></span><ArrowUpRight size={18} aria-hidden /></div>
    <h3>{copy(locale, service.title)}</h3>
    <p>{copy(locale, service.description)}</p>
    <p className="service-technology">{copy(locale, ["Built with", "Folosim"])} <strong>{copy(locale, service.technology)}</strong></p>
  </Link>)}</div>;
}

export function PillarGrid({ locale }: { locale: Locale }) {
  const icons = [Route, Workflow, Braces];
  return <div className="pillar-grid blen-pillars">{pillars.map((pillar, index) => {
    const Icon = icons[index];
    return <Link className="pillar glass" key={pillar.slug} href={`/${locale}/services/${pillar.slug}`}>
      <span className="pillar-icon"><Icon size={22} aria-hidden /></span>
      <h3>{copy(locale, pillar.title)}</h3><p>{copy(locale, pillar.intro)}</p><ArrowUpRight size={17} className="pillar-arrow" aria-hidden />
    </Link>;
  })}</div>;
}

export function Methodology({ locale }: { locale: Locale }) {
  return <ol className="methodology-grid">{method.map(({ title, detail }, index) => <li key={title[0]}>
    <span className="method-index">{String(index + 1).padStart(2, "0")}</span><h3>{copy(locale, title)}</h3><p>{copy(locale, detail)}</p>
  </li>)}</ol>;
}

export function SolutionGrid({ locale }: { locale: Locale }) {
  const solutions = [
    { Icon: Workflow, href: "builder", title: ["Automation Builder", "Editor de automatizări"], state: ["Interactive preview", "Previzualizare interactivă"], description: ["Connect Excel operations, validate the flow and inspect the generated Office Script.", "Conectează operațiuni Excel, validează fluxul și inspectează scriptul Office generat."] },
    { Icon: Layers3, href: "marketplace", title: ["Automation Marketplace", "Catalog de automatizări"], state: ["Demo templates", "Șabloane demonstrative"], description: ["Explore reusable Excel templates for data cleanup, formatting and reporting.", "Explorează șabloane Excel reutilizabile pentru curățarea datelor, formatare și raportare."] },
    { Icon: ClipboardList, href: "ops", title: [opsName, opsName], state: ["Pilot concept", "Concept de pilot"], description: ["See how a retail incident could move from store report to owner and review.", "Vezi cum poate fi preluată, atribuită și verificată o sesizare dintr-un magazin."] },
  ] as const;
  return <div className="pillar-grid blen-pillars">{solutions.map(({ Icon, href, title, state, description }) =>
    <Link href={`/${locale}/${href}`} className="pillar glass" key={href}><span className="pillar-icon"><Icon size={22} aria-hidden /></span><span className="solution-state">{copy(locale, state)}</span><h3>{copy(locale, title)}</h3><p>{copy(locale, description)}</p><ArrowUpRight size={17} className="pillar-arrow" aria-hidden /></Link>
  )}</div>;
}

export function Home({ locale }: { locale: Locale }) {
  const t = (en: string, ro: string) => copy(locale, [en, ro]);
  const href = (page: string) => `/${locale}/${page}`;
  return <>
    <section className="hero blen-hero">
      <div className="hero-content">
        <p className="blen-tagline"><span aria-hidden />{copy(locale, tagline)}</p>
        <h1>{t("Smarter systems.", "Sisteme mai inteligente.")} <em>{t("Better business.", "Afaceri mai eficiente.")}</em></h1>
        <p className="hero-description">{t("We help businesses simplify complexity through intelligent automation, thoughtful process engineering and software built around real needs.", "Ajutăm companiile să simplifice procesele complexe prin automatizare inteligentă, arhitectură operațională și soluții software adaptate nevoilor reale.")}</p>
        <div className="button-row"><Link className="button button-primary" href={href("services")}>{t("Explore our services", "Explorează serviciile")}<ArrowRight size={17} /></Link><Link className="button button-secondary" href={href("contact?engagement=implementation")}>{t("Let's talk", "Hai să discutăm")}<ArrowUpRight size={16} /></Link></div>
      </div>
      <SystemsVisual locale={locale} />
    </section>
    <section className="section blen-section" id="services" data-reveal>
      <div className="section-heading"><h2>{t("What we do", "Ce facem")}</h2><p>{t("From defining the problem to building the solution, we work with businesses, independent professionals and individuals.", "De la definirea problemei la dezvoltarea soluției, lucrăm cu firme, profesioniști independenți și persoane fizice.")}</p></div>
      <PillarGrid locale={locale} />
    </section>
    <section className="section blen-section" data-reveal>
      <div className="section-heading"><h2>{t("How we work", "Cum lucrăm")}</h2><Link className="text-link" href={href("how-it-works")}>{t("See our approach", "Vezi abordarea noastră")}<ArrowUpRight size={16} /></Link></div>
      <Methodology locale={locale} />
    </section>
    <section className="section blen-section" data-reveal>
      <div className="section-heading"><h2>{t("Solutions", "Soluții")}</h2><p>{t("Explore the tools, templates and pilot concepts in the blen. ecosystem.", "Explorează instrumentele, șabloanele și conceptele de pilot din ecosistemul blen.")}</p></div>
      <SolutionGrid locale={locale} />
    </section>
    <section className="section why-blen" data-reveal>
      <div><Boxes aria-hidden size={25} /><h2>{t("Why blen.", "De ce blen.")}</h2></div>
      <div className="why-copy"><p>{t("We connect business decisions to technical work. A clear process, reliable data and well-defined ownership guide what we design and build.", "Legăm deciziile de business de implementarea tehnică. Un proces clar, date fiabile și responsabilități definite ne ghidează proiectarea și dezvoltarea.")}</p><Link className="text-link" href={href("about")}>{t("About our approach", "Despre abordarea noastră")}<ArrowUpRight size={16} /></Link></div>
    </section>
    <section className="section final-cta" data-reveal>
      <div><h2>{t("Let's make complexity simple.", "Hai să simplificăm lucrurile.")}</h2><p>{t("Tell us what you want to improve or build.", "Spune-ne ce vrei să îmbunătățești sau să construiești.")}</p></div>
      <Link className="button button-primary" href={href("contact?engagement=implementation")}>{t("Let's talk", "Hai să discutăm")}<ArrowRight size={17} /></Link>
    </section>
  </>;
}
