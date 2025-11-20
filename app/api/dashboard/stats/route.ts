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

    // FACTURES
    const { data: factures, error: factError } = await supabaseAdmin
      .from('factures')
      .select('montant_total_ttc, montant_paye, statut')
      .eq('entreprise_id', entrepriseId)

    const totalFactures = factures?.length ?? 0
    const totalRevenue = factures?.reduce((sum: number, x: any) => sum + (x.montant_total_ttc ?? 0), 0) ?? 0
    const facturesPayees = factures?.filter((x: any) => x.statut === 'payée').length ?? 0
    const montantPaye = factures?.reduce((sum: number, x: any) => sum + (x.montant_paye ?? 0), 0) ?? 0
    const montantImpaye = totalRevenue - montantPaye

    // CLIENTS
    const { data: clients } = await supabaseAdmin
      .from('clients')
      .select('id')
      .eq('entreprise_id', entrepriseId)

    const totalClients = clients?.length ?? 0

    // DEVIS
    const { data: devis } = await supabaseAdmin
      .from('devis')
      .select('statut')
      .eq('entreprise_id', entrepriseId)

    const totalDevis = devis?.length ?? 0
    const devisAcceptes = devis?.filter((d: any) => d.statut === 'accepté').length ?? 0

    // PROSPECTS
    const { data: prospects } = await supabaseAdmin
      .from('prospects')
      .select('id')
      .eq('entreprise_id', entrepriseId)

    const totalProspects = prospects?.length ?? 0

    // TRENDS - Comparer 30 derniers jours vs 30 jours précédents
    const now = new Date()
    const d30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const d60 = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

    // Revenue trend
    const { data: currentFactures } = await supabaseAdmin
      .from('factures')
      .select('montant_total_ttc')
      .eq('entreprise_id', entrepriseId)
      .gte('date_creation', d30.toISOString())

    const { data: previousFactures } = await supabaseAdmin
      .from('factures')
      .select('montant_total_ttc')
      .eq('entreprise_id', entrepriseId)
      .gte('date_creation', d60.toISOString())
      .lt('date_creation', d30.toISOString())

    const currSum = currentFactures?.reduce((sum: number, x: any) => sum + (x.montant_total_ttc ?? 0), 0) ?? 0
    const prevSum = previousFactures?.reduce((sum: number, x: any) => sum + (x.montant_total_ttc ?? 0), 0) ?? 0
    const revenuePercent = prevSum === 0 ? 100 : Math.round(((currSum - prevSum) / prevSum) * 100)

    // Clients trend
    const { data: cNow } = await supabaseAdmin
      .from('clients')
      .select('id')
      .eq('entreprise_id', entrepriseId)
      .gte('created_at', d30.toISOString())

    const { data: cPrev } = await supabaseAdmin
      .from('clients')
      .select('id')
      .eq('entreprise_id', entrepriseId)
      .gte('created_at', d60.toISOString())
      .lt('created_at', d30.toISOString())

    const clientsPercent = (cPrev?.length ?? 0) === 0 ? 100 : Math.round((((cNow?.length ?? 0) - (cPrev?.length ?? 0)) / (cPrev?.length || 1)) * 100)

    // Factures trend
    const { data: fNow } = await supabaseAdmin
      .from('factures')
      .select('id')
      .eq('entreprise_id', entrepriseId)
      .gte('date_creation', d30.toISOString())

    const { data: fPrev } = await supabaseAdmin
      .from('factures')
      .select('id')
      .eq('entreprise_id', entrepriseId)
      .gte('date_creation', d60.toISOString())
      .lt('date_creation', d30.toISOString())

    const facturesPercent = (fPrev?.length ?? 0) === 0 ? 100 : Math.round((((fNow?.length ?? 0) - (fPrev?.length ?? 0)) / (fPrev?.length || 1)) * 100)

    // Prospects trend
    const { data: pNow } = await supabaseAdmin
      .from('prospects')
      .select('id')
      .eq('entreprise_id', entrepriseId)
      .gte('created_at', d30.toISOString())

    const { data: pPrev } = await supabaseAdmin
      .from('prospects')
      .select('id')
      .eq('entreprise_id', entrepriseId)
      .gte('created_at', d60.toISOString())
      .lt('created_at', d30.toISOString())

    const prospectsPercent = (pPrev?.length ?? 0) === 0 ? 100 : Math.round((((pNow?.length ?? 0) - (pPrev?.length ?? 0)) / (pPrev?.length || 1)) * 100)

    return NextResponse.json({
      stats: {
        totalRevenue,
        totalFactures,
        totalClients,
        facturesPayees,
        totalDevis,
        devisAcceptes,
        montantPaye,
        montantImpaye,
        totalProspects,
      },
      trends: {
        revenue: {
          direction: revenuePercent > 0 ? 'up' : revenuePercent < 0 ? 'down' : 'neutral',
          percent: Math.abs(revenuePercent),
        },
        factures: {
          direction: facturesPercent > 0 ? 'up' : facturesPercent < 0 ? 'down' : 'neutral',
          percent: Math.abs(facturesPercent),
        },
        clients: {
          direction: clientsPercent > 0 ? 'up' : clientsPercent < 0 ? 'down' : 'neutral',
          percent: Math.abs(clientsPercent),
        },
        prospects: {
          direction: prospectsPercent > 0 ? 'up' : prospectsPercent < 0 ? 'down' : 'neutral',
          percent: Math.abs(prospectsPercent),
        },
      },
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}