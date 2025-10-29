import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function GET(request: NextRequest) {
  try {
    // Récupérer tous les audits triés par date décroissante
    const { data, error } = await supabase
      .from('consulting_audits')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des audits' },
        { status: 500 }
      )
    }

    // Transformer les données pour le frontend
    const audits = (data || []).map((audit: any) => ({
      id: audit.id,
      fullName: audit.full_name,
      email: audit.email,
      phone: audit.phone,
      company: audit.company,
      industry: audit.industry,
      challenge: audit.challenge,
      preferredDate: audit.preferred_date,
      preferredTime: audit.preferred_time,
      createdAt: audit.created_at,
      status: audit.status || 'pending',
    }))

    return NextResponse.json({ audits })
  } catch (error) {
    console.error('Error fetching audits:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}