import type { MetadataRoute } from "next";
import { indexingEnabled, siteOrigin } from "@/domain/site-config";

export default function robots(): MetadataRoute.Robots {
  if (!indexingEnabled()) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/en/admin", "/ro/admin", "/en/dashboard", "/ro/dashboard", "/en/checkout", "/ro/checkout"] },
    sitemap: siteOrigin() + "/sitemap.xml",
  };
}
