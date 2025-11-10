'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Loader } from 'lucide-react'
import { supabase } from '@/lib/supabase-client'

interface UserData {
  user: {
    id: string
    email: string
    nom: string
    prenom: string
    entreprise_id: string
  }
}

export default function SettingsPage() {
  const router = useRouter()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
  })

  // Charge les données au mount
  useEffect(() => {
    let isMounted = true

    const initPage = async () => {
      try {
        console.log('🚀 Page settings montée')
        setLoading(true)

        // Récupère la session actuelle
        const {
          data: { session },
        } = await supabase.auth.getSession()

        console.log('📊 Session actuelle:', session?.user?.email)

        if (!isMounted) return

        if (session?.user) {
          console.log('✅ Session trouvée, chargement des données...')
          await loadUserData(session.user.id, session.user.email || '')
        } else {
          console.log('❌ Pas de session, écoute des changements...')
          
          // Écoute les changements d'auth
          const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, newSession) => {
              console.log('🔄 Auth event:', _event, 'User:', newSession?.user?.email)

              if (!isMounted) return

              if (newSession?.user) {
                console.log('✅ Nouvel utilisateur détecté')
                await loadUserData(newSession.user.id, newSession.user.email || '')
              } else {
                console.log('❌ Utilisateur supprimé, redirection')
                router.push('/auth/login')
              }

              setLoading(false)
            }
          )

          return () => subscription?.unsubscribe()
        }

        setLoading(false)
      } catch (err) {
        console.error('❌ Erreur init:', err)
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    const cleanup = initPage()
    
    return () => {
      isMounted = false
      cleanup?.then(fn => fn?.())
    }
  }, [router])

  /**
   * ✅ Charger les infos depuis la table utilisateurs
   */
  const loadUserData = async (userId: string, userEmail: string) => {
    try {
      console.log('📥 Chargement des données utilisateur pour:', userEmail)

      // ✅ Récupère depuis la table utilisateurs
      const { data: userData, error: userError } = await supabase
        .from('utilisateurs')
        .select('id, email, nom, prenom, entreprise_id')
        .eq('id', userId)
        .single()

      if (userError) {
        console.error('❌ Erreur récupération utilisateur:', userError)
        throw userError
      }

      if (!userData) {
        throw new Error('Utilisateur non trouvé')
      }

      console.log('✅ Données utilisateur chargées:', userData)

      setUserData({
        user: {
          id: userData.id,
          email: userData.email,
          nom: userData.nom || '',
          prenom: userData.prenom || '',
          entreprise_id: userData.entreprise_id,
        },
      })

      setFormData({
        nom: userData.nom || '',
        prenom: userData.prenom || '',
      })
    } catch (err) {
      console.error('❌ Erreur chargement:', err)
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError('')
      setSaved(false)

      if (!userData) {
        setError('Données utilisateur non trouvées')
        return
      }

      // ✅ Mettre à jour la table utilisateurs
      const { error: updateError } = await supabase
        .from('utilisateurs')
        .update({
          nom: formData.nom,
          prenom: formData.prenom,
        })
        .eq('id', userData.user.id)

      if (updateError) throw updateError

      // Mettre à jour l'état local
      setUserData({
        user: {
          ...userData.user,
          nom: formData.nom,
          prenom: formData.prenom,
        },
      })

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error('❌ Erreur sauvegarde:', err)
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <Link href="/dashboard" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
              <ArrowLeft size={20} />
              <span>Retour</span>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Paramètres du profil</h1>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-700">Erreur: données non trouvées</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/dashboard" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft size={20} />
            <span>Retour</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Paramètres du profil</h1>
          <p className="text-gray-600">Gérez vos informations personnelles</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Success Message */}
        {saved && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center gap-2">
            <span>✅</span>
            <span>Profil mis à jour avec succès!</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
            <span>❌</span>
            <span>{error}</span>
          </div>
        )}

        {/* Profile Form */}
        <div className="bg-white rounded-lg p-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Mes informations</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Prénom */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Prénom</label>
              <input
                type="text"
                name="prenom"
                value={formData.prenom}
                onChange={handleInputChange}
                placeholder="Jean"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Nom */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nom</label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleInputChange}
                placeholder="Dupont"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Email */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={userData.user.email}
                readOnly
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
            >
              {saving ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Enregistrement...</span>
                </>
              ) : (
                <>
                  <Save size={20} />
                  <span>Enregistrer</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Account Info */}
        <div className="mt-8 bg-white rounded-lg p-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Informations du compte</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Statut</p>
              <p className="text-lg font-semibold text-green-600">Actif ✓</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Email</p>
              <p className="text-lg font-semibold text-gray-900">{userData.user.email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}