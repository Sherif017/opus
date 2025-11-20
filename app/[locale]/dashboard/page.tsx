'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import { Card } from '@/components/ui/Card'
import { TrendingUp, TrendingDown, Users, FileText, DollarSign, AlertCircle, Plus, ArrowRight, RefreshCw } from 'lucide-react'
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

interface Trend {
  direction: 'up' | 'down' | 'neutral'
  percent: number
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
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [chartPeriod, setChartPeriod] = useState<'7' | '30' | '90'>('30')
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('revenue')
  const [trends, setTrends] = useState<Record<string, Trend>>({})

  // Récupérer le token de l'utilisateur connecté
  const getAuthToken = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token
  }

  // Charger les données du graphique depuis l'API
  const loadChartData = async (period: '7' | '30' | '90') => {
    try {
      const token = await getAuthToken()
      
      if (!token) {
        console.error('Pas de token')
        return
      }

      const response = await fetch(`/api/dashboard/chart?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Erreur lors du chargement du graphique')
      }

      const data = await response.json()
      setChartData(data.chartData)
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  // Rafraîchir les stats en arrière-plan (INVISIBLE - pas de spinner, pas de loading state)
  const refreshStatsBackground = async () => {
    try {
      const token = await getAuthToken()
      
      if (!token) return

      const response = await fetch('/api/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) return

      const data = await response.json()
      // Met à jour silencieusement sans aucun indicateur visuel
      setStats(data.stats)
      setTrends(data.trends)
      setPeriodStats(data.stats)
    } catch (error) {
      // Silencieux - aucune erreur affichée à l'utilisateur
      console.error('Background refresh error:', error)
    }
  }

  // Rafraîchir manuellement (visible pour l'utilisateur)
  const refreshStats = async () => {
    try {
      setIsRefreshing(true)
      await refreshStatsBackground()
    } finally {
      setIsRefreshing(false)
    }
  }

  // Charger au montage et quand la période change
  useEffect(() => {
    // Charger SILENCIEUSEMENT au montage (pas de spinner, pas de loading)
    refreshStatsBackground()
    loadChartData(chartPeriod)

    // Rafraîchir silencieusement chaque 10 secondes (invisible)
    const interval = setInterval(() => {
      refreshStatsBackground()
    }, 10000)

    return () => clearInterval(interval)
  }, [chartPeriod])

  const getTrendIcon = (direction: 'up' | 'down' | 'neutral') => {
    if (direction === 'up') return <TrendingUp className="w-4 h-4 text-green-600" />
    if (direction === 'down') return <TrendingDown className="w-4 h-4 text-red-600" />
    return <AlertCircle className="w-4 h-4 text-gray-400" />
  }

  const getTrendColor = (direction: 'up' | 'down' | 'neutral') => {
    if (direction === 'up') return 'text-green-600'
    if (direction === 'down') return 'text-red-600'
    return 'text-gray-600'
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Vue d'ensemble de votre activité</p>
        </div>
        <button
          onClick={refreshStats}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 transition-all"
          title="Rafraîchir manuellement"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Rafraîchissement...' : 'Rafraîchir'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-md hover:shadow-lg transition p-6 border border-blue-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-blue-700 text-sm font-semibold">Revenu Total</p>
              <p className="text-4xl font-bold text-blue-900 mt-3">
                {(stats.totalRevenue / 1000).toLocaleString('fr-FR', { maximumFractionDigits: 1 })}k€
              </p>
              {trends.revenue && (
                <div className={`flex items-center gap-2 mt-3 ${getTrendColor(trends.revenue.direction)}`}>
                  {getTrendIcon(trends.revenue.direction)}
                  <span className="text-sm font-bold">
                    {trends.revenue.percent}% vs mois précédent
                  </span>
                </div>
              )}
            </div>
            <div className="bg-blue-200 rounded-full p-3">
              <DollarSign className="w-6 h-6 text-blue-700" />
            </div>
          </div>
        </div>

        {/* Invoices */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-md hover:shadow-lg transition p-6 border border-purple-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-purple-700 text-sm font-semibold">Factures</p>
              <p className="text-4xl font-bold text-purple-900 mt-3">{stats.totalFactures}</p>
              <div className="flex items-center gap-2 mt-3">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-sm text-green-700 font-semibold">
                  {stats.facturesPayees} payées
                </span>
              </div>
              {trends.factures && (
                <div className={`flex items-center gap-2 mt-2 ${getTrendColor(trends.factures.direction)}`}>
                  {getTrendIcon(trends.factures.direction)}
                  <span className="text-sm font-bold">
                    {trends.factures.percent}% vs mois précédent
                  </span>
                </div>
              )}
            </div>
            <div className="bg-purple-200 rounded-full p-3">
              <FileText className="w-6 h-6 text-purple-700" />
            </div>
          </div>
        </div>

        {/* Clients */}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl shadow-md hover:shadow-lg transition p-6 border border-emerald-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-emerald-700 text-sm font-semibold">Clients</p>
              <p className="text-4xl font-bold text-emerald-900 mt-3">{stats.totalClients}</p>
              <p className="text-xs text-emerald-700 mt-3 font-medium">Client(s) enregistré(s)</p>
              {trends.clients && (
                <div className={`flex items-center gap-2 mt-2 ${getTrendColor(trends.clients.direction)}`}>
                  {getTrendIcon(trends.clients.direction)}
                  <span className="text-sm font-bold">
                    {trends.clients.percent}% vs mois précédent
                  </span>
                </div>
              )}
            </div>
            <div className="bg-emerald-200 rounded-full p-3">
              <Users className="w-6 h-6 text-emerald-700" />
            </div>
          </div>
        </div>

        {/* Prospects */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-md hover:shadow-lg transition p-6 border border-orange-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-orange-700 text-sm font-semibold">Prospects</p>
              <p className="text-4xl font-bold text-orange-900 mt-3">{stats.totalProspects}</p>
              <p className="text-xs text-orange-700 mt-3 font-medium">Prospect(s) à contacter</p>
              {trends.prospects && (
                <div className={`flex items-center gap-2 mt-2 ${getTrendColor(trends.prospects.direction)}`}>
                  {getTrendIcon(trends.prospects.direction)}
                  <span className="text-sm font-bold">
                    {trends.prospects.percent}% vs mois précédent
                  </span>
                </div>
              )}
            </div>
            <div className="bg-orange-200 rounded-full p-3">
              <AlertCircle className="w-6 h-6 text-orange-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <Card className="p-8 bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Évolution</h2>
            <p className="text-gray-500 text-sm mt-1">Tendance de votre activité</p>
          </div>
          <div className="flex gap-2">
            {(['7', '30', '90'] as const).map((period) => (
              <button
                key={period}
                onClick={() => {
                  setChartPeriod(period)
                  loadChartData(period)
                }}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  chartPeriod === period
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {period === '7' ? '7 jours' : period === '30' ? '30 jours' : '90 jours'}
              </button>
            ))}
          </div>
        </div>

        {/* Metric Selector */}
        <div className="flex gap-3 mb-8 flex-wrap">
          {(['revenue', 'factures', 'clients', 'prospects'] as const).map((metric) => (
            <button
              key={metric}
              onClick={() => setSelectedMetric(metric)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                selectedMetric === metric
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {metric === 'revenue' && '💰 Revenu'}
              {metric === 'factures' && '📄 Factures'}
              {metric === 'clients' && '👥 Clients'}
              {metric === 'prospects' && '🎯 Prospects'}
            </button>
          ))}
        </div>

        {/* Chart */}
        {chartData.length > 0 ? (
          <div className="bg-gradient-to-b from-blue-50 to-white rounded-lg p-4">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                {selectedMetric === 'revenue' && (
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Revenu (€)"
                  />
                )}
                {selectedMetric === 'factures' && (
                  <Line
                    type="monotone"
                    dataKey="factures"
                    stroke="#a855f7"
                    strokeWidth={3}
                    dot={{ fill: '#a855f7', r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Factures"
                  />
                )}
                {selectedMetric === 'clients' && (
                  <Line
                    type="monotone"
                    dataKey="clients"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: '#10b981', r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Clients"
                  />
                )}
                {selectedMetric === 'prospects' && (
                  <Line
                    type="monotone"
                    dataKey="prospects"
                    stroke="#f97316"
                    strokeWidth={3}
                    dot={{ fill: '#f97316', r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Prospects"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500 bg-gray-50 rounded-lg">
            <p className="text-lg">Pas de données pour cette période</p>
          </div>
        )}
      </Card>

      {/* Stats Period */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-md p-6 border border-blue-200">
          <p className="text-blue-700 text-xs font-bold uppercase tracking-wide">Revenu ({chartPeriod}j)</p>
          <p className="text-3xl font-bold text-blue-900 mt-3">
            {(periodStats.totalRevenue / 1000).toLocaleString('fr-FR', { maximumFractionDigits: 1 })}k€
          </p>
          <div className="h-1 bg-blue-200 rounded-full mt-4"></div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-md p-6 border border-red-200">
          <p className="text-red-700 text-xs font-bold uppercase tracking-wide">Impayé</p>
          <p className="text-3xl font-bold text-red-900 mt-3">
            {(periodStats.montantImpaye / 1000).toLocaleString('fr-FR', { maximumFractionDigits: 1 })}k€
          </p>
          <p className="text-red-600 text-xs mt-3 font-semibold">À encaisser</p>
          <div className="h-1 bg-red-200 rounded-full mt-4"></div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-md p-6 border border-purple-200">
          <p className="text-purple-700 text-xs font-bold uppercase tracking-wide">Devis acceptés</p>
          <p className="text-3xl font-bold text-purple-900 mt-3">
            {periodStats.devisAcceptes}/{periodStats.totalDevis}
          </p>
          <p className="text-purple-600 text-xs mt-3 font-semibold">Prêts à facturer</p>
          <div className="h-1 bg-purple-200 rounded-full mt-4"></div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl shadow-md p-6 border border-emerald-200">
          <p className="text-emerald-700 text-xs font-bold uppercase tracking-wide">Nouveaux clients</p>
          <p className="text-3xl font-bold text-emerald-900 mt-3">
            {periodStats.totalClients}
          </p>
          <p className="text-emerald-600 text-xs mt-3 font-semibold">Cette période</p>
          <div className="h-1 bg-emerald-200 rounded-full mt-4"></div>
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="p-8 bg-white rounded-xl shadow-lg border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Actions rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/dashboard/devis/new">
            <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl hover:shadow-lg hover:scale-105 cursor-pointer transition transform duration-200">
              <div className="bg-blue-200 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-blue-700" />
              </div>
              <p className="font-bold text-gray-900 text-lg">Nouveau devis</p>
              <p className="text-gray-600 text-sm mt-2">Créer un devis</p>
              <div className="flex items-center gap-2 mt-4 text-blue-600 font-semibold text-sm">
                <span>Créer</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>

          <Link href="/dashboard/factures/new">
            <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl hover:shadow-lg hover:scale-105 cursor-pointer transition transform duration-200">
              <div className="bg-purple-200 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6 text-purple-700" />
              </div>
              <p className="font-bold text-gray-900 text-lg">Nouvelle facture</p>
              <p className="text-gray-600 text-sm mt-2">Créer une facture</p>
              <div className="flex items-center gap-2 mt-4 text-purple-600 font-semibold text-sm">
                <span>Créer</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>

          <Link href="/dashboard/clients">
            <div className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl hover:shadow-lg hover:scale-105 cursor-pointer transition transform duration-200">
              <div className="bg-emerald-200 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-emerald-700" />
              </div>
              <p className="font-bold text-gray-900 text-lg">Nouveau client</p>
              <p className="text-gray-600 text-sm mt-2">Ajouter un client</p>
              <div className="flex items-center gap-2 mt-4 text-emerald-600 font-semibold text-sm">
                <span>Créer</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>

          <Link href="/dashboard/prospects">
            <div className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl hover:shadow-lg hover:scale-105 cursor-pointer transition transform duration-200">
              <div className="bg-orange-200 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Plus className="w-6 h-6 text-orange-700" />
              </div>
              <p className="font-bold text-gray-900 text-lg">Nouveau prospect</p>
              <p className="text-gray-600 text-sm mt-2">Ajouter un prospect</p>
              <div className="flex items-center gap-2 mt-4 text-orange-600 font-semibold text-sm">
                <span>Créer</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        </div>
      </Card>
    </div>
  )
}