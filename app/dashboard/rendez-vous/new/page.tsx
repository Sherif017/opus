'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { useRouter } from 'next/navigation'

interface Client {
  id: string
  nom: string
}

export default function NewRendezVousPage() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [companyId, setCompanyId] = useState<string>('')
  const [clientId, setClientId] = useState<string>('')
  const [dateRendezVous, setDateRendezVous] = useState<string>('')
  const [heureRendezVous, setHeureRendezVous] = useState<string>('')
  const [type, setType] = useState<string>('appel')
  const [description, setDescription] = useState<string>('')
  const [statut, setStatut] = useState<string>('en_attente')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = async () => {
    try {
      const { data: user, error: userError } = await supabase
        .from('utilisateurs')
        .select('entreprise_id')
        .limit(1)
        .single()

      if (userError) {
        console.error('Erreur utilisateur:', userError)
        return
      }

      if (!user) return
      setCompanyId(user.entreprise_id)

      const { data, error } = await supabase
        .from('clients')
        .select('id, nom')
        .eq('entreprise_id', user.entreprise_id)
        .order('nom')

      if (error) {
        console.error('Erreur clients:', error)
        return
      }

      setClients(data || [])
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleCreateRendezVous = async () => {
    if (!clientId || !dateRendezVous || !heureRendezVous) {
      alert('Veuillez remplir tous les champs obligatoires')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase
        .from('rendez_vous')
        .insert([{
          entreprise_id: companyId,
          client_id: clientId,
          date_rendez_vous: dateRendezVous,
          heure_rendez_vous: heureRendezVous,
          type: type,
          description: description || null,
          statut: statut,
        }])

      if (error) {
        console.error('Erreur insertion:', error)
        throw error
      }

      alert('Rendez-vous créé!')
      router.push('/dashboard/rendez-vous')
    } catch (error) {
      console.error('Error:', error)
      alert('Erreur: ' + (error instanceof Error ? error.message : 'Unknown'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Créer un Rendez-vous</h1>

      <Card className="mb-6">
        <h2 className="font-bold mb-4">Client</h2>
        <select
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          className="border rounded px-3 py-2 w-full"
        >
          <option value="">Sélectionner un client</option>
          {clients.map(c => (
            <option key={c.id} value={c.id}>{c.nom}</option>
          ))}
        </select>
      </Card>

      <Card className="mb-6">
        <h2 className="font-bold mb-4">Informations du Rendez-vous</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Date</label>
            <Input
              type="date"
              value={dateRendezVous}
              onChange={(e) => setDateRendezVous(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Heure</label>
            <Input
              type="time"
              value={heureRendezVous}
              onChange={(e) => setHeureRendezVous(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="border rounded px-3 py-2 w-full"
            >
              <option value="appel">Appel</option>
              <option value="visite">Visite</option>
              <option value="démo">Démo</option>
              <option value="réunion">Réunion</option>
              <option value="autre">Autre</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Statut</label>
            <select
              value={statut}
              onChange={(e) => setStatut(e.target.value)}
              className="border rounded px-3 py-2 w-full"
            >
              <option value="en_attente">En attente</option>
              <option value="confirmé">Confirmé</option>
              <option value="complété">Complété</option>
              <option value="annulé">Annulé</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Description (optionnel)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border rounded px-3 py-2 w-full h-24"
              placeholder="Ajouter des notes..."
            />
          </div>
        </div>
      </Card>

      <div className="flex gap-2">
        <Button
          onClick={handleCreateRendezVous}
          variant="primary"
          disabled={loading}
          className="flex-1"
        >
          {loading ? 'Création...' : 'Créer Rendez-vous'}
        </Button>
        <Button onClick={() => router.back()} variant="secondary">
          Annuler
        </Button>
      </div>
    </div>
  )
}