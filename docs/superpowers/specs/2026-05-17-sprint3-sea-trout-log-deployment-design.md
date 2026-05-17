# Sprint 3 — Sea Trout Log External Deployment

**Date:** 2026-05-17
**Status:** Approved

## Goal

Establish the THLabs external deployment model in production. Sea Trout Log (`havorred-log`) becomes the first independently deployed THLabs project, reachable at `trout.thlabs.dk`, with its own auth boundary, its own runtime, and its own deployment lifecycle.

THLabs links to it. It does not host it.

---

## Scope

Two repos are touched:

| Repo | Change |
|------|--------|
| `thlabs` | Update `externalUrl` in project registry |
| `havorred-log` | Add `@supabase/ssr`, auth clients, middleware, login page, callback route, layout shell |

Nothing is shared between them at runtime.

---

## Architecture

```
THLabs (thlabs.dk)
  ↓  "Open project →"  externalUrl: 'https://trout.thlabs.dk'
Sea Trout Log (trout.thlabs.dk)
  — separate Vercel project
  — separate Supabase project
  — separate auth boundary
  — separate runtime
```

No shared sessions. No cross-subdomain cookies. No SSO. No monorepo tooling. The handoff is a URL.

---

## Section 1 — STL Auth Layer

### Package

Install `@supabase/ssr` alongside the existing `@supabase/supabase-js`. Both stay — `@supabase/ssr` handles user sessions; `supabase-js` remains the substrate.

### Browser client (`lib/supabase.ts`)

Replace `createClient` (from `supabase-js`) with `createBrowserClient` (from `@supabase/ssr`). Same export shape, same env vars. Existing components that `import { supabase } from '../lib/supabase'` are unaffected.

```ts
// lib/supabase.ts
import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

### Server clients (`lib/supabase/server.ts`)

Two exports, explicit boundary:

- `getSupabaseServer()` — existing service-role client, unchanged. Used by `/api/enrich-catch` and `/api/parse-catch`. No cookies. No user session.
- `createClient(cookieStore)` — new SSR auth client using `createServerClient` from `@supabase/ssr`. Reads/writes cookies. Used by middleware, layout, and auth callback only.

```ts
// lib/supabase/server.ts (additions)
import { createServerClient } from '@supabase/ssr'
import { type ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'

export function createClient(cookieStore: ReadonlyRequestCookies) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {}, // read-only in RSC; middleware handles writes
      },
    }
  )
}
```

Note: In middleware and route handlers where cookies are writable, `setAll` is implemented fully. In server components, it is a no-op (Next.js RSC cannot set response cookies after streaming begins — middleware already refreshed them).

### Middleware (`middleware.ts`)

Responsibilities: refresh auth session cookie on every request; redirect unauthenticated users to `/login`; allow `/login` and `/auth/callback` through unconditionally.

```ts
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

No role logic. No permissions. No feature flags. No abstractions for future auth complexity.

---

## Section 2 — Login Page & Auth Callback

### Login page (`app/login/page.tsx`)

Client component. Renders a restrained, centered auth surface — not a card, not a product UI. Flat, bordered, minimal width.

Structure:
- App name in mono (`Sea Trout Log` / `Havørredloggen`)
- Email input
- "Send magic link" button
- After send: inline confirmation swap ("Check your email")
- No password field, no signup link, no "forgot password"

Auth call:
```ts
supabase.auth.signInWithOtp({
  email,
  options: { shouldCreateUser: false },
})
```

`shouldCreateUser: false` — only manually provisioned users in the STL Supabase project can authenticate. No public access path.

Visual: `bg-slate-950`, `border border-slate-800`, `text-white`, mono labels. Isolated — no THLabs navigation, no shared chrome. Feels like private infrastructure access.

### Auth callback (`app/auth/callback/route.ts`)

GET route handler. Exchanges the PKCE `code` from Supabase's magic-link redirect for a session cookie, then redirects to `/`.

```
/auth/callback?code=...
→ exchangeCodeForSession(code)
→ redirect('/')          on success
→ redirect('/login')     on error
```

No onboarding states, no verification screens, no success pages. Intentionally minimal.

---

## Section 3 — Layout Shell & Logout

### `app/layout.tsx`

Becomes `async`. Calls the SSR auth client to read the current user. Passes `userEmail` to `<Header>`. Retains the existing `min-h-screen bg-slate-950` shell.

### `components/Header.tsx`

Server component. Props: `{ userEmail: string | null }`.

Layout:
```
Sea Trout Log          troels@thlabs.dk  logout
```

- App name: `text-sm font-mono text-slate-300`
- Email: `text-xs font-mono text-slate-500` — session context, visually secondary
- `<LogoutButton />` on the right
- Separator: `border-b border-slate-800`

No nav links. No avatars. No dropdowns. No profile surface. Infrastructural.

### `components/LogoutButton.tsx`

`"use client"`. Calls `supabase.auth.signOut()` then `router.push('/login')`.

```
text-xs font-mono text-slate-300 hover:text-white
```

One step brighter than the email — clearly actionable without being prominent.

---

## Section 4 — THLabs Registry Update

In `thlabs/lib/projects.ts`, update the Sea Trout Log entry:

```ts
externalUrl: 'https://trout.thlabs.dk',
```

The existing detail page at `/projects/sea-trout-log` already renders "Open project →" when `externalUrl` is non-null. No template changes needed.

`status` remains `'development'` until the deployment is confirmed live. Updating to `'live'` is a one-line follow-up after the Vercel deploy succeeds.

---

## Deployment (Prerequisite — Manual Steps)

These steps happen outside the codebase and are not part of the implementation plan:

1. Create a separate Vercel project pointing at the `havorred-log` repo
2. Set `trout.thlabs.dk` as a custom domain in that Vercel project
3. Add DNS CNAME record at the domain registrar
4. Set environment variables in the Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENAI_API_KEY`
5. Add `https://trout.thlabs.dk` as a redirect/allowed URL in the STL Supabase Auth settings

---

## Why Auth Boundaries Remain Separate

Each Supabase project has its own auth schema, its own JWT signing keys, its own session cookies with distinct domain scoping, and its own user table. There is no technical path for a session from one project to validate against the other without explicit configuration. Sprint 3 deliberately does not build that configuration — the systems are coupled only at the URL level.

## Why Deployment Separation Matters

Independent deployments mean independent CI, independent rollback, independent scaling, and no shared failure domains. An STL deploy cannot break THLabs. A THLabs deploy cannot affect STL. Each system can evolve on its own schedule.

## How the Handoff Model Works End-to-End

```
User authenticates to THLabs
  → sees Sea Trout Log in project index
  → clicks "Open project →" (links to https://trout.thlabs.dk)
  → STL middleware checks STL session cookie → not present
  → redirected to trout.thlabs.dk/login
  → sends magic link via STL's own Supabase project
  → clicks link → /auth/callback → session cookie set → /
  → sees the STL application
```

THLabs hands off via URL. STL owns its own auth from that point forward.

---

## Files Changed

### `havorred-log`

| File | Change |
|------|--------|
| `package.json` | Add `@supabase/ssr` |
| `lib/supabase.ts` | Switch to `createBrowserClient` |
| `lib/supabase/server.ts` | Add `createClient(cookieStore)` export |
| `middleware.ts` | New — session refresh + auth gate |
| `app/login/page.tsx` | New — magic link auth surface |
| `app/auth/callback/route.ts` | New — PKCE exchange |
| `app/layout.tsx` | Add async, Header, font, dark globals |
| `components/Header.tsx` | New — app name + email + logout |
| `components/LogoutButton.tsx` | New — signOut + redirect |

### `thlabs`

| File | Change |
|------|--------|
| `lib/projects.ts` | `externalUrl: 'https://trout.thlabs.dk'` |
