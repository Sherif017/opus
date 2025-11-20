import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { getEntrepriseIdFromRequest } from '@/lib/auth'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const dynamic = 'force-dynamic'

/**
 * GET /api/dashboard/relances
 * Récupère UNIQUEMENT les prospects avec relances de l'entreprise connectée
 */
export async function GET(request: NextRequest) {
  try {
    console.log('📋 [RELANCES] Starting GET /api/dashboard/relances')
    
    // ✅ Récupérer l'entreprise_id de manière sécurisée
    let entrepriseId: string
    try {
      entrepriseId = await getEntrepriseIdFromRequest(request)
      console.log('✅ [RELANCES] Enterprise ID:', entrepriseId)
    } catch (authError) {
      console.error('❌ [RELANCES] Auth error:', authError)
      return NextResponse.json(
        { error: `Authentification: ${authError instanceof Error ? authError.message : 'Erreur inconnue'}` },
        { status: 401 }
      )
    }

    // ✅ Récupérer les prospects filtrés par entreprise
    console.log('📋 [RELANCES] Fetching prospects...')
    const { data, error } = await supabaseAdmin
      .from('prospects')
      .select(`
        *,
        relances_historique (
          id,
          numero_relance,
          texte_relance,
          date_envoi,
          email_recipient
        )
      `)
      .eq('entreprise_id', entrepriseId)
      .order('dernier_contact', { ascending: false })

    if (error) {
      console.error('❌ [RELANCES] Supabase error:', error)
      return NextResponse.json(
        { error: `Erreur base de données: ${error.message}` },
        { status: 500 }
      )
    }

    console.log('✅ [RELANCES] Prospects fetched:', data?.length)

    // Récupérer aussi les infos de l'entreprise
    const { data: companyData } = await supabaseAdmin
      .from('entreprises')
      .select('nom')
      .eq('id', entrepriseId)
      .single()

    console.log('✅ [RELANCES] Company data:', companyData?.nom)

    return NextResponse.json({ 
      prospects: data,
      companyName: companyData?.nom || ''
    })
  } catch (error) {
    console.error('❌ [RELANCES] Unexpected error:', error)
    const message = error instanceof Error ? error.message : 'Erreur serveur'
    return NextResponse.json(
      { error: `Erreur: ${message}` },
      { status: 500 }
    )
  }
}

/**
 * POST /api/dashboard/relances
 * Créer/envoyer une relance pour un prospect
 */
export async function POST(request: NextRequest) {
  try {
    console.log('📋 [RELANCES] Starting POST /api/dashboard/relances')
    
    // ✅ Récupérer l'entreprise_id
    const entrepriseId = await getEntrepriseIdFromRequest(request)

    // ✅ Parser le body
    const body = await request.json()
    const { 
      prospect_id,
      email_recipient,
      sujet_email,
      texte_relance,
      numero_relance
    } = body

    if (!prospect_id || !email_recipient) {
      return NextResponse.json(
        { error: 'prospect_id et email_recipient sont requis' },
        { status: 400 }
      )
    }

    // ✅ Vérifier que le prospect appartient à l'entreprise
    const { data: prospectData, error: prospectError } = await supabaseAdmin
      .from('prospects')
      .select('entreprise_id')
      .eq('id', prospect_id)
      .eq('entreprise_id', entrepriseId)
      .single()

    if (prospectError || !prospectData) {
      return NextResponse.json(
        { error: 'Prospect non trouvé ou accès refusé' },
        { status: 403 }
      )
    }

    // ✅ Ajouter à l'historique des relances
    const { data: relanceData, error: relanceError } = await supabaseAdmin
      .from('relances_historique')
      .insert([
        {
          prospect_id,
          entreprise_id: entrepriseId,
          email_recipient,
          sujet_email,
          texte_relance,
          numero_relance: numero_relance || 1,
          date_envoi: new Date().toISOString(),
        }
      ])
      .select()
      .single()

    if (relanceError) {
      console.error('❌ [RELANCES] Supabase error:', relanceError)
      throw relanceError
    }

    console.log('✅ [RELANCES] Relance created successfully')

    return NextResponse.json({ data: relanceData }, { status: 201 })
  } catch (error) {
    console.error('❌ [RELANCES] Error in POST:', error)
    const message = error instanceof Error ? error.message : 'Erreur serveur'
    return NextResponse.json(
      { error: message },
      { status: message.includes('authentifié') ? 401 : 500 }
    )
  }
}