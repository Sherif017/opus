import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-client'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { lead_id, scheduled_date, duration_minutes } = await req.json()

    if (!lead_id || !scheduled_date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('consulting_audits')
      .insert([
        {
          lead_id,
          scheduled_date,
          duration_minutes: duration_minutes || 30,
          status: 'scheduled',
          created_at: new Date(),
        },
      ])
      .select()
      .single()

    if (error) throw error

    // Mettre à jour lead status
    await supabase
      .from('consulting_leads')
      .update({ status: 'qualified' })
      .eq('id', lead_id)

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error creating audit' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const lead_id = searchParams.get('lead_id')

    let query = supabase
      .from('consulting_audits')
      .select('*, consulting_leads(email, name, company)')

    if (lead_id) {
      query = query.eq('lead_id', lead_id)
    }

    const { data, error } = await query.order('scheduled_date', { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error fetching audits' },
      { status: 500 }
    )
  }
}