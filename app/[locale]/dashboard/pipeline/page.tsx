'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase-client'
import { Card } from '@/components/ui/Card'
import { GripVertical, Plus, Calendar, DollarSign, Mail, Phone, Loader } from 'lucide-react'

interface Prospect {
  id: string
  nom: string
  email?: string
  telephone?: string
  valeur_potentielle?: number
  dernier_contact?: string
  statut_pipeline: string
  notes?: string
  entreprise_id: string
}

interface PipelineColumn {
  id: string
  titre: string
  couleur: string
  icon: string
  prospects: Prospect[]
}

const PIPELINE_STATUTS = [
  { id: 'nouveau', titre: 'Nouveau', couleur: 'bg-blue-50', borderColor: 'border-blue-300', icon: '🆕' },
  { id: 'qualifie', titre: 'Qualifié', couleur: 'bg-yellow-50', borderColor: 'border-yellow-300', icon: '⭐' },
  { id: 'en_contact', titre: 'En Contact', couleur: 'bg-purple-50', borderColor: 'border-purple-300', icon: '💬' },
  { id: 'devis_envoye', titre: 'Devis Envoyé', couleur: 'bg-orange-50', borderColor: 'border-orange-300', icon: '📄' },
  { id: 'ferme', titre: 'Fermé (Gagné)', couleur: 'bg-green-50', borderColor: 'border-green-300', icon: '✅' },
]

export default function PipelineKanbanPage() {
  const [columns, setColumns] = useState<PipelineColumn[]>([])
  const [loading, setLoading] = useState(true)
  const [draggedCard, setDraggedCard] = useState<string | null>(null)
  const [enterpriseId, setEnterpriseId] = useState<string>('')
  const [savingId, setSavingId] = useState<string | null>(null)

  // Charger les prospects au montage
  useEffect(() => {
    loadProspects()
  }, [])

  const loadProspects = useCallback(async () => {
    try {
      setLoading(true)

      // Récupérer l'entreprise ID
      const { data: userData } = await supabase
        .from('utilisateurs')
        .select('entreprise_id')
        .limit(1)
        .single()

      if (!userData) {
        console.error('Utilisateur non trouvé')
        return
      }

      setEnterpriseId(userData.entreprise_id)

      // Charger tous les prospects
      const { data: prospects, error } = await supabase
        .from('prospects')
        .select('*')
        .eq('entreprise_id', userData.entreprise_id)
        .order('dernier_contact', { ascending: false })

      if (error) throw error

      // Organiser par colonne
      const columnMap: { [key: string]: PipelineColumn } = {}
      PIPELINE_STATUTS.forEach(status => {
        columnMap[status.id] = {
          id: status.id,
          titre: status.titre,
          couleur: status.couleur,
          icon: status.icon,
          prospects: []
        }
      })

      // Ajouter les prospects aux colonnes
      prospects?.forEach((prospect: Prospect) => {
        const status = prospect.statut_pipeline || 'nouveau'
        if (columnMap[status]) {
          columnMap[status].prospects.push(prospect)
        } else {
          // Si le statut n'existe pas, le mettre dans "Nouveau"
          columnMap['nouveau'].prospects.push(prospect)
        }
      })

      setColumns(Object.values(columnMap))
    } catch (error) {
      console.error('Error loading prospects:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleDragStart = (e: React.DragEvent, prospectId: string) => {
    setDraggedCard(prospectId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault()
    if (!draggedCard) return

    // Trouver le prospect et la colonne source
    let sourceColumn: PipelineColumn | undefined
    let prospect: Prospect | undefined

    for (const col of columns) {
      const found = col.prospects.find(p => p.id === draggedCard)
      if (found) {
        sourceColumn = col
        prospect = found
        break
      }
    }

    if (!sourceColumn || !prospect || sourceColumn.id === targetColumnId) {
      setDraggedCard(null)
      return
    }

    setSavingId(draggedCard)

    try {
      // Mettre à jour en base de données
      const { error } = await supabase
        .from('prospects')
        .update({ statut_pipeline: targetColumnId })
        .eq('id', draggedCard)
        .eq('entreprise_id', enterpriseId)

      if (error) throw error

      // Mettre à jour l'interface
      const newColumns = columns.map(col => {
        if (col.id === sourceColumn!.id) {
          return {
            ...col,
            prospects: col.prospects.filter(p => p.id !== draggedCard)
          }
        }
        if (col.id === targetColumnId) {
          return {
            ...col,
            prospects: [...col.prospects, { ...prospect!, statut_pipeline: targetColumnId }]
          }
        }
        return col
      })

      setColumns(newColumns)
    } catch (error) {
      console.error('Error updating prospect:', error)
      alert('Erreur lors de la mise à jour du prospect')
    } finally {
      setDraggedCard(null)
      setSavingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-gray-600">Chargement du pipeline...</p>
      </div>
    )
  }

  const totalProspects = columns.reduce((sum, col) => sum + col.prospects.length, 0)
  const totalValue = columns.reduce((sum, col) => 
    sum + col.prospects.reduce((s, p) => s + (p.valeur_potentielle || 0), 0), 0
  )

  return (
    <div className="p-8 max-w-full mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Pipeline de Vente</h1>
        <p className="text-gray-600">Gérez vos prospects avec drag & drop • {totalProspects} prospects • Valeur totale : {totalValue.toLocaleString()}€</p>
      </div>

      {/* Stats du Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        {columns.map(col => {
          const totalValue = col.prospects.reduce((sum, p) => sum + (p.valeur_potentielle || 0), 0)
          return (
            <Card key={col.id} className="p-4 bg-white border border-gray-200 hover:shadow-md transition-all">
              <div className="text-center">
                <p className="text-2xl mb-2">{col.icon}</p>
                <p className="text-sm font-semibold text-gray-700">{col.titre}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{col.prospects.length}</p>
                <p className="text-xs text-gray-500 mt-1">prospect{col.prospects.length !== 1 ? 's' : ''}</p>
                <p className="text-lg font-bold text-blue-600 mt-3">{totalValue.toLocaleString()}€</p>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Pipeline Kanban */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 pb-8 overflow-x-auto">
        {columns.map(column => (
          <div
            key={column.id}
            className={`${column.couleur} rounded-xl p-4 min-h-[600px] border-2 border-dashed border-gray-300 flex flex-col`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* Header de la colonne */}
            <div className="mb-4 pb-4 border-b-2 border-gray-300">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{column.icon}</span>
                <h2 className="font-bold text-gray-900">{column.titre}</h2>
              </div>
              <p className="text-sm text-gray-600">{column.prospects.length} prospect{column.prospects.length !== 1 ? 's' : ''}</p>
            </div>

            {/* Liste des cartes */}
            <div className="space-y-3 flex-1 overflow-y-auto">
              {column.prospects.map(prospect => (
                <div
                  key={prospect.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, prospect.id)}
                  className={`bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing border-l-4 border-blue-500 ${
                    draggedCard === prospect.id ? 'opacity-50 bg-gray-100' : ''
                  } ${savingId === prospect.id ? 'opacity-75' : ''}`}
                >
                  {/* Grip handle */}
                  <div className="flex items-start gap-2 mb-2">
                    <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                    <h3 className="font-bold text-gray-900 flex-1 text-sm line-clamp-2">{prospect.nom}</h3>
                    {savingId === prospect.id && (
                      <Loader className="w-4 h-4 text-blue-600 animate-spin flex-shrink-0" />
                    )}
                  </div>

                  {/* Valeur */}
                  {prospect.valeur_potentielle && (
                    <div className="flex items-center gap-2 mb-3 pl-6">
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold text-emerald-600">{prospect.valeur_potentielle}€</span>
                    </div>
                  )}

                  {/* Email & Phone */}
                  <div className="space-y-1 text-xs pl-6 mb-3">
                    {prospect.email && (
                      <div className="flex items-center gap-2 text-gray-600 truncate">
                        <Mail className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{prospect.email}</span>
                      </div>
                    )}
                    {prospect.telephone && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-3 h-3 flex-shrink-0" />
                        <span>{prospect.telephone}</span>
                      </div>
                    )}
                  </div>

                  {/* Dernier contact */}
                  {prospect.dernier_contact && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 pl-6 pb-2 border-t pt-2">
                      <Calendar className="w-3 h-3 flex-shrink-0" />
                      <span>{new Date(prospect.dernier_contact).toLocaleDateString('fr-FR')}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 mt-3 pl-6">
                    <Link 
                      href="/dashboard/prospects"
                      className="flex-1 px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-xs font-semibold transition-colors text-center"
                    >
                      Voir tous
                    </Link>
                  </div>
                </div>
              ))}

              {column.prospects.length === 0 && (
                <div className="text-center py-12 flex flex-col items-center justify-center flex-1">
                  <p className="text-gray-500 text-sm">Aucun prospect</p>
                  <p className="text-gray-400 text-xs mt-1">Drag & drop depuis une autre colonne</p>
                </div>
              )}
            </div>

            {/* Bouton Ajouter */}
            <Link 
              href="/dashboard/prospects"
              className="w-full mt-4 px-4 py-2 border-2 border-dashed border-gray-400 hover:border-gray-500 text-gray-700 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Ajouter prospect
            </Link>
          </div>
        ))}
      </div>

      {/* Légende */}
      <Card className="p-6 bg-blue-50 border border-blue-200">
        <h3 className="font-bold text-lg mb-4">📋 Guide des Statuts</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
          {PIPELINE_STATUTS.map(status => (
            <div key={status.id}>
              <p className="font-bold text-gray-900">{status.icon} {status.titre}</p>
              <p className="text-gray-600 mt-1">
                {status.id === 'nouveau' && 'Prospect vient d\'être créé'}
                {status.id === 'qualifie' && 'Prospect a du potentiel'}
                {status.id === 'en_contact' && 'Discussions en cours'}
                {status.id === 'devis_envoye' && 'Devis en attente de réponse'}
                {status.id === 'ferme' && 'Prospect devenu client'}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Tips */}
      <Card className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200">
        <h3 className="font-bold text-lg mb-4">💡 Tips d'Utilisation</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>✅ Cliquez et glissez les cartes pour changer le statut du prospect</li>
          <li>✅ Les changements sont sauvegardés automatiquement en base de données</li>
          <li>✅ Cliquez sur "Voir tous" pour accéder à la liste complète des prospects</li>
          <li>✅ La valeur totale au-dessus se met à jour en temps réel</li>
        </ul>
      </Card>
    </div>
  )
}