'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import { Card } from '@/components/ui/Card'
import { useRouter, useParams } from 'next/navigation'
import { FileText, Mail, Download, ArrowLeft, CheckCircle, Edit2, Trash2, Send, Eye, Lock, Unlock, Copy, Printer } from 'lucide-react'

interface Client {
  id: string
  nom: string
  email?: string
}

interface LigneFacture {
  id: string
  description: string
  quantite: number
  prix_unitaire: number
  taux_tva: number
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

export default function FactureDetailPage() {
  const router = useRouter()
  const params = useParams()
  const factureId = params.id as string

  const [facture, setFacture] = useState<Facture | null>(null)
  const [lignes, setLignes] = useState<LigneFacture[]>([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [sending, setSending] = useState(false)
  const [markingPaid, setMarkingPaid] = useState(false)
  const [montantPaye, setMontantPaye] = useState<string>('')
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  useEffect(() => {
    loadFacture()
  }, [factureId])

  const loadFacture = async () => {
    try {
      setLoading(true)

      const { data: factureData, error: factureError } = await supabase
        .from('factures')
        .select('*, clients(id, nom, email)')
        .eq('id', factureId)
        .single()

      if (factureError || !factureData) {
        console.error('Facture not found')
        return
      }

      setFacture(factureData as Facture)
      setMontantPaye((factureData.montant_paye || 0).toString())

      const { data: lignesData } = await supabase
        .from('factures_lignes')
        .select('*')
        .eq('facture_id', factureId)

      setLignes(lignesData || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!facture) return
    setDownloading(true)

    try {
      const response = await fetch('/api/generate-invoice-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          factureData: facture,
          lignes: lignes,
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

      alert('PDF téléchargé !')
    } catch (error) {
      console.error('Error:', error)
      alert('Erreur lors du téléchargement')
    } finally {
      setDownloading(false)
    }
  }

  const handleSendEmail = async () => {
    if (!facture || !facture.clients?.email) {
      alert('Email du client non disponible')
      return
    }

    setSending(true)

    try {
      const response = await fetch('/api/send-invoice-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          factureData: facture,
          lignes: lignes,
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
      setSending(false)
    }
  }

  const handleMarkAsPaid = async () => {
    if (!facture) return

    const paidAmount = parseFloat(montantPaye)
    if (isNaN(paidAmount) || paidAmount < 0) {
      alert('Montant invalide')
      return
    }

    setMarkingPaid(true)

    try {
      const newStatut = paidAmount >= (facture.montant_total_ttc || 0) ? 'payée' : 'impayée'

      const { error } = await supabase
        .from('factures')
        .update({
          montant_paye: paidAmount,
          statut: newStatut,
          date_paiement: newStatut === 'payée' ? new Date().toISOString() : null,
        })
        .eq('id', factureId)

      if (error) throw error

      setFacture({
        ...facture,
        montant_paye: paidAmount,
        statut: newStatut,
      })

      setShowPaymentForm(false)
      alert('Paiement enregistré !')
    } catch (error) {
      console.error('Error:', error)
      alert('Erreur: ' + (error instanceof Error ? error.message : 'Unknown'))
    } finally {
      setMarkingPaid(false)
    }
  }

  const handleChangeStatus = async (newStatus: string) => {
    if (!facture) return
    setUpdatingStatus(true)

    try {
      const { error } = await supabase
        .from('factures')
        .update({ statut: newStatus })
        .eq('id', factureId)

      if (error) throw error

      setFacture({
        ...facture,
        statut: newStatus,
      })

      setShowStatusMenu(false)
      alert(`Statut changé à "${newStatus}"`)
    } catch (error) {
      console.error('Error:', error)
      alert('Erreur: ' + (error instanceof Error ? error.message : 'Unknown'))
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleDeleteFacture = async () => {
    if (!facture) return

    if (!confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) return

    try {
      const { error } = await supabase
        .from('factures')
        .delete()
        .eq('id', factureId)

      if (error) throw error

      alert('Facture supprimée !')
      router.push('/dashboard/factures')
    } catch (error) {
      console.error('Error:', error)
      alert('Erreur: ' + (error instanceof Error ? error.message : 'Unknown'))
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

  const statusOptions = ['brouillon', 'envoyée', 'payée', 'impayée', 'annulée']

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-blue-100 mx-auto mb-4 flex items-center justify-center">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-gray-700 font-semibold">Chargement de la facture...</p>
        </div>
      </div>
    )
  }

  if (!facture) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>
        <Card className="bg-red-50 border border-red-200 p-6 text-center">
          <p className="text-red-700 font-semibold">Facture non trouvée</p>
        </Card>
      </div>
    )
  }

  const restant = (facture.montant_total_ttc || 0) - (facture.montant_paye || 0)

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-semibold"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour
      </button>

      {/* Header avec titre et statut */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Facture {facture.numero_facture}</h1>
          <p className="text-gray-600">{facture.clients?.nom}</p>
        </div>
        <div className="flex gap-2 items-center">
          {/* Menu de changement de statut */}
          <div className="relative">
            <button
              onClick={() => setShowStatusMenu(!showStatusMenu)}
              className={`px-4 py-2 rounded font-semibold text-sm ${getStatutColor(facture.statut)} transition-all`}
            >
              {facture.statut}
            </button>
            {showStatusMenu && (
              <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-40">
                {statusOptions.map((status) => (
                  <button
                    key={status}
                    onClick={() => handleChangeStatus(status)}
                    disabled={updatingStatus}
                    className={`w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors ${
                      facture.statut === status ? 'bg-blue-50' : ''
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Infos générales */}
      <Card className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <p className="text-sm text-gray-600 mb-1">Numéro</p>
          <p className="font-semibold text-lg">{facture.numero_facture}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Date</p>
          <p className="font-semibold">{new Date(facture.date_creation).toLocaleDateString('fr-FR')}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Échéance</p>
          <p className="font-semibold">{facture.date_echeance ? new Date(facture.date_echeance).toLocaleDateString('fr-FR') : 'N/A'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Client</p>
          <p className="font-semibold">{facture.clients?.email || 'N/A'}</p>
        </div>
      </Card>

      {/* Lignes de facture */}
      <Card className="mb-6">
        <h2 className="font-bold text-lg mb-4">Lignes de Facture</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left py-2 px-2">Description</th>
                <th className="text-center py-2 px-2">Quantité</th>
                <th className="text-right py-2 px-2">Prix unitaire</th>
                <th className="text-center py-2 px-2">TVA %</th>
                <th className="text-right py-2 px-2">Total HT</th>
              </tr>
            </thead>
            <tbody>
              {lignes.map((ligne, index) => {
                const sousTotal = ligne.quantite * ligne.prix_unitaire
                return (
                  <tr key={ligne.id} className={`border-b ${index % 2 === 0 ? 'bg-gray-50' : ''}`}>
                    <td className="py-2 px-2">{ligne.description}</td>
                    <td className="text-center py-2 px-2">{ligne.quantite}</td>
                    <td className="text-right py-2 px-2">{ligne.prix_unitaire.toFixed(2)}€</td>
                    <td className="text-center py-2 px-2">{ligne.taux_tva}%</td>
                    <td className="text-right py-2 px-2 font-semibold">{sousTotal.toFixed(2)}€</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Totaux */}
      <Card className="mb-6 bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="font-semibold">Montant HT:</span>
            <span className="font-bold">{(facture.montant_total_ht || 0).toFixed(2)}€</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">TVA:</span>
            <span className="font-bold">{(facture.montant_tva || 0).toFixed(2)}€</span>
          </div>
          <div className="flex justify-between text-lg border-t-2 pt-3 border-blue-200">
            <span className="font-bold">Total TTC:</span>
            <span className="font-bold text-blue-600 text-xl">{(facture.montant_total_ttc || 0).toFixed(2)}€</span>
          </div>
        </div>
      </Card>

      {/* Paiement */}
      <Card className="mb-6">
        <h2 className="font-bold text-lg mb-4">Paiement</h2>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Montant payé</p>
            <p className="font-bold text-lg text-green-600">{(facture.montant_paye || 0).toFixed(2)}€</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Reste à payer</p>
            <p className={`font-bold text-lg ${restant > 0 ? 'text-orange-600' : 'text-green-600'}`}>
              {restant.toFixed(2)}€
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Statut paiement</p>
            <p className="font-bold">
              {(facture.montant_paye || 0) >= (facture.montant_total_ttc || 0) ? '✅ Payée' : '⏳ En attente'}
            </p>
          </div>
        </div>

        {!showPaymentForm ? (
          <button
            onClick={() => setShowPaymentForm(true)}
            className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded font-semibold transition-colors"
          >
            Enregistrer un paiement
          </button>
        ) : (
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Montant payé (€)</label>
              <input
                type="number"
                value={montantPaye}
                onChange={(e) => setMontantPaye(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-green-500"
                placeholder="0.00"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleMarkAsPaid}
                disabled={markingPaid}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-semibold transition-colors disabled:opacity-50"
              >
                {markingPaid ? 'Enregistrement...' : 'Enregistrer'}
              </button>
              <button
                onClick={() => setShowPaymentForm(false)}
                className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded font-semibold transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Actions principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <button
          onClick={handleDownloadPDF}
          disabled={downloading}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded font-semibold transition-colors disabled:opacity-50"
          title="Télécharger la facture en PDF"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Télécharger</span>
        </button>

        <button
          onClick={handleSendEmail}
          disabled={sending}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded font-semibold transition-colors disabled:opacity-50"
          title="Envoyer la facture par email"
        >
          <Mail className="w-4 h-4" />
          <span className="hidden sm:inline">Envoyer Email</span>
        </button>

        <button
          onClick={() => router.push(`/dashboard/factures/${factureId}/edit`)}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded font-semibold transition-colors"
          title="Modifier la facture"
        >
          <Edit2 className="w-4 h-4" />
          <span className="hidden sm:inline">Modifier</span>
        </button>

        <button
          onClick={handleDeleteFacture}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-red-100 hover:bg-red-200 text-red-700 rounded font-semibold transition-colors"
          title="Supprimer la facture"
        >
          <Trash2 className="w-4 h-4" />
          <span className="hidden sm:inline">Supprimer</span>
        </button>
      </div>

      {/* Actions secondaires */}
      <div className="grid grid-cols-2 gap-3">
        <button
          className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-semibold transition-colors"
          title="Dupliquer la facture"
        >
          <Copy className="w-4 h-4" />
          <span className="hidden sm:inline">Dupliquer</span>
        </button>

        <button
          className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-semibold transition-colors"
          title="Imprimer la facture"
        >
          <Printer className="w-4 h-4" />
          <span className="hidden sm:inline">Imprimer</span>
        </button>
      </div>
    </div>
  )
}