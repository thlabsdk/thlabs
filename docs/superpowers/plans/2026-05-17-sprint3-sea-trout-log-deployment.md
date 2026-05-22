# Sprint 3 — Sea Trout Log External Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Sprint type:** deployment
**Sprint status:** Awaiting Verification

**Goal:** Add independent auth (magic-link, SSR cookie sessions) to the existing Sea Trout Log app and update the THLabs registry to link to `https://trout.thlabs.dk`.

**Architecture:** `@supabase/ssr` handles cookie-based session management in the `havorred-log` repo; Next.js middleware gates all routes and redirects unauthenticated users to `/login`; a server-component login page plus PKCE callback route complete the auth loop. THLabs gains one changed line.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind 4, `@supabase/ssr`, `@supabase/supabase-js`, TypeScript, Vitest

---

## Context

**Working directories:**
- `C:\Users\troel\code\havorred-log` — Sea Trout Log (primary work)
- `C:\Users\troel\code\thlabs` — THLabs (final task only)

**AGENTS.md requirement:** Before writing any Next.js code, read `node_modules/next/dist/docs/` in the `havorred-log` directory for current API conventions. Pay attention to: async `cookies()`, Route Handler signatures, middleware patterns.

**Existing test suite (Vitest):** `lib/catch_mappers.test.ts`, `lib/catch-schema.test.ts`, `lib/spot_mappers.test.ts`, `lib/spot-schema.test.ts`, `lib/weather.test.ts`. None import from `lib/supabase.ts` — these tests must continue to pass throughout.

---

## File Map

### `havorred-log` — new files

| File | Responsibility |
|------|---------------|
| `middleware.ts` | Session refresh on every request; redirect unauthenticated users to `/login` |
| `app/login/page.tsx` | Async server component; checks session → redirects to `/` if authenticated; renders `<LoginForm />` otherwise |
| `app/login/LoginForm.tsx` | `"use client"` — email input, magic-link send, confirmation state |
| `app/auth/callback/route.ts` | GET handler; exchanges PKCE `code` for session; redirects to `/` |
| `components/Header.tsx` | Server component; receives `userEmail`; renders app name + email + `<LogoutButton />` |
| `components/LogoutButton.tsx` | `"use client"` — `signOut()` + `router.push('/login')` |

### `havorred-log` — modified files

| File | Change |
|------|--------|
| `package.json` | Add `@supabase/ssr` dependency |
| `lib/supabase.ts` | Switch from `createClient` (supabase-js) to `createBrowserClient` (@supabase/ssr) |
| `lib/supabase/server.ts` | Add `createClient()` export (SSR auth); keep existing `getSupabaseServer()` unchanged |
| `app/layout.tsx` | Make async; add Geist fonts, dark background, `<Header>` |

### `thlabs` — modified files

| File | Change |
|------|--------|
| `lib/projects.ts` | `externalUrl: 'https://trout.thlabs.dk'` for Sea Trout Log entry |

---

## Tasks

### Task 1: Install `@supabase/ssr`

**Files:**
- Modify: `havorred-log/package.json`
- Modify: `havorred-log/package-lock.json` (auto-generated)

- [ ] **Step 1.1: Install the package**

```bash
cd C:/Users/troel/code/havorred-log
npm install @supabase/ssr
```

Expected: package installs without errors. `package.json` now lists `"@supabase/ssr"` under `dependencies`.

- [ ] **Step 1.2: Verify install**

```bash
node -e "require('@supabase/ssr'); console.log('ok')"
```

Expected output: `ok`

- [ ] **Step 1.3: Commit**

```bash
git add package.json package-lock.json
git commit -m "deps: add @supabase/ssr for cookie-based auth sessions"
```

---

### Task 2: Update browser Supabase client

**Files:**
- Modify: `havorred-log/lib/supabase.ts`

The existing file uses `createClient` from `@supabase/supabase-js`. Switch to `createBrowserClient` from `@supabase/ssr`. The export name (`supabase`) stays the same — all existing component imports are unaffected.

- [ ] **Step 2.1: Replace `lib/supabase.ts`**

```ts
// lib/supabase.ts
import { createBrowserClient } from '@supabase/ssr'

// Use this in Client Components ("use client"). Do not import in server code.
// createBrowserClient reads and writes auth tokens via document.cookie.
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

- [ ] **Step 2.2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors. (Existing errors, if any, were pre-existing — don't fix unrelated issues.)

- [ ] **Step 2.3: Run existing tests to confirm nothing broke**

```bash
npm run test:run
```

Expected: all existing tests pass. The test files do not import from `lib/supabase.ts`, so this is a sanity check that the module graph still resolves.

- [ ] **Step 2.4: Commit**

```bash
git add lib/supabase.ts
git commit -m "feat: switch browser Supabase client to @supabase/ssr createBrowserClient"
```

---

### Task 3: Add SSR auth client to server module

**Files:**
- Modify: `havorred-log/lib/supabase/server.ts`

Add a new `createClient()` export for SSR cookie-based auth. The existing `getSupabaseServer()` (service-role key, no cookies) stays completely untouched — it is used by `/api/enrich-catch` and `/api/parse-catch`.

- [ ] **Step 3.1: Add `createClient` export to `lib/supabase/server.ts`**

Keep the existing `getSupabaseServer` function exactly as-is. Add the new export below it:

```ts
// lib/supabase/server.ts
import { createClient as createSupabaseServiceClient, type SupabaseClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

let cached: SupabaseClient | null = null

export function getSupabaseServer(): SupabaseClient {
  if (cached) return cached

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
  }
  if (!serviceKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY (required for server-side writes)')
  }

  cached = createSupabaseServiceClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return cached
}

// Use this in Server Components, Route Handlers, and middleware.
// Must be awaited — cookies() is async in Next.js 16.
export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  const cookieStore = await cookies()

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Expected in Server Component render — safe to ignore.
        }
      },
    },
  })
}
```

- [ ] **Step 3.2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3.3: Commit**

```bash
git add lib/supabase/server.ts
git commit -m "feat: add SSR auth client (createClient) to supabase server module"
```

---

### Task 4: Add middleware

**Files:**
- Create: `havorred-log/middleware.ts`

Gates all non-static routes. Refreshes the session cookie on every request (required by `@supabase/ssr`). Redirects unauthenticated users to `/login`. Allows `/login` and `/auth/callback` through unconditionally.

The middleware cannot use the `createClient()` from `lib/supabase/server.ts` (which calls `cookies()` internally) because middleware needs direct access to the `NextRequest`/`NextResponse` cookie objects for proper mutation. Use `createServerClient` from `@supabase/ssr` directly here.

- [ ] **Step 4.1: Create `middleware.ts`**

```ts
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isPublicPath = pathname === '/login' || pathname.startsWith('/auth/')

  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
}
```

- [ ] **Step 4.2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4.3: Smoke-test middleware in dev (manual)**

```bash
npm run dev
```

Open `http://localhost:3000` in a browser. Without an active session you should be immediately redirected to `http://localhost:3000/login` (which will 404 — that's expected, the login page doesn't exist yet). Confirm the redirect happens. Stop the dev server.

- [ ] **Step 4.4: Commit**

```bash
git add middleware.ts
git commit -m "feat: add middleware with auth gate and session refresh"
```

---

### Task 5: Add login form client component

**Files:**
- Create: `havorred-log/app/login/LoginForm.tsx`

This is the interactive part of the login page — separated from the server component (page.tsx) so the page can be async and check auth state server-side.

- [ ] **Step 5.1: Create `app/login/LoginForm.tsx`**

```tsx
// app/login/LoginForm.tsx
'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
  }

  if (sent) {
    return (
      <p className="text-sm font-mono text-slate-400">
        Check your email for a magic link.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-xs font-mono text-slate-500 uppercase tracking-wider">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="bg-slate-900 border border-slate-700 text-sm font-mono text-white px-3 py-2 focus:outline-none focus:border-slate-500"
        />
      </div>

      {error && (
        <p className="text-xs font-mono text-red-400">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="text-xs font-mono text-slate-300 border border-slate-700 px-4 py-2 hover:border-slate-500 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed self-start"
      >
        {loading ? 'Sending…' : 'Send magic link'}
      </button>
    </form>
  )
}
```

- [ ] **Step 5.2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5.3: Commit**

```bash
git add app/login/LoginForm.tsx
git commit -m "feat: add LoginForm client component with magic-link OTP send"
```

---

### Task 6: Add login page (server component)

**Files:**
- Create: `havorred-log/app/login/page.tsx`

Async server component. Checks the current session — if authenticated, redirects to `/`. Otherwise renders the restrained centered auth surface wrapping `<LoginForm />`.

- [ ] **Step 6.1: Create `app/login/page.tsx`**

```tsx
// app/login/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '../../lib/supabase/server'
import { LoginForm } from './LoginForm'

export default async function LoginPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) redirect('/')

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm border border-slate-800 p-8">
        <div className="mb-8">
          <p className="text-xs font-mono text-slate-500 mb-1">havørredloggen</p>
          <p className="text-sm font-mono text-slate-400">
            Enter your email to receive a magic link.
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  )
}
```

- [ ] **Step 6.2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6.3: Smoke-test in dev (manual)**

```bash
npm run dev
```

Open `http://localhost:3000`. You should be redirected to `/login`. The login page should render: bordered surface, "havørredloggen" label, email input, "Send magic link" button. Stop the dev server.

- [ ] **Step 6.4: Commit**

```bash
git add app/login/page.tsx
git commit -m "feat: add login page with magic-link auth surface and auth-guard redirect"
```

---

### Task 7: Add auth callback route

**Files:**
- Create: `havorred-log/app/auth/callback/route.ts`

GET route handler. Receives the PKCE `code` from Supabase's magic-link redirect, exchanges it for a session, and redirects to `/`. On error, redirects to `/login`.

- [ ] **Step 7.1: Create `app/auth/callback/route.ts`**

```ts
// app/auth/callback/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '../../../lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}/`)
    }
  }

  return NextResponse.redirect(`${origin}/login`)
}
```

- [ ] **Step 7.2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 7.3: Commit**

```bash
git add app/auth/callback/route.ts
git commit -m "feat: add PKCE auth callback route"
```

---

### Task 8: Add LogoutButton component

**Files:**
- Create: `havorred-log/components/LogoutButton.tsx`

`"use client"` component. Calls `supabase.auth.signOut()` then navigates to `/login`.

- [ ] **Step 8.1: Create `components/LogoutButton.tsx`**

```tsx
// components/LogoutButton.tsx
'use client'

import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

export function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <button
      onClick={handleLogout}
      className="text-xs font-mono text-slate-300 hover:text-white transition-colors"
    >
      logout
    </button>
  )
}
```

- [ ] **Step 8.2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 8.3: Commit**

```bash
git add components/LogoutButton.tsx
git commit -m "feat: add LogoutButton client component"
```

---

### Task 9: Add Header component

**Files:**
- Create: `havorred-log/components/Header.tsx`

Server component. Receives `userEmail: string | null`. Renders the app identity bar: app name on the left, email + logout on the right. Separated from `layout.tsx` to keep each file focused.

- [ ] **Step 9.1: Create `components/Header.tsx`**

```tsx
// components/Header.tsx
import { LogoutButton } from './LogoutButton'

interface HeaderProps {
  userEmail: string | null
}

export function Header({ userEmail }: HeaderProps) {
  return (
    <header className="border-b border-slate-800 px-6 py-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-mono text-slate-300">
          havørredloggen
        </span>

        {userEmail && (
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-slate-500">
              {userEmail}
            </span>
            <LogoutButton />
          </div>
        )}
      </div>
    </header>
  )
}
```

- [ ] **Step 9.2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 9.3: Commit**

```bash
git add components/Header.tsx
git commit -m "feat: add Header server component with session identity and logout"
```

---

### Task 10: Update root layout

**Files:**
- Modify: `havorred-log/app/layout.tsx`

Make the layout `async`. Add Geist fonts. Add dark background to `<body>`. Call `createClient()` to get the current user. Render `<Header userEmail={...} />` above the page content.

The existing `<main>` content in `app/page.tsx` already sets `bg-slate-950 text-white` on itself — the layout adds it to `<body>` for consistency (so the login page and any future pages without their own background don't flash white).

- [ ] **Step 10.1: Replace `app/layout.tsx`**

```tsx
// app/layout.tsx
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { createClient } from '../lib/supabase/server'
import { Header } from '../components/Header'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Havørredloggen',
  description: 'Private sea trout catch logging.',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <html lang="da" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen flex flex-col bg-slate-950 text-white antialiased">
        <Header userEmail={user?.email ?? null} />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  )
}
```

- [ ] **Step 10.2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 10.3: Smoke-test the full shell (manual)**

```bash
npm run dev
```

Steps to verify:
1. Open `http://localhost:3000` — redirected to `/login`. Login page shows bordered surface, email input, no header (header exists but `userEmail` is null, so the right side is empty — the app name still shows).
2. Enter your email and click "Send magic link". UI swaps to "Check your email for a magic link."
3. Click the magic link in your email. Browser follows `trout.thlabs.dk/auth/callback?code=...` — but since you're running locally, update the Supabase Auth redirect URL in the STL Supabase dashboard to `http://localhost:3000/auth/callback` temporarily. After clicking the link, you should land on `/` with the app loaded and the header showing `havørredloggen  [your email]  logout`.
4. Click "logout". Redirected back to `/login`.

Stop the dev server when done.

- [ ] **Step 10.4: Run full test suite**

```bash
npm run test:run
```

Expected: all existing tests pass.

- [ ] **Step 10.5: Production build check**

```bash
npm run build
```

Expected: build succeeds with no errors. Note any warnings but do not fix pre-existing warnings.

- [ ] **Step 10.6: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: update layout — async, Geist fonts, dark background, Header with auth state"
```

---

### Task 11: Update THLabs registry

**Files:**
- Modify: `thlabs/lib/projects.ts`

Update the Sea Trout Log entry to point to the live deployment. `status` stays `'development'` — do not change it to `'live'` until the Vercel deployment is confirmed working.

- [ ] **Step 11.1: Update `externalUrl` in `thlabs/lib/projects.ts`**

Find the Sea Trout Log entry:

```ts
{
  name: 'Sea Trout Log',
  slug: 'sea-trout-log',
  description: 'Private environmental catch logging system.',
  visibility: 'private',
  status: 'development',
  href: '/projects/sea-trout-log',
  summary: '...',
  stack: ['Next.js', 'Supabase', 'PostgreSQL', 'PostGIS'],
  externalUrl: null,   // ← change this
}
```

Change only `externalUrl`:

```ts
externalUrl: 'https://trout.thlabs.dk',
```

`status` remains `'development'`. Do not touch any other field.

- [ ] **Step 11.2: Type-check (in thlabs)**

```bash
cd C:/Users/troel/code/thlabs
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 11.3: Verify the detail page renders the link (manual)**

```bash
npm run dev
```

Open `http://localhost:3000/projects/sea-trout-log` (authenticate first if needed). The Deployment section should now show:
```
development · Open project →
```
where "Open project →" links to `https://trout.thlabs.dk`. Stop the dev server.

- [ ] **Step 11.4: Commit**

```bash
git add lib/projects.ts
git commit -m "feat: set Sea Trout Log externalUrl to https://trout.thlabs.dk"
```

---

## Deployment Prerequisites (Manual — Not in Code)

These steps happen outside the codebase after the code is complete:

1. **Create Vercel project** — point it at the `havorred-log` GitHub repo
2. **Set custom domain** — `trout.thlabs.dk` in the Vercel project settings
3. **DNS** — add a CNAME record at your registrar pointing `trout` → Vercel's DNS target
4. **Vercel environment variables** (set in Vercel dashboard, not committed):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENAI_API_KEY`
   - `OPENAI_PARSE_MODEL` (optional, defaults to `gpt-4o-mini`)
5. **Supabase Auth settings** (STL Supabase dashboard):
   - Add `https://trout.thlabs.dk/auth/callback` to Redirect URLs
   - For local dev: also add `http://localhost:3000/auth/callback`
6. **Provision your user** — in the STL Supabase dashboard, manually create the user account (since `shouldCreateUser: false` blocks self-signup)

---

## Verification Checklist (Post-Deploy)

- [ ] `https://trout.thlabs.dk` redirects to `/login` for anonymous users
- [ ] Magic-link email is received after submitting the login form
- [ ] Clicking the magic link lands on `/` with the app loaded and header showing email + logout
- [ ] Clicking "logout" redirects to `/login`
- [ ] `https://thlabs.dk/projects/sea-trout-log` shows "Open project →" linking to `https://trout.thlabs.dk`
- [ ] `https://trout.thlabs.dk` has no knowledge of the THLabs session (open in a private window — no THLabs login carries over)
- [ ] Direct URL access to `/` while unauthenticated redirects to `/login`
- [ ] Existing STL functionality (catches, spots, bulk ops, AI parse) works when authenticated

---

## Verification Record

**Verified:** —
**Verified by:** —
**Environment:** —
**Result:** —

_Verification not yet performed. Per ADR-006, this sprint cannot be marked Complete until this record is filled in and Result is PASS or PASS WITH CAVEATS._

| # | Checklist item (abbreviated) | Result | Observed |
|---|------------------------------|--------|----------|
| 1 | Anonymous → /login redirect | — | — |
| 2 | Magic-link email received | — | — |
| 3 | Magic link → / with header | — | — |
| 4 | Logout → /login | — | — |
| 5 | THLabs detail page "Open project →" | — | — |
| 6 | No THLabs session carryover | — | — |
| 7 | Unauthenticated / → /login | — | — |
| 8 | STL features work authenticated | — | — |

**Caveats:** —
**Registry action taken:** —

---

## Sprint Closure

- [ ] All task checkboxes above are checked, or explicitly marked deferred with a reason
- [ ] Verification Record is filled in and Result is PASS or PASS WITH CAVEATS
- [ ] Drift reconciliation pass complete
- [ ] `docs/status.md` Active State and `docs/roadmap.md` updated
- [ ] `Complete (with caveats)` caveats recorded in roadmap deferred or status.md Accepted Limitations — or: n/a

**Closed:** —
**Outstanding at close:** —
