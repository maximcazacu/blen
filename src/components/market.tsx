"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, BarChart3, Grid2X2, Layers3, Search } from "lucide-react";
import { copy, currency, statusLabel, type Locale, type Product } from "@/domain/catalog";
export type Listed = Product & {displayPrice?:{EUR:number;RON:number}};
export function Market({locale,products}:{locale:Locale;products:Listed[]}) {
  const t=(en:string,ro:string)=>copy(locale,[en,ro]);
  const [query,setQuery]=useState("");
  const [category,setCategory]=useState("");
  const [sort,setSort]=useState("");
  const [code,setCode]=useState<"EUR"|"RON">(locale==="ro"?"RON":"EUR");
  const categoryLabel=(value:string)=>value==="Reporting"?t("Reporting","Raportare"):value==="Custom"?t("Custom","La comandă"):value;
  const items=products.filter(product=>(!category || product.category===category) && (copy(locale,product.title)+" "+copy(locale,product.description)).toLocaleLowerCase(locale).includes(query.trim().toLocaleLowerCase(locale)));
  if(sort==="price")items.sort((a,b)=>(a.displayPrice?.[code]??Infinity)-(b.displayPrice?.[code]??Infinity));
  if(sort==="title")items.sort((a,b)=>copy(locale,a.title).localeCompare(copy(locale,b.title),locale));
  return <>
    <div className="filters glass"><label className="search"><Search size={17}/><input value={query} onChange={event=>setQuery(event.target.value)} aria-label={t("Search products","Caută produse")} placeholder={t("Search automations…","Caută automatizări…")}/></label>
      <label><span className="sr-only">{t("Category","Categorie")}</span><select value={category} onChange={event=>setCategory(event.target.value)}><option value="">{t("All categories","Toate categoriile")}</option>{[...new Set(products.map(product=>product.category))].map(value=><option key={value} value={value}>{categoryLabel(value)}</option>)}</select></label>
      <label><span className="sr-only">{t("Sort","Sortare")}</span><select value={sort} onChange={event=>setSort(event.target.value)}><option value="">{t("Featured","Recomandate")}</option><option value="price">{t("Lowest test price","Cel mai mic preț de test")}</option><option value="title">{t("Name","Nume")}</option></select></label>
      <label><span className="sr-only">{t("Currency","Monedă")}</span><select value={code} onChange={event=>setCode(event.target.value==="EUR"?"EUR":"RON")}><option>EUR</option><option>RON</option></select></label>
    </div>
    <p className="mono muted" role="status">{items.length} {t("results","rezultate")}</p>
    <div className="pillar-grid">{items.map(product=>{const Icon=product.icon==="chart"?BarChart3:product.icon==="grid"?Grid2X2:Layers3;return <Link key={product.id} className="product-card glass" href={`/${locale}/marketplace/${product.slug}`}>
      <div className="product-image" data-tone={product.category==="Reporting"?"blue":"green"}><Icon size={50} strokeWidth={1.2}/><span className="chip">{statusLabel(locale,product.status)}</span></div>
      <div className="product-content"><p className="eyebrow">{categoryLabel(product.category)} · v{product.version}</p><h3>{copy(locale,product.title)}</h3><p>{copy(locale,product.description)}</p>
      <div className="product-footer"><span>{product.displayPrice?currency(locale,product.displayPrice[code],code):statusLabel(locale,product.status)}</span><ArrowUpRight size={18}/></div></div></Link>})}</div>
  </>;
}
