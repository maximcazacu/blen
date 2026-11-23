"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Globe2, Menu, X } from "lucide-react";
import { copy, type Locale } from "@/domain/catalog";

export function Logo({ locale }: { locale: Locale }) {
  return <Link href={`/${locale}`} className="brand" aria-label="blen.">
    <Image src="/blen.svg" width={97} height={31} alt="blen." unoptimized />
  </Link>;
}

export function Navigation({ locale, preview }: { locale: Locale; preview: boolean }) {
  const t = (en: string, ro: string) => copy(locale, [en, ro]);
  const path = usePathname();
  const [menu, setMenu] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const links = [
    ["", t("Home", "Acasă")], ["services", t("Services", "Servicii")], ["solutions", t("Solutions", "Soluții")],
    ["builder", t("Builder", "Editor")], ["marketplace", t("Marketplace", "Catalog")],
    ["about", t("About", "Despre")], ["contact", "Contact"],
  ];
  const other = locale === "ro" ? "en" : "ro";
  const switchTo = `/${other}${path.slice(3)}`;

  return <header className="topbar blen-topbar" onKeyDown={event => {
    if (event.key === "Escape" && menu) { setMenu(false); trigger.current?.focus(); }
  }}>
    <div className="nav-content">
      <Logo locale={locale} />
      <button ref={trigger} className="icon-button mobile-menu" aria-expanded={menu} aria-controls="main-nav" aria-label={t("Menu", "Meniu")} onClick={() => setMenu(!menu)}>{menu ? <X size={20} /> : <Menu size={20} />}</button>
      <nav id="main-nav" aria-label={t("Main", "Principal")} className={menu ? "open" : ""}>
        {links.map(([slug, label]) => {
          const href = slug ? `/${locale}/${slug}` : `/${locale}`;
          const active = path === href || Boolean(slug && path.startsWith(href + "/"));
          return <Link key={slug} href={href} className={active ? "active" : ""} aria-current={path === href ? "page" : undefined} onClick={() => setMenu(false)}>{label}</Link>;
        })}
      </nav>
      <div className="nav-actions">
        <Link aria-label={t("Switch to Romanian", "Schimbă limba în engleză")} href={switchTo} hrefLang={other} className="locale" onClick={event => {
          event.preventDefault();
          window.location.assign(switchTo + window.location.search + window.location.hash);
        }}><Globe2 size={16} aria-hidden />{other.toUpperCase()}</Link>
        {preview && <Link className="button button-quiet nav-workspace" href={`/${locale}/dashboard`}>{t("Workspace", "Contul meu")}<ArrowUpRight size={15} aria-hidden /></Link>}
      </div>
    </div>
  </header>;
}
