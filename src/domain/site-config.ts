export const brand = "blen.";
export const opsName = "FluxClar Ops by blen.";
export const tagline = ["Business clarity. Engineered intelligence.", "Claritate în afaceri. Inteligență prin inginerie."] as const;
export const siteDescription = [
  "Business consulting, process engineering, AI automation and custom software for businesses and individuals.",
  "Consultanță de business, ingineria proceselor, automatizare cu AI și software la comandă pentru firme și persoane fizice.",
] as const;

export function siteOrigin() {
  const address = new URL(process.env.BLEN_SITE_URL || "https://blen.ro");
  if (!["http:", "https:"].includes(address.protocol) || address.username || address.password || address.pathname !== "/" || address.search || address.hash) {
    throw new Error("BLEN_SITE_URL must be an HTTP(S) origin without credentials, paths or query parameters.");
  }
  return address.origin;
}

export function indexingEnabled() {
  return process.env.NODE_ENV === "production" && process.env.BLEN_INDEXING_ENABLED === "1" &&
    Boolean(process.env.BLEN_SITE_URL) && siteOrigin().startsWith("https://");
}

export const publicPaths: readonly string[] = [
  "", "/services", "/services/business-consulting", "/services/intelligent-automation", "/services/software-integrations",
  "/services/copilot-studio", "/services/excel-automation", "/services/power-automate", "/services/n8n",
  "/solutions", "/consulting", "/how-it-works", "/about", "/contact", "/faq",
];
