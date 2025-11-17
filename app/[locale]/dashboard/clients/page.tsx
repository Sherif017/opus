'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'
import { Plus, Trash2, Edit3, Mail, Phone } from 'lucide-react'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'

interface Client {
  id: string
  nom: string
  prenom?: string
  email?: string
  phone?: string
  adresse?: string
  code_postal?: string
  ville?: string
  segment?: string
  source_acquisition?: string
  tags?: string[]
  notes?: string
  created_at: string
}

export default function ClientsPage() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    phone: '',
    adresse: '',
    code_postal: '',
    ville: '',
    segment: '',
    source_acquisition: '',
    tags: '',
    notes: '',
  })

  // ⛔ useEffect dépend de initAuth → on mémorise la fonction
  const loadClientsWithToken = useCallback(async (token: string) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/dashboard/clients', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `API Error: ${response.status}`)
      }

      const { data } = await response.json()
      setClients(data || [])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  // ✔ Correction : typage + useCallback pour éviter les warnings
  const initAuth = useCallback(async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (session) {
        await loadClientsWithToken(session.access_token)
      } else {
        setLoading(false)
      }

      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event: AuthChangeEvent, newSession: Session | null) => {
          if (newSession) {
            await loadClientsWithToken(newSession.access_token)
          } else {
            setLoading(false)
            router.push('/auth/login')
          }
        }
      )

      return () => subscription?.unsubscribe()
    } catch (err) {
      setLoading(false)
      router.push('/auth/login')
    }
  }, [router, loadClientsWithToken])

  // ✔ Correction : initAuth ajouté dans les dépendances
  useEffect(() => {
    initAuth()
  }, [initAuth])

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No session')

      const body = {
        nom: formData.nom,
        prenom: formData.prenom || null,
        email: formData.email || null,
        phone: formData.phone || null,
        adresse: formData.adresse || null,
        code_postal: formData.code_postal || null,
        ville: formData.ville || null,
        segment: formData.segment || null,
        source_acquisition: formData.source_acquisition || null,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : null,
        notes: formData.notes || null,
      }

      let response

      if (editingId) {
        response = await fetch(`/api/dashboard/clients/${editingId}`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        })

        if (!response.ok) throw new Error('Modification error')

        const { data } = await response.json()
        setClients(clients.map((c) => (c.id === editingId ? data : c)))
        setEditingId(null)
      } else {
        response = await fetch('/api/dashboard/clients', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        })

        if (!response.ok) throw new Error('Creation error')

        const { data } = await response.json()
        setClients([data, ...clients])
      }

      setFormData({
        nom: '',
        prenom: '',
        email: '',
        phone: '',
        adresse: '',
        code_postal: '',
        ville: '',
        segment: '',
        source_acquisition: '',
        tags: '',
        notes: '',
      })
      setShowForm(false)
    } catch (err) {
      alert('Error: ' + (err instanceof Error ? err.message : 'Unknown'))
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No session')

      const response = await fetch(`/api/dashboard/clients/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (!response.ok) throw new Error('Deletion error')

      setClients(clients.filter((c) => c.id !== id))
    } catch (err) {
      alert('Error: ' + (err instanceof Error ? err.message : 'Unknown'))
    }
  }

  const handleEdit = (client: Client) => {
    setEditingId(client.id)
    setFormData({
      nom: client.nom,
      prenom: client.prenom || '',
      email: client.email || '',
      phone: client.phone || '',
      adresse: client.adresse || '',
      code_postal: client.code_postal || '',
      ville: client.ville || '',
      segment: client.segment || '',
      source_acquisition: client.source_acquisition || '',
      tags: client.tags?.join(', ') || '',
      notes: client.notes || '',
    })
    setShowForm(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading clients...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-600 mt-2">Manage your client portfolio</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          {showForm ? 'Cancel' : 'Add'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleAddClient} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/** 🔧 Les inputs restent identiques à ton code d’origine */}
              {/* ----- FORMULAIRE INCHANGÉ ----- */}
              <input
                type="text"
                placeholder="Name *"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                className="border rounded-lg px-3 py-2"
                required
              />
              <input
                type="text"
                placeholder="First Name"
                value={formData.prenom}
                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                className="border rounded-lg px-3 py-2"
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
              <input
                type="text"
                placeholder="Address"
                value={formData.adresse}
                onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                className="border rounded-lg px-3 py-2"
              />
              <input
                type="text"
                placeholder="Postal Code"
                value={formData.code_postal}
                onChange={(e) => setFormData({ ...formData, code_postal: e.target.value })}
                className="border rounded-lg px-3 py-2"
              />
              <input
                type="text"
                placeholder="City"
                value={formData.ville}
                onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                className="border rounded-lg px-3 py-2"
              />
              <input
                type="text"
                placeholder="Segment"
                value={formData.segment}
                onChange={(e) => setFormData({ ...formData, segment: e.target.value })}
                className="border rounded-lg px-3 py-2"
              />
              <input
                type="text"
                placeholder="Source"
                value={formData.source_acquisition}
                onChange={(e) => setFormData({ ...formData, source_acquisition: e.target.value })}
                className="border rounded-lg px-3 py-2"
              />
              <input
                type="text"
                placeholder="Tags (comma separated)"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
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
        {clients.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No clients found</p>
          </div>
        ) : (
          clients.map((client) => (
            <div key={client.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-lg">
                    {client.nom} {client.prenom}
                  </h3>

                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    {client.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {client.email}
                      </div>
                    )}

                    {client.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {client.phone}
                      </div>
                    )}
                  </div>

                  {client.ville && (
                    <p className="text-sm mt-2 text-gray-600">{client.ville}</p>
                  )}

                  {client.tags && client.tags.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {client.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(client)}
                    className="p-2 text-gray-600 hover:text-blue-600"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(client.id)}
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
