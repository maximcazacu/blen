# Migration from FluxClar

## Repository baseline

The original checkout at `C:/Automation/automation-services` was inspected before edits. It was on `main`, commit `9a61d0f`, with modifications to all five tracked files and additional untracked source and assets. No project package manifest or AGENTS.md was present in the original directory. The audit document informed the feature map. Its prior B2B launch recommendation is historical context for this local B2B and B2C product preview.

The rebuild is isolated in the `flowelix/` directory of the `flowelix/local-mvp` branch in a linked worktree. The original `main` checkout retains its modified and untracked files. The new app uses a fresh database and fresh local sessions. The original Python service can run independently.

| FluxClar component | blen. treatment |
| --- | --- |
| index.html, site.js, style.css, config.js | Rebuilt as EN/RO App Router pages. Copilot remains the first custom service. Its three scripted scenarios and their query slugs carry forward. |
| fluxclar-ops.html and ops.css | Rebuilt as the FluxClar Ops by blen. page with an interactive fictional retail workflow. `/fluxclar-ops.html` redirects to `/ro/ops`. The `pilot=ops` handoff still selects `workflows` and records Ops as the source. |
| Python request API, inquiry CLI and admin | Replaced in the local MVP by validated server actions, new SQLite storage, an inbox and quotation revisions. Existing Python API clients still belong to the legacy service. |
| Static email draft | Preserved with the provisional Gmail address and explicit send-from-mail-app behavior. |
| Provider and legal pages | Redirects lead to localized review drafts. Approval and verified provider details are launch dependencies. |
| Legacy colors, illustrations and logo | Replaced by the blen. identity and workflow diagrams. OFL fonts retained with license files. |
| build_public.py, manifest and launch.json | Kept with the legacy checkout. blen. uses Next.js build and preview gates. |
| analytics.js, cookies.js and booking | Remain inactive in blen.. The local preview has no analytics, advertising or booking integration. |

The app has no dependency on the original working tree at runtime.
