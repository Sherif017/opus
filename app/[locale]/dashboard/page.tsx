'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import { Card } from '@/components/ui/Card'
import { TrendingUp, TrendingDown, Users, FileText, DollarSign, AlertCircle, Plus, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

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
  const [trends, setTrends] = useState<{ [key: string]: { direction: 'up' | 'down' | 'neutral'; percent: number } }>({})

  useEffect(() => {
    loadStats()
    
    const interval = setInterval(() => {
      refreshStatsInBackground()
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    loadChartData(chartPeriod)
  }, [chartPeriod])

  const loadStats = async () => {
    try {
      setLoading(true)
      await fetchStats()
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshStatsInBackground = async () => {
    try {
      setIsRefreshing(true)
      await fetchStats()
    } catch (error) {
      console.error('Error refreshing stats:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const fetchStats = async () => {
    const { data: userData } = await supabase
      .from('utilisateurs')
      .select('entreprise_id')
      .limit(1)
      .single()

    if (!userData) return

    const entrepriseId = userData.entreprise_id

    // Factures
    const { data: factures } = await supabase
      .from('factures')
      .select('montant_total_ttc, montant_paye, statut')
      .eq('entreprise_id', entrepriseId)

    const totalFactures = factures?.length || 0
    const totalRevenue = factures?.reduce((sum, f) => sum + (f.montant_total_ttc || 0), 0) || 0
    const facturesPayees = factures?.filter(f => f.statut === 'payée').length || 0
    const montantPaye = factures?.reduce((sum, f) => sum + (f.montant_paye || 0), 0) || 0
    const montantImpaye = totalRevenue - montantPaye

    // Clients
    const { data: clients } = await supabase
      .from('clients')
      .select('id')
      .eq('entreprise_id', entrepriseId)

    const totalClients = clients?.length || 0

    // Devis
    const { data: devis } = await supabase
      .from('devis')
      .select('statut')
      .eq('entreprise_id', entrepriseId)

    const totalDevis = devis?.length || 0
    const devisAcceptes = devis?.filter(d => d.statut === 'accepté').length || 0

    // Prospects
    const { data: prospects } = await supabase
      .from('prospects')
      .select('id')
      .eq('entreprise_id', entrepriseId)

    const totalProspects = prospects?.length || 0

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
  }

  const calculateTrends = async (entrepriseId: string) => {
    try {
      const now = new Date()
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

      const { data: currentFactures } = await supabase
        .from('factures')
        .select('montant_total_ttc')
        .eq('entreprise_id', entrepriseId)
        .gte('date_creation', thirtyDaysAgo.toISOString())

      const currentRevenue = currentFactures?.reduce((sum, f) => sum + (f.montant_total_ttc || 0), 0) || 0

      const { data: previousFactures } = await supabase
        .from('factures')
        .select('montant_total_ttc')
        .eq('entreprise_id', entrepriseId)
        .gte('date_creation', sixtyDaysAgo.toISOString())
        .lt('date_creation', thirtyDaysAgo.toISOString())

      const previousRevenue = previousFactures?.reduce((sum, f) => sum + (f.montant_total_ttc || 0), 0) || 0

      const revenuePercent = previousRevenue === 0 
        ? 100 
        : Math.round(((currentRevenue - previousRevenue) / previousRevenue) * 100)

      const { data: currentClients } = await supabase
        .from('clients')
        .select('id')
        .eq('entreprise_id', entrepriseId)
        .gte('created_at', thirtyDaysAgo.toISOString())

      const { data: previousClients } = await supabase
        .from('clients')
        .select('id')
        .eq('entreprise_id', entrepriseId)
        .gte('created_at', sixtyDaysAgo.toISOString())
        .lt('created_at', thirtyDaysAgo.toISOString())

      const clientsPercent = (previousClients?.length || 0) === 0
        ? 100
        : Math.round(((currentClients?.length || 0) - (previousClients?.length || 0)) / (previousClients?.length || 1) * 100)

      const { data: currentFacturesCount } = await supabase
        .from('factures')
        .select('id')
        .eq('entreprise_id', entrepriseId)
        .gte('date_creation', thirtyDaysAgo.toISOString())

      const { data: previousFacturesCount } = await supabase
        .from('factures')
        .select('id')
        .eq('entreprise_id', entrepriseId)
        .gte('date_creation', sixtyDaysAgo.toISOString())
        .lt('date_creation', thirtyDaysAgo.toISOString())

      const facturesPercent = (previousFacturesCount?.length || 0) === 0
        ? 100
        : Math.round(((currentFacturesCount?.length || 0) - (previousFacturesCount?.length || 0)) / (previousFacturesCount?.length || 1) * 100)

      const { data: currentProspects } = await supabase
        .from('prospects')
        .select('id')
        .eq('entreprise_id', entrepriseId)
        .gte('created_at', thirtyDaysAgo.toISOString())

      const { data: previousProspects } = await supabase
        .from('prospects')
        .select('id')
        .eq('entreprise_id', entrepriseId)
        .gte('created_at', sixtyDaysAgo.toISOString())
        .lt('created_at', thirtyDaysAgo.toISOString())

      const prospectsPercent = (previousProspects?.length || 0) === 0
        ? 100
        : Math.round(((currentProspects?.length || 0) - (previousProspects?.length || 0)) / (previousProspects?.length || 1) * 100)

      setTrends({
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
      })
    } catch (error) {
      console.error('Error calculating trends:', error)
    }
  }

  const loadChartData = async (period: '7' | '30' | '90') => {
    try {
      const { data: userData } = await supabase
        .from('utilisateurs')
        .select('entreprise_id')
        .limit(1)
        .single()

      if (!userData) return

      const entrepriseId = userData.entreprise_id
      const days = parseInt(period)
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      // Factures par jour
      const { data: factures } = await supabase
        .from('factures')
        .select('montant_total_ttc, montant_paye, date_creation, statut')
        .eq('entreprise_id', entrepriseId)
        .gte('date_creation', startDate.toISOString())

      // Clients par jour
      const { data: clients } = await supabase
        .from('clients')
        .select('created_at')
        .eq('entreprise_id', entrepriseId)
        .gte('created_at', startDate.toISOString())

      // Prospects par jour
      const { data: prospects } = await supabase
        .from('prospects')
        .select('created_at')
        .eq('entreprise_id', entrepriseId)
        .gte('created_at', startDate.toISOString())

      // Devis par jour
      const { data: devis } = await supabase
        .from('devis')
        .select('created_at, statut')
        .eq('entreprise_id', entrepriseId)
        .gte('created_at', startDate.toISOString())

      // Agréger les données par jour
      const dataByDate: { [key: string]: ChartData } = {}

      // Créer une entrée pour chaque jour
      for (let i = 0; i < days; i++) {
        const date = new Date(startDate)
        date.setDate(date.getDate() + i)
        const dateStr = date.toLocaleDateString('fr-FR', { month: '2-digit', day: '2-digit' })
        dataByDate[dateStr] = { date: dateStr, revenue: 0, factures: 0, clients: 0, prospects: 0 }
      }

      // Ajouter les factures
      factures?.forEach(f => {
        const dateStr = new Date(f.date_creation).toLocaleDateString('fr-FR', { month: '2-digit', day: '2-digit' })
        if (dataByDate[dateStr]) {
          dataByDate[dateStr].revenue += f.montant_total_ttc || 0
          dataByDate[dateStr].factures += 1
        }
      })

      // Ajouter les clients
      clients?.forEach(c => {
        const dateStr = new Date(c.created_at).toLocaleDateString('fr-FR', { month: '2-digit', day: '2-digit' })
        if (dataByDate[dateStr]) {
          dataByDate[dateStr].clients += 1
        }
      })

      // Ajouter les prospects
      prospects?.forEach(p => {
        const dateStr = new Date(p.created_at).toLocaleDateString('fr-FR', { month: '2-digit', day: '2-digit' })
        if (dataByDate[dateStr]) {
          dataByDate[dateStr].prospects += 1
        }
      })

      const sortedData = Object.values(dataByDate).sort((a, b) => {
        const dateA = new Date(a.date.split('/').reverse().join('-'))
        const dateB = new Date(b.date.split('/').reverse().join('-'))
        return dateA.getTime() - dateB.getTime()
      })

      setChartData(sortedData)

      // Calculer le maximum pour le graphique
      const maxRevenue = Math.max(...sortedData.map(d => d.revenue), 1)
      setMaxValue(maxRevenue)

      // Calculer les stats pour la période
      const periodTotalRevenue = factures?.reduce((sum, f) => sum + (f.montant_total_ttc || 0), 0) || 0
      const periodTotalFactures = factures?.length || 0
      const periodFacturesPayees = factures?.filter(f => f.statut === 'payée').length || 0
      const periodMontantPaye = factures?.reduce((sum, f) => sum + (f.montant_paye || 0), 0) || 0
      const periodMontantImpaye = periodTotalRevenue - periodMontantPaye
      const periodTotalClients = clients?.length || 0
      const periodTotalProspects = prospects?.length || 0
      const periodTotalDevis = devis?.length || 0
      const periodDevisAcceptes = devis?.filter(d => d.statut === 'accepté').length || 0

      setPeriodStats({
        totalRevenue: periodTotalRevenue,
        totalFactures: periodTotalFactures,
        totalClients: periodTotalClients,
        facturesPayees: periodFacturesPayees,
        totalDevis: periodTotalDevis,
        devisAcceptes: periodDevisAcceptes,
        montantPaye: periodMontantPaye,
        montantImpaye: periodMontantImpaye,
        totalProspects: periodTotalProspects,
      })
    } catch (error) {
      console.error('Error loading chart data:', error)
    }
  }

  const TrendIndicator = ({ metric }: { metric: MetricType }) => {
    const trend = trends[metric]
    if (!trend) return null

    return (
      <div className="flex items-center gap-2">
        {trend.direction === 'up' ? (
          <TrendingUp className="w-4 h-4 text-green-600" />
        ) : trend.direction === 'down' ? (
          <TrendingDown className="w-4 h-4 text-red-600" />
        ) : null}
        <span className={trend.direction === 'up' ? 'text-green-600' : trend.direction === 'down' ? 'text-red-600' : 'text-gray-600'}>
          {trend.percent}%
        </span>
      </div>
    )
  }

  const metricColors: { [key in MetricType]: string } = {
    revenue: 'text-green-600',
    factures: 'text-blue-600',
    clients: 'text-purple-600',
    prospects: 'text-orange-600',
  }

  const tauxPaiement = stats.totalFactures > 0 ? Math.round((stats.facturesPayees / stats.totalFactures) * 100) : 0

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Bienvenue ! 👋</p>
      </div>

      {/* Graphique Évolution */}
      <Card className="p-8 bg-white">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>📈 Évolution</span>
          </h2>

          {/* Sélection métrique et période */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6 pb-4 border-b">
            <div className="flex gap-2">
              {(['revenue', 'factures', 'clients', 'prospects'] as MetricType[]).map(metric => (
                <button
                  key={metric}
                  onClick={() => setSelectedMetric(metric)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    selectedMetric === metric
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {metric === 'revenue' && 'Revenus (€)'}
                  {metric === 'factures' && 'Nombre de Factures'}
                  {metric === 'clients' && 'Nombre de Clients'}
                  {metric === 'prospects' && 'Nombre de Prospects'}
                </button>
              ))}
            </div>

            <div className="flex gap-2 ml-auto">
              {(['7', '30', '90'] as const).map(period => (
                <button
                  key={period}
                  onClick={() => setChartPeriod(period)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    chartPeriod === period
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {period} jours
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Graphique */}
        {chartData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#f3f4f6',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    padding: '12px',
                  }}
                />
                <Legend />
                {selectedMetric === 'revenue' && (
                  <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981' }} name="Revenus (€)" />
                )}
                {selectedMetric === 'factures' && (
                  <Line type="monotone" dataKey="factures" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6' }} name="Factures" />
                )}
                {selectedMetric === 'clients' && (
                  <Line type="monotone" dataKey="clients" stroke="#a855f7" strokeWidth={3} dot={{ fill: '#a855f7' }} name="Clients" />
                )}
                {selectedMetric === 'prospects' && (
                  <Line type="monotone" dataKey="prospects" stroke="#f97316" strokeWidth={3} dot={{ fill: '#f97316' }} name="Prospects" />
                )}
              </LineChart>
            </ResponsiveContainer>

            {/* Statistiques du graphique - BASÉES SUR LA PÉRIODE */}
            <div className="mt-8 grid grid-cols-4 gap-4 pt-6 border-t">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total période</p>
                <p className={`text-xl font-bold ${metricColors[selectedMetric]}`}>
                  {selectedMetric === 'revenue'
                    ? `${chartData.reduce((sum, d) => sum + d.revenue, 0).toFixed(0)}€`
                    : chartData.reduce((sum, d) => sum + d[selectedMetric], 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Moyenne/jour</p>
                <p className={`text-xl font-bold ${metricColors[selectedMetric]}`}>
                  {selectedMetric === 'revenue'
                    ? `${(chartData.reduce((sum, d) => sum + d.revenue, 0) / chartData.length).toFixed(0)}€`
                    : (chartData.reduce((sum, d) => sum + d[selectedMetric], 0) / chartData.length).toFixed(0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Max/jour</p>
                <p className={`text-xl font-bold ${metricColors[selectedMetric]}`}>
                  {selectedMetric === 'revenue'
                    ? `${Math.max(...chartData.map(d => d[selectedMetric])).toFixed(0)}€`
                    : Math.max(...chartData.map(d => d[selectedMetric]))}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Jours actifs</p>
                <p className="text-xl font-bold text-gray-700">{chartData.length}</p>
              </div>
            </div>
          </>
        ) : (
          <div className="h-96 flex items-center justify-center text-gray-500">
            <p>Aucune donnée disponible pour cette période</p>
          </div>
        )}
      </Card>

      {/* KPIs Principaux - ADAPTÉS À LA PÉRIODE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Revenu Total</p>
              <p className="text-3xl font-bold">{periodStats.totalRevenue.toFixed(0)}€</p>
              <p className="text-xs text-gray-500 mt-1">Période : {chartPeriod} jours</p>
            </div>
            <div className="p-3 rounded-lg bg-white bg-opacity-50">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Factures</p>
              <p className="text-3xl font-bold">{periodStats.totalFactures}</p>
              <p className="text-xs text-gray-500 mt-1">{periodStats.facturesPayees} payées</p>
            </div>
            <div className="p-3 rounded-lg bg-white bg-opacity-50">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Clients</p>
              <p className="text-3xl font-bold">{periodStats.totalClients}</p>
              <p className="text-xs text-gray-500 mt-1">Période : {chartPeriod} jours</p>
            </div>
            <div className="p-3 rounded-lg bg-white bg-opacity-50">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Prospects</p>
              <p className="text-3xl font-bold">{periodStats.totalProspects}</p>
              <p className="text-xs text-gray-500 mt-1">Période : {chartPeriod} jours</p>
            </div>
            <div className="p-3 rounded-lg bg-white bg-opacity-50">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Actions Rapides Simples */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
        <h2 className="font-bold text-lg mb-4">⚡ Actions Rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Link href="/dashboard/devis/new">
            <button className="w-full px-4 py-3 bg-white hover:bg-blue-50 border border-blue-200 rounded-lg font-semibold text-blue-700 transition-all flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Créer un Devis
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>

          <Link href="/dashboard/factures/new">
            <button className="w-full px-4 py-3 bg-white hover:bg-green-50 border border-green-200 rounded-lg font-semibold text-green-700 transition-all flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Créer une Facture
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>

          <Link href="/dashboard/clients">
            <button className="w-full px-4 py-3 bg-white hover:bg-purple-50 border border-purple-200 rounded-lg font-semibold text-purple-700 transition-all flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Ajouter un Client
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </Card>

      {/* Détails Financiers - GLOBAUX (TOUS LES TEMPS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-emerald-600 text-white">
              <DollarSign className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-emerald-900">Montant Payé (Total)</h3>
          </div>
          <p className="text-3xl font-bold text-emerald-700">{stats.montantPaye.toFixed(2)}€</p>
          <p className="text-sm text-emerald-600 mt-1">Paiements reçus (tous les temps)</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-orange-600 text-white">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-orange-900">Montant Impayé (Total)</h3>
          </div>
          <p className="text-3xl font-bold text-orange-700">{stats.montantImpaye.toFixed(2)}€</p>
          <p className="text-sm text-orange-600 mt-1">À recevoir (tous les temps)</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-blue-600 text-white">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-blue-900">Devis (Total)</h3>
          </div>
          <p className="text-3xl font-bold text-blue-700">{stats.totalDevis}</p>
          <p className="text-sm text-blue-600 mt-1">{stats.devisAcceptes} acceptés (tous les temps)</p>
        </Card>
      </div>

      {/* Résumé Activité - GLOBAL */}
      <Card className="p-6">
        <h2 className="font-bold text-lg mb-6">Résumé Activité (Tous les temps)</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-2">Factures Payées</p>
            <p className="text-2xl font-bold">{stats.facturesPayees}/{stats.totalFactures}</p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.totalFactures > 0 
                ? Math.round((stats.facturesPayees / stats.totalFactures) * 100) 
                : 0}%
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Moyenne par Facture</p>
            <p className="text-2xl font-bold">
              {stats.totalFactures > 0 
                ? (stats.totalRevenue / stats.totalFactures).toFixed(0) 
                : 0}€
            </p>
            <p className="text-xs text-gray-500 mt-1">Montant moyen</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Devis Acceptés</p>
            <p className="text-2xl font-bold">{stats.devisAcceptes}/{stats.totalDevis}</p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.totalDevis > 0 
                ? Math.round((stats.devisAcceptes / stats.totalDevis) * 100) 
                : 0}%
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Montant Moyen par Client</p>
            <p className="text-2xl font-bold">
              {stats.totalClients > 0 
                ? (stats.totalRevenue / stats.totalClients).toFixed(0) 
                : 0}€
            </p>
            <p className="text-xs text-gray-500 mt-1">Par entreprise</p>
          </div>
        </div>
      </Card>

      {/* Conseils */}
      <Card className="p-6 bg-blue-50 border border-blue-200">
        <h3 className="font-bold text-lg mb-3">💡 Conseils</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>✅ {stats.devisAcceptes} devis acceptés - Bonne activité !</li>
          <li>💰 {tauxPaiement}% de paiement - {tauxPaiement >= 80 ? '🎉 Excellent!' : tauxPaiement >= 50 ? '📈 À améliorer' : '⚠️ À surveiller'}</li>
          <li>📊 {stats.totalClients} clients - Continuez vos efforts commerciaux !</li>
        </ul>
      </Card>
    </div>
  )
}