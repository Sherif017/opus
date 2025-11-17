import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { getEntrepriseIdFromRequest } from '@/lib/auth'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const dynamic = 'force-dynamic'

/**
 * GET /api/dashboard/factures
 * Récupère UNIQUEMENT les factures de l'entreprise connectée
 */
export async function GET(request: NextRequest) {
  try {
    // ✅ Récupérer l'entreprise_id de manière sécurisée
    const entrepriseId = await getEntrepriseIdFromRequest(request)

    // ✅ Récupérer les factures filtrées par entreprise avec les clients
    const { data, error } = await supabaseAdmin
      .from('factures')
      .select(`
        *,
        clients (
          id,
          nom,
          email
        )
      `)
      .eq('entreprise_id', entrepriseId)
      .order('date_creation', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    return NextResponse.json({ factures: data })
  } catch (error) {
    console.error('Error in GET /api/dashboard/factures:', error)
    const message = error instanceof Error ? error.message : 'Erreur serveur'
    return NextResponse.json(
      { error: message },
      { status: message.includes('authentifié') ? 401 : 500 }
    )
  }
}

/**
 * POST /api/dashboard/factures
 * Créer une nouvelle facture pour l'entreprise connectée
 */
export async function POST(request: NextRequest) {
  try {
    // ✅ Récupérer l'entreprise_id
    const entrepriseId = await getEntrepriseIdFromRequest(request)

    // ✅ Parser le body
    const body = await request.json()
    const { 
      numero_facture, 
      client_id, 
      statut, 
      montant_total_ht, 
      montant_tva, 
      montant_total_ttc,
      montant_paye,
      date_creation,
      date_echeance,
      date_paiement
    } = body

    if (!numero_facture || !client_id) {
      return NextResponse.json(
        { error: 'numero_facture et client_id sont requis' },
        { status: 400 }
      )
    }

    // ✅ Vérifier que le client appartient à l'entreprise
    const { data: clientData, error: clientError } = await supabaseAdmin
      .from('clients')
      .select('entreprise_id')
      .eq('id', client_id)
      .eq('entreprise_id', entrepriseId)
      .single()

    if (clientError || !clientData) {
      return NextResponse.json(
        { error: 'Client non trouvé ou accès refusé' },
        { status: 403 }
      )
    }

    // ✅ Insérer la facture avec entreprise_id
    const { data, error } = await supabaseAdmin
      .from('factures')
      .insert([
        {
          numero_facture,
          client_id,
          statut: statut || 'en attente',
          montant_total_ht: montant_total_ht || 0,
          montant_tva: montant_tva || 0,
          montant_total_ttc: montant_total_ttc || 0,
          montant_paye: montant_paye || 0,
          date_creation: date_creation || new Date().toISOString(),
          date_echeance: date_echeance || null,
          date_paiement: date_paiement || null,
          entreprise_id: entrepriseId,  // ← CRUCIAL
        }
      ])
      .select(`
        *,
        clients (
          id,
          nom,
          email
        )
      `)
      .single()

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/dashboard/factures:', error)
    const message = error instanceof Error ? error.message : 'Erreur serveur'
    return NextResponse.json(
      { error: message },
      { status: message.includes('authentifié') ? 401 : 500 }
    )
  }
}