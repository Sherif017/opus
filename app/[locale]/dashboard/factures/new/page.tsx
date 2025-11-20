'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import { Card } from '@/components/ui/Card'
import { FileText, ArrowLeft, ChevronRight, Download, Mail, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Client {
  id: string
  nom: string
  email?: string
}

interface Devis {
  id: string
  numero_devis: string
  client_id: string
  statut: string
  montant_total_ht?: number
  montant_tva?: number
  montant_total_ttc?: number
  date_creation: string
  clients?: Client
}

export default function SelectDevisForFacturePage() {
  const router = useRouter()
  const [devis, setDevis] = useState<Devis[]>([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState<string | null>(null)
  const [sending, setSending] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    init()
  }, [])

  const init = async () => {
    try {
      setLoading(true)
      
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        console.error('❌ No session found during init')
        setLoading(false)
        return
      }

      await refreshDevis(session.access_token)
    } catch (error) {
      console.error('Error in init:', error)
      setLoading(false)
    }
  }

  const refreshDevis = async (token?: string) => {
    try {
      let accessToken = token
      if (!accessToken) {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError || !session?.access_token) {
          console.warn('⚠️  Session not ready yet')
          return
        }
        accessToken = session.access_token
      }

      const response = await fetch('/api/dashboard/devis', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('❌ API Error:', error)
        return
      }

      const data = await response.json()
      // ✅ Filtrer les devis acceptés ou non facturés
      const availableDevis = (data.devis || []).filter((d: Devis) => 
        d.statut === 'accepté' || d.statut === 'en attente'
      )
      setDevis(availableDevis)
    } catch (error) {
      console.error('Error refreshing devis:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await refreshDevis()
  }

  const handleDownload = async (devisId: string) => {
    try {
      setDownloading(devisId)
      const response = await fetch(`/api/devis/generate-pdf?devisId=${devisId}`)
      
      if (!response.ok) throw new Error('Erreur génération PDF')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `devis-${devisId}.pdf`
      a.click()
    } catch (error) {
      console.error('Error downloading:', error)
      alert('Erreur lors du téléchargement')
    } finally {
      setDownloading(null)
    }
  }

  const handleSendEmail = async (devisId: string, clientEmail?: string) => {
    if (!clientEmail) {
      alert('Email du client manquant')
      return
    }

    try {
      setSending(devisId)
      const response = await fetch('/api/send-devis-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ devisId, email: clientEmail }),
      })

      if (!response.ok) throw new Error('Erreur envoi email')
      
      alert('Email envoyé avec succès')
    } catch (error) {
      console.error('Error sending:', error)
      alert('Erreur lors de l\'envoi')
    } finally {
      setSending(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des devis...</p>
        </div>
      </div>
    )
  }

  const totalAmount = devis.reduce((sum, d) => sum + (d.montant_total_ttc || 0), 0)

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
          <h1 className="text-4xl font-bold text-gray-900">Créer une Facture</h1>
          <p className="text-gray-600 mt-2">Sélectionnez un devis à facturer</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Rafraîchissement...' : 'Rafraîchir'}
        </button>
      </div>

      {/* Stats */}
      {devis.length > 0 && (
        <Card className="p-6 bg-blue-50">
          <p className="text-gray-600 text-sm">Devis disponibles</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{devis.length} devis • {totalAmount.toLocaleString()}€</p>
        </Card>
      )}

      {/* Liste des devis */}
      <div className="grid gap-4">
        {devis.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-semibold">Aucun devis disponible</p>
            <p className="text-gray-400 text-sm mt-2">Créez un devis accepté pour pouvoir créer une facture</p>
            <Link href="/dashboard/devis">
              <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Aller aux devis
              </button>
            </Link>
          </Card>
        ) : (
          devis.map((d) => (
            <Card key={d.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{d.numero_devis}</h3>
                      <p className="text-sm text-gray-600">{d.clients?.nom || 'Client inconnu'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className={`px-3 py-1 rounded text-xs font-semibold ${
                      d.statut === 'accepté' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {d.statut}
                    </span>
                    <span className="font-bold text-gray-900">{d.montant_total_ttc?.toLocaleString()}€</span>
                    <span className="text-gray-600">{new Date(d.date_creation).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownload(d.id)}
                    disabled={downloading === d.id}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded disabled:opacity-50"
                    title="Télécharger le PDF"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleSendEmail(d.id, d.clients?.email)}
                    disabled={sending === d.id}
                    className="p-2 text-green-600 hover:bg-green-50 rounded disabled:opacity-50"
                    title="Envoyer par email"
                  >
                    <Mail className="w-4 h-4" />
                  </button>
                  <Link href={`/dashboard/factures/new/${d.id}`}>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">
                      Facturer
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </Link>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}