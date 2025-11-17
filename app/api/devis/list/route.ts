import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { getEntrepriseIdFromRequest } from '@/lib/auth'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const dynamic = 'force-dynamic'

/**
 * GET /api/devis/list
 * Récupère UNIQUEMENT les devis de l'entreprise connectée
 */
export async function GET(request: NextRequest) {
  try {
    console.log('📊 [GET /api/devis/list] Request started')
    
    // ✅ Récupérer l'entreprise_id de manière sécurisée
    const entrepriseId = await getEntrepriseIdFromRequest(request)
    console.log('📊 [GET /devis/list] entrepriseId:', entrepriseId)

    // ✅ Récupérer les devis filtrés par entreprise avec les clients
    const { data, error } = await supabaseAdmin
      .from('devis')
      .select(`
        id,
        numero_devis,
        client_id,
        statut,
        montant_total_ht,
        montant_tva,
        montant_total_ttc,
        date_creation,
        clients:client_id (
          id,
          nom,
          email
        )
      `)
      .eq('entreprise_id', entrepriseId)
      .order('date_creation', { ascending: false })

    console.log('📊 [GET /devis/list] Query result:', { count: data?.length || 0, error })

    if (error) {
      console.error('❌ [GET /devis/list] Supabase error:', error)
      throw error
    }

    console.log('✅ [GET /devis/list] Returning', data?.length || 0, 'devis')
    return NextResponse.json({ devis: data })
  } catch (error) {
    console.error('❌ [GET /devis/list] Error:', error)
    const message = error instanceof Error ? error.message : 'Erreur serveur'
    return NextResponse.json(
      { error: message },
      { status: message.includes('authentifié') ? 401 : 500 }
    )
  }
}