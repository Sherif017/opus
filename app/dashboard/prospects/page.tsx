'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'

interface Prospect {
  id: string
  nom: string
  email?: string
  phone?: string
  statut_pipeline: string
  valeur_potentielle?: number
  created_at: string
}

const STATUTS = ['nouveau', 'qualifié', 'proposition', 'négociation', 'gagné', 'perdu']

export default function ProspectsPage() {
  const [prospects, setProspects] = useState<Prospect[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [companyId, setCompanyId] = useState<string>('')
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    phone: '',
    statut_pipeline: 'nouveau',
    valeur_potentielle: '',
  })

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
      const { data, error } = await supabase
        .from('prospects')
        .insert([{
          nom: formData.nom,
          email: formData.email || null,
          phone: formData.phone || null,
          statut_pipeline: formData.statut_pipeline,
          valeur_potentielle: formData.valeur_potentielle ? parseFloat(formData.valeur_potentielle) : null,
          entreprise_id: companyId,
        }])
        .select()
        .single()

      if (error) throw error

      setProspects([data, ...prospects])
      setFormData({ nom: '', email: '', phone: '', statut_pipeline: 'nouveau', valeur_potentielle: '' })
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

  if (loading) return <p className="p-6">Chargement...</p>

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Prospects</h1>
        <Button onClick={() => setShowForm(!showForm)} variant="primary">
          {showForm ? 'Annuler' : 'Ajouter Prospect'}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <h2 className="text-xl font-bold mb-4">Nouveau Prospect</h2>
          <form onSubmit={handleAddProspect} className="space-y-4">
            <Input
              label="Nom *"
              value={formData.nom}
              onChange={(e) => setFormData({...formData, nom: e.target.value})}
              required
            />
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
            <Input
              label="Valeur Potentielle (€)"
              type="number"
              value={formData.valeur_potentielle}
              onChange={(e) => setFormData({...formData, valeur_potentielle: e.target.value})}
            />
            <Button type="submit" variant="primary">Créer Prospect</Button>
          </form>
        </Card>
      )}

      {prospects.length === 0 ? (
        <p className="text-gray-500">Aucun prospect. Créez-en un!</p>
      ) : (
        <div className="grid gap-4">
          {prospects.map((prospect) => (
            <Card key={prospect.id}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{prospect.nom}</h3>
                  {prospect.email && <p className="text-gray-600">{prospect.email}</p>}
                  {prospect.phone && <p className="text-gray-600">{prospect.phone}</p>}
                  {prospect.valeur_potentielle && (
                    <p className="text-green-600 font-semibold">{prospect.valeur_potentielle}€</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <select
                    value={prospect.statut_pipeline}
                    onChange={(e) => handleUpdateStatus(prospect.id, e.target.value)}
                    className="border rounded px-2 py-1"
                  >
                    {STATUTS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <Button
                    onClick={() => handleDeleteProspect(prospect.id)}
                    variant="danger"
                  >
                    Supprimer
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}