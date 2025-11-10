'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase-client'
import { Card } from '@/components/ui/Card'
import { MessageSquare, ChevronDown, StickyNote, Edit2, Send, X } from 'lucide-react'

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
  sujet_email: string
}

export default function RelancesPage() {
  const [prospects, setProspects] = useState<Prospect[]>([])
  const [loading, setLoading] = useState(true)
  const [generatingId, setGeneratingId] = useState<string | null>(null)
  const [sendingId, setSendingId] = useState<string | null>(null)
  const [relances, setRelances] = useState<Record<string, string>>({})
  const [editingMailId, setEditingMailId] = useState<string | null>(null)
  const [editingMailData, setEditingMailData] = useState({
    sujet: '',
    corps: '',
  })
  const [historiqueOpen, setHistoriqueOpen] = useState<string | null>(null)
  const [historique, setHistorique] = useState<Record<string, HistoriqueRelance[]>>({})
  const [entrepriseName, setEntrepriseName] = useState('')
  const [senderEmail, setSenderEmail] = useState('')
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

      // Charger TOUS les prospects
      const { data, error } = await supabase
        .from('prospects')
        .select('*')
        .eq('entreprise_id', user.entreprise_id)
        .order('dernier_contact', { ascending: true })

      if (error) throw error
      setProspects(data || [])

      // Récupérer l'email d'envoi
      setSenderEmail(process.env.NEXT_PUBLIC_SENDER_EMAIL || 'noreply@opus.boutique')

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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copié au presse-papiers!')
  }

  // Générer un message progressif selon le numéro de relance
  const generateRelance = async (prospect: Prospect) => {
    setGeneratingId(prospect.id)

    try {
      const numRelances = historique[prospect.id]?.length || 0
      const numeroRelance = numRelances + 1

      if (numeroRelance > 3) {
        alert('Vous avez déjà envoyé 3 relances à ce prospect')
        setGeneratingId(null)
        return
      }

      const response = await fetch('/api/ai/generate-relance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prospectName: prospect.nom,
          lastContact: prospect.dernier_contact || 'Jamais',
          companyName: entrepriseName,
          prospectEmail: prospect.email || 'N/A',
          numeroRelance: numeroRelance,
        }),
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error)

      // Construire le corps complet du mail (Bonjour + message + fermeture + signature)
      const corpsComplet = `Bonjour ${prospect.nom},

${data.relanceText}

N'hésitez pas à nous contacter si vous avez des questions.

Cordialement,
${entrepriseName}`

      setRelances(prev => ({
        ...prev,
        [prospect.id]: data.relanceText,
      }))
      setEditingMailId(prospect.id)
      setEditingMailData({
        sujet: `Suivi - ${entrepriseName}`,
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

    if (!editingMailData.sujet || !editingMailData.corps) {
      alert('L\'objet et le corps du mail sont requis')
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
          relanceText: editingMailData.corps,
          companyName: entrepriseName,
          sujet: editingMailData.sujet,
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
          texte_relance: editingMailData.corps,
          email_recipient: prospect.email,
          sujet_email: editingMailData.sujet,
          statut: 'envoyé',
        }])

      // Recharger historique
      await loadHistorique(prospect.id, companyId)

      alert('Email envoyé et enregistré avec succès!')
      setRelances(prev => {
        const newRelances = { ...prev }
        delete newRelances[prospect.id]
        return newRelances
      })
      setEditingMailId(null)
      setEditingMailData({ sujet: '', corps: '' })
    } catch (error) {
      console.error('Error sending email:', error)
      alert('Erreur: ' + (error instanceof Error ? error.message : 'Unknown'))
    } finally {
      setSendingId(null)
    }
  }

  const saveNotes = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingNotesId) return

    try {
      const { error } = await supabase
        .from('prospects')
        .update({ notes: formData.notes })
        .eq('id', editingNotesId)

      if (error) throw error

      setProspects(prev =>
        prev.map(p =>
          p.id === editingNotesId ? { ...p, notes: formData.notes } : p
        )
      )

      setEditingNotesId(null)
      setFormData({ notes: '' })
      alert('Notes enregistrées!')
    } catch (error) {
      console.error('Error saving notes:', error)
      alert('Erreur lors de l\'enregistrement')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-gray-600">Chargement...</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Relances</h1>
        <p className="text-gray-600">
          {prospects.length} prospect{prospects.length !== 1 ? 's' : ''} à relancer
        </p>
      </div>

      {/* Formulaire d'édition des notes */}
      {editingNotesId && (
        <Card className="mb-6 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-3xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Modifier les notes</h2>
          <form onSubmit={saveNotes}>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Notes (max 500 caractères)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Ajoutez des notes sur ce prospect..."
                maxLength={500}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-vertical min-h-[120px] font-medium"
              />
              <p className="text-xs text-gray-500 mt-2">{formData.notes.length}/500 caractères</p>
            </div>

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
          <p className="text-gray-800 text-xl font-bold mb-2">Aucun prospect trouvé</p>
          <p className="text-gray-700">Créez des prospects pour commencer à les relancer</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {prospects.map((prospect, index) => {
            const numRelances = historique[prospect.id]?.length || 0
            const isNotesOpen = expandedNotes === prospect.id
            const hasRelance = relances[prospect.id]
            const isEditingMail = editingMailId === prospect.id
            const nextRelanceNumber = numRelances + 1

            return (
              <div key={prospect.id}>
                {/* Prospect Card */}
                <Card className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-6">
                    {/* Infos principales */}
                    <div className="flex-1">
                      <div className="flex items-baseline gap-3 mb-3 flex-wrap">
                        <h3 className="text-2xl font-bold text-gray-900">{prospect.nom}</h3>
                        <span className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold">
                          {prospect.statut_pipeline}
                        </span>
                        {numRelances > 0 && (
                          <span className="text-xs px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-semibold">
                            {numRelances} relance{numRelances > 1 ? 's' : ''} envoyée{numRelances > 1 ? 's' : ''}
                          </span>
                        )}
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

                        {prospect.notes && (
                          <button
                            onClick={() => setExpandedNotes(isNotesOpen ? null : prospect.id)}
                            className="flex items-center gap-2 text-amber-700 text-sm font-semibold hover:text-amber-800 transition-colors mt-2"
                          >
                            <StickyNote className="w-4 h-4 flex-shrink-0" />
                            <span>Notes</span>
                            <ChevronDown className={`w-4 h-4 transition-transform ${isNotesOpen ? 'rotate-180' : ''}`} />
                          </button>
                        )}

                        {isNotesOpen && prospect.notes && (
                          <div className="mt-3 p-3 bg-amber-50 rounded border-l-4 border-amber-400">
                            <p className="text-gray-800 text-sm whitespace-pre-wrap">{prospect.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto sm:flex-col-reverse">
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
                            {generatingId === prospect.id ? '⏳ Gen...' : `✨ Relance ${nextRelanceNumber}`}
                          </button>
                        )
                      ) : null}
                    </div>
                  </div>
                </Card>

                {/* Formulaire d'édition du mail complet */}
                {isEditingMail && hasRelance && (
                  <Card className="mt-2 bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-xl p-6 shadow-md">
                    <div className="flex items-center gap-2 mb-4">
                      <Edit2 className="w-5 h-5 text-amber-600" />
                      <h3 className="text-lg font-bold text-amber-900">
                        Éditer Relance #{nextRelanceNumber} - {prospect.nom}
                      </h3>
                    </div>

                    <div className="space-y-4">
                      {/* Objet du mail */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Objet du mail
                        </label>
                        <input
                          type="text"
                          value={editingMailData.sujet}
                          onChange={(e) => setEditingMailData(prev => ({ ...prev, sujet: e.target.value }))}
                          className="w-full px-4 py-3 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white font-medium"
                          placeholder="Ex: Suivi - Opus"
                        />
                        <p className="text-xs text-gray-500 mt-1">{editingMailData.sujet.length} caractères</p>
                      </div>

                      {/* Corps du mail */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Corps du mail (complet)
                        </label>
                        <textarea
                          value={editingMailData.corps}
                          onChange={(e) => setEditingMailData(prev => ({ ...prev, corps: e.target.value }))}
                          className="w-full px-4 py-3 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 resize-vertical min-h-[200px] font-medium bg-white"
                          placeholder="Entrez le texte complet du mail..."
                        />
                        <p className="text-xs text-gray-500 mt-1">{editingMailData.corps.length} caractères</p>
                      </div>

                      {/* Prévisualisation du mail */}
                      <div className="bg-white border-2 border-amber-200 rounded-lg p-4 max-h-80 overflow-y-auto shadow-sm">
                        <p className="text-xs font-bold text-amber-900 mb-3">📧 Aperçu du mail :</p>
                        <div className="bg-gray-50 p-4 rounded text-sm space-y-2 text-gray-800 border border-gray-300">
                          <p className="font-semibold text-gray-600">De : {senderEmail}</p>
                          <p className="font-semibold text-gray-600">À : {prospect.email}</p>
                          <p className="font-semibold text-gray-600">Objet : {editingMailData.sujet}</p>
                          <hr className="my-3 border-gray-300" />
                          <div className="whitespace-pre-wrap leading-relaxed text-gray-700">
                            {editingMailData.corps}
                          </div>
                        </div>
                      </div>

                      {/* Boutons */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => sendEmailRelance(prospect)}
                          disabled={sendingId === prospect.id}
                          className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          <Send className="w-4 h-4" />
                          {sendingId === prospect.id ? 'Envoi...' : 'Envoyer'}
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

                {/* Historique des relances - Dropdown */}
                {numRelances > 0 && (
                  <div className="mt-2 bg-white border border-gray-200 rounded-xl p-4 cursor-pointer hover:shadow-md transition-all"
                    onClick={() => setHistoriqueOpen(historiqueOpen === prospect.id ? null : prospect.id)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">📬</span>
                        <span className="font-bold text-gray-700">
                          Historique ({numRelances})
                        </span>
                      </div>
                      <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${historiqueOpen === prospect.id ? 'rotate-180' : ''}`} />
                    </div>

                    {/* Historique ouvert */}
                    {historiqueOpen === prospect.id && (
                      <div className="mt-4 space-y-3 border-t border-gray-200 pt-4">
                        {historique[prospect.id]?.map((relance) => (
                          <div key={relance.id} className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-400">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-bold text-gray-800 flex items-center gap-2">
                                <span className="text-xl">#{relance.numero_relance}</span>
                                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded font-semibold">Relance {relance.numero_relance}</span>
                              </p>
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
                            
                            <p className="text-xs text-gray-600 mb-2">
                              <span className="font-semibold">À :</span> {relance.email_recipient}
                            </p>
                            
                            <p className="text-xs text-gray-600 mb-3">
                              <span className="font-semibold">Objet :</span> {relance.sujet_email}
                            </p>

                            <div className="bg-white p-3 rounded border border-gray-300 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
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