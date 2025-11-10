'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import { Card } from '@/components/ui/Card'
import { FileText, Download, Mail, Edit2, Trash2, Send, CheckCircle } from 'lucide-react'
import Link from 'next/link'

interface Client {
  id: string
  nom: string
  email?: string
}

interface Facture {
  id: string
  numero_facture: string
  client_id: string
  statut: string
  montant_total_ht?: number
  montant_tva?: number
  montant_total_ttc?: number
  montant_paye?: number
  date_creation: string
  date_echeance?: string
  date_paiement?: string
  clients?: Client
}

export default function FacturesPage() {
  const [factures, setFactures] = useState<Facture[]>([])
  const [loading, setLoading] = useState(true)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [sendingId, setSendingId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    init()
    
    // Auto-refresh toutes les 10 secondes EN ARRIÈRE-PLAN
    const interval = setInterval(() => {
      refreshFacturesInBackground()
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  const init = async () => {
    try {
      setLoading(true)
      await refreshFactures()
    } catch (error) {
      console.error('Error in init:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshFactures = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError || !session?.access_token) {
        console.error('No session found:', sessionError)
        return
      }

      const response = await fetch('/api/factures/list', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('API Error:', error)
        return
      }

      const data = await response.json()
      setFactures(data.factures || [])
    } catch (error) {
      console.error('Error refreshing factures:', error)
    }
  }

  const refreshFacturesInBackground = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return

      const response = await fetch('/api/factures/list', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setFactures(data.factures || [])
      }
    } catch (error) {
      console.error('Error refreshing:', error)
    }
  }

  const getStatutColor = (statut: string) => {
    const colors: Record<string, string> = {
      brouillon: 'bg-gray-100 text-gray-700 border border-gray-200',
      envoyée: 'bg-blue-100 text-blue-700 border border-blue-200',
      payée: 'bg-green-100 text-green-700 border border-green-200',
      impayée: 'bg-red-100 text-red-700 border border-red-200',
      annulée: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
    }
    return colors[statut] || 'bg-gray-100 text-gray-700'
  }

  const isEnvoyee = (statut: string) => {
    return statut !== 'brouillon'
  }

  const isPayee = (statut: string) => {
    return statut === 'payée'
  }

  const handleDownloadPDF = async (e: React.MouseEvent, facture: Facture) => {
    e.preventDefault()
    setDownloadingId(facture.id)

    try {
      const response = await fetch('/api/generate-invoice-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          factureData: facture,
          lignes: [],
          clientData: { nom: facture.clients?.nom },
          entrepriseData: { nom: 'OPUS' },
        }),
      })

      if (!response.ok) throw new Error('Erreur génération PDF')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `facture-${facture.numero_facture}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error:', error)
      alert('Erreur lors du téléchargement')
    } finally {
      setDownloadingId(null)
    }
  }

  const handleSendEmail = async (e: React.MouseEvent, facture: Facture) => {
    e.preventDefault()

    if (!facture.clients?.email) {
      alert('Email du client non disponible')
      return
    }

    setSendingId(facture.id)

    try {
      const response = await fetch('/api/send-invoice-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          factureData: facture,
          lignes: [],
          clientEmail: facture.clients.email,
          clientName: facture.clients.nom,
          entrepriseData: { nom: 'OPUS' },
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Erreur envoi')

      alert('Facture envoyée par email !')
    } catch (error) {
      console.error('Error:', error)
      alert('Erreur: ' + (error instanceof Error ? error.message : 'Unknown'))
    } finally {
      setSendingId(null)
    }
  }

  const handleDeleteFacture = async (e: React.MouseEvent, facture: Facture) => {
    e.preventDefault()

    if (!confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) return

    try {
      const { error } = await supabase
        .from('factures')
        .delete()
        .eq('id', facture.id)

      if (error) throw error

      setFactures(factures.filter(f => f.id !== facture.id))
      alert('Facture supprimée !')
    } catch (error) {
      console.error('Error:', error)
      alert('Erreur: ' + (error instanceof Error ? error.message : 'Unknown'))
    }
  }

  const handleToggleEnvoyee = async (e: React.MouseEvent, facture: Facture) => {
    e.preventDefault()
    setUpdatingId(facture.id)

    try {
      // Si brouillon → envoyée, sinon → brouillon
      const newStatus = isEnvoyee(facture.statut) ? 'brouillon' : 'envoyée'

      const { error } = await supabase
        .from('factures')
        .update({ statut: newStatus })
        .eq('id', facture.id)

      if (error) throw error

      setFactures(factures.map(f => 
        f.id === facture.id ? { ...f, statut: newStatus } : f
      ))
    } catch (error) {
      console.error('Error:', error)
      alert('Erreur: ' + (error instanceof Error ? error.message : 'Unknown'))
    } finally {
      setUpdatingId(null)
    }
  }

  const handleTogglePayee = async (e: React.MouseEvent, facture: Facture) => {
    e.preventDefault()
    setUpdatingId(facture.id)

    try {
      // Si payée → impayée, sinon → payée
      const newStatus = isPayee(facture.statut) ? 'impayée' : 'payée'

      const { error } = await supabase
        .from('factures')
        .update({ statut: newStatus })
        .eq('id', facture.id)

      if (error) throw error

      setFactures(factures.map(f => 
        f.id === facture.id ? { ...f, statut: newStatus } : f
      ))
    } catch (error) {
      console.error('Error:', error)
      alert('Erreur: ' + (error instanceof Error ? error.message : 'Unknown'))
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full bg-blue-100 mx-auto mb-4 flex items-center justify-center">
          <FileText className="w-6 h-6 text-blue-600" />
        </div>
        <p className="text-gray-700 font-semibold">Chargement des factures...</p>
      </div>
    </div>
  )

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-2">Factures</h1>
          <p className="text-lg text-gray-600">{factures.length} factures en base</p>
        </div>
      </div>

      {/* Liste des factures */}
      {factures.length === 0 ? (
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-3xl p-16 text-center shadow-lg">
          <div className="w-20 h-20 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="w-10 h-10 text-blue-600" />
          </div>
          <p className="text-gray-800 text-xl font-bold mb-2">Aucune facture trouvée</p>
          <p className="text-gray-700">Les factures sont créées automatiquement à partir des devis acceptés</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {factures.map((f, index) => (
            <Link key={f.id} href={`/dashboard/factures/${f.id}`}>
              <Card className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
                  {/* Infos principales */}
                  <div className="flex-1">
                    <div className="flex items-baseline gap-3 mb-4">
                      <h3 className="text-2xl font-bold text-gray-900">Facture {index + 1}</h3>
                      <p className="text-lg text-gray-700 font-semibold">{f.clients?.nom}</p>
                    </div>

                    <div className="space-y-2 text-sm">
                      <p className="text-gray-600">
                        <span className="font-semibold">N° :</span> <span className="font-mono text-gray-900">{f.numero_facture}</span>
                      </p>
                      <p className="text-gray-600">
                        <span className="font-semibold">Montant TTC :</span> <span className="text-lg font-bold text-gray-900">{(f.montant_total_ttc || 0).toFixed(2)}€</span>
                      </p>
                      <p className="text-gray-600">
                        <span className="font-semibold">Payé :</span> <span className="font-bold">{(f.montant_paye || 0).toFixed(2)}€</span>
                      </p>
                      <p className="text-gray-600">
                        <span className="font-semibold">Reste :</span> <span className="font-bold text-orange-600">{((f.montant_total_ttc || 0) - (f.montant_paye || 0)).toFixed(2)}€</span>
                      </p>
                      <p className="text-gray-600">
                        <span className="font-semibold">Date :</span> {new Date(f.date_creation).toLocaleDateString('fr-FR')}
                      </p>
                      {f.date_echeance && (
                        <p className="text-gray-600">
                          <span className="font-semibold">Échéance :</span> {new Date(f.date_echeance).toLocaleDateString('fr-FR')}
                        </p>
                      )}
                      <p className="text-gray-600">
                        <span className="font-semibold">Statut :</span> <span className={`inline-block px-2 py-1 rounded text-sm font-bold ${getStatutColor(f.statut)}`}>
                          {f.statut}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3 w-full md:w-auto">
                    {/* Toggles pour Envoyée et Payée */}
                    <div className="flex gap-3 bg-gray-50 p-4 rounded-lg">
                      {/* Toggle Envoyée */}
                      <button
                        onClick={(e) => handleToggleEnvoyee(e, f)}
                        disabled={updatingId === f.id}
                        className={`flex items-center gap-2 px-3 py-2 rounded font-semibold text-sm transition-all ${
                          isEnvoyee(f.statut)
                            ? 'bg-blue-200 text-blue-700 hover:bg-blue-300'
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                        title={isEnvoyee(f.statut) ? 'Marquer comme non envoyée' : 'Marquer comme envoyée'}
                      >
                        <Send className="w-4 h-4" />
                        Envoyée
                        {isEnvoyee(f.statut) && <CheckCircle className="w-4 h-4" />}
                      </button>

                      {/* Toggle Payée */}
                      <button
                        onClick={(e) => handleTogglePayee(e, f)}
                        disabled={updatingId === f.id}
                        className={`flex items-center gap-2 px-3 py-2 rounded font-semibold text-sm transition-all ${
                          isPayee(f.statut)
                            ? 'bg-green-200 text-green-700 hover:bg-green-300'
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                        title={isPayee(f.statut) ? 'Marquer comme impayée' : 'Marquer comme payée'}
                      >
                        <CheckCircle className="w-4 h-4" />
                        Payée
                        {isPayee(f.statut) && <CheckCircle className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Autres boutons */}
                    <div className="flex flex-wrap gap-2">
                      {/* Bouton Télécharger PDF */}
                      <button
                        onClick={(e) => handleDownloadPDF(e, f)}
                        disabled={downloadingId === f.id}
                        className="flex-1 px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <Download className="w-4 h-4" />
                        PDF
                      </button>

                      {/* Bouton Envoyer Email */}
                      <button
                        onClick={(e) => handleSendEmail(e, f)}
                        disabled={sendingId === f.id}
                        className="flex-1 px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <Mail className="w-4 h-4" />
                        Email
                      </button>

                      {/* Bouton Modifier */}
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          // Redirection vers l'édition
                        }}
                        className="flex-1 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                      >
                        <Edit2 className="w-4 h-4" />
                        Modifier
                      </button>

                      {/* Bouton Supprimer */}
                      <button
                        onClick={(e) => handleDeleteFacture(e, f)}
                        className="flex-1 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}