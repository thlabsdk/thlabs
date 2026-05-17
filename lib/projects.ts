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
    externalUrl: 'https://trout.thlabs.dk',
  },
]

export function getVisibleProjects(authenticated: boolean): Project[] {
  if (authenticated) return PROJECTS
  return PROJECTS.filter((p) => p.visibility === 'public')
}
