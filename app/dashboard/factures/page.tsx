'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Plus, FileText, StickyNote, ChevronDown } from 'lucide-react'

interface Facture {
  id: string
  numero_facture: string
  client_id: string
  montant_total_ttc?: number
  montant_paye?: number
  notes?: string
  date_creation: string
  clients?: { nom: string; email?: string }
}

export default function FacturesPage() {
  const [factures, setFactures] = useState<Facture[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingAmount, setEditingAmount] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [downloading, setDownloading] = useState<string | null>(null)
  const [sending, setSending] = useState<string | null>(null)
  const [expandedNotes, setExpandedNotes] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    notes: '',
  })
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null)

  useEffect(() => {
    init()
  }, [])

  const init = async () => {
    try {
      const { data: user } = await supabase
        .from('utilisateurs')
        .select('entreprise_id')
        .limit(1)
        .single()

      if (!user) return

      const { data, error } = await supabase
        .from('factures')
        .select('*, clients(nom, email)')
        .eq('entreprise_id', user.entreprise_id)
        .order('date_creation', { ascending: false })

      if (error) throw error
      setFactures(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPaymentStatus = (montantTTC: number, montantPaye: number) => {
    const paye = montantPaye || 0
    if (paye === 0) return { label: 'Non payée', color: 'bg-red-100 text-red-800' }
    if (paye >= montantTTC) return { label: 'Payée', color: 'bg-green-100 text-green-800' }
    return { label: 'Partiellement payée', color: 'bg-yellow-100 text-yellow-800' }
  }

  const handleEditClick = (facture: Facture) => {
    setEditingId(facture.id)
    setEditingAmount((facture.montant_paye || 0).toString())
  }

  const handleSaveAmount = async (factureId: string) => {
    const amount = parseFloat(editingAmount)
    
    if (isNaN(amount) || amount < 0) {
      alert('Veuillez entrer un montant valide')
      return
    }

    setSaving(true)

    try {
      const { error } = await supabase
        .from('factures')
        .update({ montant_paye: amount })
        .eq('id', factureId)

      if (error) throw error

      setFactures(factures.map(f =>
        f.id === factureId ? { ...f, montant_paye: amount } : f
      ))

      setEditingId(null)
      alert('Montant payé mis à jour!')
    } catch (error) {
      console.error('Error:', error)
      alert('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditingAmount('')
  }

  const handleDeleteFacture = async (factureId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) return

    setDeleting(factureId)

    try {
      const { error: lignesError } = await supabase
        .from('factures_lignes')
        .delete()
        .eq('facture_id', factureId)

      if (lignesError) throw lignesError

      const { error: factureError } = await supabase
        .from('factures')
        .delete()
        .eq('id', factureId)

      if (factureError) throw factureError

      setFactures(factures.filter(f => f.id !== factureId))
      alert('Facture supprimée!')
    } catch (error) {
      console.error('Error:', error)
      alert('Erreur lors de la suppression')
    } finally {
      setDeleting(null)
    }
  }

  const getLignesFacture = async (factureId: string) => {
    const { data } = await supabase
      .from('factures_lignes')
      .select('*')
      .eq('facture_id', factureId)

    return data || []
  }

  const handleDownloadPDF = async (facture: Facture) => {
    setDownloading(facture.id)

    try {
      const lignes = await getLignesFacture(facture.id)

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

      alert('PDF téléchargé!')
    } catch (error) {
      console.error('Error:', error)
      alert('Erreur lors du téléchargement')
    } finally {
      setDownloading(null)
    }
  }

  const handleSendByEmail = async (facture: Facture) => {
    if (!facture.clients?.email) {
      alert('Email du client non disponible')
      return
    }

    setSending(facture.id)

    try {
      const lignes = await getLignesFacture(facture.id)

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

      alert('Facture envoyée par email!')
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
        .from('factures')
        .update({
          notes: formData.notes || null,
        })
        .eq('id', editingNotesId)

      if (error) throw error

      setFactures(factures.map(f => f.id === editingNotesId ? {
        ...f,
        notes: formData.notes || undefined,
      } : f))

      setEditingNotesId(null)
      setFormData({ notes: '' })
    } catch (error) {
      console.error('Error:', error)
      alert('Erreur: ' + (error instanceof Error ? error.message : 'Unknown'))
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
        <button className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-2xl font-semibold transition-all shadow-lg hover:shadow-xl">
          <Plus className="w-5 h-5" />
          Créer une facture
        </button>
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
          {factures.map((f, index) => {
            const montantTTC = f.montant_total_ttc || 0
            const montantPaye = f.montant_paye || 0
            const resteAPayer = montantTTC - montantPaye
            const paymentStatus = getPaymentStatus(montantTTC, montantPaye)
            const isEditing = editingId === f.id
            const isEditingNotes = editingNotesId === f.id
            const isNotesOpen = expandedNotes === f.id

            // Formulaire de modification des notes
            if (isEditingNotes) {
              return (
                <Card key={f.id} className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-3xl p-8 shadow-lg">
                  <h2 className="text-3xl font-bold text-gray-900 mb-1">
                    Modifier les notes
                  </h2>
                  <p className="text-gray-600 text-sm mb-8">Facture {index + 1}</p>
                  
                  <form onSubmit={handleSaveNotes} className="space-y-6">
                    {/* Notes */}
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <label className="block text-sm font-bold text-gray-700 mb-2">📝 Notes</label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        placeholder="Ajoutez des notes sur cette facture..."
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
              )
            }

            // Affichage normal de la facture
            return (
              <Card key={f.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-6">
                  {/* Infos principales */}
                  <div className="flex-1">
                    <div className="flex items-baseline gap-3 mb-4">
                      <h3 className="text-2xl font-bold text-gray-900">Facture {index + 1}</h3>
                      <p className="text-lg text-gray-700 font-semibold">{f.clients?.nom}</p>
                    </div>

                    <div className="space-y-2 text-sm">
                      <p className="text-gray-600">
                        <span className="font-semibold">Montant TTC :</span> <span className="text-lg font-bold text-gray-900">{montantTTC.toFixed(2)}€</span>
                      </p>
                      <p className="text-gray-600">
                        <span className="font-semibold">Montant payé :</span> <span className="font-bold text-green-600">{montantPaye.toFixed(2)}€</span>
                      </p>
                      <p className="text-gray-600">
                        <span className="font-semibold">Reste à payer :</span> <span className="font-bold text-red-600">{resteAPayer.toFixed(2)}€</span>
                      </p>
                      <p className="text-gray-600">
                        <span className="font-semibold">Date :</span> {new Date(f.date_creation).toLocaleDateString('fr-FR')}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-semibold">Statut :</span> <span className={`inline-block px-2 py-1 rounded text-sm font-bold ${paymentStatus.color}`}>
                          {paymentStatus.label}
                        </span>
                      </p>

                      {f.notes && (
                        <button
                          onClick={() => setExpandedNotes(isNotesOpen ? null : f.id)}
                          className="flex items-center gap-2 text-amber-700 text-sm font-semibold hover:text-amber-800 transition-colors mt-2"
                        >
                          <StickyNote className="w-4 h-4 flex-shrink-0" />
                          <span>Notes ({f.notes.length} caractères)</span>
                          <ChevronDown className={`w-4 h-4 transition-transform ${isNotesOpen ? 'rotate-180' : ''}`} />
                        </button>
                      )}

                      {isNotesOpen && f.notes && (
                        <div className="mt-3 p-3 bg-amber-50 rounded border-l-4 border-amber-400">
                          <p className="text-gray-800 text-sm whitespace-pre-wrap">{f.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 w-full sm:w-auto sm:flex-col-reverse">
                    <button
                      onClick={() => handleDeleteFacture(f.id)}
                      disabled={deleting === f.id}
                      className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded font-semibold text-sm transition-colors disabled:opacity-50"
                    >
                      {deleting === f.id ? 'Suppression...' : 'Supprimer'}
                    </button>

                    <button
                      onClick={() => {
                        setFormData({ notes: f.notes || '' })
                        setEditingNotesId(f.id)
                      }}
                      className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded font-semibold text-sm transition-colors"
                    >
                      Modifier
                    </button>

                    {isEditing ? (
                      <>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={editingAmount}
                            onChange={(e) => setEditingAmount(e.target.value)}
                            placeholder="0"
                            className="px-3 py-2 border border-gray-300 rounded font-semibold text-sm w-24"
                          />
                          <button
                            onClick={() => handleSaveAmount(f.id)}
                            disabled={saving}
                            className="px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded font-semibold text-sm transition-colors disabled:opacity-50"
                          >
                            {saving ? 'Enregistrement...' : 'Enregistrer'}
                          </button>
                          <button
                            onClick={handleCancel}
                            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-semibold text-sm transition-colors"
                          >
                            Annuler
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEditClick(f)}
                          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-semibold text-sm transition-colors"
                        >
                          Montant payé
                        </button>

                        <button
                          onClick={() => handleDownloadPDF(f)}
                          disabled={downloading === f.id}
                          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-semibold text-sm transition-colors disabled:opacity-50"
                        >
                          {downloading === f.id ? 'PDF...' : 'PDF'}
                        </button>

                        <button
                          onClick={() => handleSendByEmail(f)}
                          disabled={sending === f.id}
                          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-semibold text-sm transition-colors disabled:opacity-50"
                        >
                          {sending === f.id ? 'Email...' : 'Email'}
                        </button>
                      </>
                    )}
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