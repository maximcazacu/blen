# blen. business consulting

The entry points are `/ro/consulting` and `/en/consulting`. The initial offer is a paid audit of one process, followed by a discovery call to review findings and agree what to standardize first. Scope and price are agreed by email before the audit.

The contact form prepares a draft for the configured contact inbox. The visitor reviews and sends it from their email app. In local preview, testers can also save a fictional request to **Admin → Consulting**. The diagnostic can attach its answers to a local test request. The email draft includes the inquiry fields, and visitors can add assessment details before sending it. The footer links to the builder, catalog and Ops in local preview.

## Diagnostic rules, version 1.0

Each listed signal contributes one point to its area. Repeated selections count once. Higher scores appear first. Ties use the order shown below, and AI readiness follows other signalled areas. Areas with no signals are omitted.

| Area | Signals | Recommended service |
| --- | --- | --- |
| Process standardization | Steps undocumented or partly documented, recurring errors, accuracy goal | Process design and optimization |
| Data architecture | Duplicates, hard-to-access data, centralization goal | Data architecture |
| Workflow automation | Repeated manual entry, automation goal, repeated entry in a daily or weekly process | Process design and optimization |
| Reporting | Reporting delays, reporting goal | Data architecture |
| Systems integration | Disconnected systems, plus more than one digital tool when systems are disconnected | Systems integration |
| Governance and documentation | Unclear ownership, incomplete documentation, governance goal | Process audit |
| AI readiness | Explicit goal to evaluate AI | AI opportunity and readiness |

The first area determines the next step. If there is no signal, the recommendation is a process audit. Business context, budget and timeline are for consultation review. The questionnaire displays the signals behind each recommendation. The result gives topics to investigate and cannot verify root causes or estimate savings.

## Submission and access

Answers stay in component state until the visitor submits the assessment. The request describes which answers and contact details will be stored and links to the local privacy notice. The server recomputes the result from validated input and saves the answers and result together. The administrator can review all local demo submissions. A signed-in customer can see their own records. A guest submission can be reviewed by an administrator and is not retroactively assigned to an account.

Use **Admin → Consulting** to update the request status, assign a service, keep internal notes, share milestones, publish a private text deliverable and respond to support requests. The consultation quote records consulting, implementation, third-party licenses, hosting and optional maintenance as separate amounts. The server computes the total from these amounts. Draft quotes and unapproved deliverables are visible only to administrators.

Local files and records are for fictional data. The existing database is extended on startup without replacing existing records. The Supabase migration is a proposed hosted schema with owner RLS, column restrictions on internal notes and an approval check for deliverables. It is not connected to the SQLite preview. Hosted authorization, production retention, file delivery and any contractual support terms need separate validation and approval before release.
