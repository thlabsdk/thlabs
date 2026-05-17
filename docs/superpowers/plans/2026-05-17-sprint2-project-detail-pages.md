# Sprint 2: Project Detail Pages & Private Route Gating — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `/projects/[slug]` detail pages with inline private-route gating, extending the static project registry with detail-page metadata fields.

**Architecture:** A single dynamic route (`app/projects/[slug]/page.tsx`) handles all project slugs — lookup from the static `PROJECTS` registry, `notFound()` for unknown slugs, inline server-side auth gate for private projects, and a shared detail layout rendered from model fields. No middleware, no per-project files, no database.

**Tech Stack:** Next.js 16 App Router (server components, async params), Supabase SSR (`@supabase/ssr`), Tailwind CSS v4, TypeScript

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `lib/projects.ts` | Modify | Add `summary?`, `stack?`, `externalUrl?` to `Project` type; update both registry entries |
| `app/projects/[slug]/page.tsx` | Create | Dynamic route — slug lookup, auth gate, detail page UI |

---

## Task 1: Extend the Project model and update the registry

**Files:**
- Modify: `lib/projects.ts`

### Next.js params note (read before implementing)

In Next.js 15+, `params` in page components is a `Promise` — you must `await params` before accessing values. This is covered in Task 2. No changes needed here for that.

- [ ] **Step 1: Add three optional fields to the `Project` type**

Open `lib/projects.ts`. Replace the `Project` type definition:

```ts
export type Project = {
  name: string
  slug: string
  description: string
  visibility: ProjectVisibility
  status: ProjectStatus
  href: string
  summary?: string
  stack?: string[]
  externalUrl?: string | null
}
```

- [ ] **Step 2: Update the THLabs registry entry**

Replace the existing THLabs entry (note: `href` changes from `'https://thlabs.dk'` to `'/projects/thlabs'` — the external URL moves to `externalUrl`):

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
  },
```

- [ ] **Step 3: Update the Sea Trout Log registry entry**

Replace the existing Sea Trout Log entry:

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
  },
```

- [ ] **Step 4: Verify the complete file looks correct**

`lib/projects.ts` should now read:

```ts
export type ProjectVisibility = 'public' | 'private'
export type ProjectStatus = 'live' | 'active' | 'development' | 'archived'

export type Project = {
  name: string
  slug: string
  description: string
  visibility: ProjectVisibility
  status: ProjectStatus
  href: string
  summary?: string
  stack?: string[]
  externalUrl?: string | null
}

export const PROJECTS: Project[] = [
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
  },
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
  },
]

export function getVisibleProjects(authenticated: boolean): Project[] {
  if (authenticated) return PROJECTS
  return PROJECTS.filter((p) => p.visibility === 'public')
}
```

- [ ] **Step 5: Type-check**

```powershell
npx tsc --noEmit
```

Expected: no errors. The new fields are optional so existing consumers of `Project` are unaffected.

---

## Task 2: Create the project detail route

**Files:**
- Create: `app/projects/[slug]/page.tsx`

- [ ] **Step 1: Create the directory**

```powershell
New-Item -ItemType Directory -Force "app/projects/[slug]"
```

- [ ] **Step 2: Create `app/projects/[slug]/page.tsx`**

```tsx
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Container } from '@/components/layout/Container'
import { PROJECTS } from '@/lib/projects'

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const project = PROJECTS.find((p) => p.slug === slug)
  if (!project) notFound()

  if (project.visibility === 'private') {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) redirect('/login')
  }

  return (
    <Container>
      <section className="pt-24 pb-32">
        <p className="text-xs font-mono text-muted">
          projects / {project.slug}
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
          {project.name}
        </h1>
        <p className="mt-1 text-xs font-mono text-muted">
          {project.status} · {project.visibility}
        </p>

        <div className="mt-8 border-t border-border" />

        {project.summary && (
          <p className="mt-8 text-sm text-muted max-w-lg">{project.summary}</p>
        )}

        {project.stack && project.stack.length > 0 && (
          <div className="mt-8">
            <p className="text-xs font-mono uppercase tracking-wider text-muted">
              Stack
            </p>
            <p className="mt-2 text-sm font-mono text-foreground">
              {project.stack.join(', ')}
            </p>
          </div>
        )}

        <div className="mt-8">
          <p className="text-xs font-mono uppercase tracking-wider text-muted">
            Deployment
          </p>
          <p className="mt-2 text-sm font-mono text-foreground">
            {project.status}
            {project.externalUrl ? (
              <>
                {' · '}
                <a
                  href={project.externalUrl}
                  className="underline underline-offset-4 hover:text-muted transition-colors duration-150"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open project →
                </a>
              </>
            ) : (
              ' · —'
            )}
          </p>
        </div>
      </section>
    </Container>
  )
}
```

- [ ] **Step 3: Type-check**

```powershell
npx tsc --noEmit
```

Expected: no errors.

---

## Task 3: Verify

No automated test framework is set up in this project. Verification is TypeScript + build + manual browser checks.

- [ ] **Step 1: Run a production build**

```powershell
npm run build
```

Expected: build completes with no errors. There should be no TypeScript or Next.js compilation failures.

- [ ] **Step 2: Start the dev server**

```powershell
npm run dev
```

- [ ] **Step 3: Verify /projects list (anonymous)**

Open `http://localhost:3000/projects` in a private/incognito window (not logged in).

Expected: only `thlabs` is listed. Sea Trout Log is hidden. THLabs entry links to `/projects/thlabs` (not `https://thlabs.dk`).

- [ ] **Step 4: Verify public detail page (anonymous)**

Navigate to `http://localhost:3000/projects/thlabs`.

Expected:
- Page renders without auth check
- Breadcrumb: `projects / thlabs`
- Heading: `THLabs`
- Status line: `live · public`
- Summary paragraph visible
- Stack line: `Next.js, Supabase, Vercel`
- Deployment line: `live · Open project →` (links to `https://thlabs.dk`)

- [ ] **Step 5: Verify private detail page redirect (anonymous)**

Navigate to `http://localhost:3000/projects/sea-trout-log` while not logged in.

Expected: redirected to `/login`.

- [ ] **Step 6: Verify private detail page (authenticated)**

Log in via the magic link flow at `/login`, then navigate to `http://localhost:3000/projects/sea-trout-log`.

Expected:
- Page renders
- Breadcrumb: `projects / sea-trout-log`
- Heading: `Sea Trout Log`
- Status line: `development · private`
- Summary paragraph visible
- Stack line: `Next.js, Supabase, PostgreSQL, PostGIS`
- Deployment line: `development · —`

- [ ] **Step 7: Verify unknown slug returns 404**

Navigate to `http://localhost:3000/projects/does-not-exist`.

Expected: Next.js 404 page.

- [ ] **Step 8: Verify /projects list (authenticated)**

Navigate to `http://localhost:3000/projects` while logged in.

Expected: both `thlabs` and `sea-trout-log` are listed. Behaviour unchanged from Sprint 1.
