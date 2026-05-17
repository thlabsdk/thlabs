'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/about', label: 'About' },
  { href: '/projects', label: 'Projects' },
  { href: '/contact', label: 'Contact' },
]

export function NavLinks() {
  const pathname = usePathname()

  return (
    <ul className="flex items-center gap-8">
      {links.map(({ href, label }) => {
        const isActive = pathname === href
        return (
          <li key={href}>
            <Link
              href={href}
              className={`text-sm transition-colors duration-150 ${
                isActive
                  ? 'text-foreground'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              {label}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
