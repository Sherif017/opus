'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import { Plus, FileText, RefreshCw } from 'lucide-react'
import Link from 'next/link'

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

export default function DevisPage() {
  const [devis, setDevis] = useState<Devis[]>([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState<string | null>(null)
  const [sending, setSending] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const STATUTS = ['brouillon', 'en attente', 'accepté', 'refusé', 'expiré']

  useEffect(() => {
    init()
  }, [])

  const init = async () => {
    try {
      setLoading(true)
      
      // ✅ Vérifier que la session est prête AVANT de charger les devis
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

  /**
   * ✅ Fonction de rafraîchissement via API sécurisée
   */
  const refreshDevis = async (token?: string) => {
    try {
      // ✅ Récupérer le token de la session si pas fourni
      let accessToken = token
      if (!accessToken) {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError || !session?.access_token) {
          console.warn('⚠️  Session not ready yet')
          return
        }
        accessToken = session.access_token
      }

      console.log('📄 Fetching devis with token...')

      // ✅ Appeler la nouvelle API sécurisée avec le token
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
      console.log('✅ Devis fetched:', data.devis?.length)
      setDevis(data.devis || [])
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

  const handleChangeStatut = async (devisId: string, newStatut: string) => {
    try {
      setUpdatingId(devisId)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) throw new Error('No session')

      const response = await fetch(`/api/dashboard/devis/${devisId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ statut: newStatut }),
      })

      if (!response.ok) throw new Error('Erreur mise à jour')

      const { data } = await response.json()
      setDevis(devis.map(d => d.id === devisId ? data : d))
      alert('Statut mis à jour avec succès')
    } catch (error) {
      console.error('Error updating statut:', error)
      alert('Erreur lors de la mise à jour du statut')
    } finally {
      setUpdatingId(null)
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
          <h1 className="text-4xl font-bold text-gray-900">Devis</h1>
          <p className="text-gray-600 mt-2">{devis.length} devis • Montant total : {totalAmount.toLocaleString()}€</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Rafraîchissement...' : 'Rafraîchir'}
          </button>
          <Link href="/dashboard/devis/new">
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="w-4 h-4" />
              Nouveau devis
            </button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4">
        {devis.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucun devis créé</p>
          </div>
        ) : (
          devis.map((d) => (
            <div key={d.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div>
                      <h3 className="font-bold text-lg">{d.numero_devis}</h3>
                      <p className="text-sm text-gray-600">{d.clients?.nom || 'Client inconnu'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-sm">
                    <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-700">
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
                    className="px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded disabled:opacity-50"
                  >
                    {downloading === d.id ? 'Téléchargement...' : 'Télécharger'}
                  </button>
                  <button
                    onClick={() => handleSendEmail(d.id, d.clients?.email)}
                    disabled={sending === d.id}
                    className="px-3 py-2 text-sm font-semibold text-green-600 hover:bg-green-50 rounded disabled:opacity-50"
                  >
                    {sending === d.id ? 'Envoi...' : 'Envoyer'}
                  </button>
                  <select
                    value={d.statut}
                    onChange={(e) => handleChangeStatut(d.id, e.target.value)}
                    disabled={updatingId === d.id}
                    className="px-3 py-2 text-sm font-semibold border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
                  >
                    {STATUTS.map((statut) => (
                      <option key={statut} value={statut}>
                        {statut.charAt(0).toUpperCase() + statut.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}