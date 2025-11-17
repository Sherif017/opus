import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { getEntrepriseIdFromRequest } from '@/lib/auth'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const dynamic = 'force-dynamic'

/**
 * GET /api/dashboard/rendez-vous
 * Récupère UNIQUEMENT les rendez-vous de l'entreprise connectée
 */
export async function GET(request: NextRequest) {
  try {
    // ✅ Récupérer l'entreprise_id de manière sécurisée
    const entrepriseId = await getEntrepriseIdFromRequest(request)

    // ✅ Récupérer les rendez-vous filtrés par entreprise avec les clients
    const { data, error } = await supabaseAdmin
      .from('rendez_vous')
      .select(`
        *,
        clients (
          id,
          nom
        )
      `)
      .eq('entreprise_id', entrepriseId)
      .order('date_rendez_vous', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    return NextResponse.json({ rdvs: data })
  } catch (error) {
    console.error('Error in GET /api/dashboard/rendez-vous:', error)
    const message = error instanceof Error ? error.message : 'Erreur serveur'
    return NextResponse.json(
      { error: message },
      { status: message.includes('authentifié') ? 401 : 500 }
    )
  }
}

/**
 * POST /api/dashboard/rendez-vous
 * Créer un nouveau rendez-vous pour l'entreprise connectée
 */
export async function POST(request: NextRequest) {
  try {
    // ✅ Récupérer l'entreprise_id
    const entrepriseId = await getEntrepriseIdFromRequest(request)

    // ✅ Parser le body
    const body = await request.json()
    const { 
      client_id, 
      date_rendez_vous, 
      heure_rendez_vous,
      type,
      description,
      statut
    } = body

    if (!client_id || !date_rendez_vous || !heure_rendez_vous) {
      return NextResponse.json(
        { error: 'client_id, date_rendez_vous et heure_rendez_vous sont requis' },
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

    // ✅ Insérer le rendez-vous avec entreprise_id
    const { data, error } = await supabaseAdmin
      .from('rendez_vous')
      .insert([
        {
          client_id,
          date_rendez_vous,
          heure_rendez_vous,
          type: type || 'reunion',
          description: description || null,
          statut: statut || 'en_attente',
          entreprise_id: entrepriseId,  // ← CRUCIAL
        }
      ])
      .select(`
        *,
        clients (
          id,
          nom
        )
      `)
      .single()

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/dashboard/rendez-vous:', error)
    const message = error instanceof Error ? error.message : 'Erreur serveur'
    return NextResponse.json(
      { error: message },
      { status: message.includes('authentifié') ? 401 : 500 }
    )
  }
}