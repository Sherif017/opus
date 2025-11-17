'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'
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
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      await loadProspectsWithToken(session.access_token)
    } catch (error) {
      console.error('Error:', error)
      alert('Erreur: ' + (error instanceof Error ? error.message : 'Unknown'))
    } finally {
      setLoading(false)
    }
  }

  const loadProspectsWithToken = async (token: string) => {
    try {
      setLoading(true)

      const response = await fetch('/api/dashboard/prospects', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `API Error: ${response.status}`)
      }

      const { data } = await response.json()
      setProspects(data || [])
    } catch (error) {
      console.error('Error loading prospects:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const handleAddProspect = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No session')

      if (editingId) {
        // Modification
        const response = await fetch(`/api/dashboard/prospects/${editingId}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nom: formData.nom,
            email: formData.email || null,
            phone: formData.phone || null,
            statut_pipeline: formData.statut_pipeline,
            valeur_potentielle: formData.valeur_potentielle ? parseFloat(formData.valeur_potentielle) : null,
            notes: formData.notes || null,
          }),
        })

        if (!response.ok) throw new Error('Modification error')

        const { data } = await response.json()
        setProspects(prospects.map(p => p.id === editingId ? data : p))
        setEditingId(null)
      } else {
        // Création
        const response = await fetch('/api/dashboard/prospects', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nom: formData.nom,
            email: formData.email || null,
            phone: formData.phone || null,
            statut_pipeline: formData.statut_pipeline,
            valeur_potentielle: formData.valeur_potentielle ? parseFloat(formData.valeur_potentielle) : null,
            notes: formData.notes || null,
          }),
        })

        if (!response.ok) throw new Error('Creation error')

        const { data } = await response.json()
        setProspects([data, ...prospects])
      }

      setFormData({
        nom: '',
        email: '',
        phone: '',
        statut_pipeline: 'nouveau',
        valeur_potentielle: '',
        notes: '',
      })
      setShowForm(false)
    } catch (err) {
      console.error('Error adding prospect:', err)
      alert('Error: ' + (err instanceof Error ? err.message : 'Unknown'))
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No session')

      const response = await fetch(`/api/dashboard/prospects/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (!response.ok) throw new Error('Deletion error')

      setProspects(prospects.filter(p => p.id !== id))
    } catch (err) {
      console.error('Error deleting prospect:', err)
      alert('Error: ' + (err instanceof Error ? err.message : 'Unknown'))
    }
  }

  const handleEdit = (prospect: Prospect) => {
    setEditingId(prospect.id)
    setFormData({
      nom: prospect.nom,
      email: prospect.email || '',
      phone: prospect.phone || '',
      statut_pipeline: prospect.statut_pipeline,
      valeur_potentielle: prospect.valeur_potentielle?.toString() || '',
      notes: prospect.notes || '',
    })
    setShowForm(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading prospects...</p>
        </div>
      </div>
    )
  }

  const totalValue = prospects.reduce((sum, p) => sum + (p.valeur_potentielle || 0), 0)

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Prospects</h1>
          <p className="text-gray-600 mt-2">{prospects.length} prospects • Valeur totale : {totalValue.toLocaleString()}€</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          {showForm ? 'Cancel' : 'Add'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleAddProspect} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Name *"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                className="border rounded-lg px-3 py-2"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="border rounded-lg px-3 py-2"
              />
              <input
                type="tel"
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="border rounded-lg px-3 py-2"
              />
              <select
                value={formData.statut_pipeline}
                onChange={(e) => setFormData({ ...formData, statut_pipeline: e.target.value })}
                className="border rounded-lg px-3 py-2"
              >
                {STATUTS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Potential Value"
                value={formData.valeur_potentielle}
                onChange={(e) => setFormData({ ...formData, valeur_potentielle: e.target.value })}
                className="border rounded-lg px-3 py-2"
              />
            </div>
            <textarea
              placeholder="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="border rounded-lg px-3 py-2 w-full"
              rows={3}
            />
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {editingId ? 'Update' : 'Create'}
            </button>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {prospects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No prospects found</p>
          </div>
        ) : (
          prospects.map((prospect) => (
            <div key={prospect.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{prospect.nom}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    {prospect.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {prospect.email}
                      </div>
                    )}
                    {prospect.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {prospect.phone}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-700">
                      {prospect.statut_pipeline}
                    </span>
                    {prospect.valeur_potentielle && (
                      <div className="flex items-center gap-1 text-green-600">
                        <TrendingUp className="w-4 h-4" />
                        {prospect.valeur_potentielle}€
                      </div>
                    )}
                  </div>
                  {prospect.notes && (
                    <button
                      onClick={() => setExpandedNotes(expandedNotes === prospect.id ? null : prospect.id)}
                      className="flex items-center gap-1 mt-2 text-xs text-gray-500 hover:text-gray-700"
                    >
                      <StickyNote className="w-4 h-4" />
                      Notes
                      <ChevronDown className={`w-3 h-3 transition-transform ${expandedNotes === prospect.id ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                  {expandedNotes === prospect.id && prospect.notes && (
                    <p className="text-xs text-gray-600 mt-2 p-2 bg-gray-50 rounded">{prospect.notes}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(prospect)}
                    className="p-2 text-gray-600 hover:text-blue-600"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(prospect.id)}
                    className="p-2 text-gray-600 hover:text-red-600"
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