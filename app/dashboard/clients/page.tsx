'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'

interface Client {
  id: string
  nom: string
  prenom?: string
  email?: string
  phone?: string
  ville?: string
  created_at: string
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [companyId, setCompanyId] = useState<string>('')
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    phone: '',
    ville: '',
  })

  useEffect(() => {
    init()
  }, [])

  const init = async () => {
    try {
      // Récupérer le premier utilisateur (c'est nous)
      const { data: user, error: userError } = await supabase
        .from('utilisateurs')
        .select('entreprise_id')
        .limit(1)
        .single()

      if (userError) throw userError
      if (!user) throw new Error('Utilisateur non trouvé')

      setCompanyId(user.entreprise_id)

      // Charger les clients
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
      const { data, error } = await supabase
        .from('clients')
        .insert([{
          nom: formData.nom,
          prenom: formData.prenom,
          email: formData.email,
          phone: formData.phone,
          ville: formData.ville,
          entreprise_id: companyId,
        }])
        .select()
        .single()

      if (error) throw error

      setClients([data, ...clients])
      setFormData({ nom: '', prenom: '', email: '', phone: '', ville: '' })
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

  if (loading) return <p className="p-6">Chargement...</p>

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Clients</h1>
        <Button onClick={() => setShowForm(!showForm)} variant="primary">
          {showForm ? 'Annuler' : 'Ajouter Client'}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <h2 className="text-xl font-bold mb-4">Nouveau Client</h2>
          <form onSubmit={handleAddClient} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Nom *"
                value={formData.nom}
                onChange={(e) => setFormData({...formData, nom: e.target.value})}
                required
              />
              <Input
                label="Prénom"
                value={formData.prenom}
                onChange={(e) => setFormData({...formData, prenom: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
              <Input
                label="Téléphone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            <Input
              label="Ville"
              value={formData.ville}
              onChange={(e) => setFormData({...formData, ville: e.target.value})}
            />
            <Button type="submit" variant="primary">Créer Client</Button>
          </form>
        </Card>
      )}

      {clients.length === 0 ? (
        <p className="text-gray-500">Aucun client. Créez-en un!</p>
      ) : (
        <div className="grid gap-4">
          {clients.map((client) => (
            <Card key={client.id}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{client.nom} {client.prenom || ''}</h3>
                  <p className="text-gray-600">{client.email}</p>
                  <p className="text-gray-600">{client.phone}</p>
                  {client.ville && <p className="text-gray-500">{client.ville}</p>}
                </div>
                <Button
                  onClick={() => handleDeleteClient(client.id)}
                  variant="danger"
                >
                  Supprimer
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}