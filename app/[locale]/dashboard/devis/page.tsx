'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import { Card } from '@/components/ui/Card'
import { Plus, FileText, StickyNote, ChevronDown } from 'lucide-react'
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
  notes?: string
  date_creation: string
  clients?: Client
}

export default function DevisPage() {
  const [devis, setDevis] = useState<Devis[]>([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState<string | null>(null)
  const [sending, setSending] = useState<string | null>(null)
  const [expandedNotes, setExpandedNotes] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    notes: '',
  })

  useEffect(() => {
    init()
    
    // ✅ Auto-refresh toutes les 2 secondes pour détecter les nouveaux devis
    const interval = setInterval(() => {
      refreshDevis()
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const init = async () => {
    try {
      setLoading(true)
      await refreshDevis()
    } catch (error) {
      console.error('Error in init:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * ✅ Fonction de rafraîchissement via API sécurisée
   */
  const refreshDevis = async () => {
    try {
      // ✅ Récupérer le token de la session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError || !session?.access_token) {
        console.error('❌ No session found:', sessionError)
        return
      }

      console.log('🔄 Fetching devis with token...')

      // ✅ Appeler l'API sécurisée avec le token
      const response = await fetch('/api/devis/list', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
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
    }
  }

  const getLignesDevis = async (devisId: string) => {
    const { data } = await supabase
      .from('devis_lignes')
      .select('*')
      .eq('devis_id', devisId)

    return data || []
  }

  const handleDownloadPDF = async (devisItem: Devis) => {
    setDownloading(devisItem.id)

    try {
      const lignes = await getLignesDevis(devisItem.id)

      const response = await fetch('/api/generate-devis-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          devisData: devisItem,
          lignes: lignes,
          clientData: { nom: devisItem.clients?.nom },
          entrepriseData: { nom: 'OPUS' },
        }),
      })

      if (!response.ok) throw new Error('Erreur génération PDF')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `devis-${devisItem.numero_devis}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      alert('PDF téléchargé !')
    } catch (error) {
      console.error('Error:', error)
      alert('Erreur lors du téléchargement')
    } finally {
      setDownloading(null)
    }
  }

  const handleSendByEmail = async (devisItem: Devis) => {
    if (!devisItem.clients?.email) {
      alert('Email du client non disponible')
      return
    }

    setSending(devisItem.id)

    try {
      const lignes = await getLignesDevis(devisItem.id)

      const response = await fetch('/api/send-devis-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          devisData: devisItem,
          lignes: lignes,
          clientEmail: devisItem.clients.email,
          clientName: devisItem.clients.nom,
          entrepriseData: { nom: 'OPUS' },
        }),
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error || 'Erreur envoi')

      alert('Devis envoyé par email !')
    } catch (error) {
      console.error('Error:', error)
      alert('Erreur: ' + (error instanceof Error ? error.message : 'Unknown'))
    } finally {
      setSending(null)
    }
  }

  const handleSaveNotes = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const { error } = await supabase
        .from('devis')
        .update({
          notes: formData.notes || null,
        })
        .eq('id', editingId)

      if (error) throw error

      setDevis(devis.map(d => d.id === editingId ? {
        ...d,
        notes: formData.notes || undefined,
      } : d))

      setEditingId(null)
      setFormData({ notes: '' })
    } catch (error) {
      console.error('Error:', error)
      alert('Erreur: ' + (error instanceof Error ? error.message : 'Unknown'))
    }
  }

  const handleDeleteDevis = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce devis ?')) return

    try {
      const { error: lignesError } = await supabase
        .from('devis_lignes')
        .delete()
        .eq('devis_id', id)

      if (lignesError) throw lignesError

      const { error: devisError } = await supabase
        .from('devis')
        .delete()
        .eq('id', id)

      if (devisError) throw devisError

      setDevis(devis.filter(d => d.id !== id))
      alert('Devis supprimé!')
    } catch (error) {
      console.error('Error:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const getStatutColor = (statut: string) => {
    const colors: Record<string, string> = {
      brouillon: 'bg-gray-100 text-gray-700 border border-gray-200',
      envoyé: 'bg-blue-100 text-blue-700 border border-blue-200',
      accepté: 'bg-green-100 text-green-700 border border-green-200',
      rejeté: 'bg-red-100 text-red-700 border border-red-200',
      facturé: 'bg-purple-100 text-purple-700 border border-purple-200',
    }
    return colors[statut] || 'bg-gray-100 text-gray-700'
  }

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full bg-blue-100 mx-auto mb-4 flex items-center justify-center">
          <FileText className="w-6 h-6 text-blue-600" />
        </div>
        <p className="text-gray-700 font-semibold">Chargement des devis...</p>
      </div>
    </div>
  )

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-2">Devis</h1>
          <p className="text-lg text-gray-600">{devis.length} devis en base</p>
        </div>
        <Link href="/dashboard/devis/new">
          <button className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-2xl font-semibold transition-all shadow-lg hover:shadow-xl">
            <Plus className="w-5 h-5" />
            Créer un devis
          </button>
        </Link>
      </div>

      {/* Liste des devis */}
      {devis.length === 0 ? (
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-3xl p-16 text-center shadow-lg">
          <div className="w-20 h-20 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="w-10 h-10 text-blue-600" />
          </div>
          <p className="text-gray-800 text-xl font-bold mb-2">Aucun devis trouvé</p>
          <p className="text-gray-700 mb-8">Commencez par créer votre premier devis</p>
          <Link href="/dashboard/devis/new">
            <button className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-bold transition-all shadow-lg">
              <Plus className="w-5 h-5" />
              Créer un devis
            </button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4">
          {devis.map((d, index) => {
            const isNotesOpen = expandedNotes === d.id
            const isEditing = editingId === d.id

            // Formulaire de modification des notes
            if (isEditing) {
              return (
                <Card key={d.id} className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-3xl p-8 shadow-lg">
                  <h2 className="text-3xl font-bold text-gray-900 mb-1">
                    Modifier les notes
                  </h2>
                  <p className="text-gray-600 text-sm mb-8">Devis {index + 1}</p>
                  
                  <form onSubmit={handleSaveNotes} className="space-y-6">
                    {/* Notes */}
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <label className="block text-sm font-bold text-gray-700 mb-2">📝 Notes</label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        placeholder="Ajoutez des notes sur ce devis..."
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
                          setEditingId(null)
                          setFormData({ notes: '' })
                        }}
                        className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-xl font-bold transition-colors"
                      >
                        Annuler
                      </button>
                    </div>
                  </form>
                </Card>
              )
            }

            // Affichage normal du devis
            return (
              <Card key={d.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-6">
                  {/* Infos principales */}
                  <div className="flex-1">
                    <div className="flex items-baseline gap-3 mb-4">
                      <h3 className="text-2xl font-bold text-gray-900">Devis {index + 1}</h3>
                      <p className="text-lg text-gray-700 font-semibold">{d.clients?.nom}</p>
                    </div>

                    <div className="space-y-2 text-sm">
                      <p className="text-gray-600">
                        <span className="font-semibold">Montant TTC :</span> <span className="text-lg font-bold text-gray-900">{(d.montant_total_ttc || 0).toFixed(2)}€</span>
                      </p>
                      <p className="text-gray-600">
                        <span className="font-semibold">Date :</span> {new Date(d.date_creation).toLocaleDateString('fr-FR')}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-semibold">Statut :</span> <span className={`inline-block px-2 py-1 rounded text-sm font-bold ${getStatutColor(d.statut)}`}>
                          {d.statut}
                        </span>
                      </p>

                      {d.notes && (
                        <button
                          onClick={() => setExpandedNotes(isNotesOpen ? null : d.id)}
                          className="flex items-center gap-2 text-amber-700 text-sm font-semibold hover:text-amber-800 transition-colors mt-2"
                        >
                          <StickyNote className="w-4 h-4 flex-shrink-0" />
                          <span>Notes ({d.notes.length} caractères)</span>
                          <ChevronDown className={`w-4 h-4 transition-transform ${isNotesOpen ? 'rotate-180' : ''}`} />
                        </button>
                      )}

                      {isNotesOpen && d.notes && (
                        <div className="mt-3 p-3 bg-amber-50 rounded border-l-4 border-amber-400">
                          <p className="text-gray-800 text-sm whitespace-pre-wrap">{d.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 w-full sm:w-auto sm:flex-col-reverse">
                    <button
                      onClick={() => handleDeleteDevis(d.id)}
                      className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded font-semibold text-sm transition-colors"
                    >
                      Supprimer
                    </button>

                    <button
                      onClick={() => {
                        setFormData({ notes: d.notes || '' })
                        setEditingId(d.id)
                      }}
                      className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded font-semibold text-sm transition-colors"
                    >
                      Modifier
                    </button>

                    <button
                      onClick={() => handleDownloadPDF(d)}
                      disabled={downloading === d.id}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-semibold text-sm transition-colors disabled:opacity-50"
                    >
                      {downloading === d.id ? 'PDF...' : 'PDF'}
                    </button>

                    <button
                      onClick={() => handleSendByEmail(d)}
                      disabled={sending === d.id}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-semibold text-sm transition-colors disabled:opacity-50"
                    >
                      {sending === d.id ? 'Email...' : 'Email'}
                    </button>

                    {d.statut === 'accepté' && (
                      <Link href={`/dashboard/factures/new?devis_id=${d.id}`}>
                        <button className="px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded font-semibold text-sm transition-colors">
                          Facture
                        </button>
                      </Link>
                    )}

                    <Link href={`/dashboard/devis/${d.id}`}>
                      <button className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-semibold text-sm transition-colors">
                        Éditer
                      </button>
                    </Link>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}