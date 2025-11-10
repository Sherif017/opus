import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.slice(7)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // ✅ Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ✅ Récupérer l'entreprise_id
    const { data: userData } = await supabase
      .from('utilisateurs')
      .select('entreprise_id')
      .eq('id', user.id)
      .single()

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { devis_id, lignes } = body

    if (!devis_id || !lignes || lignes.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // ✅ Récupérer le devis
    const { data: devis, error: devisError } = await supabase
      .from('devis')
      .select('*, clients(id, nom, email)')
      .eq('id', devis_id)
      .eq('entreprise_id', userData.entreprise_id)
      .single()

    if (devisError || !devis) {
      return NextResponse.json({ error: 'Devis not found' }, { status: 404 })
    }

    console.log('✅ Devis found:', devis.id)

    // ✅ Calculer les totaux
    let totalHT = 0
    let totalTVA = 0

    lignes.forEach((ligne: any) => {
      const sousTotal = ligne.quantite * ligne.prix_unitaire
      totalHT += sousTotal
      totalTVA += sousTotal * (ligne.taux_tva / 100)
    })

    const totalTTC = totalHT + totalTVA

    // ✅ Générer le numéro de facture
    const numero = `FAC-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`

    // ✅ Créer la facture
    const { data: factureData, error: factureError } = await supabase
      .from('factures')
      .insert([{
        entreprise_id: userData.entreprise_id,
        client_id: devis.client_id,
        devis_id: devis_id,
        numero_facture: numero,
        statut: 'brouillon',
        montant_total_ht: totalHT,
        montant_tva: totalTVA,
        montant_total_ttc: totalTTC,
        date_echeance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 jours
      }])
      .select()
      .single()

    if (factureError) {
      console.error('❌ Facture creation error:', factureError)
      return NextResponse.json({ error: factureError.message }, { status: 500 })
    }

    console.log('✅ Facture created:', factureData.id)

    // ✅ Insérer les lignes de facture
    const lignesData = lignes.map((ligne: any) => ({
      facture_id: factureData.id,
      description: ligne.description,
      quantite: ligne.quantite,
      prix_unitaire: ligne.prix_unitaire,
      taux_tva: ligne.taux_tva,
    }))

    const { error: lignesError } = await supabase
      .from('factures_lignes')
      .insert(lignesData)

    if (lignesError) {
      console.error('❌ Lignes creation error:', lignesError)
      return NextResponse.json({ error: lignesError.message }, { status: 500 })
    }

    console.log('✅ Facture lignes created:', lignesData.length)

    // ✅ Mettre à jour le statut du devis à "facturé"
    const { error: updateError } = await supabase
      .from('devis')
      .update({ statut: 'facturé' })
      .eq('id', devis_id)

    if (updateError) {
      console.error('⚠️ Devis update error (non-critique):', updateError)
    }

    return NextResponse.json({ 
      message: 'Facture created successfully',
      facture: factureData
    })
  } catch (error) {
    console.error('❌ API Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}