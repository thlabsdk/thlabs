## Active State

- **Active sprint:** Sprint 4 — Governance Hardening (`docs/superpowers/specs/2026-05-22-sprint4-governance-hardening-design.md`)
- **Next action:** Close Sprint 4 — run Sprint Closure checklist in the plan
- **Last updated:** 2026-05-22

# Current Status

## Deployment

| System | URL | Platform | Status |
|--------|-----|----------|--------|
| THLabs | `thlabs.dk` | Vercel | Live |
| Sea Trout Log | `trout.thlabs.dk` | Vercel | Live |

Both are separate Vercel projects with independent build pipelines, environment variables, and deployment lifecycles.

---

## Infrastructure

| System | Repo | Stack |
|--------|------|-------|
| THLabs | `thlabs` | Next.js 16, React 19, Tailwind CSS 4, TypeScript, Supabase, Vercel |
| Sea Trout Log | `havorred-log` | Next.js 16, React 19, Tailwind CSS 4, TypeScript, Supabase (PostgreSQL + PostGIS), Vercel |

No shared infrastructure between systems. Each has its own Supabase project, Vercel project, and DNS entry.

---

## Authentication

### THLabs

- Magic-link OTP via Supabase (`@supabase/ssr`)
- SSR cookie session
- Login surface: `/login`; PKCE exchange: `/auth/callback`
- Nav reflects session state: anonymous → Login link; authenticated → email + Logout
- **No global middleware** — private routes gate access with an inline `getUser()` check

### Sea Trout Log

- Separate Supabase project — no session sharing with THLabs
- Same pattern: magic-link OTP, `shouldCreateUser: false` (manually provisioned users only)
- **Global middleware** gates all routes; `/login` and `/auth/callback` are the only public paths
- A THLabs session grants no access to STL, and vice versa

---

## Routing

### THLabs (`app/`)

| Route | Access | Notes |
|-------|--------|-------|
| `/` | Public | |
| `/about` | Public | |
| `/contact` | Public | |
| `/projects` | Public (filtered) | Private projects hidden for anonymous users |
| `/projects/[slug]` | Per-project | Public slugs open; private slugs redirect anonymous users to `/login` |
| `/login` | Public | |
| `/auth/callback` | Public | PKCE exchange |

---

## Projects

Registry source of truth: `lib/projects.ts`

| Name | Slug | Visibility | Status | External URL |
|------|------|-----------|--------|-------------|
| THLabs | `thlabs` | public | live | `https://thlabs.dk` |
| Sea Trout Log | `sea-trout-log` | private | live | `https://trout.thlabs.dk` |

---

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Runtime | React 19 |
| Styling | Tailwind CSS 4 |
| Language | TypeScript |
| Auth | Supabase + `@supabase/ssr` |
| Hosting | Vercel |

---

## Active Capabilities

- Public project index with auth-based visibility filtering
- Project detail pages with inline private route gating
- Nav auth state: session-aware without a client-side auth provider
- External project handoff via `externalUrl` link ("Open project →")
- Magic-link auth with SSR cookie session and PKCE callback

---

## Known Gaps

### Drift (doc disagrees with reality — must be reconciled at sprint close)

_None currently open._

### Accepted Limitations (no current intent to close)

- No automated health checks or uptime monitoring for either deployment.
- Project metadata is maintained manually in `lib/projects.ts` — no distributed self-description mechanism yet. See roadmap "Later / Deferred".

---

## Immediate Technical Priorities

1. Continue Sea Trout Log feature development in `havorred-log`
