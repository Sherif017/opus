'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Bell, LogOut, User as UserIcon, ChevronDown } from 'lucide-react'

interface UserData {
  id: string
  email: string
  prenom: string
  nom: string
  entreprise_id: string
  entreprises: CompanyData
}

interface CompanyData {
  id: string
  nom: string
  email?: string
  telephone?: string
}

export function Header() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [company, setCompany] = useState<CompanyData | null>(null)
  const [showMenu, setShowMenu] = useState(false)

  useEffect(() => {
    loadUserInfo()
  }, [])

  const loadUserInfo = async () => {
    try {
      const { data: userData } = await supabase
        .from('utilisateurs')
        .select('*, entreprises(*)')
        .single()

      if (userData) {
        setUser(userData as UserData)
        if (userData.entreprises) {
          setCompany(userData.entreprises as CompanyData)
        }
      }
    } catch (error) {
      console.error('Error loading user:', error)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    document.cookie = 'auth_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    router.push('/')
  }

  return (
    <header className="border-b border-gray-200 bg-white shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
        {/* Left */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {company?.nom || 'Dashboard'}
          </h2>
          <p className="text-base text-gray-700 font-medium">
            Bienvenue {user?.prenom} ! 👋
          </p>
        </div>

        {/* Right */}
        <div className="flex items-center gap-5">
          {/* Notifications */}
          <button className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-gray-900 relative">
            <Bell className="w-6 h-6" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors text-white shadow-md hover:shadow-lg"
            >
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-blue-600" />
              </div>
              <ChevronDown className="w-4 h-4" />
            </button>

            {/* Dropdown */}
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <button
                  onClick={() => {
                    setShowMenu(false)
                    router.push('/dashboard/settings')
                  }}
                  className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors flex items-center gap-2 border-b border-gray-200 font-medium"
                >
                  <UserIcon className="w-4 h-4" />
                  Profil
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors flex items-center gap-2 font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}