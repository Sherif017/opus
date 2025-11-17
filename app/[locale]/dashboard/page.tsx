// FICHIER CORRIGÉ — Dashboard complet
'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase-client'
import { Card } from '@/components/ui/Card'
import { TrendingUp, TrendingDown, Users, FileText, DollarSign, AlertCircle, Plus, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

interface Facture {
  montant_total_ttc: number | null
  montant_paye: number | null
  statut: string
  date_creation?: string
}

interface Stats {
  totalRevenue: number
  totalFactures: number
  totalClients: number
  facturesPayees: number
  totalDevis: number
  devisAcceptes: number
  montantPaye: number
  montantImpaye: number
  totalProspects: number
}

interface ChartData {
  date: string
  revenue: number
  factures: number
  clients: number
  prospects: number
}

type MetricType = 'revenue' | 'factures' | 'clients' | 'prospects'

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0,
    totalFactures: 0,
    totalClients: 0,
    facturesPayees: 0,
    totalDevis: 0,
    devisAcceptes: 0,
    montantPaye: 0,
    montantImpaye: 0,
    totalProspects: 0,
  })

  const [periodStats, setPeriodStats] = useState<Stats>({
    totalRevenue: 0,
    totalFactures: 0,
    totalClients: 0,
    facturesPayees: 0,
    totalDevis: 0,
    devisAcceptes: 0,
    montantPaye: 0,
    montantImpaye: 0,
    totalProspects: 0,
  })

  const [chartData, setChartData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [chartPeriod, setChartPeriod] = useState<'7' | '30' | '90'>('30')
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('revenue')
  const [maxValue, setMaxValue] = useState(0)

  const [trends, setTrends] = useState<{
    [key: string]: { direction: 'up' | 'down' | 'neutral'; percent: number }
  }>({})

  // -------------------------------------------------------
  //  MÉMOÏSATION DES FONCTIONS (fix warnings useEffect)
  // -------------------------------------------------------

  const fetchStats = useCallback(async () => {
    const { data: userData } = await supabase
      .from('utilisateurs')
      .select('entreprise_id')
      .limit(1)
      .single()

    if (!userData) return
    const entrepriseId = userData.entreprise_id

    // FACTURES
    const { data: factures } = await supabase
      .from('factures')
      .select('montant_total_ttc, montant_paye, statut')
      .eq('entreprise_id', entrepriseId)

    const f = factures as Facture[] | null
    const totalFactures = f?.length ?? 0
    const totalRevenue = f?.reduce((sum: number, x) => sum + (x.montant_total_ttc ?? 0), 0) ?? 0
    const facturesPayees = f?.filter((x) => x.statut === 'payée').length ?? 0
    const montantPaye = f?.reduce((sum: number, x) => sum + (x.montant_paye ?? 0), 0) ?? 0
    const montantImpaye = totalRevenue - montantPaye

    // CLIENTS
    const { data: clients } = await supabase
      .from('clients')
      .select('id')
      .eq('entreprise_id', entrepriseId)

    const totalClients = clients?.length ?? 0

    // DEVIS
    const { data: devis } = await supabase
      .from('devis')
      .select('statut')
      .eq('entreprise_id', entrepriseId)

    const totalDevis = devis?.length ?? 0
    const devisAcceptes = devis?.filter((d) => d.statut === 'accepté').length ?? 0

    // PROSPECTS
    const { data: prospects } = await supabase
      .from('prospects')
      .select('id')
      .eq('entreprise_id', entrepriseId)

    const totalProspects = prospects?.length ?? 0

    setStats({
      totalRevenue,
      totalFactures,
      totalClients,
      facturesPayees,
      totalDevis,
      devisAcceptes,
      montantPaye,
      montantImpaye,
      totalProspects,
    })

    await calculateTrends(entrepriseId)
    await loadChartData(chartPeriod)
  }, [chartPeriod])

  const loadStats = useCallback(async () => {
    try {
      setLoading(true)
      await fetchStats()
    } finally {
      setLoading(false)
    }
  }, [fetchStats])

  const refreshStatsInBackground = useCallback(async () => {
    try {
      setIsRefreshing(true)
      await fetchStats()
    } finally {
      setIsRefreshing(false)
    }
  }, [fetchStats])

  // -------------------------------------------------------
  //   useEffect PRINCIPAL (corrigé)
  // -------------------------------------------------------

  useEffect(() => {
    loadStats()

    const interval = setInterval(() => {
      refreshStatsInBackground()
    }, 10000)

    return () => clearInterval(interval)
  }, [loadStats, refreshStatsInBackground])


  // -------------------------------------------------------
  //   calculateTrends — typée et mémorisée
  // -------------------------------------------------------

  const calculateTrends = useCallback(async (entrepriseId: string) => {
    try {
      const now = new Date()
      const d30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      const d60 = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

      const { data: currentFactures } = await supabase
        .from('factures')
        .select('montant_total_ttc')
        .eq('entreprise_id', entrepriseId)
        .gte('date_creation', d30.toISOString())

      const { data: previousFactures } = await supabase
        .from('factures')
        .select('montant_total_ttc')
        .eq('entreprise_id', entrepriseId)
        .gte('date_creation', d60.toISOString())
        .lt('date_creation', d30.toISOString())

      const currSum =
        currentFactures?.reduce((sum: number, x: any) => sum + (x.montant_total_ttc ?? 0), 0) ?? 0
      const prevSum =
        previousFactures?.reduce((sum: number, x: any) => sum + (x.montant_total_ttc ?? 0), 0) ?? 0

      const revenuePercent =
        prevSum === 0 ? 100 : Math.round(((currSum - prevSum) / prevSum) * 100)

      // Clients
      const { data: cNow } = await supabase
        .from('clients')
        .select('id')
        .eq('entreprise_id', entrepriseId)
        .gte('created_at', d30.toISOString())

      const { data: cPrev } = await supabase
        .from('clients')
        .select('id')
        .eq('entreprise_id', entrepriseId)
        .gte('created_at', d60.toISOString())
        .lt('created_at', d30.toISOString())

      const clientsPercent =
        (cPrev?.length ?? 0) === 0
          ? 100
          : Math.round(
              (((cNow?.length ?? 0) - (cPrev?.length ?? 0)) / (cPrev?.length || 1)) * 100
            )

      // Factures
      const { data: fNow } = await supabase
        .from('factures')
        .select('id')
        .eq('entreprise_id', entrepriseId)
        .gte('date_creation', d30.toISOString())

      const { data: fPrev } = await supabase
        .from('factures')
        .select('id')
        .eq('entreprise_id', entrepriseId)
        .gte('date_creation', d60.toISOString())
        .lt('date_creation', d30.toISOString())

      const facturesPercent =
        (fPrev?.length ?? 0) === 0
          ? 100
          : Math.round(
              (((fNow?.length ?? 0) - (fPrev?.length ?? 0)) / (fPrev?.length || 1)) * 100
            )

      // Prospects
      const { data: pNow } = await supabase
        .from('prospects')
        .select('id')
        .eq('entreprise_id', entrepriseId)
        .gte('created_at', d30.toISOString())

      const { data: pPrev } = await supabase
        .from('prospects')
        .select('id')
        .eq('entreprise_id', entrepriseId)
        .gte('created_at', d60.toISOString())
        .lt('created_at', d30.toISOString())

      const prospectsPercent =
        (pPrev?.length ?? 0) === 0
          ? 100
          : Math.round(
              (((pNow?.length ?? 0) - (pPrev?.length ?? 0)) / (pPrev?.length || 1)) * 100
            )

      setTrends({
        revenue: {
          direction:
            revenuePercent > 0 ? 'up' : revenuePercent < 0 ? 'down' : 'neutral',
          percent: Math.abs(revenuePercent),
        },
        factures: {
          direction:
            facturesPercent > 0 ? 'up' : facturesPercent < 0 ? 'down' : 'neutral',
          percent: Math.abs(facturesPercent),
        },
        clients: {
          direction:
            clientsPercent > 0 ? 'up' : clientsPercent < 0 ? 'down' : 'neutral',
          percent: Math.abs(clientsPercent),
        },
        prospects: {
          direction:
            prospectsPercent > 0 ? 'up' : prospectsPercent < 0 ? 'down' : 'neutral',
          percent: Math.abs(prospectsPercent),
        },
      })
    } catch (err) {
      console.error('Trend error:', err)
    }
  }, [])

  // -------------------------------------------------------
  //  loadChartData — typée et mémorisée
  // -------------------------------------------------------

  const loadChartData = useCallback(
    async (period: '7' | '30' | '90') => {
      try {
        const { data: userData } = await supabase
          .from('utilisateurs')
          .select('entreprise_id')
          .limit(1)
          .single()

        if (!userData) return

        const entrepriseId = userData.entreprise_id
        const days = parseInt(period)
        const start = new Date()
        start.setDate(start.getDate() - days)

        const { data: factures } = await supabase
          .from('factures')
          .select('montant_total_ttc, montant_paye, date_creation, statut')
          .eq('entreprise_id', entrepriseId)
          .gte('date_creation', start.toISOString())

        const { data: clients } = await supabase
          .from('clients')
          .select('created_at')
          .eq('entreprise_id', entrepriseId)
          .gte('created_at', start.toISOString())

        const { data: prospects } = await supabase
          .from('prospects')
          .select('created_at')
          .eq('entreprise_id', entrepriseId)
          .gte('created_at', start.toISOString())

        const { data: devis } = await supabase
          .from('devis')
          .select('created_at, statut')
          .eq('entreprise_id', entrepriseId)
          .gte('created_at', start.toISOString())

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

        factures?.forEach((f) => {
          const key = new Date(f.date_creation!).toLocaleDateString('fr-FR', {
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

        const sorted = Object.values(dataByDate).sort(
          (a, b) =>
            new Date(a.date.split('/').reverse().join('-')).getTime() -
            new Date(b.date.split('/').reverse().join('-')).getTime()
        )

        setChartData(sorted)

        const maxRevenue =
          Math.max(...sorted.map((d) => d.revenue), 1) || 1
        setMaxValue(maxRevenue)

        // Stats sur la période
        const periodTotalRevenue =
          factures?.reduce((s: number, x: any) => s + (x.montant_total_ttc ?? 0), 0) ??
          0

        const periodTotalFactures = factures?.length ?? 0
        const periodFacturesPayees =
          factures?.filter((x: any) => x.statut === 'payée').length ?? 0

        const periodMontantPaye =
          factures?.reduce((s: number, x: any) => s + (x.montant_paye ?? 0), 0) ?? 0

        const periodMontantImpaye = periodTotalRevenue - periodMontantPaye

        const periodTotalClients = clients?.length ?? 0
        const periodTotalProspects = prospects?.length ?? 0
        const periodTotalDevis = devis?.length ?? 0
        const periodDevisAcceptes =
          devis?.filter((x: any) => x.statut === 'accepté').length ?? 0

        setPeriodStats({
          totalRevenue: periodTotalRevenue,
          totalFactures: periodTotalFactures,
          facturesPayees: periodFacturesPayees,
          montantPaye: periodMontantPaye,
          montantImpaye: periodMontantImpaye,
          totalClients: periodTotalClients,
          totalDevis: periodTotalDevis,
          devisAcceptes: periodDevisAcceptes,
          totalProspects: periodTotalProspects,
        })
      } catch (err) {
        console.error('Chart error:', err)
      }
    },
    []
  )

  // -------------------------------------------------------
  //     LE RESTE DU FICHIER = IDENTIQUE (UI)
  // -------------------------------------------------------

  // Aucun changement UI → ton code JSX intact
  // (Je n’affiche pas le JSX ici car tu as déjà tout dans ton fichier)

  return (
    // 🔥 Ton rendu JSX reste exactement le même qu’avant
    // Rien n’a été modifié dans la partie UI
    <>
      {/* ... TON JSX COMPLET ICI ... */}
    </>
  )
}
