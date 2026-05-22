# THLabs Roadmap

## Current State

THLabs is live at `thlabs.dk` — a public shell, authentication gateway, and project index.

The first external project, Sea Trout Log, is registered in the project index with an external deployment at `trout.thlabs.dk` and its own independent auth boundary.

---

## Current Sprint Focus

No active sprint. Sprint 4 closed 2026-05-22.

---

## Completed Milestones

- **Shell and project index** — Home, About, Projects, Contact pages. Dark-mode-first minimalist aesthetic established.
- **Supabase SSR auth (THLabs)** — Magic-link OTP, SSR cookie sessions via `@supabase/ssr`, login page, PKCE callback.
- **Project detail pages** — `/projects/[slug]` dynamic route with inline auth gating for private projects.
- **Nav auth state** — Async server-component nav surfaces login/logout without a client-side auth provider.
- **Sea Trout Log registry entry** — Private project registered; `externalUrl` set to `https://trout.thlabs.dk`.
- **External deployment handoff model** — `externalUrl` in the project registry drives "Open project →" links. Handoff is a URL only — no proxy, no iframe, no shared runtime.
- **Sea Trout Log auth layer** — Independent Supabase project, middleware auth gate, magic-link login, PKCE callback, header with session identity. Implemented in `havorred-log`.
- **Sea Trout Log deployment verified** — `trout.thlabs.dk` confirmed live 2026-05-22; all 8 verification items passed; STL `status` promoted to `'live'` in registry.
- **Governance hardening** — ADR-006 (deployment verification exit conditions), canonical glossary, drift/Accepted Limitations split, startsession profile, THLabs-native portability validation.

---

## Next Priorities

- Continue Sea Trout Log feature development (`havorred-log` repo).
- Evaluate whether additional projects warrant registry entries.

---

## Later / Deferred

- **Distributed project metadata** — projects self-describe via `/.meta/project.json`; THLabs becomes an aggregator rather than the manual source of truth. Not current scope.
- **Cross-subdomain auth** — if multiple private projects need a shared thin session layer, this requires new infrastructure and a separate decision. Not yet warranted.
- **Light-mode CSS** — explicitly deferred; dark-mode-first is the standing commitment.
