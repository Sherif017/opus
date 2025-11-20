'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import { Card } from '@/components/ui/Card'
import { FileText, Download, Mail, Edit2, Trash2, Send, CheckCircle, RefreshCw } from 'lucide-react'
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
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [sendingId, setSendingId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  // Récupérer le token de l'utilisateur connecté
  const getAuthToken = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token
  }

  // Charger les factures depuis l'API
  const loadFactures = async () => {
    try {
      setLoading(true)
      const token = await getAuthToken()

      if (!token) {
        console.error('Pas de token')
        return
      }

      const response = await fetch('/api/dashboard/factures', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
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
    } finally {
      setLoading(false)
    }
  }

  // Charger les factures en arrière-plan (silencieusement)
  const loadFacturesBackground = async () => {
    try {
      const token = await getAuthToken()

      if (!token) return

      const response = await fetch('/api/dashboard/factures', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) return

      const data = await response.json()
      setFactures(data.factures || [])
    } catch (error) {
      console.error('Error in background refresh:', error)
    }
  }

  // Rafraîchir manuellement (visible)
  const refreshFactures = async () => {
    try {
      setIsRefreshing(true)
      await loadFacturesBackground()
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    loadFactures()

    // Auto-refresh silencieux chaque 10 secondes
    const interval = setInterval(() => {
      loadFacturesBackground()
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  const handleDownload = async (factureId: string) => {
    try {
      setDownloadingId(factureId)
      const response = await fetch(`/api/factures/generate-pdf?factureId=${factureId}`)

      if (!response.ok) throw new Error('Erreur génération PDF')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `facture-${factureId}.pdf`
      a.click()
    } catch (error) {
      console.error('Error downloading:', error)
      alert('Erreur lors du téléchargement')
    } finally {
      setDownloadingId(null)
    }
  }

  const handleSendEmail = async (factureId: string, clientEmail?: string) => {
    if (!clientEmail) {
      alert('Email du client manquant')
      return
    }

    try {
      setSendingId(factureId)

      // ✅ Appeler la route simple (sans Bearer token)
      const response = await fetch('/api/send-invoice-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ factureId, email: clientEmail }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erreur envoi email')
      }

      alert('Email envoyé avec succès')
      // Rafraîchir les factures
      await loadFacturesBackground()
    } catch (error) {
      console.error('Erreur envoi email', error)
      alert(error instanceof Error ? error.message : 'Erreur lors de l\'envoi')
    } finally {
      setSendingId(null)
    }
  }

  const handleMarkAsPaid = async (factureId: string) => {
    try {
      setUpdatingId(factureId)

      const token = await getAuthToken()
      if (!token) throw new Error('No session')

      const response = await fetch(`/api/dashboard/factures/${factureId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          statut: 'payée',
          date_paiement: new Date().toISOString(),
        }),
      })

      if (!response.ok) throw new Error('Erreur mise à jour')

      const { data } = await response.json()
      setFactures(factures.map(f => f.id === factureId ? data : f))
    } catch (error) {
      console.error('Error updating:', error)
      alert('Erreur lors de la mise à jour')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDelete = async (factureId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) return

    try {
      setUpdatingId(factureId)

      const token = await getAuthToken()
      if (!token) throw new Error('No session')

      const response = await fetch(`/api/dashboard/factures/${factureId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error('Erreur suppression')

      setFactures(factures.filter(f => f.id !== factureId))
    } catch (error) {
      console.error('Error deleting:', error)
      alert('Erreur lors de la suppression')
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des factures...</p>
        </div>
      </div>
    )
  }

  const totalAmount = factures.reduce((sum, f) => sum + (f.montant_total_ttc || 0), 0)
  const totalPaid = factures.reduce((sum, f) => sum + (f.montant_paye || 0), 0)
  const unpaidAmount = totalAmount - totalPaid

  return (
    <div className="space-y-8 p-6">
      {/* Header avec bouton refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Factures</h1>
          <p className="text-gray-600 mt-2">{factures.length} factures</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={refreshFactures}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 transition-all"
            title="Rafraîchir manuellement"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Rafraîchissement...' : 'Rafraîchir'}
          </button>
          <Link href="/dashboard/factures/new">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">
              Nouvelle facture
            </button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
          <p className="text-blue-700 text-sm font-semibold">Total</p>
          <p className="text-3xl font-bold text-blue-900 mt-2">{totalAmount.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}€</p>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
          <p className="text-green-700 text-sm font-semibold">Payé</p>
          <p className="text-3xl font-bold text-green-900 mt-2">{totalPaid.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}€</p>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100 border border-red-200">
          <p className="text-red-700 text-sm font-semibold">À encaisser</p>
          <p className="text-3xl font-bold text-red-900 mt-2">{unpaidAmount.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}€</p>
        </Card>
      </div>

      {/* Factures list */}
      <div className="grid gap-4">
        {factures.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-semibold">Aucune facture créée</p>
            <p className="text-gray-400 text-sm mt-2">Créez votre première facture pour la voir apparaître ici</p>
            <Link href="/dashboard/factures/new">
              <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Créer une facture
              </button>
            </Link>
          </Card>
        ) : (
          factures.map((f) => (
            <div key={f.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{f.numero_facture}</h3>
                      <p className="text-sm text-gray-600">{f.clients?.nom || 'Client inconnu'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-sm flex-wrap">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        f.statut === 'payée'
                          ? 'bg-green-100 text-green-700'
                          : f.statut === 'envoyée'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {f.statut}
                    </span>
                    <span className="font-bold text-gray-900">
                      {f.montant_total_ttc?.toLocaleString('fr-FR', { maximumFractionDigits: 2 })}€
                    </span>
                    <span className="text-gray-600">
                      {new Date(f.date_creation).toLocaleDateString('fr-FR')}
                    </span>
                    {f.montant_paye && f.montant_paye > 0 && (
                      <span className="text-green-600 font-semibold">
                        Acompte: {f.montant_paye.toLocaleString('fr-FR', { maximumFractionDigits: 2 })}€
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleDownload(f.id)}
                    disabled={downloadingId === f.id}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50 transition-all"
                    title="Télécharger PDF"
                  >
                    <Download className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => handleSendEmail(f.id, f.clients?.email)}
                    disabled={sendingId === f.id}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50 transition-all"
                    title="Envoyer par email"
                  >
                    <Mail className="w-5 h-5" />
                  </button>

                  {f.statut !== 'payée' && (
                    <button
                      onClick={() => handleMarkAsPaid(f.id)}
                      disabled={updatingId === f.id}
                      className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg disabled:opacity-50 transition-all"
                      title="Marquer comme payée"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(f.id)}
                    disabled={updatingId === f.id}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 transition-all"
                    title="Supprimer"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Tips */}
      {factures.length > 0 && (
        <Card className="p-6 bg-blue-50 border border-blue-200">
          <h3 className="font-bold text-lg mb-3">💡 Tips</h3>
          <ul className="space-y-2 text-sm text-blue-900">
            <li>✅ Téléchargez la facture en PDF avec le bouton télécharger</li>
            <li>✅ Envoyez la facture au client par email avec le bouton courrier</li>
            <li>✅ Marquez la facture comme payée avec le bouton check</li>
            <li>✅ Les données se rafraîchissent automatiquement chaque 10 secondes</li>
          </ul>
        </Card>
      )}
    </div>
  )
}