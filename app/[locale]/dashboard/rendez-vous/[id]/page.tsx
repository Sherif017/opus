'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase-client'
import { Card } from '@/components/ui/Card'
import { useRouter, useParams } from 'next/navigation'

interface Client {
  id: string
  nom: string
}

interface RendezVous {
  id: string
  client_id: string
  date_rendez_vous: string
  heure_rendez_vous: string
  type: string
  description?: string
  statut: string
}

export default function EditRendezVousPage() {
  const router = useRouter()
  const params = useParams()
  const rdvId = params.id as string

  const [rdv, setRdv] = useState<RendezVous | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [clientId, setClientId] = useState<string>('')
  const [dateRendezVous, setDateRendezVous] = useState<string>('')
  const [heureRendezVous, setHeureRendezVous] = useState<string>('')
  const [type, setType] = useState<string>('appel')
  const [description, setDescription] = useState<string>('')
  const [statut, setStatut] = useState<string>('en_attente')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const loadData = useCallback(async () => {
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

      // Charger les clients
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('id, nom')
        .eq('entreprise_id', user.entreprise_id)
        .order('nom')

      if (clientsError) {
        console.error('Erreur clients:', clientsError)
      }
      setClients(clientsData || [])

      // Charger le rendez-vous
      const { data: rdvData, error: rdvError } = await supabase
        .from('rendez_vous')
        .select('*')
        .eq('id', rdvId)
        .single()

      if (rdvError) {
        console.error('Erreur RDV:', rdvError)
        throw rdvError
      }

      setRdv(rdvData)
      setClientId(rdvData.client_id)
      setDateRendezVous(rdvData.date_rendez_vous)
      setHeureRendezVous(rdvData.heure_rendez_vous)
      setType(rdvData.type)
      setDescription(rdvData.description || '')
      setStatut(rdvData.statut)
    } catch (error) {
      console.error('Error:', error)
      alert('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }, [rdvId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSaveRendezVous = async () => {
    if (!clientId || !dateRendezVous || !heureRendezVous) {
      alert('Veuillez remplir tous les champs obligatoires')
      return
    }

    setSaving(true)

    try {
      const { error } = await supabase
        .from('rendez_vous')
        .update({
          client_id: clientId,
          date_rendez_vous: dateRendezVous,
          heure_rendez_vous: heureRendezVous,
          type: type,
          description: description || null,
          statut: statut,
        })
        .eq('id', rdvId)

      if (error) {
        console.error('Erreur sauvegarde:', error)
        throw error
      }

      alert('Rendez-vous modifié!')
      router.push('/dashboard/rendez-vous')
    } catch (error) {
      console.error('Error:', error)
      alert('Erreur: ' + (error instanceof Error ? error.message : 'Unknown'))
    } finally {
      setSaving(false)
    }
  }

  const getStatutStyle = (st: string) => {
    const styles: Record<string, string> = {
      en_attente: 'border-l-4 border-yellow-400 bg-yellow-50',
      confirmé: 'border-l-4 border-blue-400 bg-blue-50',
      complété: 'border-l-4 border-green-400 bg-green-50',
      annulé: 'border-l-4 border-red-400 bg-red-50',
    }
    return styles[st] || 'border-l-4 border-gray-400 bg-gray-50'
  }

  if (loading) return <p className="p-6">Chargement...</p>
  if (!rdv) return <p className="p-6">Rendez-vous non trouvé</p>

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Modifier Rendez-vous</h1>

      <Card className={`mb-6 p-6 ${getStatutStyle(statut)}`}>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Statut actuel</p>
            <p className="text-2xl font-bold capitalize">{statut}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Changer le statut</p>
            <select
              value={statut}
              onChange={(e) => setStatut(e.target.value)}
              className="border-2 rounded px-4 py-2 font-semibold"
            >
              <option value="en_attente">En attente</option>
              <option value="confirmé">Confirmé</option>
              <option value="complété">Complété</option>
              <option value="annulé">Annulé</option>
            </select>
          </div>
        </div>
      </Card>

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
            <input
              type="date"
              value={dateRendezVous}
              onChange={(e) => setDateRendezVous(e.target.value)}
              className="border rounded px-3 py-2 w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Heure</label>
            <input
              type="time"
              value={heureRendezVous}
              onChange={(e) => setHeureRendezVous(e.target.value)}
              className="border rounded px-3 py-2 w-full"
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
        <button
          onClick={handleSaveRendezVous}
          disabled={saving}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold transition"
        >
          {saving ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
        </button>
        <button 
          onClick={() => router.back()}
          className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition"
        >
          Annuler
        </button>
      </div>
    </div>
  )
}