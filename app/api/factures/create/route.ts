import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { getEntrepriseIdFromRequest } from '@/lib/auth'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const dynamic = 'force-dynamic'

/**
 * POST /api/factures/create
 * Créer une nouvelle facture à partir d'un devis
 */
export async function POST(request: NextRequest) {
  try {
    // ✅ Récupérer l'entreprise_id
    const entrepriseId = await getEntrepriseIdFromRequest(request)

    // ✅ Parser le body
    const body = await request.json()
    const { devis_id, lignes } = body

    if (!devis_id || !lignes || lignes.length === 0) {
      return NextResponse.json(
        { error: 'devis_id et lignes sont requis' },
        { status: 400 }
      )
    }

    console.log('📋 Creating facture from devis:', devis_id)

    // ✅ Récupérer le devis
    const { data: devis, error: devisError } = await supabaseAdmin
      .from('devis')
      .select('*, clients(id, nom, email), entreprises(id)')
      .eq('id', devis_id)
      .single()

    if (devisError || !devis) {
      console.error('❌ Devis not found:', devisError)
      return NextResponse.json(
        { error: 'Devis non trouvé' },
        { status: 404 }
      )
    }

    // ✅ Vérifier que le devis appartient à l'entreprise
    if (devis.entreprises?.id !== entrepriseId) {
      return NextResponse.json(
        { error: 'Vous n\'avez pas accès à ce devis' },
        { status: 403 }
      )
    }

    console.log('✅ Devis found, client_id:', devis.client_id)

    // ✅ Générer le numéro de facture
    const dateNow = new Date()
    const year = dateNow.getFullYear()
    const month = String(dateNow.getMonth() + 1).padStart(2, '0')
    const day = String(dateNow.getDate()).padStart(2, '0')
    const randomNum = Math.floor(Math.random() * 10000)
    const numero_facture = `FAC-${year}${month}${day}-${randomNum}`

    console.log('📝 Generated facture number:', numero_facture)

    // ✅ Calculer les totaux
    let totalHT = 0
    let totalTVA = 0

    lignes.forEach((ligne: any) => {
      const sousTotal = ligne.quantite * ligne.prix_unitaire
      totalHT += sousTotal
      totalTVA += sousTotal * (ligne.taux_tva / 100)
    })

    const totalTTC = totalHT + totalTVA

    console.log('💰 Totals:', { totalHT, totalTVA, totalTTC })

    // ✅ Créer la facture
    const { data: facture, error: factureError } = await supabaseAdmin
      .from('factures')
      .insert([
        {
          numero_facture,
          client_id: devis.client_id,
          entreprise_id: entrepriseId,
          devis_id: devis_id,
          statut: 'en attente',
          montant_total_ht: totalHT,
          montant_tva: totalTVA,
          montant_total_ttc: totalTTC,
          montant_paye: 0,
          date_creation: new Date().toISOString(),
          date_echeance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 jours
          date_paiement: null,
        },
      ])
      .select()
      .single()

    if (factureError || !facture) {
      console.error('❌ Error creating facture:', factureError)
      throw factureError
    }

    console.log('✅ Facture created:', facture.id)

    // ✅ Créer les lignes de facture
    const factureLignes = lignes.map((ligne: any) => ({
      facture_id: facture.id,
      description: ligne.description,
      quantite: ligne.quantite,
      prix_unitaire: ligne.prix_unitaire,
      taux_tva: ligne.taux_tva,
    }))

    const { error: lignesError } = await supabaseAdmin
      .from('factures_lignes')
      .insert(factureLignes)

    if (lignesError) {
      console.error('❌ Error creating facture lines:', lignesError)
      throw lignesError
    }

    console.log('✅ Facture lines created:', factureLignes.length)

    // ✅ Mettre à jour le statut du devis à "facturé"
    const { error: updateDevisError } = await supabaseAdmin
      .from('devis')
      .update({ statut_facturation: 'facturé' })
      .eq('id', devis_id)

    if (updateDevisError) {
      console.warn('⚠️  Warning updating devis status:', updateDevisError)
      // On continue même si cette mise à jour échoue
    }

    return NextResponse.json(
      {
        success: true,
        facture: {
          id: facture.id,
          numero_facture: facture.numero_facture,
          montant_total_ttc: facture.montant_total_ttc,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('❌ Error in POST /api/factures/create:', error)
    const message = error instanceof Error ? error.message : 'Erreur serveur'
    return NextResponse.json(
      { error: message },
      { status: message.includes('authentifié') ? 401 : 500 }
    )
  }
}