'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase-client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { useRouter, useParams } from 'next/navigation'

interface Client {
  id: string
  nom: string
}

interface LigneDevis {
  id?: string
  description: string
  quantite: number
  prix_unitaire: number
  taux_tva: number
}

interface Devis {
  id: string
  numero_devis: string
  client_id: string
  statut: string
  montant_total_ht?: number
  montant_tva?: number
  montant_total_ttc?: number
}

type LigneDevisField = keyof Omit<LigneDevis, 'id'>

export default function EditDevisPage() {
  const router = useRouter()
  const params = useParams()
  const devisId = params.id as string

  const [devis, setDevis] = useState<Devis | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [clientId, setClientId] = useState<string>('')
  const [statut, setStatut] = useState<string>('')
  const [lignes, setLignes] = useState<LigneDevis[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const { data: user } = await supabase
        .from('utilisateurs')
        .select('entreprise_id')
        .limit(1)
        .single()

      if (!user) return

      const { data: clientsData } = await supabase
        .from('clients')
        .select('id, nom')
        .eq('entreprise_id', user.entreprise_id)

      setClients(clientsData || [])

      const { data: devisData, error: devisError } = await supabase
        .from('devis')
        .select('*')
        .eq('id', devisId)
        .single()

      if (devisError) {
        console.error('Erreur devis:', devisError)
        throw devisError
      }

      setDevis(devisData as Devis)
      setClientId(devisData.client_id)
      setStatut(devisData.statut)

      const { data: lignesData, error: lignesError } = await supabase
        .from('devis_lignes')
        .select('*')
        .eq('devis_id', devisId)

      if (lignesError) {
        console.error('Erreur lignes:', lignesError)
      }

      setLignes((lignesData || []) as LigneDevis[])
    } catch (error) {
      console.error('Error:', error)
      alert('Erreur lors du chargement du devis')
    } finally {
      setLoading(false)
    }
  }, [devisId])

  useEffect(() => {
    loadData()
  }, [loadData])

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

  const handleSaveDevis = async () => {
    if (!clientId || lignes.some(l => !l.description || l.prix_unitaire === 0)) {
      alert('Remplissez tous les champs')
      return
    }

    setSaving(true)

    try {
      const { totalHT, totalTVA, totalTTC } = calculateTotal()

      // ✅ Mettre à jour le devis avec le nouveau statut
      const { error: updateError } = await supabase
        .from('devis')
        .update({
          client_id: clientId,
          statut: statut,
          montant_total_ht: totalHT,
          montant_tva: totalTVA,
          montant_total_ttc: totalTTC,
        })
        .eq('id', devisId)

      if (updateError) {
        console.error('Erreur mise à jour devis:', updateError.message)
        throw updateError
      }

      const { error: deleteError } = await supabase
        .from('devis_lignes')
        .delete()
        .eq('devis_id', devisId)

      if (deleteError) throw deleteError

      for (const ligne of lignes) {
        const { error: insertError } = await supabase
          .from('devis_lignes')
          .insert({
            devis_id: devisId,
            description: ligne.description,
            quantite: ligne.quantite,
            prix_unitaire: ligne.prix_unitaire,
            taux_tva: ligne.taux_tva,
          })

        if (insertError) throw insertError
      }

      alert('Devis modifié avec succès!')
      router.push('/dashboard/devis')
    } catch (error) {
      console.error('Error:', error)
      alert('Erreur: ' + (error instanceof Error ? error.message : 'Unknown'))
    } finally {
      setSaving(false)
    }
  }

  const getStatutColor = (statutValue: string) => {
    const colors: Record<string, string> = {
      brouillon: 'bg-gray-100 text-gray-700 border border-gray-200',
      envoyé: 'bg-blue-100 text-blue-700 border border-blue-200',
      accepté: 'bg-green-100 text-green-700 border border-green-200',
      rejeté: 'bg-red-100 text-red-700 border border-red-200',
      facturé: 'bg-purple-100 text-purple-700 border border-purple-200',
    }
    return colors[statutValue] || 'bg-gray-100 text-gray-700'
  }

  const { totalHT, totalTVA, totalTTC } = calculateTotal()
  const isFactured = statut === 'facturé'

  if (loading) return <p className="p-6">Chargement...</p>
  if (!devis) return <p className="p-6">Devis non trouvé</p>

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Modifier Devis {devis.numero_devis}</h1>

      {/* Statut */}
      <Card className="mb-6">
        <h2 className="font-bold mb-4">Statut du Devis</h2>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-sm font-semibold text-gray-700 block mb-2">Statut</label>
            <select
              value={statut}
              onChange={(e) => setStatut(e.target.value)}
              className="border rounded px-3 py-2 w-full"
            >
              <option value="brouillon">Brouillon</option>
              <option value="envoyé">Envoyé</option>
              <option value="accepté">Accepté</option>
              <option value="rejeté">Rejeté</option>
              <option value="facturé">Facturé</option>
            </select>
          </div>
          <div className={`px-3 py-2 rounded font-semibold text-sm ${getStatutColor(statut)} mt-6`}>
            {statut}
          </div>
        </div>
      </Card>

      {isFactured && (
        <Card className="mb-6 bg-red-50 border-2 border-red-200 p-4">
          <p className="text-sm text-red-600">
            ⚠️ Ce devis a été facturé. Soyez prudent lors de sa modification.
          </p>
        </Card>
      )}

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
          onClick={handleSaveDevis}
          variant="primary"
          disabled={saving}
          className="flex-1"
        >
          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </Button>
        <Button onClick={() => router.back()} variant="secondary">
          Annuler
        </Button>
      </div>
    </div>
  )
}