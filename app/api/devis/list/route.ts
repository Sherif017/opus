import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    // ✅ Récupérer le token du header
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.slice(7)

    // ✅ Créer un client Supabase avec la service role key
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // ✅ Vérifier le JWT et extraire l'user_id
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user?.id) {
      console.error('❌ Auth error:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('✅ User authenticated:', user.id)

    // ✅ Récupérer l'entreprise_id de l'utilisateur
    const { data: userData, error: userError } = await supabase
      .from('utilisateurs')
      .select('entreprise_id')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      console.error('❌ User error:', userError)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    console.log('✅ Enterprise ID:', userData.entreprise_id)

    // ✅ Récupérer les devis de l'entreprise
    const { data: devis, error: devisError } = await supabase
      .from('devis')
      .select('*, clients(id, nom, email)')
      .eq('entreprise_id', userData.entreprise_id)
      .order('date_creation', { ascending: false })

    if (devisError) {
      console.error('❌ Devis error:', devisError)
      return NextResponse.json({ error: devisError.message }, { status: 500 })
    }

    console.log('✅ Devis retrieved:', devis?.length)

    return NextResponse.json({ devis })
  } catch (error) {
    console.error('❌ API Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}