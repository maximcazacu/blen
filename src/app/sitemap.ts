import type { MetadataRoute } from "next";
import { publicPaths, indexingEnabled, siteOrigin } from "@/domain/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  if (!indexingEnabled()) return [];
  const base = siteOrigin();
  return publicPaths.flatMap(path => {
    const languages = { en: base + "/en" + path, ro: base + "/ro" + path, "x-default": base + "/ro" + path };
    return (["en", "ro"] as const).map(locale => ({ url: languages[locale], alternates: { languages } }));
  });
}
