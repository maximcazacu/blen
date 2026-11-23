import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";
import { indexingEnabled } from "./src/domain/site-config";

export default function config(phase: string): NextConfig {
  if (phase !== PHASE_DEVELOPMENT_SERVER && (
    process.env.FLOWELIX_PREVIEW === "1" || process.env.STRIPE_SECRET_KEY || process.env.STRIPE_WEBHOOK_SECRET
  )) throw new Error("The local preview and Stripe test configuration require the local development server.");
  return {
    distDir: process.env.FLOWELIX_E2E === "1" ? ".next-test" : ".next",
    devIndicators: false,
    agentRules: false,
    poweredByHeader: false,
    async headers() {
      return [{ source: "/:path*", headers: [
        ...(!indexingEnabled() ? [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] : []),
        { key: "Referrer-Policy", value: "no-referrer" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ] }];
    },
    async redirects() {
      return [
        { source: "/", destination: "/ro", permanent: false },
        { source: "/index.html", has:[{type:"query",key:"pilot",value:"ops"}], destination: "/ro/custom-automation", permanent: false },
        { source: "/index.html", has:[{type:"query",key:"scenariu"}], destination: "/ro/services/copilot-studio", permanent: false },
        { source: "/index.html", destination: "/ro", permanent: false },
        { source: "/fluxclar-ops.html", destination: "/ro/ops", permanent: false },
        { source: "/privacy.html", destination: "/ro/privacy", permanent: false },
        { source: "/cookies.html", destination: "/ro/cookies", permanent: false },
        { source: "/prestator.html", destination: "/ro/provider", permanent: false },
        { source: "/refund-policy.html", destination: "/ro/refunds", permanent: false },
      ];
    },
  };
}
