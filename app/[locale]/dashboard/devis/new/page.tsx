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

interface LigneDevis {
  description: string
  quantite: number
  prix_unitaire: number
  taux_tva: number
}

type LigneDevisField = keyof LigneDevis

export default function NewDevisPage() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [companyId, setCompanyId] = useState<string>('')
  const [clientId, setClientId] = useState<string>('')
  const [lignes, setLignes] = useState<LigneDevis[]>([
    { description: '', quantite: 1, prix_unitaire: 0, taux_tva: 20 },
  ])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadClients()
  }, [])

  /**
   * ✅ Charger les clients de l'utilisateur connecté
   */
  const loadClients = async () => {
    try {
      // ✅ D'abord récupérer l'utilisateur connecté
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.user?.id) {
        console.error('❌ Pas de session')
        return
      }

      console.log('📊 Utilisateur connecté:', session.user.id)

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

      console.log('✅ Entreprise ID:', entrepriseId)

      // ✅ Récupérer les clients de l'entreprise
      const { data, error } = await supabase
        .from('clients')
        .select('id, nom')
        .eq('entreprise_id', entrepriseId)

      if (error) {
        console.error('❌ Erreur récupération clients:', error)
        return
      }

      console.log('✅ Clients chargés:', data)
      setClients(data || [])
    } catch (error) {
      console.error('❌ Error in loadClients:', error)
    }
  }

  const handleAddLigne = () => {
    setLignes([...lignes, { description: '', quantite: 1, prix_unitaire: 0, taux_tva: 20 }])
  }

  const handleRemoveLigne = (index: number) => {
    setLignes(lignes.filter((_, i) => i !== index))
  }

  const handleLigneChange = (index: number, field: LigneDevisField, value: string | number) => {
    const newLignes = [...lignes]
    const typedValue = typeof value === 'string' ? 
      (field === 'description' ? value : parseFloat(value) || 0) 
      : value
    newLignes[index] = { ...newLignes[index], [field]: typedValue }
    setLignes(newLignes)
  }

  const calculateTotal = () => {
    let totalHT = 0
    lignes.forEach(ligne => {
      totalHT += ligne.quantite * ligne.prix_unitaire
    })

    let totalTVA = 0
    lignes.forEach(ligne => {
      const sousTotal = ligne.quantite * ligne.prix_unitaire
      totalTVA += sousTotal * (ligne.taux_tva / 100)
    })

    return { totalHT, totalTVA, totalTTC: totalHT + totalTVA }
  }

  const handleCreateDevis = async () => {
    if (!clientId || lignes.some(l => !l.description || l.prix_unitaire === 0)) {
      alert('Remplissez tous les champs')
      return
    }

    setLoading(true)

    try {
      const { totalHT, totalTVA, totalTTC } = calculateTotal()
      
      const numero = `DEV-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`

      const { data: devisData, error: devisError } = await supabase
        .from('devis')
        .insert([{
          entreprise_id: companyId,
          client_id: clientId,
          numero_devis: numero,
          statut: 'brouillon',
          montant_total_ht: totalHT,
          montant_tva: totalTVA,
          montant_total_ttc: totalTTC,
        }])
        .select()
        .single()

      if (devisError) throw devisError

      for (const ligne of lignes) {
        await supabase.from('devis_lignes').insert([{
          devis_id: devisData.id,
          description: ligne.description,
          quantite: ligne.quantite,
          prix_unitaire: ligne.prix_unitaire,
          taux_tva: ligne.taux_tva,
        }])
      }

      console.log('✅ Devis créé avec succès!')
      
      // ✅ Attendre 500ms avant de rediriger pour que Supabase se synchronise
      setTimeout(() => {
        router.push('/dashboard/devis')
      }, 500)
    } catch (error) {
      console.error('Error:', error)
      alert('Erreur: ' + (error instanceof Error ? error.message : 'Unknown'))
      setLoading(false)
    }
  }

  const { totalHT, totalTVA, totalTTC } = calculateTotal()

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Créer Devis</h1>

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
        <h2 className="font-bold mb-4">Lignes Devis</h2>

        <div className="space-y-4 mb-4">
          {lignes.map((ligne, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Description</label>
                  <Input
                    placeholder="Service/Produit"
                    value={ligne.description}
                    onChange={(e) => handleLigneChange(index, 'description', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Quantité</label>
                  <Input
                    type="number"
                    placeholder="1"
                    value={ligne.quantite}
                    onChange={(e) => handleLigneChange(index, 'quantite', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Prix unitaire</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={ligne.prix_unitaire}
                    onChange={(e) => handleLigneChange(index, 'prix_unitaire', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">TVA %</label>
                  <Input
                    type="number"
                    placeholder="20"
                    value={ligne.taux_tva}
                    onChange={(e) => handleLigneChange(index, 'taux_tva', e.target.value)}
                  />
                </div>
              </div>
              <div className="mt-3">
                <Button
                  onClick={() => handleRemoveLigne(index)}
                  variant="danger"
                  className="w-full"
                >
                  Supprimer
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Button onClick={handleAddLigne} variant="secondary" className="w-full">
          Ajouter Ligne
        </Button>
      </Card>

      <Card className="mb-6 bg-gray-50">
        <div className="space-y-2 text-right">
          <div className="flex justify-between">
            <span>Montant HT:</span>
            <span className="font-bold">{totalHT.toFixed(2)}€</span>
          </div>
          <div className="flex justify-between">
            <span>TVA:</span>
            <span className="font-bold">{totalTVA.toFixed(2)}€</span>
          </div>
          <div className="flex justify-between text-lg border-t pt-2">
            <span>Total TTC:</span>
            <span className="font-bold text-green-600">{totalTTC.toFixed(2)}€</span>
          </div>
        </div>
      </Card>

      <div className="flex gap-2">
        <Button
          onClick={handleCreateDevis}
          variant="primary"
          disabled={loading}
          className="flex-1"
        >
          {loading ? 'Création...' : 'Créer Devis'}
        </Button>
        <Button onClick={() => router.back()} variant="secondary">
          Annuler
        </Button>
      </div>
    </div>
  )
}