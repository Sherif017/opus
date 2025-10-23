'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Plus, Trash2, Mail, Phone, TrendingUp, StickyNote, Edit3, ChevronDown } from 'lucide-react'

interface Prospect {
  id: string
  nom: string
  email?: string
  phone?: string
  statut_pipeline: string
  valeur_potentielle?: number
  notes?: string
  created_at: string
}

const STATUTS = ['nouveau', 'qualifié', 'proposition', 'négociation', 'gagné', 'perdu']

export default function ProspectsPage() {
  const [prospects, setProspects] = useState<Prospect[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [companyId, setCompanyId] = useState<string>('')
  const [expandedNotes, setExpandedNotes] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    phone: '',
    statut_pipeline: 'nouveau',
    valeur_potentielle: '',
    notes: '',
  })
  const [editingId, setEditingId] = useState<string | null>(null)

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

      const { data: prospectsData, error: prospectsError } = await supabase
        .from('prospects')
        .select('*')
        .eq('entreprise_id', user.entreprise_id)
        .order('created_at', { ascending: false })

      if (prospectsError) throw prospectsError
      setProspects(prospectsData || [])
    } catch (error) {
      console.error('Error:', error)
      alert('Erreur: ' + (error instanceof Error ? error.message : 'Unknown'))
    } finally {
      setLoading(false)
    }
  }

  const handleAddProspect = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingId) {
        // Modification
        const { error } = await supabase
          .from('prospects')
          .update({
            nom: formData.nom,
            email: formData.email || null,
            phone: formData.phone || null,
            statut_pipeline: formData.statut_pipeline,
            valeur_potentielle: formData.valeur_potentielle ? parseFloat(formData.valeur_potentielle) : null,
            notes: formData.notes || null,
          })
          .eq('id', editingId)

        if (error) throw error

        setProspects(prospects.map(p => p.id === editingId ? {
          ...p,
          nom: formData.nom,
          email: formData.email || undefined,
          phone: formData.phone || undefined,
          statut_pipeline: formData.statut_pipeline,
          valeur_potentielle: formData.valeur_potentielle ? parseFloat(formData.valeur_potentielle) : undefined,
          notes: formData.notes || undefined,
        } : p))
        
        setEditingId(null)
      } else {
        // Création
        const { data, error } = await supabase
          .from('prospects')
          .insert([{
            nom: formData.nom,
            email: formData.email || null,
            phone: formData.phone || null,
            statut_pipeline: formData.statut_pipeline,
            valeur_potentielle: formData.valeur_potentielle ? parseFloat(formData.valeur_potentielle) : null,
            notes: formData.notes || null,
            entreprise_id: companyId,
          }])
          .select()
          .single()

        if (error) throw error

        setProspects([data, ...prospects])
      }

      setFormData({ nom: '', email: '', phone: '', statut_pipeline: 'nouveau', valeur_potentielle: '', notes: '' })
      setShowForm(false)
    } catch (error) {
      console.error('Error adding prospect:', error)
      alert('Erreur: ' + (error instanceof Error ? error.message : 'Unknown'))
    }
  }

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('prospects')
        .update({ statut_pipeline: newStatus })
        .eq('id', id)

      if (error) throw error

      setProspects(prospects.map(p => p.id === id ? { ...p, statut_pipeline: newStatus } : p))
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const handleDeleteProspect = async (id: string) => {
    if (!confirm('Êtes-vous sûr?')) return

    try {
      const { error } = await supabase
        .from('prospects')
        .delete()
        .eq('id', id)

      if (error) throw error

      setProspects(prospects.filter(p => p.id !== id))
    } catch (error) {
      console.error('Error deleting prospect:', error)
    }
  }

  const getStatutColor = (statut: string) => {
    const colors: Record<string, Record<string, string>> = {
      nouveau: { bg: 'bg-blue-50', badge: 'bg-blue-100 text-blue-700 border border-blue-200', icon: 'text-blue-600' },
      qualifié: { bg: 'bg-purple-50', badge: 'bg-purple-100 text-purple-700 border border-purple-200', icon: 'text-purple-600' },
      proposition: { bg: 'bg-yellow-50', badge: 'bg-yellow-100 text-yellow-700 border border-yellow-200', icon: 'text-yellow-600' },
      négociation: { bg: 'bg-orange-50', badge: 'bg-orange-100 text-orange-700 border border-orange-200', icon: 'text-orange-600' },
      gagné: { bg: 'bg-green-50', badge: 'bg-green-100 text-green-700 border border-green-200', icon: 'text-green-600' },
      perdu: { bg: 'bg-red-50', badge: 'bg-red-100 text-red-700 border border-red-200', icon: 'text-red-600' },
    }
    return colors[statut] || { bg: 'bg-gray-50', badge: 'bg-gray-100 text-gray-700', icon: 'text-gray-600' }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full bg-blue-100 mx-auto mb-4 flex items-center justify-center">
          <Plus className="w-6 h-6 text-blue-600" />
        </div>
        <p className="text-gray-700 font-semibold">Chargement des prospects...</p>
      </div>
    </div>
  )

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-2">Prospects</h1>
          <p className="text-lg text-gray-600">{prospects.length} prospect{prospects.length > 1 ? 's' : ''} en base</p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm)
            setEditingId(null)
            setFormData({ nom: '', email: '', phone: '', statut_pipeline: 'nouveau', valeur_potentielle: '', notes: '' })
          }}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-2xl font-semibold transition-all shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          {showForm ? 'Masquer' : 'Ajouter un prospect'}
        </button>
      </div>

      {/* Formulaire d'ajout */}
      {showForm && !editingId ? (
        <Card className="bg-gradient-to-br from-white to-gray-50 border-2 border-blue-200 rounded-3xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">➕ Nouveau Prospect</h2>
          
          <form onSubmit={handleAddProspect} className="space-y-6">
            {/* Infos principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nom */}
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <label className="block text-sm font-bold text-gray-700 mb-2">👤 Nom*</label>
                <input
                  type="text"
                  required
                  value={formData.nom}
                  onChange={(e) => setFormData({...formData, nom: e.target.value})}
                  placeholder="Jean Dupont"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-medium"
                />
              </div>
              {/* Email */}
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <label className="block text-sm font-bold text-gray-700 mb-2">✉️ Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="jean@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-medium"
                />
              </div>
              {/* Téléphone */}
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <label className="block text-sm font-bold text-gray-700 mb-2">📞 Téléphone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="+33612345678"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-medium"
                />
              </div>
              {/* Valeur potentielle */}
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <label className="block text-sm font-bold text-gray-700 mb-2">💰 Valeur (€)</label>
                <input
                  type="number"
                  value={formData.valeur_potentielle}
                  onChange={(e) => setFormData({...formData, valeur_potentielle: e.target.value})}
                  placeholder="50000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-medium"
                />
              </div>
            </div>

            {/* Statut */}
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <label className="block text-sm font-bold text-gray-700 mb-2">📊 Statut</label>
              <select
                value={formData.statut_pipeline}
                onChange={(e) => setFormData({...formData, statut_pipeline: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-medium bg-white"
              >
                {STATUTS.map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <label className="block text-sm font-bold text-gray-700 mb-2">📝 Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Informations importantes sur ce prospect..."
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
                ✅ Créer le prospect
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setFormData({ nom: '', email: '', phone: '', statut_pipeline: 'nouveau', valeur_potentielle: '', notes: '' })
                }}
                className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-xl font-bold transition-colors"
              >
                ✕ Annuler
              </button>
            </div>
          </form>
        </Card>
      ) : null}

      {/* Liste des prospects */}
      {prospects.length === 0 ? (
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-3xl p-16 text-center shadow-lg">
          <div className="w-20 h-20 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <Plus className="w-10 h-10 text-blue-600" />
          </div>
          <p className="text-gray-800 text-xl font-bold mb-2">Aucun prospect trouvé</p>
          <p className="text-gray-700">Commencez par ajouter votre premier prospect</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {prospects.map((prospect) => {
            const colors = getStatutColor(prospect.statut_pipeline)
            const isNotesOpen = expandedNotes === prospect.id
            const isEditing = editingId === prospect.id

            // Formulaire de modification
            if (isEditing) {
              return (
                <Card key={prospect.id} className="bg-gradient-to-br from-white to-gray-50 border-2 border-yellow-200 rounded-3xl p-8 shadow-lg">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">✏️ Modifier Prospect</h2>
                  
                  <form onSubmit={handleAddProspect} className="space-y-6">
                    {/* Infos principales */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Nom */}
                      <div className="bg-white rounded-xl p-4 border border-gray-200">
                        <label className="block text-sm font-bold text-gray-700 mb-2">👤 Nom*</label>
                        <input
                          type="text"
                          required
                          value={formData.nom}
                          onChange={(e) => setFormData({...formData, nom: e.target.value})}
                          placeholder="Jean Dupont"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-medium"
                        />
                      </div>
                      {/* Email */}
                      <div className="bg-white rounded-xl p-4 border border-gray-200">
                        <label className="block text-sm font-bold text-gray-700 mb-2">✉️ Email</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          placeholder="jean@example.com"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-medium"
                        />
                      </div>
                      {/* Téléphone */}
                      <div className="bg-white rounded-xl p-4 border border-gray-200">
                        <label className="block text-sm font-bold text-gray-700 mb-2">📞 Téléphone</label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          placeholder="+33612345678"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-medium"
                        />
                      </div>
                      {/* Valeur potentielle */}
                      <div className="bg-white rounded-xl p-4 border border-gray-200">
                        <label className="block text-sm font-bold text-gray-700 mb-2">💰 Valeur (€)</label>
                        <input
                          type="number"
                          value={formData.valeur_potentielle}
                          onChange={(e) => setFormData({...formData, valeur_potentielle: e.target.value})}
                          placeholder="50000"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>

                    {/* Statut */}
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <label className="block text-sm font-bold text-gray-700 mb-2">📊 Statut</label>
                      <select
                        value={formData.statut_pipeline}
                        onChange={(e) => setFormData({...formData, statut_pipeline: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-medium bg-white"
                      >
                        {STATUTS.map(s => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                    </div>

                    {/* Notes */}
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <label className="block text-sm font-bold text-gray-700 mb-2">📝 Notes</label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        placeholder="Ajoutez des informations importantes sur ce prospect..."
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
                        ✅ Enregistrer les modifications
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(null)
                          setShowForm(false)
                          setFormData({ nom: '', email: '', phone: '', statut_pipeline: 'nouveau', valeur_potentielle: '', notes: '' })
                        }}
                        className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-xl font-bold transition-colors"
                      >
                        ✕ Annuler
                      </button>
                    </div>
                  </form>
                </Card>
              )
            }
            
            // Affichage normal du prospect
            return (
              <Card key={prospect.id} className={`${colors.bg} border-2 border-gray-200 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all hover:border-blue-300`}>
                {/* Ligne principale */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  {/* Infos prospect */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colors.bg} border-2 border-gray-300`}>
                        <span className="text-lg">👤</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 truncate">
                        {prospect.nom}
                      </h3>
                    </div>
                    
                    {/* Données */}
                    <div className="mt-4 space-y-3">
                      {prospect.email && (
                        <div className="flex items-center gap-2 text-gray-700 text-sm">
                          <Mail className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <span className="truncate">{prospect.email}</span>
                        </div>
                      )}
                      
                      {prospect.phone && (
                        <div className="flex items-center gap-2 text-gray-700 text-sm">
                          <Phone className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <span>{prospect.phone}</span>
                        </div>
                      )}
                      
                      {prospect.valeur_potentielle && (
                        <div className="flex items-center gap-2 text-emerald-700 text-sm font-bold">
                          <TrendingUp className="w-4 h-4 flex-shrink-0" />
                          <span>{prospect.valeur_potentielle.toLocaleString('fr-FR')}€ potentiel</span>
                        </div>
                      )}

                      {prospect.notes && (
                        <button
                          onClick={() => setExpandedNotes(isNotesOpen ? null : prospect.id)}
                          className="flex items-center gap-2 text-amber-700 text-sm font-semibold hover:text-amber-800 transition-colors mt-2"
                        >
                          <StickyNote className="w-4 h-4 flex-shrink-0" />
                          <span>Notes ({prospect.notes.length} caractères)</span>
                          <ChevronDown className={`w-4 h-4 transition-transform ${isNotesOpen ? 'rotate-180' : ''}`} />
                        </button>
                      )}
                    </div>

                    {/* Notes expandables */}
                    {isNotesOpen && prospect.notes && (
                      <div className="mt-4 p-4 bg-amber-50 rounded-lg border-l-4 border-amber-400">
                        <p className="text-gray-800 text-sm whitespace-pre-wrap">{prospect.notes}</p>
                      </div>
                    )}

                    <p className="text-xs text-gray-500 mt-4">
                      📅 Créé le {new Date(prospect.created_at).toLocaleDateString('fr-FR', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3 w-full sm:w-auto sm:items-end">
                    <div className="w-full sm:w-auto">
                      <label className="block text-xs font-bold text-gray-600 mb-1.5">Statut</label>
                      <select
                        value={prospect.statut_pipeline}
                        onChange={(e) => handleUpdateStatus(prospect.id, e.target.value)}
                        className={`w-full sm:w-auto px-3 py-2 rounded-lg border font-bold cursor-pointer transition ${colors.badge} text-center sm:text-left`}
                      >
                        {STATUTS.map(s => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto flex-col-reverse">
                      <button
                        onClick={() => handleDeleteProspect(prospect.id)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-bold transition-all hover:shadow-md whitespace-nowrap"
                      >
                        <Trash2 className="w-4 h-4" />
                        Supprimer
                      </button>
                      <button
                        onClick={() => {
                          setFormData({
                            nom: prospect.nom,
                            email: prospect.email || '',
                            phone: prospect.phone || '',
                            statut_pipeline: prospect.statut_pipeline,
                            valeur_potentielle: prospect.valeur_potentielle ? prospect.valeur_potentielle.toString() : '',
                            notes: prospect.notes || '',
                          })
                          setEditingId(prospect.id)
                          setShowForm(true)
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-bold transition-all hover:shadow-md"
                      >
                        <Edit3 className="w-4 h-4" />
                        Modifier
                      </button>
                    </div>
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