export type ProjectVisibility = 'public' | 'private'
export type ProjectStatus = 'live' | 'active' | 'development' | 'archived'

export type Project = {
  name: string
  slug: string
  description: string
  visibility: ProjectVisibility
  status: ProjectStatus
  href: string
}

export const PROJECTS: Project[] = [
  {
    name: 'THLabs',
    slug: 'thlabs',
    description: 'Public shell, auth gateway, and project index.',
    visibility: 'public',
    status: 'live',
    href: 'https://thlabs.dk',
  },
  {
    name: 'Sea Trout Log',
    slug: 'sea-trout-log',
    description: 'Private environmental catch logging system.',
    visibility: 'private',
    status: 'development',
    href: '/projects/sea-trout-log',
  },
]

export function getVisibleProjects(authenticated: boolean): Project[] {
  if (authenticated) return PROJECTS
  return PROJECTS.filter((p) => p.visibility === 'public')
}
