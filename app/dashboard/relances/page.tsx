'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

interface Prospect {
  id: string
  nom: string
  email?: string
  dernier_contact?: string
  valeur_potentielle?: number
  statut_pipeline: string
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
  }

  const loadHistorique = async (prospectId: string, companyId: string) => {
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
  }

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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copié!')
  }

  if (loading) return <p className="p-6">Chargement...</p>

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Relances Automatiques (IA)</h1>

      {prospects.length === 0 ? (
        <Card>
          <p className="text-gray-600">Aucun prospect à relancer pour le moment.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          <p className="text-gray-600">
            {prospects.length} prospect(s) à relancer
          </p>

          {prospects.map(prospect => {
            const numRelances = historique[prospect.id]?.length || 0

            return (
              <Card key={prospect.id}>
                <div className="mb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">{prospect.nom}</h3>
                      <p className="text-gray-600">{prospect.email}</p>
                      {prospect.valeur_potentielle && (
                        <p className="text-green-600">{prospect.valeur_potentielle}€</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">{numRelances} relance(s)</p>
                      {numRelances > 0 && (
                        <button
                          onClick={() => setHistoriqueOpen(historiqueOpen === prospect.id ? null : prospect.id)}
                          className="text-blue-600 text-sm underline"
                        >
                          {historiqueOpen === prospect.id ? 'Masquer' : 'Voir historique'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {historiqueOpen === prospect.id && historique[prospect.id] && (
                  <div className="bg-gray-50 p-3 rounded mb-4 border-l-4 border-gray-300">
                    <h4 className="font-bold text-sm mb-3">Historique des relances:</h4>
                    <div className="space-y-3 max-h-48 overflow-y-auto">
                      {historique[prospect.id].map((relance) => (
                        <div key={relance.id} className="border-l-2 border-gray-300 pl-3 pb-2">
                          <p className="text-sm font-semibold text-gray-700">
                            Relance #{relance.numero_relance} - {new Date(relance.date_envoi).toLocaleDateString('fr-FR')}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">{relance.texte_relance}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {relances[prospect.id] ? (
                  <div>
                    <div className="bg-yellow-50 p-4 rounded mb-3 border-l-4 border-yellow-500">
                      <p className="text-sm font-semibold text-yellow-900 mb-2">Aperçu du mail:</p>
                      <div className="text-sm text-gray-800 space-y-2">
                        <p><strong>Envoyé à:</strong> {prospect.email}</p>
                        <p><strong>Objet:</strong> Suivi - {entrepriseName}</p>
                        <div className="bg-white p-2 rounded border border-yellow-200 mt-2">
                          <p className="text-xs text-gray-500 mb-2">--- CORPS DU MAIL ---</p>
                          <p>Bonjour {prospect.nom},</p>
                          <p className="my-2">{relances[prospect.id]}</p>
                          <p>N&apos;hésitez pas à nous contacter si vous avez des questions.</p>
                          <p className="mt-2">Cordialement,<br/><strong>{entrepriseName}</strong></p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        onClick={() => copyToClipboard(relances[prospect.id])}
                        variant="primary"
                      >
                        Copier Message
                      </Button>
                      <Button
                        onClick={() => sendEmailRelance(prospect, relances[prospect.id])}
                        disabled={sendingId === prospect.id}
                        variant="primary"
                      >
                        {sendingId === prospect.id ? 'Envoi...' : 'Envoyer Email'}
                      </Button>
                      <Button
                        onClick={() => setRelances(prev => {
                          const newRelances = { ...prev }
                          delete newRelances[prospect.id]
                          return newRelances
                        })}
                        variant="secondary"
                      >
                        Annuler
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={() => generateRelance(prospect)}
                    disabled={generatingId === prospect.id}
                    variant="primary"
                  >
                    {generatingId === prospect.id ? 'Génération...' : 'Générer Relance (IA)'}
                  </Button>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}