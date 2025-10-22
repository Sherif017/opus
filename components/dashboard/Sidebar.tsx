'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

export function Sidebar() {
  const router = useRouter()

  const handleLogout = () => {
    document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    router.push('/auth/login')
  }

  const links = [
    { label: 'Overview', href: '/dashboard' },
    { label: 'Clients', href: '/dashboard/clients' },
    { label: 'Prospects', href: '/dashboard/prospects' },
    { label: 'Relances (IA)', href: '/dashboard/relances' },
  ]

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-8">🎵 OPUS</h1>

      <nav className="space-y-2 mb-8">
        {links.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className="block px-4 py-2 rounded hover:bg-gray-800"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <Button onClick={handleLogout} variant="danger" className="w-full">
        Déconnexion
      </Button>
    </div>
  )
}