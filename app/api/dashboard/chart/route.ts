import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

interface ChartData {
  date: string
  revenue: number
  factures: number
  clients: number
  prospects: number
}

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

    // Récupérer la période depuis les query params
    const period = (req.nextUrl.searchParams.get('period') as '7' | '30' | '90') || '30'
    const days = parseInt(period)
    const start = new Date()
    start.setDate(start.getDate() - days)

    // Récupérer les données
    const { data: factures } = await supabaseAdmin
      .from('factures')
      .select('montant_total_ttc, date_creation')
      .eq('entreprise_id', entrepriseId)
      .gte('date_creation', start.toISOString())

    const { data: clients } = await supabaseAdmin
      .from('clients')
      .select('created_at')
      .eq('entreprise_id', entrepriseId)
      .gte('created_at', start.toISOString())

    const { data: prospects } = await supabaseAdmin
      .from('prospects')
      .select('created_at')
      .eq('entreprise_id', entrepriseId)
      .gte('created_at', start.toISOString())

    const { data: devis } = await supabaseAdmin
      .from('devis')
      .select('created_at')
      .eq('entreprise_id', entrepriseId)
      .gte('created_at', start.toISOString())

    // Construire les données par date
    const dataByDate: Record<string, ChartData> = {}

    for (let i = 0; i < days; i++) {
      const d = new Date(start)
      d.setDate(d.getDate() + i)
      const key = d.toLocaleDateString('fr-FR', {
        month: '2-digit',
        day: '2-digit',
      })
      dataByDate[key] = {
        date: key,
        revenue: 0,
        factures: 0,
        clients: 0,
        prospects: 0,
      }
    }

    // Remplir les données
    factures?.forEach((f: any) => {
      const key = new Date(f.date_creation).toLocaleDateString('fr-FR', {
        month: '2-digit',
        day: '2-digit',
      })
      if (dataByDate[key]) {
        dataByDate[key].revenue += f.montant_total_ttc ?? 0
        dataByDate[key].factures += 1
      }
    })

    clients?.forEach((c: any) => {
      const key = new Date(c.created_at).toLocaleDateString('fr-FR', {
        month: '2-digit',
        day: '2-digit',
      })
      if (dataByDate[key]) dataByDate[key].clients += 1
    })

    prospects?.forEach((p: any) => {
      const key = new Date(p.created_at).toLocaleDateString('fr-FR', {
        month: '2-digit',
        day: '2-digit',
      })
      if (dataByDate[key]) dataByDate[key].prospects += 1
    })

    devis?.forEach((d: any) => {
      const key = new Date(d.created_at).toLocaleDateString('fr-FR', {
        month: '2-digit',
        day: '2-digit',
      })
      if (dataByDate[key]) dataByDate[key].factures += 1
    })

    // Trier par date
    const sorted = Object.values(dataByDate).sort(
      (a, b) =>
        new Date(a.date.split('/').reverse().join('-')).getTime() -
        new Date(b.date.split('/').reverse().join('-')).getTime()
    )

    return NextResponse.json({ chartData: sorted })
  } catch (error) {
    console.error('Dashboard chart error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}