# blen.

Bilingual local preview of blen. for business consulting, process engineering, AI automation and custom software. It includes a process diagnostic, an Excel automation builder, a demonstration marketplace and a fictional FluxClar Ops pilot.

The charcoal, off-white and blue design uses a geometric wordmark and an interactive systems diagram. See [Release preparation](BLEN_RELEASE.md) for configuration and commercial launch requirements.

## Run on Windows

Install Node.js 24 and npm. From this directory in PowerShell:

```powershell
npm.cmd ci
npm.cmd run dev
```

Open http://127.0.0.1:3000/ro or http://127.0.0.1:3000/en. To use another port, run `$env:PORT = '3001'` before starting. Use the printed loopback address.

For Windows Command Prompt, change to the project directory with `cd /d "path-to-project"`, then run `npm.cmd ci` and `npm.cmd run dev`.

- Open **Contact** to prepare an email draft for the blen. inbox or save a fictional audit request. The draft must be sent from the visitor’s email app. Open **Business Consulting** to explore services and complete the five-step diagnostic. Sign in before saving a test request if you want to track it in your workspace.
- Use **Admin demo → Consulting** to review requests, assign a service, save project updates, itemize quotes, approve a text deliverable and track support requests.

- Open **Builder**, choose a template and select **Preview** for sample rows and generated TypeScript. Sign in, save the workflow, choose **Export**, confirm a simulated order and download its ZIP.
- Sign in with **Start a demo session** or register using a synthetic address. A demo session makes a new test identity. Register if you want to sign in as the same local customer again.
- Open **Marketplace** to filter and sort examples, choose EUR or RON, and test product checkout. All visible prices are test amounts.
- Submit a test request while signed in to see it in **Workspace → Requests**. Anonymous requests appear in the admin inbox only.
- Open **Admin demo** in a separate browser profile or private window. Its synthetic administrator can review orders, edit demo catalog entries, update requests and save quotation revisions. Signing in as the demo admin in the same browser switches the current session.

The preview persists records in `.flowelix/demo.sqlite`. Use a separate local file via `FLOWELIX_DB` to keep datasets apart. Keep the workspace private. The admin demo deliberately allows any visitor to the loopback preview to start an administrator session.

## Verify

```powershell
npm.cmd run typecheck
npm.cmd test
npm.cmd run test:e2e
npm.cmd run build
```

The browser suite defaults to installed Microsoft Edge and starts an isolated server on port 3100 with a synthetic database and separate Next build directory. Set `PLAYWRIGHT_CHANNEL=chrome` in PowerShell via `$env:PLAYWRIGHT_CHANNEL = 'chrome'` to use installed Chrome. The production compilation is for QA. The supported preview entry point is `npm.cmd run dev`.

## Optional test integrations

Copy `.env.example` to `.env.local` and provide credentials only for test projects you control. Supabase Auth can provide account confirmation and password recovery. PostgreSQL and Storage integration are deferred. Stripe requires a test API key, a webhook signing secret and explicitly configured test prices. Without both Stripe credentials, the demo runs the local simulator.

Read [Architecture](ARCHITECTURE.md), [Migration](MIGRATION.md), [Design system](DESIGN_SYSTEM.md), [Builder](AUTOMATION_BUILDER.md), [Payments](PAYMENTS.md), [Security](SECURITY.md), [Legal launch checklist](LEGAL_LAUNCH_CHECKLIST.md), [Deployment](DEPLOYMENT.md) and [Verification](TESTING.md).
