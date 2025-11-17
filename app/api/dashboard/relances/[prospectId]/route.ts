import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { getEntrepriseIdFromRequest } from '@/lib/auth'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const dynamic = 'force-dynamic'

/**
 * PATCH /api/dashboard/relances/[prospectId]
 * Mettre à jour les notes d'un prospect (vérifier qu'il appartient à l'entreprise)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ prospectId: string }> }
) {
  try {
    const { prospectId } = await params

    // ✅ Récupérer l'entreprise_id
    const entrepriseId = await getEntrepriseIdFromRequest(request)

    const body = await request.json()
    const { notes } = body

    // ✅ Vérifier que le prospect appartient à l'entreprise
    const { data: existingData, error: checkError } = await supabaseAdmin
      .from('prospects')
      .select('entreprise_id')
      .eq('id', prospectId)
      .eq('entreprise_id', entrepriseId)
      .single()

    if (checkError || !existingData) {
      return NextResponse.json(
        { error: 'Prospect non trouvé' },
        { status: 404 }
      )
    }

    if (existingData.entreprise_id !== entrepriseId) {
      return NextResponse.json(
        { error: 'Vous n\'avez pas accès à ce prospect' },
        { status: 403 }
      )
    }

    // ✅ Mettre à jour les notes
    const { data, error } = await supabaseAdmin
      .from('prospects')
      .update({ notes })
      .eq('id', prospectId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error in PATCH /api/dashboard/relances/[prospectId]:', error)
    const message = error instanceof Error ? error.message : 'Erreur serveur'
    return NextResponse.json(
      { error: message },
      { status: message.includes('authentifié') ? 401 : 500 }
    )
  }
}

/**
 * DELETE /api/dashboard/relances/[prospectId]
 * Supprimer UN prospect (vérifier qu'il appartient à l'entreprise)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ prospectId: string }> }
) {
  try {
    const { prospectId } = await params

    // ✅ Récupérer l'entreprise_id
    const entrepriseId = await getEntrepriseIdFromRequest(request)

    // ✅ Vérifier que le prospect appartient à l'entreprise
    const { data: existingData, error: checkError } = await supabaseAdmin
      .from('prospects')
      .select('entreprise_id')
      .eq('id', prospectId)
      .eq('entreprise_id', entrepriseId)
      .single()

    if (checkError || !existingData) {
      return NextResponse.json(
        { error: 'Prospect non trouvé' },
        { status: 404 }
      )
    }

    if (existingData.entreprise_id !== entrepriseId) {
      return NextResponse.json(
        { error: 'Vous n\'avez pas accès à ce prospect' },
        { status: 403 }
      )
    }

    // ✅ Supprimer aussi l'historique des relances
    await supabaseAdmin
      .from('relances_historique')
      .delete()
      .eq('prospect_id', prospectId)

    // ✅ Supprimer le prospect
    const { error } = await supabaseAdmin
      .from('prospects')
      .delete()
      .eq('id', prospectId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/dashboard/relances/[prospectId]:', error)
    const message = error instanceof Error ? error.message : 'Erreur serveur'
    return NextResponse.json(
      { error: message },
      { status: message.includes('authentifié') ? 401 : 500 }
    )
  }
}