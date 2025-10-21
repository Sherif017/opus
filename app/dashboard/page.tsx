'use client'

import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const router = useRouter()

  const handleLogout = () => {
    document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    router.push('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">🎵 OPUS</h1>
          <Button onClick={handleLogout} variant="secondary">
            Déconnexion
          </Button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-3xl font-bold mb-4">Bienvenue sur OPUS! 🎵</h2>
          <p className="text-gray-600 mb-8">
            Inscription et authentification: ✅ COMPLÉTÉES!
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800">
              <strong>ÉTAPE 1 Terminée! 🚀</strong>
            </p>
            <p className="text-blue-700 mt-2">
              Prochaine: Créer la base de données Supabase
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}