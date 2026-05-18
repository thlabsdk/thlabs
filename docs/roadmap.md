# THLabs Roadmap

## Current State

THLabs is live at `thlabs.dk` — a public shell, authentication gateway, and project index.

The first external project, Sea Trout Log, is registered in the project index with an external deployment at `trout.thlabs.dk` and its own independent auth boundary.

---

## Current Sprint Focus

Sprint 3 (Sea Trout Log deployment) is the most recently completed sprint. The THLabs registry links to the live STL deployment via `externalUrl`. The Sea Trout Log auth layer and application shell are implemented in the `havorred-log` repository.

Outstanding: confirm Vercel deployment is live and update `status` from `'development'` to `'live'` in `lib/projects.ts`.

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
