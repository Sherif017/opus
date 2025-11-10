import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { getEntrepriseIdFromRequest } from '@/lib/auth'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const dynamic = 'force-dynamic'

/**
 * GET /api/dashboard/clients
 * Récupère UNIQUEMENT les clients de l'entreprise connectée
 */
export async function GET(request: NextRequest) {
  try {
    // ✅ Récupérer l'entreprise_id de manière sécurisée
    const entrepriseId = await getEntrepriseIdFromRequest(request)

    // ✅ Récupérer les clients filtrés par entreprise
    const { data, error } = await supabaseAdmin
      .from('clients')
      .select('*')
      .eq('entreprise_id', entrepriseId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error in GET /api/dashboard/clients:', error)
    const message = error instanceof Error ? error.message : 'Erreur serveur'
    return NextResponse.json(
      { error: message },
      { status: message.includes('authentifié') ? 401 : 500 }
    )
  }
}

/**
 * POST /api/dashboard/clients
 * Créer un nouveau client pour l'entreprise connectée
 */
export async function POST(request: NextRequest) {
  try {
    // ✅ Créer le client DANS la fonction
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // ✅ Récupérer l'entreprise_id
    const entrepriseId = await getEntrepriseIdFromRequest(request)

    // ✅ Parser le body
    const body = await request.json()
    const { nom, prenom, email, phone, adresse, code_postal, ville, segment, source_acquisition, tags, notes } = body

    if (!nom || !email) {
      return NextResponse.json(
        { error: 'nom et email sont requis' },
        { status: 400 }
      )
    }

    // ✅ Insérer avec entreprise_id
    const { data, error } = await supabaseAdmin
      .from('clients')
      .insert([
        {
          nom,
          prenom: prenom || null,
          email,
          phone: phone || null,
          adresse: adresse || null,
          code_postal: code_postal || null,
          ville: ville || null,
          segment: segment || null,
          source_acquisition: source_acquisition || null,
          tags: tags || null,
          notes: notes || null,
          entreprise_id: entrepriseId,  // ← CRUCIAL
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/dashboard/clients:', error)
    const message = error instanceof Error ? error.message : 'Erreur serveur'
    return NextResponse.json(
      { error: message },
      { status: message.includes('authentifié') ? 401 : 500 }
    )
  }
}