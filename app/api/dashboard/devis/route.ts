import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { getEntrepriseIdFromRequest } from '@/lib/auth'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const dynamic = 'force-dynamic'

/**
 * GET /api/dashboard/devis
 * Récupère UNIQUEMENT les devis de l'entreprise connectée
 */
export async function GET(request: NextRequest) {
  try {
    // ✅ Récupérer l'entreprise_id de manière sécurisée
    const entrepriseId = await getEntrepriseIdFromRequest(request)

    // ✅ Récupérer les devis filtrés par entreprise avec les clients
    const { data, error } = await supabaseAdmin
      .from('devis')
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

    return NextResponse.json({ devis: data })
  } catch (error) {
    console.error('Error in GET /api/dashboard/devis:', error)
    const message = error instanceof Error ? error.message : 'Erreur serveur'
    return NextResponse.json(
      { error: message },
      { status: message.includes('authentifié') ? 401 : 500 }
    )
  }
}

/**
 * POST /api/dashboard/devis
 * Créer un nouveau devis pour l'entreprise connectée
 */
export async function POST(request: NextRequest) {
  try {
    // ✅ Récupérer l'entreprise_id
    const entrepriseId = await getEntrepriseIdFromRequest(request)

    // ✅ Parser le body
    const body = await request.json()
    const { 
      numero_devis, 
      client_id, 
      statut, 
      montant_total_ht, 
      montant_tva, 
      montant_total_ttc, 
      date_creation,
      devis_lignes 
    } = body

    if (!numero_devis || !client_id) {
      return NextResponse.json(
        { error: 'numero_devis et client_id sont requis' },
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

    // ✅ Insérer le devis avec entreprise_id
    const { data, error } = await supabaseAdmin
      .from('devis')
      .insert([
        {
          numero_devis,
          client_id,
          statut: statut || 'brouillon',
          montant_total_ht: montant_total_ht || 0,
          montant_tva: montant_tva || 0,
          montant_total_ttc: montant_total_ttc || 0,
          date_creation: date_creation || new Date().toISOString(),
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
    console.error('Error in POST /api/dashboard/devis:', error)
    const message = error instanceof Error ? error.message : 'Erreur serveur'
    return NextResponse.json(
      { error: message },
      { status: message.includes('authentifié') ? 401 : 500 }
    )
  }
}