'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase-client'
import { Card } from '@/components/ui/Card'
import { MessageSquare, ChevronDown, StickyNote, Edit2, Send, X, AlertCircle, CheckCircle, Clock } from 'lucide-react'

interface Prospect {
  id: string
  nom: string
  email?: string
  dernier_contact?: string
  valeur_potentielle?: number
  statut_pipeline: string
  notes?: string
  relances_historique?: HistoriqueRelance[]
}

interface HistoriqueRelance {
  id: string
  numero_relance: number
  texte_relance: string
  date_envoi: string
  email_recipient: string
}

export default function RelancesPageAdvanced() {
  const [prospects, setProspects] = useState<Prospect[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [generatingId, setGeneratingId] = useState<string | null>(null)
  const [sendingId, setSendingId] = useState<string | null>(null)
  const [relances, setRelances] = useState<Record<string, string>>({})
  const [editingMailId, setEditingMailId] = useState<string | null>(null)
  const [editingMailData, setEditingMailData] = useState({
    sujet: '',
    corps: '',
  })
  const [historiqueOpen, setHistoriqueOpen] = useState<string | null>(null)
  const [entrepriseName, setEntrepriseName] = useState('')
  const [senderEmail, setSenderEmail] = useState('')
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    notes: '',
  })

  const init = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setError('❌ Vous n\'êtes pas connecté')
        setLoading(false)
        return
      }

      const response = await fetch('/api/dashboard/relances', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('API Error:', errorData)
        setError(`❌ Erreur: ${errorData.error || `Statut ${response.status}`}`)
        setLoading(false)
        return
      }

      const { prospects: prospectsData, companyName } = await response.json()
      setProspects(prospectsData || [])
      setEntrepriseName(companyName)
      setSenderEmail(process.env.NEXT_PUBLIC_SENDER_EMAIL || 'noreply@opus.boutique')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue'
      console.error('Error loading data:', error)
      setError(`❌ ${message}`)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    init()
  }, [init])

  // Calculer le contexte du prospect pour l'IA
  const getProspectContext = (prospect: Prospect) => {
    const jours_depuis_contact = prospect.dernier_contact
      ? Math.floor((Date.now() - new Date(prospect.dernier_contact).getTime()) / (1000 * 60 * 60 * 24))
      : null

    return {
      valeur_potentielle: prospect.valeur_potentielle,
      statut_pipeline: prospect.statut_pipeline,
      notes: prospect.notes,
      jours_depuis_contact: jours_depuis_contact,
    }
  }

  const generateRelance = async (prospect: Prospect) => {
    setGeneratingId(prospect.id)

    try {
      const numRelances = prospect.relances_historique?.length || 0
      const numeroRelance = numRelances + 1

      if (numeroRelance > 3) {
        alert('Vous avez déjà envoyé 3 relances à ce prospect')
        setGeneratingId(null)
        return
      }

      const context = getProspectContext(prospect)

      console.log(`📧 Generating relance ${numeroRelance}/3 with context:`, context)

      const response = await fetch('/api/ai/generate-relance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prospectName: prospect.nom,
          lastContact: prospect.dernier_contact || 'Jamais',
          companyName: entrepriseName,
          prospectEmail: prospect.email || 'N/A',
          numeroRelance: numeroRelance,
          prospectContext: context,
        }),
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error)

      // Construire le sujet adapté au numéro de relance
      const sujets = {
        1: `${entrepriseName} - Vous m'aviez intéressé`,
        2: `${entrepriseName} - Quelques nouvelles fonctionnalités`,
        3: `${entrepriseName} - Une dernière chose avant de vous laisser`,
      }

      const corpsComplet = `Bonjour ${prospect.nom},

${data.relanceText}

Cordialement,
L'équipe ${entrepriseName}`

      setRelances(prev => ({
        ...prev,
        [prospect.id]: data.relanceText,
      }))
      setEditingMailId(prospect.id)
      setEditingMailData({
        sujet: sujets[numeroRelance as keyof typeof sujets] || `Suivi - ${entrepriseName}`,
        corps: corpsComplet,
      })
    } catch (error) {
      console.error('Error generating relance:', error)
      alert('Erreur: ' + (error instanceof Error ? error.message : 'Unknown'))
    } finally {
      setGeneratingId(null)
    }
  }

  const sendEmailRelance = async (prospect: Prospect) => {
    if (!prospect.email) {
      alert('Email du prospect manquant')
      return
    }

    setSendingId(prospect.id)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const numRelances = prospect.relances_historique?.length || 0
      const numeroRelance = numRelances + 1

      const response = await fetch('/api/emails/send-relance', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prospectEmail: prospect.email,
          prospectName: prospect.nom,
          relanceText: editingMailData.corps,
          companyName: entrepriseName,
          sujet: editingMailData.sujet,
          numeroRelance: numeroRelance,
          prospectId: prospect.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'envoi')
      }

      alert('✅ Relance envoyée avec succès!')
      setEditingMailId(null)
      setEditingMailData({ sujet: '', corps: '' })
      setRelances(prev => {
        const newRelances = { ...prev }
        delete newRelances[prospect.id]
        return newRelances
      })

      // Rafraîchir les données
      await init()
    } catch (error) {
      console.error('Error sending relance:', error)
      alert('Erreur lors de l\'envoi: ' + (error instanceof Error ? error.message : 'Unknown'))
    } finally {
      setSendingId(null)
    }
  }

  const handleUpdateNotes = async (prospect: Prospect) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const response = await fetch(`/api/dashboard/prospects/${prospect.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes: formData.notes }),
      })

      if (!response.ok) throw new Error('Erreur mise à jour')

      const { data: updatedProspect } = await response.json()
      setProspects(prospects.map(p => p.id === prospect.id ? updatedProspect : p))
      setEditingNotesId(null)
      alert('✅ Notes mises à jour!')
    } catch (error) {
      console.error('Error updating notes:', error)
      alert('Erreur: ' + (error instanceof Error ? error.message : 'Unknown'))
    }
  }

  // Composant pour afficher le statut des relances
  const RelanceStatus = ({ prospect }: { prospect: Prospect }) => {
    const numRelances = prospect.relances_historique?.length || 0
    const nextRelance = numRelances + 1

    if (numRelances === 0) {
      return (
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
          <Clock className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-semibold text-blue-700">Aucune relance</span>
        </div>
      )
    } else if (numRelances < 3) {
      return (
        <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          <span className="text-sm font-semibold text-amber-700">{numRelances}/3 relances</span>
        </div>
      )
    } else {
      return (
        <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
          <CheckCircle className="w-4 h-4 text-red-600" />
          <span className="text-sm font-semibold text-red-700">3/3 relances (max atteint)</span>
        </div>
      )
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des prospects...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="p-4 bg-red-50 border border-red-200">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => init()}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
          >
            Réessayer
          </button>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Relances IA</h1>
        <p className="text-gray-600 mt-2">Gérez vos relances intelligentes auprès des prospects</p>
      </div>

      {prospects.length === 0 ? (
        <Card className="p-12 text-center">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-semibold">Aucun prospect</p>
          <p className="text-gray-400 text-sm mt-2">Créez des prospects pour gérer les relances</p>
        </Card>
      ) : (
        <div className="grid gap-6">
          {prospects.map((prospect) => {
            const hasRelance = relances[prospect.id]
            const isEditingMail = editingMailId === prospect.id
            const numRelances = prospect.relances_historique?.length || 0
            const nextRelanceNumber = numRelances + 1
            const isNotesOpen = editingNotesId === prospect.id

            return (
              <div key={prospect.id}>
                <Card className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between gap-4 flex-col sm:flex-row">
                    <div className="flex-1 w-full">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{prospect.nom}</h3>
                        <RelanceStatus prospect={prospect} />
                      </div>
                      
                      <p className="text-sm text-gray-600 mt-1">{prospect.email || 'Email non disponible'}</p>

                      {prospect.dernier_contact && (
                        <p className="text-xs text-gray-500 mt-2">
                          Dernier contact : {new Date(prospect.dernier_contact).toLocaleDateString('fr-FR')}
                        </p>
                      )}

                      {prospect.valeur_potentielle && (
                        <p className="text-sm font-semibold text-green-600 mt-2">
                          Valeur potentielle: {prospect.valeur_potentielle.toLocaleString()}€
                        </p>
                      )}

                      {/* Notes Section */}
                      <div className="mt-4">
                        {isNotesOpen ? (
                          <div className="space-y-3">
                            <textarea
                              value={formData.notes}
                              onChange={(e) => setFormData({ notes: e.target.value })}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical min-h-[100px]"
                              placeholder="Ajouter une note..."
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleUpdateNotes(prospect)}
                                className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm"
                              >
                                Enregistrer
                              </button>
                              <button
                                onClick={() => setEditingNotesId(null)}
                                className="flex-1 px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-semibold text-sm"
                              >
                                Annuler
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {prospect.notes && (
                              <div className="p-3 bg-amber-50 rounded border-l-4 border-amber-400">
                                <p className="text-gray-800 text-sm whitespace-pre-wrap">{prospect.notes}</p>
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 w-full sm:w-auto sm:flex-col-reverse mt-4">
                        <button
                          onClick={() => {
                            setFormData({ notes: prospect.notes || '' })
                            setEditingNotesId(prospect.id)
                          }}
                          className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-semibold text-sm transition-colors"
                        >
                          📝 Notes
                        </button>

                        {!isEditingMail && !hasRelance ? (
                          numRelances >= 3 ? (
                            <button disabled className="px-4 py-2 bg-gray-100 text-gray-400 rounded-lg font-semibold text-sm cursor-not-allowed">
                              ✓ 3 relances max
                            </button>
                          ) : (
                            <button
                              onClick={() => generateRelance(prospect)}
                              disabled={generatingId === prospect.id}
                              className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-semibold text-sm transition-colors disabled:opacity-50"
                            >
                              {generatingId === prospect.id ? '⏳ Génération...' : `✨ Relance ${nextRelanceNumber}/3`}
                            </button>
                          )
                        ) : null}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Formulaire d'édition du mail */}
                {isEditingMail && hasRelance && (
                  <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-xl p-6 shadow-md mt-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Edit2 className="w-5 h-5 text-amber-600" />
                      <h3 className="text-lg font-bold text-amber-900">
                        Relance #{nextRelanceNumber} - {prospect.nom}
                      </h3>
                      <span className="ml-auto text-sm px-3 py-1 bg-amber-200 text-amber-900 rounded-full font-semibold">
                        {nextRelanceNumber === 1 ? '🤝 Doux' : nextRelanceNumber === 2 ? '⚡ Progressif' : '🎯 Final'}
                      </span>
                    </div>

                    <div className="space-y-4">
                      {/* Objet */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Objet du mail
                        </label>
                        <input
                          type="text"
                          value={editingMailData.sujet}
                          onChange={(e) => setEditingMailData(prev => ({ ...prev, sujet: e.target.value }))}
                          className="w-full px-4 py-3 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                          placeholder="Objet du mail"
                        />
                      </div>

                      {/* Corps */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Corps du mail
                        </label>
                        <textarea
                          value={editingMailData.corps}
                          onChange={(e) => setEditingMailData(prev => ({ ...prev, corps: e.target.value }))}
                          className="w-full px-4 py-3 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 resize-vertical min-h-[250px] bg-white"
                        />
                      </div>

                      {/* Aperçu */}
                      <div className="bg-white border-2 border-amber-200 rounded-lg p-4 max-h-80 overflow-y-auto">
                        <p className="text-xs font-bold text-amber-900 mb-3">📧 Aperçu :</p>
                        <div className="bg-gray-50 p-4 rounded text-sm text-gray-800 space-y-2 border border-gray-300">
                          <p className="font-semibold text-gray-600">De : {senderEmail}</p>
                          <p className="font-semibold text-gray-600">À : {prospect.email}</p>
                          <p className="font-semibold text-gray-600">Objet : {editingMailData.sujet}</p>
                          <hr className="my-3" />
                          <div className="whitespace-pre-wrap">{editingMailData.corps}</div>
                        </div>
                      </div>

                      {/* Boutons */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => sendEmailRelance(prospect)}
                          disabled={sendingId === prospect.id}
                          className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          <Send className="w-4 h-4" />
                          {sendingId === prospect.id ? 'Envoi...' : `Envoyer Relance ${nextRelanceNumber}`}
                        </button>
                        <button
                          onClick={() => {
                            setEditingMailId(null)
                            setEditingMailData({ sujet: '', corps: '' })
                            setRelances(prev => {
                              const newRelances = { ...prev }
                              delete newRelances[prospect.id]
                              return newRelances
                            })
                          }}
                          className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          Annuler
                        </button>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Historique */}
                {numRelances > 0 && (
                  <div className="bg-white border border-gray-200 rounded-xl p-4 cursor-pointer hover:shadow-md transition-all mt-4"
                    onClick={() => setHistoriqueOpen(historiqueOpen === prospect.id ? null : prospect.id)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">📬</span>
                        <span className="font-bold text-gray-700">
                          Historique des relances ({numRelances})
                        </span>
                      </div>
                      <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${historiqueOpen === prospect.id ? 'rotate-180' : ''}`} />
                    </div>

                    {historiqueOpen === prospect.id && (
                      <div className="mt-4 space-y-3 border-t border-gray-200 pt-4">
                        {prospect.relances_historique?.map((relance) => (
                          <div key={relance.id} className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-400">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-800 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                                  Relance #{relance.numero_relance}
                                </span>
                                {relance.numero_relance === 1 && <span className="text-xs text-gray-500">🤝 Doux</span>}
                                {relance.numero_relance === 2 && <span className="text-xs text-gray-500">⚡ Progressif</span>}
                                {relance.numero_relance === 3 && <span className="text-xs text-gray-500">🎯 Final</span>}
                              </div>
                              <p className="text-xs text-gray-500">
                                {new Date(relance.date_envoi).toLocaleDateString('fr-FR', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                            <p className="text-xs text-gray-600 mb-2">À : {relance.email_recipient}</p>
                            <div className="bg-white p-3 rounded border border-gray-300 text-sm text-gray-700 whitespace-pre-wrap max-h-40 overflow-y-auto">
                              {relance.texte_relance}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}