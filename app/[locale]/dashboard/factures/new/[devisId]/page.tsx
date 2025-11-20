'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useRouter, useParams } from 'next/navigation'
import { FileText, ArrowLeft } from 'lucide-react'

interface Client {
  id: string
  nom: string
  email?: string
}

interface LigneDevis {
  id: string
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
  clients?: Client
}

export default function CreateFactureFromDevisPage() {
  const router = useRouter()
  const params = useParams()
  const devisId = params.devisId as string

  const [devis, setDevis] = useState<Devis | null>(null)
  const [lignes, setLignes] = useState<LigneDevis[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!devisId) {
      setError('ID du devis manquant')
      setLoading(false)
      return
    }
    loadDevis()
  }, [devisId])

  const loadDevis = async () => {
    try {
      setLoading(true)
      setError(null)

      // ✅ Récupérer le devis
      const { data: devisData, error: devisError } = await supabase
        .from('devis')
        .select('*, clients(id, nom, email)')
        .eq('id', devisId)
        .single()

      if (devisError || !devisData) {
        setError('Devis non trouvé')
        return
      }

      setDevis(devisData as Devis)

      // ✅ Récupérer les lignes du devis
      const { data: lignesData, error: lignesError } = await supabase
        .from('devis_lignes')
        .select('*')
        .eq('devis_id', devisId)

      if (lignesError) {
        setError('Erreur lors du chargement des lignes')
        return
      }

      setLignes(lignesData || [])
    } catch (err) {
      console.error('Error:', err)
      setError('Erreur lors du chargement du devis')
    } finally {
      setLoading(false)
    }
  }

  const calculateTotal = () => {
    let totalHT = 0
    let totalTVA = 0

    lignes.forEach(ligne => {
      const sousTotal = ligne.quantite * ligne.prix_unitaire
      totalHT += sousTotal
      totalTVA += sousTotal * (ligne.taux_tva / 100)
    })

    return { totalHT, totalTVA, totalTTC: totalHT + totalTVA }
  }

  const handleCreateFacture = async () => {
    if (!devis || lignes.length === 0) {
      alert('Données incomplètes')
      return
    }

    setCreating(true)

    try {
      // ✅ Récupérer le token
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        setError('Pas de session active')
        return
      }

      // ✅ Appeler l'API sécurisée
      const response = await fetch('/api/factures/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          devis_id: devis.id,
          lignes: lignes,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Erreur lors de la création')
        return
      }

      console.log('✅ Facture créée:', data.facture)
      alert('Facture créée avec succès !')

      // ✅ Rediriger vers la page factures
      setTimeout(() => {
        router.push('/dashboard/factures')
      }, 500)
    } catch (err) {
      console.error('Error:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-blue-100 mx-auto mb-4 flex items-center justify-center">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-gray-700 font-semibold">Chargement du devis...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>
        <Card className="bg-red-50 border border-red-200 p-6 text-center">
          <p className="text-red-700 font-semibold">{error}</p>
        </Card>
      </div>
    )
  }

  if (!devis) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>
        <Card className="bg-yellow-50 border border-yellow-200 p-6 text-center">
          <p className="text-yellow-700 font-semibold">Devis non trouvé</p>
        </Card>
      </div>
    )
  }

  const { totalHT, totalTVA, totalTTC } = calculateTotal()

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-semibold"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour
      </button>

      <h1 className="text-3xl font-bold mb-2">Créer Facture</h1>
      <p className="text-gray-600 mb-6">À partir du devis {devis.numero_devis}</p>

      {/* Infos Devis */}
      <Card className="mb-6">
        <h2 className="font-bold mb-4 text-lg">Informations du Devis</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Devis</p>
            <p className="font-semibold">{devis.numero_devis}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Client</p>
            <p className="font-semibold">{devis.clients?.nom}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="font-semibold">{devis.clients?.email || 'Non disponible'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Statut</p>
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded font-semibold text-sm">
              {devis.statut}
            </span>
          </div>
        </div>
      </Card>

      {/* Lignes */}
      <Card className="mb-6">
        <h2 className="font-bold mb-4 text-lg">Lignes de Facture</h2>

        {lignes.length === 0 ? (
          <p className="text-gray-600 text-center py-8">Aucune ligne de devis</p>
        ) : (
          <div className="space-y-3">
            {lignes.map((ligne, index) => (
              <div key={ligne.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-sm">
                  <div className="md:col-span-2">
                    <p className="text-gray-600 text-xs mb-1 font-semibold">Description</p>
                    <p className="font-medium">{ligne.description}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs mb-1 font-semibold">Quantité</p>
                    <p className="font-medium">{ligne.quantite}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs mb-1 font-semibold">Prix unitaire</p>
                    <p className="font-medium">{ligne.prix_unitaire.toFixed(2)}€</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs mb-1 font-semibold">TVA</p>
                    <p className="font-medium">{ligne.taux_tva}%</p>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-300">
                  <p className="text-right text-gray-700 font-semibold">
                    Sous-total: {(ligne.quantite * ligne.prix_unitaire).toFixed(2)}€
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Totaux */}
      <Card className="mb-6 bg-gray-50">
        <div className="space-y-3 text-right">
          <div className="flex justify-between">
            <span>Montant HT:</span>
            <span className="font-bold">{totalHT.toFixed(2)}€</span>
          </div>
          <div className="flex justify-between">
            <span>TVA:</span>
            <span className="font-bold">{totalTVA.toFixed(2)}€</span>
          </div>
          <div className="flex justify-between text-lg border-t pt-3">
            <span>Total TTC:</span>
            <span className="font-bold text-green-600">{totalTTC.toFixed(2)}€</span>
          </div>
        </div>
      </Card>

      {/* Boutons */}
      <div className="flex gap-2">
        <Button
          onClick={handleCreateFacture}
          variant="primary"
          disabled={creating || lignes.length === 0}
          className="flex-1"
        >
          {creating ? 'Création...' : 'Créer Facture'}
        </Button>
        <Button onClick={() => router.back()} variant="secondary">
          Annuler
        </Button>
      </div>
    </div>
  )
}