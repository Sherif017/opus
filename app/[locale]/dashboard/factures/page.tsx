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

  const refreshFactures = async (token?: string) => {
    try {
      // ✅ Récupérer le token de la session si pas fourni
      let accessToken = token
      if (!accessToken) {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError || !session?.access_token) {
          console.error('No session found:', sessionError)
          return
        }
        accessToken = session.access_token
      }

      // ✅ Appeler la nouvelle API sécurisée avec le token
      const response = await fetch('/api/dashboard/factures', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
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

      const response = await fetch('/api/dashboard/factures', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
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
      const response = await fetch('/api/send-invoice-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ factureId, email: clientEmail }),
      })

      if (!response.ok) throw new Error('Erreur envoi email')
      
      alert('Email envoyé avec succès')
    } catch (error) {
      console.error('Error sending:', error)
      alert('Erreur lors de l\'envoi')
    } finally {
      setSendingId(null)
    }
  }

  const handleMarkAsPaid = async (factureId: string) => {
    try {
      setUpdatingId(factureId)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) throw new Error('No session')

      const response = await fetch(`/api/dashboard/factures/${factureId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
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

      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) throw new Error('No session')

      const response = await fetch(`/api/dashboard/factures/${factureId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Factures</h1>
          <p className="text-gray-600 mt-2">{factures.length} factures</p>
        </div>
        <Link href="/dashboard/factures/new">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Nouvelle facture
          </button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-6">
          <p className="text-gray-600 text-sm">Total</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{totalAmount.toLocaleString()}€</p>
        </Card>
        <Card className="p-6">
          <p className="text-gray-600 text-sm">Payé</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{totalPaid.toLocaleString()}€</p>
        </Card>
        <Card className="p-6">
          <p className="text-gray-600 text-sm">À encaisser</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{unpaidAmount.toLocaleString()}€</p>
        </Card>
      </div>

      {/* Factures list */}
      <div className="grid gap-4">
        {factures.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucune facture créée</p>
          </div>
        ) : (
          factures.map((f) => (
            <div key={f.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div>
                      <h3 className="font-bold text-lg">{f.numero_facture}</h3>
                      <p className="text-sm text-gray-600">{f.clients?.nom || 'Client inconnu'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      f.statut === 'payée' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {f.statut}
                    </span>
                    <span className="font-bold text-gray-900">{f.montant_total_ttc?.toLocaleString()}€</span>
                    <span className="text-gray-600">{new Date(f.date_creation).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownload(f.id)}
                    disabled={downloadingId === f.id}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleSendEmail(f.id, f.clients?.email)}
                    disabled={sendingId === f.id}
                    className="p-2 text-green-600 hover:bg-green-50 rounded disabled:opacity-50"
                  >
                    <Mail className="w-4 h-4" />
                  </button>
                  {f.statut !== 'payée' && (
                    <button
                      onClick={() => handleMarkAsPaid(f.id)}
                      disabled={updatingId === f.id}
                      className="p-2 text-orange-600 hover:bg-orange-50 rounded disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(f.id)}
                    disabled={updatingId === f.id}
                    className="p-2 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}