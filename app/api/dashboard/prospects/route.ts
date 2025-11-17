import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { getEntrepriseIdFromRequest } from '@/lib/auth'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const dynamic = 'force-dynamic'

/**
 * GET /api/dashboard/prospects
 * Récupère UNIQUEMENT les prospects de l'entreprise connectée
 */
export async function GET(request: NextRequest) {
  try {
    console.log('📊 [GET /api/dashboard/prospects] Request started')
    
    // ✅ Récupérer l'entreprise_id de manière sécurisée
    const entrepriseId = await getEntrepriseIdFromRequest(request)
    console.log('📊 [GET] entrepriseId:', entrepriseId)

    // ✅ Récupérer les prospects filtrés par entreprise
    const { data, error } = await supabaseAdmin
      .from('prospects')
      .select('*')
      .eq('entreprise_id', entrepriseId)
      .order('created_at', { ascending: false })

    console.log('📊 [GET] Query result:', { count: data?.length || 0, error })

    if (error) {
      console.error('❌ [GET] Supabase error:', error)
      throw error
    }

    console.log('✅ [GET] Returning', data?.length || 0, 'prospects')
    return NextResponse.json({ data })
  } catch (error) {
    console.error('❌ [GET] Error in GET /api/dashboard/prospects:', error)
    const message = error instanceof Error ? error.message : 'Erreur serveur'
    return NextResponse.json(
      { error: message },
      { status: message.includes('authentifié') ? 401 : 500 }
    )
  }
}

/**
 * POST /api/dashboard/prospects
 * Créer un nouveau prospect pour l'entreprise connectée
 */
export async function POST(request: NextRequest) {
  try {
    console.log('📊 [POST /api/dashboard/prospects] Request started')
    
    // ✅ Récupérer l'entreprise_id
    const entrepriseId = await getEntrepriseIdFromRequest(request)
    console.log('📊 [POST] entrepriseId:', entrepriseId)

    // ✅ Parser le body
    const body = await request.json()
    const { nom, email, phone, statut_pipeline, valeur_potentielle, notes, dernier_contact } = body
    console.log('📊 [POST] Request body:', { nom, email, statut_pipeline })

    if (!nom) {
      return NextResponse.json(
        { error: 'nom est requis' },
        { status: 400 }
      )
    }

    // ✅ Insérer avec entreprise_id
    console.log('📊 [POST] Inserting prospect with entrepriseId:', entrepriseId)
    
    const { data, error } = await supabaseAdmin
      .from('prospects')
      .insert([
        {
          nom,
          email: email || null,
          phone: phone || null,
          statut_pipeline: statut_pipeline || 'nouveau',
          valeur_potentielle: valeur_potentielle || null,
          notes: notes || null,
          dernier_contact: dernier_contact || null,
          entreprise_id: entrepriseId,  // ← CRUCIAL
        }
      ])
      .select()
      .single()

    console.log('📊 [POST] Insert result:', { data: data?.id, error })

    if (error) {
      console.error('❌ [POST] Supabase error:', error)
      throw error
    }

    console.log('✅ [POST] Prospect created:', data?.id)
    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('❌ [POST] Error in POST /api/dashboard/prospects:', error)
    const message = error instanceof Error ? error.message : 'Erreur serveur'
    return NextResponse.json(
      { error: message },
      { status: message.includes('authentifié') ? 401 : 500 }
    )
  }
}