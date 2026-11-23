# Security

## Local preview boundary

The launcher binds to `127.0.0.1`. Mutating storage, local admin access, downloads and payment operations require the local development configuration. Keep the server private and supply only synthetic data. The demo admin is intentionally available from a local sign-in button. Treat anyone with access to the preview as an administrator of its synthetic data.

Local password accounts use salted scrypt hashes. Session IDs are randomly generated, stored hashed and expire after 12 hours. The cookie is HTTP-only and SameSite Strict. The builder can carry a draft through sign-in using tab-scoped session storage. The draft is removed when reopened. Next’s origin validation applies to server actions. The Stripe webhook uses signature verification in place of browser authentication. Database access uses bound parameters for request inputs. The local service scopes customer records and paid downloads to the authenticated owner. Downloads use an authenticated server endpoint and private, no-store caching.

Requests use bounded input, an invisible honeypot, server-side rate limits and a UUID submission reference for retry. Rate limits are local fixed windows, with per-address and global counters for submissions. No account or workflow is inferred from an anonymous request.

The build rejects preview or Stripe secrets in production configuration. Preview pages carry robots controls and security headers. Before hosting, implement and test hosted administrator provisioning, durable service rate limits, incident response, log redaction, CSP, production cookies, backup and retention controls, artifact storage, and PostgreSQL/RLS authorization tests. Browser checks verify local account isolation only.

Do not enter real contact details, customer data, or Microsoft tenant credentials. No customer workflow runs on the server.
