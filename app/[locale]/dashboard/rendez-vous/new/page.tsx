'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import { Card } from '@/components/ui/Card'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus } from 'lucide-react'

interface Contact {
  id: string
  nom: string
  type: 'client'
  email?: string
}

export default function NewRendezVousPage() {
  const router = useRouter()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [companyId, setCompanyId] = useState<string>('')
  const [contactId, setContactId] = useState<string>('')
  const [dateRendezVous, setDateRendezVous] = useState<string>('')
  const [heureRendezVous, setHeureRendezVous] = useState<string>('')
  const [type, setType] = useState<string>('appel')
  const [description, setDescription] = useState<string>('')
  const [statut, setStatut] = useState<string>('en_attente')
  const [creatingRdv, setCreatingRdv] = useState(false)

  useEffect(() => {
    loadContacts()
  }, [])

  const loadContacts = async () => {
    try {
      setLoading(true)

      // ✅ Récupérer la session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.user?.id) {
        console.error('❌ Pas de session')
        return
      }

      // ✅ Récupérer l'entreprise_id de l'utilisateur
      const { data: userData, error: userError } = await supabase
        .from('utilisateurs')
        .select('entreprise_id')
        .eq('id', session.user.id)
        .single()

      if (userError || !userData) {
        console.error('❌ Erreur récupération utilisateur:', userError)
        return
      }

      const entrepriseId = userData.entreprise_id
      setCompanyId(entrepriseId)

      // ✅ Charger les clients de l'entreprise
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .eq('entreprise_id', entrepriseId)

      if (clientsError) {
        console.error('❌ Erreur récupération clients:', clientsError)
        return
      }

      const clients = (clientsData || []).map(c => ({
        id: c.id,
        nom: c.nom,
        type: 'client' as const,
        email: c.email,
      }))

      setContacts(clients)
    } catch (error) {
      console.error('❌ Erreur chargement contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRendezVous = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!contactId || !dateRendezVous || !heureRendezVous) {
      alert('Veuillez remplir tous les champs obligatoires')
      return
    }

    setCreatingRdv(true)

    try {
      const { error } = await supabase
        .from('rendez_vous')
        .insert([{
          entreprise_id: companyId,
          client_id: contactId,
          date_rendez_vous: dateRendezVous,
          heure_rendez_vous: heureRendezVous,
          type: type,
          description: description || null,
          statut: statut,
        }])

      if (error) {
        console.error('Erreur création RDV:', error)
        throw error
      }

      alert('Rendez-vous créé avec succès !')
      setTimeout(() => {
        router.push('/dashboard/rendez-vous')
      }, 500)
    } catch (error) {
      console.error('Error:', error)
      alert('Erreur: ' + (error instanceof Error ? error.message : 'Erreur inconnue'))
    } finally {
      setCreatingRdv(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-700 font-semibold">Chargement des contacts...</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-semibold"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour
      </button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Créer un Rendez-vous</h1>
        <p className="text-gray-600">Planifier un nouveau rendez-vous avec un client ou prospect</p>
      </div>

      <form onSubmit={handleCreateRendezVous} className="space-y-6">
        {/* Sélection du contact */}
        <Card className="p-6">
          <h2 className="font-bold text-lg mb-4">👥 Sélectionner un contact</h2>

          {/* Filtre par type */}
          {/* Supprimé - on garde que les clients */}

          {/* Select avec les clients */}
          <select
            value={contactId}
            onChange={(e) => setContactId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-base"
            required
          >
            <option value="">-- Sélectionner un client --</option>
            {contacts.map(contact => (
              <option key={contact.id} value={contact.id}>
                {contact.nom}
                {contact.email && ` - ${contact.email}`}
              </option>
            ))}
          </select>

          {contacts.length === 0 && (
            <p className="text-sm text-gray-500 mt-2">Aucun client disponible</p>
          )}
        </Card>

        {/* Informations du RDV */}
        <Card className="p-6">
          <h2 className="font-bold text-lg mb-4">📅 Informations du Rendez-vous</h2>

          <div className="space-y-4">
            {/* Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={dateRendezVous}
                onChange={(e) => setDateRendezVous(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            {/* Heure */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Heure <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={heureRendezVous}
                onChange={(e) => setHeureRendezVous(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="appel">📞 Appel téléphonique</option>
                <option value="reunion">🤝 Réunion en personne</option>
                <option value="visioconference">💻 Visioconférence</option>
                <option value="visite_chantier">📍 Visite de chantier</option>
                <option value="autre">📌 Autre</option>
              </select>
            </div>

            {/* Statut */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Statut</label>
              <select
                value={statut}
                onChange={(e) => setStatut(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="en_attente">⏳ En attente</option>
                <option value="confirmé">✅ Confirmé</option>
                <option value="complété">✔️ Complété</option>
                <option value="annulé">❌ Annulé</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Notes additionnelles sur le rendez-vous..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
                rows={4}
              />
            </div>
          </div>
        </Card>

        {/* Boutons d'action */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={creatingRdv || !contactId || !dateRendezVous || !heureRendezVous}
            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {creatingRdv ? 'Création en cours...' : 'Créer le Rendez-vous'}
          </button>

          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-colors"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  )
}