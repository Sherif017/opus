import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getEntrepriseIdFromRequest } from '@/lib/auth'


export const dynamic = 'force-dynamic'

/**
 * GET /api/consulting/leads
 * Récupère UNIQUEMENT les leads de l'entreprise connectée
 */
export async function GET(req: NextRequest) {
    // ✅ Créer les clients DANS la fonction
    const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

  try {
    // ✅ Récupérer l'entreprise_id de manière sécurisée
    const entrepriseId = await getEntrepriseIdFromRequest(req)

    // ✅ Récupérer les leads filtrés par entreprise
    const { data, error } = await supabaseAdmin
      .from('consulting_leads')
      .select('*')
      .eq('entreprise_id', entrepriseId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error fetching leads' },
      { status: error instanceof Error && error.message.includes('authentifié') ? 401 : 500 }
    )
  }
}

/**
 * POST /api/consulting/leads
 * Créer un nouveau lead pour l'entreprise connectée
 */
export async function POST(req: NextRequest) {
    // ✅ Créer les clients DANS la fonction
    const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

  try {
    // ✅ Récupérer l'entreprise_id
    const entrepriseId = await getEntrepriseIdFromRequest(req)

    const { email, name, company, phone, sector, source } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    // Vérifier si lead existe déjà POUR CETTE ENTREPRISE
    const { data: existing } = await supabaseAdmin
      .from('consulting_leads')
      .select('id')
      .eq('email', email)
      .eq('entreprise_id', entrepriseId)  // ← Filtrer par entreprise aussi
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Lead already exists for this company' },
        { status: 409 }
      )
    }

    // Créer nouveau lead avec entreprise_id
    const { data, error } = await supabaseAdmin
      .from('consulting_leads')
      .insert([
        {
          email,
          name: name || 'N/A',
          company: company || null,
          phone: phone || null,
          sector: sector || null,
          source: source || 'organic',
          status: 'new',
          entreprise_id: entrepriseId,  // ← CRUCIAL
          created_at: new Date(),
        },
      ])
      .select()
      .single()

    if (error) throw error

    // Envoyer email de bienvenue
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/consulting/send-welcome-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.get('authorization') || ''  // Passer le token
      },
      body: JSON.stringify({ email, name }),
    })

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error creating lead' },
      { status: error instanceof Error && error.message.includes('authentifié') ? 401 : 500 }
    )
  }
}