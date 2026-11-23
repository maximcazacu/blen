# blen. release preparation

The rebrand is applied to the existing Next.js project. The bilingual marketing pages present consulting and process engineering, AI and automation, and software and integrations. Their links lead to the existing builder, marketplace, diagnostic, workspaces and FluxClar Ops pilot.

## Local preview

Run `npm.cmd run dev` in this project. Open `http://127.0.0.1:3000/ro` or `http://127.0.0.1:3000/en`. The original preview variables, session keys, API routes, database path and migrations are compatible with existing local data. The source folder and package identifier still use their historical names.

## Launch configuration

- Confirm control of the intended domain, connect DNS and TLS, and set `BLEN_SITE_URL` to the confirmed HTTPS origin before deployment. The default metadata origin is the intended address `https://blen.ro`.
- Supply the approved provider record through `BLEN_PROVIDER_NAME`, `BLEN_PROVIDER_REGISTRATION`, `BLEN_PROVIDER_ADDRESS` and `BLEN_PRIVACY_CONTACT`. Review and replace the bilingual legal drafts before publication.
- Confirm the professional contact and privacy workflow. The contact page uses the previously supplied email and phone. The form prepares a draft for the visitor to send, and the test form saves locally. A first-party delivery service and transactional email still require setup.
- Review the privacy disclosures against the actual processing and providers. The current site has no analytics or advertising integrations. Configure consent handling if non-essential tracking is added.
- Leave `BLEN_INDEXING_ENABLED` unset while reviewing. Once the public site is ready, set it to `1` in production with an explicit HTTPS origin, then build and verify canonical URLs, language alternates, robots and the sitemap. Demo and account pages retain noindex metadata.
- Keep SQLite demo records, preview administrator access and test payment credentials on loopback. Complete a production data and authorization setup before accepting customer records. Verify auth and email delivery with the chosen providers. Verify generated Office Scripts in licensed Excel before commercial distribution. Checkout supports simulation and optional Stripe test mode only.

The domain, legal entity, registrations and launch approvals require confirmation. No public deployment was performed.
