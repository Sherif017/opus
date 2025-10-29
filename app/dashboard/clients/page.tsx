'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Plus, Trash2, Mail, Phone, MapPin, User, Edit3, StickyNote, ChevronDown } from 'lucide-react'

interface Client {
  id: string
  nom: string
  prenom?: string
  email?: string
  phone?: string
  ville?: string
  notes?: string
  created_at: string
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [companyId, setCompanyId] = useState<string>('')
  const [expandedNotes, setExpandedNotes] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    phone: '',
    ville: '',
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

      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .eq('entreprise_id', user.entreprise_id)
        .order('created_at', { ascending: false })

      if (clientsError) throw clientsError
      setClients(clientsData || [])
    } catch (error) {
      console.error('Error:', error)
      alert('Erreur: ' + (error instanceof Error ? error.message : 'Unknown'))
    } finally {
      setLoading(false)
    }
  }

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingId) {
        // Modification
        const { error } = await supabase
          .from('clients')
          .update({
            nom: formData.nom,
            prenom: formData.prenom || null,
            email: formData.email || null,
            phone: formData.phone || null,
            ville: formData.ville || null,
            notes: formData.notes || null,
          })
          .eq('id', editingId)

        if (error) throw error

        setClients(clients.map(c => c.id === editingId ? {
          ...c,
          nom: formData.nom,
          prenom: formData.prenom || undefined,
          email: formData.email || undefined,
          phone: formData.phone || undefined,
          ville: formData.ville || undefined,
          notes: formData.notes || undefined,
        } : c))
        
        setEditingId(null)
      } else {
        // Création
        const { data, error } = await supabase
          .from('clients')
          .insert([{
            nom: formData.nom,
            prenom: formData.prenom || null,
            email: formData.email || null,
            phone: formData.phone || null,
            ville: formData.ville || null,
            notes: formData.notes || null,
            entreprise_id: companyId,
          }])
          .select()
          .single()

        if (error) throw error

        setClients([data, ...clients])
      }

      setFormData({ nom: '', prenom: '', email: '', phone: '', ville: '', notes: '' })
      setShowForm(false)
    } catch (error) {
      console.error('Error adding client:', error)
      alert('Erreur: ' + (error instanceof Error ? error.message : 'Unknown'))
    }
  }

  const handleDeleteClient = async (id: string) => {
    if (!confirm('Êtes-vous sûr?')) return

    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id)

      if (error) throw error
      setClients(clients.filter(c => c.id !== id))
    } catch (error) {
      console.error('Error deleting client:', error)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full bg-blue-100 mx-auto mb-4 flex items-center justify-center">
          <User className="w-6 h-6 text-blue-600" />
        </div>
        <p className="text-gray-700 font-semibold">Chargement des clients...</p>
      </div>
    </div>
  )

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-2">Clients</h1>
          <p className="text-lg text-gray-600">{clients.length} client{clients.length !== 1 ? 's' : ''} en base</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null)
            setFormData({ nom: '', prenom: '', email: '', phone: '', ville: '', notes: '' })
            setShowForm(!showForm)
          }}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-2xl font-semibold transition-all shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          {showForm ? 'Annuler' : 'Ajouter un client'}
        </button>
      </div>

      {/* Formulaire création (en haut) */}
      {showForm && !editingId && (
        <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-3xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-1">
            Ajouter un nouveau client
          </h2>
          <p className="text-gray-600 text-sm mb-8">Créez un nouveau client et commencez à gérer votre relation commerciale</p>

          <form onSubmit={handleAddClient} className="space-y-6">
            {/* Nom & Prénom */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <label className="block text-sm font-bold text-gray-700 mb-2">Nom *</label>
                <Input
                  required
                  value={formData.nom}
                  onChange={(e) => setFormData({...formData, nom: e.target.value})}
                  placeholder="Dupont"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <label className="block text-sm font-bold text-gray-700 mb-2">Prénom</label>
                <Input
                  value={formData.prenom}
                  onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                  placeholder="Jean"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Email & Téléphone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <label className="block text-sm font-bold text-gray-700 mb-2">📧 Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="jean@exemple.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <label className="block text-sm font-bold text-gray-700 mb-2">📱 Téléphone</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="+33 6 12 34 56 78"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Ville */}
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <label className="block text-sm font-bold text-gray-700 mb-2">📍 Ville</label>
              <Input
                value={formData.ville}
                onChange={(e) => setFormData({...formData, ville: e.target.value})}
                placeholder="Paris"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Notes */}
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <label className="block text-sm font-bold text-gray-700 mb-2">📝 Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Ajoutez des informations sur ce client..."
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
                Ajouter ce client
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setFormData({ nom: '', prenom: '', email: '', phone: '', ville: '', notes: '' })
                }}
                className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-xl font-bold transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Liste des clients */}
      {clients.length === 0 ? (
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-3xl p-16 text-center shadow-lg">
          <div className="w-20 h-20 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-10 h-10 text-blue-600" />
          </div>
          <p className="text-gray-800 text-xl font-bold mb-2">Aucun client pour le moment</p>
          <p className="text-gray-700">Commencez par ajouter votre premier client pour gérer vos relations commerciales</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {clients.map((client) => {
            const isNotesOpen = expandedNotes === client.id

            if (editingId === client.id) {
              return (
                <Card key={client.id} className="bg-gradient-to-br from-white to-gray-50 border-2 border-blue-300 rounded-3xl p-8 shadow-lg">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Modifier le client</h3>

                  <form onSubmit={handleAddClient} className="space-y-6">
                    {/* Nom & Prénom */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white rounded-xl p-4 border border-gray-200">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Nom *</label>
                        <Input
                          required
                          value={formData.nom}
                          onChange={(e) => setFormData({...formData, nom: e.target.value})}
                          placeholder="Dupont"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>

                      <div className="bg-white rounded-xl p-4 border border-gray-200">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Prénom</label>
                        <Input
                          value={formData.prenom}
                          onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                          placeholder="Jean"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>

                    {/* Email & Téléphone */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white rounded-xl p-4 border border-gray-200">
                        <label className="block text-sm font-bold text-gray-700 mb-2">📧 Email</label>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          placeholder="jean@exemple.com"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                      <div className="bg-white rounded-xl p-4 border border-gray-200">
                        <label className="block text-sm font-bold text-gray-700 mb-2">📱 Téléphone</label>
                        <Input
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          placeholder="+33 6 12 34 56 78"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>

                    {/* Ville */}
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <label className="block text-sm font-bold text-gray-700 mb-2">📍 Ville</label>
                      <Input
                        value={formData.ville}
                        onChange={(e) => setFormData({...formData, ville: e.target.value})}
                        placeholder="Paris"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    {/* Notes */}
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <label className="block text-sm font-bold text-gray-700 mb-2">📝 Notes</label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        placeholder="Ajoutez des informations sur ce client..."
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
                        Enregistrer les modifications
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(null)
                          setShowForm(false)
                          setFormData({ nom: '', prenom: '', email: '', phone: '', ville: '', notes: '' })
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

            // Affichage normal du client
            return (
              <Card key={client.id} className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all hover:border-blue-300">
                {/* Ligne principale */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  {/* Infos client */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100 border-2 border-gray-300">
                        <span className="text-lg">👤</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 truncate">
                        {client.nom} {client.prenom || ''}
                      </h3>
                    </div>
                    
                    {/* Données */}
                    <div className="mt-4 space-y-3">
                      {client.email && (
                        <div className="flex items-center gap-2 text-gray-700 text-sm">
                          <Mail className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <span className="truncate">{client.email}</span>
                        </div>
                      )}
                      
                      {client.phone && (
                        <div className="flex items-center gap-2 text-gray-700 text-sm">
                          <Phone className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <span>{client.phone}</span>
                        </div>
                      )}
                      
                      {client.ville && (
                        <div className="flex items-center gap-2 text-gray-700 text-sm">
                          <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <span>{client.ville}</span>
                        </div>
                      )}

                      {client.notes && (
                        <button
                          onClick={() => setExpandedNotes(isNotesOpen ? null : client.id)}
                          className="flex items-center gap-2 text-amber-700 text-sm font-semibold hover:text-amber-800 transition-colors mt-2"
                        >
                          <StickyNote className="w-4 h-4 flex-shrink-0" />
                          <span>Notes ({client.notes.length} caractères)</span>
                          <ChevronDown className={`w-4 h-4 transition-transform ${isNotesOpen ? 'rotate-180' : ''}`} />
                        </button>
                      )}
                    </div>

                    {/* Notes expandables */}
                    {isNotesOpen && client.notes && (
                      <div className="mt-4 p-4 bg-amber-50 rounded-lg border-l-4 border-amber-400">
                        <p className="text-gray-800 text-sm whitespace-pre-wrap">{client.notes}</p>
                      </div>
                    )}

                    <p className="text-xs text-gray-500 mt-4">
                      Créé le {new Date(client.created_at).toLocaleDateString('fr-FR', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3 w-full sm:w-auto sm:items-end">
                    <div className="flex gap-2 w-full sm:w-auto flex-col-reverse">
                      <button
                        onClick={() => handleDeleteClient(client.id)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-bold transition-all hover:shadow-md whitespace-nowrap"
                      >
                        <Trash2 className="w-4 h-4" />
                        Supprimer
                      </button>
                      <button
                        onClick={() => {
                          setFormData({
                            nom: client.nom,
                            prenom: client.prenom || '',
                            email: client.email || '',
                            phone: client.phone || '',
                            ville: client.ville || '',
                            notes: client.notes || '',
                          })
                          setEditingId(client.id)
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