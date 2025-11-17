import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { getEntrepriseIdFromRequest } from '@/lib/auth'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const dynamic = 'force-dynamic'

/**
 * PATCH /api/dashboard/rendez-vous/[id]
 * Mettre à jour UN rendez-vous (vérifier qu'il appartient à l'entreprise)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // ✅ Récupérer l'entreprise_id
    const entrepriseId = await getEntrepriseIdFromRequest(request)

    const body = await request.json()

    // ✅ Vérifier que le rendez-vous appartient à l'entreprise
    const { data: existingData, error: checkError } = await supabaseAdmin
      .from('rendez_vous')
      .select('entreprise_id')
      .eq('id', id)
      .single()

    if (checkError || !existingData) {
      return NextResponse.json(
        { error: 'Rendez-vous non trouvé' },
        { status: 404 }
      )
    }

    if (existingData.entreprise_id !== entrepriseId) {
      return NextResponse.json(
        { error: 'Vous n\'avez pas accès à ce rendez-vous' },
        { status: 403 }
      )
    }

    // ✅ Mettre à jour
    const { data, error } = await supabaseAdmin
      .from('rendez_vous')
      .update(body)
      .eq('id', id)
      .select(`
        *,
        clients (
          id,
          nom
        )
      `)
      .single()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error in PATCH /api/dashboard/rendez-vous/[id]:', error)
    const message = error instanceof Error ? error.message : 'Erreur serveur'
    return NextResponse.json(
      { error: message },
      { status: message.includes('authentifié') ? 401 : 500 }
    )
  }
}

/**
 * DELETE /api/dashboard/rendez-vous/[id]
 * Supprimer UN rendez-vous (vérifier qu'il appartient à l'entreprise)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // ✅ Récupérer l'entreprise_id
    const entrepriseId = await getEntrepriseIdFromRequest(request)

    // ✅ Vérifier que le rendez-vous appartient à l'entreprise
    const { data: existingData, error: checkError } = await supabaseAdmin
      .from('rendez_vous')
      .select('entreprise_id')
      .eq('id', id)
      .single()

    if (checkError || !existingData) {
      return NextResponse.json(
        { error: 'Rendez-vous non trouvé' },
        { status: 404 }
      )
    }

    if (existingData.entreprise_id !== entrepriseId) {
      return NextResponse.json(
        { error: 'Vous n\'avez pas accès à ce rendez-vous' },
        { status: 403 }
      )
    }

    // ✅ Supprimer le rendez-vous
    const { error } = await supabaseAdmin
      .from('rendez_vous')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/dashboard/rendez-vous/[id]:', error)
    const message = error instanceof Error ? error.message : 'Erreur serveur'
    return NextResponse.json(
      { error: message },
      { status: message.includes('authentifié') ? 401 : 500 }
    )
  }
}