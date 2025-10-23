'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
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

  const loadClients = async () => {
    try {
      const { data: user } = await supabase
        .from('utilisateurs')
        .select('entreprise_id')
        .limit(1)
        .single()

      if (!user) return
      setCompanyId(user.entreprise_id)

      const { data } = await supabase
        .from('clients')
        .select('id, nom')
        .eq('entreprise_id', user.entreprise_id)

      setClients(data || [])
    } catch (error) {
      console.error('Error:', error)
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
      
      // Générer numéro devis
      const numero = `DEV-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`

      // Créer devis avec les montants
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

      // Créer lignes
      for (const ligne of lignes) {
        await supabase.from('devis_lignes').insert([{
          devis_id: devisData.id,
          description: ligne.description,
          quantite: ligne.quantite,
          prix_unitaire: ligne.prix_unitaire,
          taux_tva: ligne.taux_tva,
        }])
      }

      alert('Devis créé!')
      router.push('/dashboard/devis')
    } catch (error) {
      console.error('Error:', error)
      alert('Erreur: ' + (error instanceof Error ? error.message : 'Unknown'))
    } finally {
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

        <div className="space-y-3 mb-4">
          {lignes.map((ligne, index) => (
            <div key={index} className="grid grid-cols-5 gap-2">
              <Input
                placeholder="Description"
                value={ligne.description}
                onChange={(e) => handleLigneChange(index, 'description', e.target.value)}
              />
              <Input
                type="number"
                placeholder="Quantité"
                value={ligne.quantite}
                onChange={(e) => handleLigneChange(index, 'quantite', e.target.value)}
              />
              <Input
                type="number"
                placeholder="Prix unitaire"
                value={ligne.prix_unitaire}
                onChange={(e) => handleLigneChange(index, 'prix_unitaire', e.target.value)}
              />
              <Input
                type="number"
                placeholder="TVA %"
                value={ligne.taux_tva}
                onChange={(e) => handleLigneChange(index, 'taux_tva', e.target.value)}
              />
              <Button
                onClick={() => handleRemoveLigne(index)}
                variant="danger"
              >
                Supprimer
              </Button>
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