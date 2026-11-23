import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Logo, Navigation } from "@/components/shell";
import { copy, type Locale } from "@/domain/catalog";
import { brand, indexingEnabled, opsName, siteDescription, siteOrigin, tagline } from "@/domain/site-config";
import { previewEnabled } from "@/server/config";
import "../theme.css";
import "../motion.css";
import "../blen.css";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const lang = locale === "ro" ? "ro" : "en";
  const description = copy(lang, siteDescription);
  return {
    metadataBase: new URL(siteOrigin()),
    title: { default: brand + " — " + copy(lang, tagline), template: "%s | " + brand },
    description,
    applicationName: brand,
    icons: { icon: { url: "/favicon.svg", type: "image/svg+xml" } },
    robots: { index: indexingEnabled(), follow: indexingEnabled() },
  };
}

export default async function Layout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale: value } = await params;
  if (value !== "en" && value !== "ro") notFound();
  const locale: Locale = value;
  const t = (en: string, ro: string) => copy(locale, [en, ro]);
  const preview = previewEnabled();
  const links = [
    ["services", t("Services", "Servicii")], ["solutions", t("Solutions", "Soluții")],
    ["how-it-works", t("How it works", "Cum lucrăm")], ["about", t("About", "Despre")],
    ["ops", opsName], ["privacy", t("Privacy", "Confidențialitate")], ["cookies", t("Cookies", "Module cookie")],
    ["terms", t("Terms", "Termeni")], ["provider", t("Provider", "Prestator")], ["complaints", t("Complaints", "Reclamații")],
  ];
  return <html lang={locale} data-scroll-behavior="smooth"><body>
    <a className="skip" href="#main">{t("Skip to content", "Sari la conținut")}</a>
    <Navigation locale={locale} preview={preview} />
    <main id="main" className="shell">{children}</main>
    <footer><div className="footer-inner">
      <div><Logo locale={locale} /><p>{copy(locale, tagline)}</p>{preview && <p>{t("Local preview", "Previzualizare locală")}</p>}</div>
      <div className="footer-links">
        {links.map(([slug, label]) => <Link key={slug} href={`/${locale}/${slug}`}>{label}</Link>)}
        {preview && <nav className="footer-links preview-links" aria-label={t("Local demos", "Demonstrații locale")}>
          {[
            ["builder", t("Automation Builder", "Editor de automatizări")], ["marketplace", t("Marketplace", "Catalog")],
            ["delivery", t("Delivery", "Livrare")], ["refunds", t("Refunds", "Rambursări")],
            ["licensing", t("Licensing", "Licențe")], ["admin", t("Admin demo", "Demo administrare")],
          ].map(([slug, label]) => <Link key={slug} href={`/${locale}/${slug}`}>{label}</Link>)}
        </nav>}
      </div>
      <Link className="footer-cta" href={`/${locale}/contact?engagement=implementation`}>{t("Let's talk", "Hai să discutăm")}</Link>
    </div></footer>
  </body></html>;
}
