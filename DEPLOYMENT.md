# Deployment preparation

Start the local product with `npm.cmd run dev`. Use `npm.cmd run build` to verify compilation without test credentials. The development preview is not a deployment target.

## Optional disposable Supabase setup

1. Provision a test project or use the local Supabase stack if available. Set `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` in `.env.local`.
2. Allow the loopback callback URLs `http://127.0.0.1:3000/ro/auth/callback` and `http://127.0.0.1:3000/en/auth/callback`, including the recovery destination as configured by the auth project.
3. Configure confirmation and reset email for synthetic test identities. Verify the sign-up, callback and recovery paths on the same browser that initiated the flow.
4. The migration under `supabase/migrations` defines a proposed PostgreSQL and private Storage boundary. Apply it only to a disposable project while building the adapter and testing RLS. The MVP continues storing app records in local SQLite.

See [Supabase’s Next.js Auth guide](https://supabase.com/docs/guides/auth/server-side/nextjs). For payments setup, see [Payments](PAYMENTS.md).

## Release dependencies

Before preparing an externally hosted deployment, complete the service-backed persistence and authorization paths, configure transactional email, validate Office Scripts in Excel and exercise Stripe against a real test endpoint. Approve the provider and legal facts and test commercial pricing and invoicing before introducing any live mode.

The Next.js architecture can target a server runtime after these changes. The local SQLite adapter and preview login deliberately cannot serve as an external deployment.
