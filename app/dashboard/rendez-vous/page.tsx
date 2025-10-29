'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import { Card } from '@/components/ui/Card'
import Link from 'next/link'

interface RendezVous {
  id: string
  client_id: string
  date_rendez_vous: string
  heure_rendez_vous: string
  type: string
  description?: string
  statut: string
  clients?: { nom: string }
}

export default function RendezVousPage() {
  const [rendezVous, setRendezVous] = useState<RendezVous[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatut, setFilterStatut] = useState<string>('all')

  useEffect(() => {
    init()
  }, [])

  const init = async () => {
    try {
      const { data: user, error: userError } = await supabase
        .from('utilisateurs')
        .select('entreprise_id')
        .limit(1)
        .single()

      if (userError) {
        console.error('Erreur utilisateur:', userError)
        return
      }

      if (!user) return

      const { data, error } = await supabase
        .from('rendez_vous')
        .select('*, clients(nom)')
        .eq('entreprise_id', user.entreprise_id)
        .order('date_rendez_vous', { ascending: true })

      if (error) {
        console.error('Erreur rendez-vous:', error)
        throw error
      }
      
      setRendezVous(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteRendezVous = async (id: string) => {
    if (!confirm('Supprimer ce rendez-vous?')) return

    try {
      await supabase.from('rendez_vous').delete().eq('id', id)
      setRendezVous(rendezVous.filter(rv => rv.id !== id))
      alert('Rendez-vous supprimé!')
    } catch (error) {
      console.error('Error:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const getStatutColor = (statut: string) => {
    const colors: Record<string, string> = {
      en_attente: 'bg-yellow-100 text-yellow-800 border-l-4 border-yellow-400',
      confirmé: 'bg-blue-100 text-blue-800 border-l-4 border-blue-400',
      complété: 'bg-green-100 text-green-800 border-l-4 border-green-400',
      annulé: 'bg-red-100 text-red-800 border-l-4 border-red-400',
    }
    return colors[statut] || 'bg-gray-100 border-l-4 border-gray-400'
  }

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      appel: '📞',
      visite: '👤',
      démo: '🎬',
      réunion: '👥',
      autre: '📋',
    }
    return icons[type] || '📋'
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      appel: 'bg-blue-50 text-blue-700 border border-blue-200',
      visite: 'bg-green-50 text-green-700 border border-green-200',
      démo: 'bg-purple-50 text-purple-700 border border-purple-200',
      réunion: 'bg-orange-50 text-orange-700 border border-orange-200',
      autre: 'bg-gray-50 text-gray-700 border border-gray-200',
    }
    return colors[type] || 'bg-gray-50 border border-gray-200'
  }

  const filteredRendezVous = filterStatut === 'all' 
    ? rendezVous 
    : rendezVous.filter(rv => rv.statut === filterStatut)

  const upcomingCount = rendezVous.filter(rv => 
    new Date(rv.date_rendez_vous) >= new Date() && rv.statut !== 'annulé'
  ).length

  if (loading) return <p className="p-6 text-center">Chargement...</p>

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Rendez-vous</h1>
          <p className="text-gray-600">{upcomingCount} rendez-vous à venir</p>
        </div>
        <Link href="/dashboard/rendez-vous/new">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold">
            + Créer RDV
          </button>
        </Link>
      </div>

      {/* Filtres */}
      <Card className="mb-8 p-6">
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => setFilterStatut('all')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterStatut === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tous ({rendezVous.length})
          </button>
          <button
            onClick={() => setFilterStatut('en_attente')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterStatut === 'en_attente' 
                ? 'bg-yellow-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            En attente ({rendezVous.filter(rv => rv.statut === 'en_attente').length})
          </button>
          <button
            onClick={() => setFilterStatut('confirmé')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterStatut === 'confirmé' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Confirmé ({rendezVous.filter(rv => rv.statut === 'confirmé').length})
          </button>
          <button
            onClick={() => setFilterStatut('complété')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterStatut === 'complété' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Complété ({rendezVous.filter(rv => rv.statut === 'complété').length})
          </button>
          <button
            onClick={() => setFilterStatut('annulé')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterStatut === 'annulé' 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Annulé ({rendezVous.filter(rv => rv.statut === 'annulé').length})
          </button>
        </div>
      </Card>

      {/* Liste */}
      {filteredRendezVous.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500 text-lg">Aucun rendez-vous. Créez-en un pour commencer!</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRendezVous.map((rv) => (
            <Card key={rv.id} className={`p-6 hover:shadow-lg transition ${getStatutColor(rv.statut)}`}>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                {/* Client et Date */}
                <div className="md:col-span-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Client</p>
                  <p className="text-lg font-bold">{rv.clients?.nom}</p>
                  <p className="text-sm text-gray-600 mt-2">
                    📅 {new Date(rv.date_rendez_vous).toLocaleDateString('fr-FR')}
                  </p>
                </div>

                {/* Heure */}
                <div className="md:col-span-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Heure</p>
                  <p className="text-lg font-bold">🕐 {rv.heure_rendez_vous}</p>
                </div>

                {/* Type */}
                <div className="md:col-span-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Type</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold inline-flex items-center gap-2 ${getTypeColor(rv.type)}`}>
                    <span>{getTypeIcon(rv.type)}</span>
                    {rv.type}
                  </span>
                </div>

                {/* Statut */}
                <div className="md:col-span-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Statut</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold inline-block capitalize`}>
                    {rv.statut}
                  </span>
                </div>

                {/* Actions */}
                <div className="md:col-span-3 flex gap-2 justify-end">
                  <Link href={`/dashboard/rendez-vous/${rv.id}`}>
                    <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg">
                      ✏️ Modifier
                    </button>
                  </Link>
                  <button
                    onClick={() => handleDeleteRendezVous(rv.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                  >
                    🗑️ Supprimer
                  </button>
                </div>
              </div>

              {/* Description */}
              {rv.description && (
                <div className="mt-4 pt-4 border-t border-current border-opacity-20">
                  <p className="text-sm"><strong>Notes :</strong> {rv.description}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}