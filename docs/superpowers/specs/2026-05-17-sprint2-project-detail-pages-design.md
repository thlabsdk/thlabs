# Sprint 2: Project Detail Pages & Private Route Gating

**Date:** 2026-05-17  
**Status:** Approved  

---

## Scope

Add project detail routes (`/projects/[slug]`), extend the project data model with detail-page metadata, build the Sea Trout Log detail page, and introduce minimal private route gating — all without global middleware, databases, or CMS.

THLabs remains: shell, auth gateway, project index. Projects remain separate systems and separate deployments.

---

## Data Model

Extend `lib/projects.ts` with three optional fields. Existing fields (`visibility`, `status`, `href`) are unchanged.

```ts
export type Project = {
  name: string
  slug: string
  description: string         // short, used in list view
  visibility: ProjectVisibility
  status: ProjectStatus
  href: string
  // Detail-page fields (optional)
  summary?: string            // longer narrative paragraph
  stack?: string[]            // e.g. ['Next.js', 'Supabase', 'PostgreSQL']
  externalUrl?: string | null // future handoff URL; null = not yet deployed
}
```

`visibility` drives both list-view filtering (existing) and detail-page access gating (new). No additional field needed.

### THLabs registry entry

```ts
{
  name: 'THLabs',
  slug: 'thlabs',
  description: 'Public shell, auth gateway, and project index.',
  visibility: 'public',
  status: 'live',
  href: '/projects/thlabs',
  summary:
    'Minimal software lab and project index for experimental systems, tools, and private infrastructure.',
  stack: ['Next.js', 'Supabase', 'Vercel'],
  externalUrl: 'https://thlabs.dk',
}
```

Note: `href` changes from `'https://thlabs.dk'` to `'/projects/thlabs'` so the project list links to the internal detail page. The external URL is captured in `externalUrl` instead.

### Sea Trout Log registry entry

```ts
{
  name: 'Sea Trout Log',
  slug: 'sea-trout-log',
  description: 'Private environmental catch logging system.',
  visibility: 'private',
  status: 'development',
  href: '/projects/sea-trout-log',
  summary:
    'Private catch logging system for sea trout fishing. Captures GPS coordinates, catch data, water conditions, and tide information per session. Designed as a structured field record — not a social tool.',
  stack: ['Next.js', 'Supabase', 'PostgreSQL', 'PostGIS'],
  externalUrl: null,
}
```

---

## Routing

### Dynamic route

**File:** `app/projects/[slug]/page.tsx`

This single file handles all project slugs. No per-project files.

### Auth gate (inline, server-side)

```
1. Look up project by slug in PROJECTS registry
2. If not found → notFound()
3. If project.visibility === 'private':
     a. createClient() + getUser()
     b. If no user → redirect('/login')
4. Render detail page
```

Auth check is local to this page only. No middleware. No route groups. No shared guard utility (YAGNI — one callsite). Consistent with the pattern in `app/projects/page.tsx`.

Public project pages (e.g. `thlabs`) render without any auth check — openly accessible by design.

---

## UI Design

### Identity

Maintains THLabs aesthetic: dark-mode-first, restrained, technical. Feels like system documentation or an internal registry record — not a startup landing page.

### Layout (top to bottom)

```
projects / {slug}               ← mono breadcrumb, text-xs, muted
{Project Name}                  ← text-3xl font-semibold
{status} · {visibility}         ← text-xs font-mono muted, inline
────────────────────────────    ← border-t border-border
{summary paragraph}             ← text-sm text-muted, styled directly (no prose/Typography)

STACK                           ← text-xs font-mono uppercase tracking-wider muted label
{stack items comma-separated}   ← text-sm font-mono foreground (e.g. "Next.js, Supabase, PostgreSQL, PostGIS")

DEPLOYMENT                      ← same label style
{status} · {externalUrl or —}   ← text-sm font-mono; if externalUrl: "Open project →" link
```

### Rules

- No tag chips, pill badges, or visual technology labels. Stack is plain mono comma-separated text.
- No Tailwind Typography (`prose`). Text styled directly with utility classes.
- No hero images, gradients, action buttons (beyond external link), social sharing, or sidebar.
- No back-link by default (nav + browser back is sufficient at this scale).

---

## Behaviour Matrix

| User state       | Public page         | Private page        | Unknown slug |
|------------------|--------------------|--------------------|--------------|
| Anonymous        | Renders            | Redirect `/login`  | `notFound()` |
| Authenticated    | Renders            | Renders            | `notFound()` |

### /projects list

No change. `getVisibleProjects(!!user)` continues to hide private projects from anonymous users and show all projects to authenticated users.

---

## Future: External Deployment Handoff

`externalUrl` is the hook for future "Open project →" links. When a project is deployed externally:

1. Set `externalUrl` in the registry entry.
2. The detail page automatically renders the link.

No iframe embedding, no shared runtime, no proxy. Projects remain fully separate systems. THLabs hands off via URL only.

---

## Why Middleware Is Deferred

Middleware runs on every request and is harder to reason about than page-level checks. With one private detail route, a local `getUser()` check is simpler, more explicit, and easier to audit. Middleware becomes the right tool when multiple routes need the same gate — that threshold isn't reached yet.

---

## Architecture Constraints (Not In Scope)

- No database or CMS
- No admin system
- No monorepo tooling
- No shared frontend state between THLabs and project apps
- No complex auth abstractions
- No middleware/proxy

---

## Files Changed

| File | Change |
|------|--------|
| `lib/projects.ts` | Add `summary`, `stack`, `externalUrl` fields; update THLabs and Sea Trout Log entries; update THLabs `href` to `/projects/thlabs` |
| `app/projects/[slug]/page.tsx` | New — dynamic route, auth gate, detail page |
