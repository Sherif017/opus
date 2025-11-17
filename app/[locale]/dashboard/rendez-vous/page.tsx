'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import { Card } from '@/components/ui/Card'
import { Calendar, Clock, Plus, Edit2, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Client {
  id: string
  nom: string
}

interface RendezVous {
  id: string
  client_id: string
  date_rendez_vous: string
  heure_rendez_vous: string
  type: string
  description?: string
  statut: string
  clients?: Client
}

export default function RendezVousPage() {
  const router = useRouter()
  const [rdvs, setRdvs] = useState<RendezVous[]>([])
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    loadRendezVous()
    
    // Auto-refresh toutes les 10 secondes EN ARRIÈRE-PLAN
    const interval = setInterval(() => {
      refreshRendezVousInBackground()
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  const loadRendezVous = async () => {
    try {
      setLoading(true)
      await fetchRendezVous()
    } catch (error) {
      console.error('Error loading RDV:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshRendezVousInBackground = async () => {
    try {
      setIsRefreshing(true)
      await fetchRendezVous()
    } catch (error) {
      console.error('Error refreshing RDV:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const fetchRendezVous = async (token?: string) => {
    try {
      // ✅ Récupérer le token de la session si pas fourni
      let accessToken = token
      if (!accessToken) {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session?.access_token) {
          console.error('❌ Pas de session')
          return
        }
        accessToken = session.access_token
      }

      // ✅ Appeler la nouvelle API sécurisée avec le token
      const response = await fetch('/api/dashboard/rendez-vous', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('❌ Erreur API:', error)
        return
      }

      const data = await response.json()
      console.log('✅ RDV chargés:', data.rdvs)
      setRdvs(data.rdvs || [])
    } catch (error) {
      console.error('❌ Erreur chargement RDV:', error)
    }
  }

  const getStatutColor = (statut: string) => {
    const colors: Record<string, string> = {
      en_attente: 'bg-gray-100 text-gray-700 border border-gray-200',
      confirmé: 'bg-blue-100 text-blue-700 border border-blue-200',
      complété: 'bg-green-100 text-green-700 border border-green-200',
      annulé: 'bg-red-100 text-red-700 border border-red-200',
    }
    return colors[statut] || 'bg-gray-100 text-gray-700'
  }

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      appel: '📞',
      reunion: '🤝',
      visioconference: '💻',
      visite_chantier: '🏗️',
      autre: '📌',
    }
    return icons[type] || '📅'
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const handleDeleteRdv = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) throw new Error('No session')

      const response = await fetch(`/api/dashboard/rendez-vous/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (!response.ok) throw new Error('Erreur suppression')

      setRdvs(rdvs.filter(r => r.id !== id))
      alert('Rendez-vous supprimé !')
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la suppression')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-blue-100 mx-auto mb-4 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-gray-700 font-semibold">Chargement des rendez-vous...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-2">Rendez-vous</h1>
          <p className="text-lg text-gray-600">{rdvs.length} rendez-vous en base</p>
        </div>
        <div className="flex items-center gap-4">
          {isRefreshing && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>Mise à jour en cours...</span>
            </div>
          )}
          <Link href="/dashboard/rendez-vous/new">
            <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nouveau RDV
            </button>
          </Link>
        </div>
      </div>

      {/* Liste des RDV */}
      {rdvs.length === 0 ? (
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-3xl p-16 text-center shadow-lg">
          <div className="w-20 h-20 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar className="w-10 h-10 text-blue-600" />
          </div>
          <p className="text-gray-800 text-xl font-bold mb-2">Aucun rendez-vous trouvé</p>
          <p className="text-gray-700">Créez votre premier rendez-vous pour commencer</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {rdvs.map((rdv) => (
            <Card key={rdv.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
                {/* Infos principales */}
                <div className="flex-1">
                  <div className="flex items-baseline gap-3 mb-4">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {getTypeIcon(rdv.type)} {rdv.type.replace(/_/g, ' ')}
                    </h3>
                    <p className="text-lg text-gray-700 font-semibold">{rdv.clients?.nom || 'N/A'}</p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <p className="text-gray-600 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span className="font-semibold">Date :</span> {formatDate(rdv.date_rendez_vous)}
                    </p>
                    <p className="text-gray-600 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span className="font-semibold">Heure :</span> {rdv.heure_rendez_vous}
                    </p>
                    {rdv.description && (
                      <p className="text-gray-600">
                        <span className="font-semibold">Notes :</span> {rdv.description}
                      </p>
                    )}
                    <p className="text-gray-600">
                      <span className="font-semibold">Statut :</span>{' '}
                      <span className={`inline-block px-2 py-1 rounded text-sm font-bold ${getStatutColor(rdv.statut)}`}>
                        {rdv.statut}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                  <button
                    onClick={() => router.push(`/dashboard/rendez-vous/${rdv.id}`)}
                    className="flex-1 md:flex-none px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Voir
                  </button>

                  <button
                    onClick={() => handleDeleteRdv(rdv.id)}
                    className="flex-1 md:flex-none px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Supprimer
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}