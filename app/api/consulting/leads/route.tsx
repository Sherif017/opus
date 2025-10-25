import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { email, name, company, phone, sector, source } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    // Vérifier si lead existe déjà
    const { data: existing } = await supabase
      .from('consulting_leads')
      .select('id')
      .eq('email', email)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Lead already exists' },
        { status: 409 }
      )
    }

    // Créer nouveau lead
    const { data, error } = await supabase
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
          created_at: new Date(),
        },
      ])
      .select()
      .single()

    if (error) throw error

    // Envoyer email de bienvenue
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/consulting/send-welcome-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name }),
    })

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error creating lead' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    // Récupérer tous les leads (authentification requise en prod)
    const { data, error } = await supabase
      .from('consulting_leads')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error fetching leads' },
      { status: 500 }
    )
  }
}