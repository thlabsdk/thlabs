# THLabs Roadmap

## Current State

THLabs is live at `thlabs.dk` — a public shell, authentication gateway, and project index.

The first external project, Sea Trout Log, is registered in the project index with an external deployment at `trout.thlabs.dk` and its own independent auth boundary.

---

## Current Sprint Focus

**Sprint 3 — Sea Trout Log External Deployment — `Awaiting Verification`**

Implementation is complete: the STL auth layer, middleware, login surface, PKCE callback, and layout shell are merged in `havorred-log`; the THLabs registry `externalUrl` points to `https://trout.thlabs.dk`. Code and infrastructure changes are committed.

**Not operationally verified.** The deployment at `trout.thlabs.dk` has not been confirmed reachable and the auth flow has not been exercised. Per ADR-006, this sprint cannot be marked Complete until the Verification Record in the Sprint 3 plan is filled in with a passing result. STL registry `status` remains `'development'` pending a passing verification.

**Sprint 4 — Governance Hardening — `In Progress`**

Adding governance discipline that closes the operational gaps identified by the portability assessment. See `docs/superpowers/specs/2026-05-22-sprint4-governance-hardening-design.md`.

---

## Completed Milestones

- **Shell and project index** — Home, About, Projects, Contact pages. Dark-mode-first minimalist aesthetic established.
- **Supabase SSR auth (THLabs)** — Magic-link OTP, SSR cookie sessions via `@supabase/ssr`, login page, PKCE callback.
- **Project detail pages** — `/projects/[slug]` dynamic route with inline auth gating for private projects.
- **Nav auth state** — Async server-component nav surfaces login/logout without a client-side auth provider.
- **Sea Trout Log registry entry** — Private project registered; `externalUrl` set to `https://trout.thlabs.dk`.
- **External deployment handoff model** — `externalUrl` in the project registry drives "Open project →" links. Handoff is a URL only — no proxy, no iframe, no shared runtime.
- **Sea Trout Log auth layer** — Independent Supabase project, middleware auth gate, magic-link login, PKCE callback, header with session identity. Implemented in `havorred-log`.

---

## Next Priorities

- Confirm `trout.thlabs.dk` deployment is operational; set STL `status: 'live'`.
- Continue Sea Trout Log feature development (`havorred-log` repo).
- Evaluate whether additional projects warrant registry entries.

---

## Later / Deferred

- **Distributed project metadata** — projects self-describe via `/.meta/project.json`; THLabs becomes an aggregator rather than the manual source of truth. Not current scope.
- **Cross-subdomain auth** — if multiple private projects need a shared thin session layer, this requires new infrastructure and a separate decision. Not yet warranted.
- **Light-mode CSS** — explicitly deferred; dark-mode-first is the standing commitment.
