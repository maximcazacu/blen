"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NotFound() {
  const locale = usePathname().split("/")[1] === "en" ? "en" : "ro";
  return <section className="page-intro"><p className="eyebrow">404</p>
    <h1>{locale === "en" ? "Page unavailable" : "Pagina nu este disponibilă"}</h1>
    <Link className="button button-primary" href={`/${locale}`}>blen.</Link>
  </section>;
}
