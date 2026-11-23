import "server-only";
import { siteOrigin } from "@/domain/site-config";
export const previewEnabled = () => process.env.NODE_ENV === "development" && process.env.FLOWELIX_PREVIEW === "1";
export const origin = () => process.env.NODE_ENV === "development" ? process.env.FLOWELIX_ORIGIN || "http://127.0.0.1:3000" : siteOrigin();
export const contact = () => process.env.FLOWELIX_CONTACT_EMAIL || "maximcazacu0501@gmail.com";
export const contactPhone = { display: "+40 754 916 034", href: "tel:+40754916034" };
export const configuredAuth = () => Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_PUBLISHABLE_KEY);
export function stripeEnabled() {
  return previewEnabled() && /^sk_test_/.test(process.env.STRIPE_SECRET_KEY ?? "") &&
    /^whsec_/.test(process.env.STRIPE_WEBHOOK_SECRET ?? "");
}
