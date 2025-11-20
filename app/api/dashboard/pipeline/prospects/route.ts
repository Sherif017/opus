import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    // Récupérer le header d'autorisation
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    // Récupérer l'utilisateur depuis le token
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      )
    }

    // Récupérer l'entreprise_id de cet utilisateur
    const { data: userData, error: userError } = await supabaseAdmin
      .from('utilisateurs')
      .select('entreprise_id')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'Entreprise non trouvée' },
        { status: 404 }
      )
    }

    const entrepriseId = userData.entreprise_id

    // Charger tous les prospects de cette entreprise
    const { data: prospects, error: prospectError } = await supabaseAdmin
      .from('prospects')
      .select('*')
      .eq('entreprise_id', entrepriseId)
      .order('dernier_contact', { ascending: false })

    if (prospectError) throw prospectError

    return NextResponse.json({
      prospects: prospects || [],
      entrepriseId: entrepriseId,
    })
  } catch (error) {
    console.error('Pipeline prospects error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    // Récupérer le header d'autorisation
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    // Récupérer l'utilisateur depuis le token
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      )
    }

    // Récupérer l'entreprise_id
    const { data: userData } = await supabaseAdmin
      .from('utilisateurs')
      .select('entreprise_id')
      .eq('id', user.id)
      .single()

    if (!userData) {
      return NextResponse.json(
        { error: 'Entreprise non trouvée' },
        { status: 404 }
      )
    }

    const entrepriseId = userData.entreprise_id
    const { prospectId, statut_pipeline } = await req.json()

    if (!prospectId || !statut_pipeline) {
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      )
    }

    // Mettre à jour le prospect (vérifier qu'il appartient à cette entreprise)
    const { error: updateError } = await supabaseAdmin
      .from('prospects')
      .update({ statut_pipeline })
      .eq('id', prospectId)
      .eq('entreprise_id', entrepriseId)

    if (updateError) throw updateError

    return NextResponse.json({
      success: true,
      message: 'Prospect mis à jour',
    })
  } catch (error) {
    console.error('Pipeline update error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}