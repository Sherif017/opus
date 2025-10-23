'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { MessageSquare, ChevronDown, StickyNote } from 'lucide-react'

interface Prospect {
  id: string
  nom: string
  email?: string
  dernier_contact?: string
  valeur_potentielle?: number
  statut_pipeline: string
  notes?: string
}

interface HistoriqueRelance {
  id: string
  numero_relance: number
  texte_relance: string
  date_envoi: string
  email_recipient: string
}

export default function RelancesPage() {
  const [prospects, setProspects] = useState<Prospect[]>([])
  const [loading, setLoading] = useState(true)
  const [generatingId, setGeneratingId] = useState<string | null>(null)
  const [sendingId, setSendingId] = useState<string | null>(null)
  const [relances, setRelances] = useState<Record<string, string>>({})
  const [historiqueOpen, setHistoriqueOpen] = useState<string | null>(null)
  const [historique, setHistorique] = useState<Record<string, HistoriqueRelance[]>>({})
  const [entrepriseName, setEntrepriseName] = useState('')
  const [companyId, setCompanyId] = useState<string>('')
  const [expandedNotes, setExpandedNotes] = useState<string | null>(null)
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    notes: '',
  })

  const loadHistorique = useCallback(async (prospectId: string, companyId: string) => {
    try {
      const { data } = await supabase
        .from('relances_historique')
        .select('*')
        .eq('prospect_id', prospectId)
        .eq('entreprise_id', companyId)
        .order('date_envoi', { ascending: false })

      setHistorique(prev => ({
        ...prev,
        [prospectId]: data || [],
      }))
    } catch (error) {
      console.error('Error loading historique:', error)
    }
  }, [])

  const init = useCallback(async () => {
    try {
      const { data: user, error: userError } = await supabase
        .from('utilisateurs')
        .select('entreprise_id')
        .limit(1)
        .single()

      if (userError) throw userError
      if (!user) throw new Error('Utilisateur non trouvé')

      setCompanyId(user.entreprise_id)

      const { data: company } = await supabase
        .from('entreprises')
        .select('nom')
        .eq('id', user.entreprise_id)
        .single()

      if (company) setEntrepriseName(company.nom)

      const { data, error } = await supabase
        .from('prospects')
        .select('*')
        .eq('entreprise_id', user.entreprise_id)
        .eq('statut_pipeline', 'nouveau')
        .order('dernier_contact', { ascending: true })

      if (error) throw error
      setProspects(data || [])

      // Charger historique pour tous les prospects
      if (data) {
        for (const prospect of data) {
          loadHistorique(prospect.id, user.entreprise_id)
        }
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }, [loadHistorique])

  useEffect(() => {
    init()
  }, [init])

  const generateRelance = async (prospect: Prospect) => {
    setGeneratingId(prospect.id)

    try {
      const response = await fetch('/api/ai/generate-relance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prospectName: prospect.nom,
          lastContact: prospect.dernier_contact || 'Jamais',
          companyName: entrepriseName,
          prospectEmail: prospect.email || 'N/A',
        }),
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error)

      setRelances(prev => ({
        ...prev,
        [prospect.id]: data.relanceText,
      }))
    } catch (error) {
      console.error('Error generating relance:', error)
      alert('Erreur: ' + (error instanceof Error ? error.message : 'Unknown'))
    } finally {
      setGeneratingId(null)
    }
  }

  const sendEmailRelance = async (prospect: Prospect, relanceText: string) => {
    if (!prospect.email) {
      alert('Email du prospect manquant')
      return
    }

    setSendingId(prospect.id)

    try {
      const response = await fetch('/api/emails/send-relance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prospectEmail: prospect.email,
          prospectName: prospect.nom,
          relanceText: relanceText,
          companyName: entrepriseName,
        }),
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error)

      // Enregistrer dans l'historique
      const numeroRelance = (historique[prospect.id]?.length || 0) + 1

      await supabase
        .from('relances_historique')
        .insert([{
          entreprise_id: companyId,
          prospect_id: prospect.id,
          numero_relance: numeroRelance,
          texte_relance: relanceText,
          email_recipient: prospect.email,
          statut: 'envoyé',
        }])

      // Recharger historique
      await loadHistorique(prospect.id, companyId)

      alert('Email envoyé et enregistré!')
      setRelances(prev => {
        const newRelances = { ...prev }
        delete newRelances[prospect.id]
        return newRelances
      })
    } catch (error) {
      console.error('Error sending email:', error)
      alert('Erreur: ' + (error instanceof Error ? error.message : 'Unknown'))
    } finally {
      setSendingId(null)
    }
  }

  const handleSaveNotes = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const { error } = await supabase
        .from('prospects')
        .update({
          notes: formData.notes || null,
        })
        .eq('id', editingNotesId)

      if (error) throw error

      setProspects(prospects.map(p => p.id === editingNotesId ? {
        ...p,
        notes: formData.notes || undefined,
      } : p))

      setEditingNotesId(null)
      setFormData({ notes: '' })
    } catch (error) {
      console.error('Error:', error)
      alert('Erreur: ' + (error instanceof Error ? error.message : 'Unknown'))
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Texte copié !')
  }

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full bg-blue-100 mx-auto mb-4 flex items-center justify-center">
          <MessageSquare className="w-6 h-6 text-blue-600" />
        </div>
        <p className="text-gray-700 font-semibold">Chargement des relances...</p>
      </div>
    </div>
  )

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-2">Relances</h1>
        <p className="text-lg text-gray-600">{prospects.length} prospect{prospects.length > 1 ? 's' : ''} à relancer</p>
      </div>

      {/* Formulaire modification notes */}
      {editingNotesId && (
        <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-3xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-1">
            Modifier les notes
          </h2>
          <p className="text-gray-600 text-sm mb-8">Prospect sélectionné</p>
          
          <form onSubmit={handleSaveNotes} className="space-y-6">
            {/* Notes */}
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <label className="block text-sm font-bold text-gray-700 mb-2">📝 Notes</label>
              <textarea
                value={formData.notes}
                maxLength={500}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Ajoutez des notes sur ce prospect..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-vertical min-h-[120px] font-medium"
              />
              <p className="text-xs text-gray-500 mt-2">{formData.notes.length}/500 caractères</p>
            </div>

            {/* Boutons */}
            <div className="flex gap-3 pt-6">
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl"
              >
                Enregistrer
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingNotesId(null)
                  setFormData({ notes: '' })
                }}
                className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-xl font-bold transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Liste des prospects */}
      {prospects.length === 0 ? (
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-3xl p-16 text-center shadow-lg">
          <div className="w-20 h-20 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageSquare className="w-10 h-10 text-blue-600" />
          </div>
          <p className="text-gray-800 text-xl font-bold mb-2">Aucun prospect à relancer</p>
          <p className="text-gray-700">Tous vos prospects ont été contactés ou sont en phase avancée du pipeline</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {prospects.map((prospect, index) => {
            const numRelances = historique[prospect.id]?.length || 0
            const isNotesOpen = expandedNotes === prospect.id
            const hasRelance = relances[prospect.id]

            return (
              <Card key={prospect.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-6">
                  {/* Infos principales */}
                  <div className="flex-1">
                    <div className="flex items-baseline gap-3 mb-4">
                      <h3 className="text-2xl font-bold text-gray-900">Prospect {index + 1}</h3>
                      <p className="text-lg text-gray-700 font-semibold">{prospect.nom}</p>
                    </div>

                    <div className="space-y-2 text-sm">
                      <p className="text-gray-600">
                        <span className="font-semibold">Email :</span> {prospect.email || 'Non renseigné'}
                      </p>
                      
                      {prospect.valeur_potentielle && (
                        <p className="text-gray-600">
                          <span className="font-semibold">Valeur :</span> <span className="font-bold text-emerald-600">{prospect.valeur_potentielle}€</span>
                        </p>
                      )}

                      <p className="text-gray-600">
                        <span className="font-semibold">Relances envoyées :</span> <span className="font-bold">{numRelances}</span>
                      </p>

                      {prospect.notes && (
                        <button
                          onClick={() => setExpandedNotes(isNotesOpen ? null : prospect.id)}
                          className="flex items-center gap-2 text-amber-700 text-sm font-semibold hover:text-amber-800 transition-colors mt-2"
                        >
                          <StickyNote className="w-4 h-4 flex-shrink-0" />
                          <span>Notes ({prospect.notes.length} caractères)</span>
                          <ChevronDown className={`w-4 h-4 transition-transform ${isNotesOpen ? 'rotate-180' : ''}`} />
                        </button>
                      )}

                      {isNotesOpen && prospect.notes && (
                        <div className="mt-3 p-3 bg-amber-50 rounded border-l-4 border-amber-400">
                          <p className="text-gray-800 text-sm whitespace-pre-wrap">{prospect.notes}</p>
                        </div>
                      )}

                      {numRelances > 0 && (
                        <button
                          onClick={() => setHistoriqueOpen(historiqueOpen === prospect.id ? null : prospect.id)}
                          className="text-blue-600 text-sm font-semibold hover:text-blue-700 transition-colors"
                        >
                          {historiqueOpen === prospect.id ? 'Masquer historique' : 'Voir historique'}
                        </button>
                      )}
                    </div>

                    {/* Historique des relances */}
                    {historiqueOpen === prospect.id && historique[prospect.id]?.length > 0 && (
                      <div className="mt-4 p-4 bg-gray-50 rounded border-l-4 border-gray-300 space-y-3 max-h-48 overflow-y-auto">
                        {historique[prospect.id].map((relance) => (
                          <div key={relance.id} className="border-l-2 border-gray-300 pl-3">
                            <p className="text-sm font-semibold text-gray-700">
                              Relance #{relance.numero_relance} - {new Date(relance.date_envoi).toLocaleDateString('fr-FR')}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">{relance.texte_relance}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 w-full sm:w-auto sm:flex-col-reverse">
                    <button
                      onClick={() => {
                        setFormData({ notes: prospect.notes || '' })
                        setEditingNotesId(prospect.id)
                      }}
                      className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded font-semibold text-sm transition-colors"
                    >
                      Modifier
                    </button>

                    {hasRelance ? (
                      <>
                        <button
                          onClick={() => copyToClipboard(relances[prospect.id])}
                          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-semibold text-sm transition-colors"
                        >
                          Copier
                        </button>
                        <button
                          onClick={() => sendEmailRelance(prospect, relances[prospect.id])}
                          disabled={sendingId === prospect.id}
                          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-semibold text-sm transition-colors disabled:opacity-50"
                        >
                          {sendingId === prospect.id ? 'Envoi...' : 'Envoyer'}
                        </button>
                        <button
                          onClick={() => setRelances(prev => {
                            const newRelances = { ...prev }
                            delete newRelances[prospect.id]
                            return newRelances
                          })}
                          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-semibold text-sm transition-colors"
                        >
                          Annuler
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => generateRelance(prospect)}
                        disabled={generatingId === prospect.id}
                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-semibold text-sm transition-colors disabled:opacity-50"
                      >
                        {generatingId === prospect.id ? 'Génération...' : 'Générer'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Aperçu du mail généré */}
                {hasRelance && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="bg-amber-50 p-4 rounded border-l-4 border-amber-400">
                      <p className="text-sm font-bold text-amber-900 mb-3">Aperçu du mail :</p>
                      <div className="text-sm text-gray-800 space-y-2">
                        <p><span className="font-semibold">À :</span> {prospect.email}</p>
                        <p><span className="font-semibold">Objet :</span> Suivi - {entrepriseName}</p>
                        <div className="bg-white p-3 rounded border border-amber-200 mt-2">
                          <p className="text-xs text-gray-500 mb-2">--- CORPS DU MAIL ---</p>
                          <p>Bonjour {prospect.nom},</p>
                          <p className="my-2">{relances[prospect.id]}</p>
                          <p>N&apos;hésitez pas à nous contacter si vous avez des questions.</p>
                          <p className="mt-2">Cordialement,<br/><span className="font-semibold">{entrepriseName}</span></p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}