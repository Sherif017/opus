'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { TrendingUp, TrendingDown, Plus, ArrowRight, Users, FileText, DollarSign, BarChart3, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface KPIs {
  totalClients: number
  totalProspects: number
  devisEnCours: number
  facturesImpayees: number
  totalRevenus: number
  revenusMonth: number
  clientsThisMonth: number
  devisThisMonth: number
}

interface Trend {
  clients: { value: number; trend: number }
  devis: { value: number; trend: number }
  revenus: { value: number; trend: number }
}

interface ChartDataItem {
  name: string
  revenus: number
}

export default function DashboardPage() {
  const [kpis, setKpis] = useState<KPIs>({
    totalClients: 0,
    totalProspects: 0,
    devisEnCours: 0,
    facturesImpayees: 0,
    totalRevenus: 0,
    revenusMonth: 0,
    clientsThisMonth: 0,
    devisThisMonth: 0,
  })
  const [trends, setTrends] = useState<Trend>({
    clients: { value: 0, trend: 0 },
    devis: { value: 0, trend: 0 },
    revenus: { value: 0, trend: 0 },
  })
  const [chartData, setChartData] = useState<ChartDataItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const { data: user } = await supabase
        .from('utilisateurs')
        .select('entreprise_id')
        .single()

      if (!user) return

      const companyId = user.entreprise_id
      const now = new Date()
      const currentMonth = now.getMonth()
      const currentYear = now.getFullYear()
      const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1
      const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear

      const firstDayCurrentMonth = new Date(currentYear, currentMonth, 1)
      const firstDayPreviousMonth = new Date(previousYear, previousMonth, 1)
      const firstDayCurrentMonthStr = firstDayCurrentMonth.toISOString()
      const firstDayPreviousMonthStr = firstDayPreviousMonth.toISOString()

      const [
        clientsRes,
        prospectsRes,
        devisRes,
        facturesRes,
        revenusRes,
        monthRevenusRes,
        clientsMonthRes,
        devisMonthRes,
        clientsPreviousRes,
        devisPreviousRes,
        revenusPreviousRes,
        monthlyDataRes,
      ] = await Promise.all([
        supabase
          .from('clients')
          .select('*', { count: 'exact', head: true })
          .eq('entreprise_id', companyId),
        supabase
          .from('prospects')
          .select('*', { count: 'exact', head: true })
          .eq('entreprise_id', companyId),
        supabase
          .from('devis')
          .select('*', { count: 'exact', head: true })
          .eq('entreprise_id', companyId)
          .neq('statut', 'facturé'),
        supabase
          .from('factures')
          .select('montant_total_ttc, montant_paye')
          .eq('entreprise_id', companyId)
          .neq('statut', 'payée'),
        supabase
          .from('factures')
          .select('montant_total_ttc')
          .eq('entreprise_id', companyId)
          .eq('statut', 'payée'),
        supabase
          .from('factures')
          .select('montant_total_ttc')
          .eq('entreprise_id', companyId)
          .eq('statut', 'payée')
          .gte('date_creation', firstDayCurrentMonthStr),
        supabase
          .from('clients')
          .select('*', { count: 'exact', head: true })
          .eq('entreprise_id', companyId)
          .gte('created_at', firstDayCurrentMonthStr),
        supabase
          .from('devis')
          .select('*', { count: 'exact', head: true })
          .eq('entreprise_id', companyId)
          .gte('date_creation', firstDayCurrentMonthStr),
        supabase
          .from('clients')
          .select('*', { count: 'exact', head: true })
          .eq('entreprise_id', companyId)
          .gte('created_at', firstDayPreviousMonthStr)
          .lt('created_at', firstDayCurrentMonthStr),
        supabase
          .from('devis')
          .select('*', { count: 'exact', head: true })
          .eq('entreprise_id', companyId)
          .gte('date_creation', firstDayPreviousMonthStr)
          .lt('date_creation', firstDayCurrentMonthStr),
        supabase
          .from('factures')
          .select('montant_total_ttc')
          .eq('entreprise_id', companyId)
          .eq('statut', 'payée')
          .gte('date_creation', firstDayPreviousMonthStr)
          .lt('date_creation', firstDayCurrentMonthStr),
        supabase
          .from('factures')
          .select('montant_total_ttc, date_creation')
          .eq('entreprise_id', companyId)
          .eq('statut', 'payée'),
      ])

      const facturesImpayees = facturesRes.data?.filter(
        (f) => (f.montant_paye || 0) < (f.montant_total_ttc || 0)
      ).length || 0

      const totalRevenus = revenusRes.data?.reduce((acc, f) => acc + (f.montant_total_ttc || 0), 0) || 0
      const revenusMonth = monthRevenusRes.data?.reduce((acc, f) => acc + (f.montant_total_ttc || 0), 0) || 0
      const revenusPrevious = revenusPreviousRes.data?.reduce((acc, f) => acc + (f.montant_total_ttc || 0), 0) || 0

      const clientsTrend = clientsPreviousRes.count ? 
        Math.round(((clientsMonthRes.count || 0) - (clientsPreviousRes.count || 0)) / (clientsPreviousRes.count || 1) * 100) : 0
      
      const devisTrend = devisPreviousRes.count ?
        Math.round(((devisMonthRes.count || 0) - (devisPreviousRes.count || 0)) / (devisPreviousRes.count || 1) * 100) : 0
      
      const revenusTrend = revenusPrevious ?
        Math.round(((revenusMonth || 0) - revenusPrevious) / revenusPrevious * 100) : 0

      setKpis({
        totalClients: clientsRes.count || 0,
        totalProspects: prospectsRes.count || 0,
        devisEnCours: devisRes.count || 0,
        facturesImpayees,
        totalRevenus,
        revenusMonth,
        clientsThisMonth: clientsMonthRes.count || 0,
        devisThisMonth: devisMonthRes.count || 0,
      })

      setTrends({
        clients: { value: clientsMonthRes.count || 0, trend: clientsTrend },
        devis: { value: devisMonthRes.count || 0, trend: devisTrend },
        revenus: { value: revenusMonth, trend: revenusTrend },
      })

      const monthlyRevenus: Record<string, number> = {}
      monthlyDataRes.data?.forEach((facture) => {
        const date = new Date(facture.date_creation)
        const monthKey = date.toLocaleString('fr-FR', { month: 'short', year: '2-digit' })
        monthlyRevenus[monthKey] = (monthlyRevenus[monthKey] || 0) + (facture.montant_total_ttc || 0)
      })

      const months: ChartDataItem[] = []
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthKey = date.toLocaleString('fr-FR', { month: 'short', year: '2-digit' })
        months.push({
          name: monthKey,
          revenus: monthlyRevenus[monthKey] || 0,
        })
      }

      setChartData(months)
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-blue-100 mx-auto mb-4 flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-gray-700 font-semibold">Chargement du dashboard...</p>
        </div>
      </div>
    )
  }

  interface KPICardProps {
    title: string
    value: number | string
    subtitle?: string
    trend?: number
    icon: React.ComponentType<{ className: string }>
    bgColor: string
    iconColor: string
  }

  const KPICard: React.FC<KPICardProps> = ({ 
    title, 
    value, 
    subtitle, 
    trend, 
    icon: Icon, 
    bgColor, 
    iconColor 
  }) => (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 font-medium mb-2">{title}</p>
          <p className="text-4xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-600 mt-2">{subtitle}</p>}
        </div>
        <div className={`p-4 rounded-xl ${bgColor} flex-shrink-0`}>
          <Icon className={`w-7 h-7 ${iconColor}`} />
        </div>
      </div>
      {trend !== undefined && (
        <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
          {trend > 0 ? (
            <>
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <span className="text-base font-semibold text-emerald-600">+{trend}%</span>
            </>
          ) : trend < 0 ? (
            <>
              <TrendingDown className="w-5 h-5 text-red-600" />
              <span className="text-base font-semibold text-red-600">{trend}%</span>
            </>
          ) : (
            <span className="text-base text-gray-500">-</span>
          )}
          <span className="text-sm text-gray-600">vs mois dernier</span>
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-5xl font-bold text-gray-900 mb-3">Dashboard</h1>
          <p className="text-lg text-gray-700">Bienvenue ! Voici votre activité ce mois.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link
            href="/dashboard/devis/new"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            Nouveau devis
          </Link>
          <Link
            href="/dashboard/factures/new"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            Nouvelle facture
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Clients totaux"
          value={kpis.totalClients}
          subtitle={`${kpis.clientsThisMonth} ce mois`}
          trend={trends.clients.trend}
          icon={Users}
          bgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
        <KPICard
          title="Prospects"
          value={kpis.totalProspects}
          icon={TrendingUp}
          bgColor="bg-purple-100"
          iconColor="text-purple-600"
        />
        <KPICard
          title="Devis en cours"
          value={kpis.devisEnCours}
          subtitle={`${kpis.devisThisMonth} ce mois`}
          trend={trends.devis.trend}
          icon={FileText}
          bgColor="bg-amber-100"
          iconColor="text-amber-600"
        />
        <KPICard
          title="Factures impayées"
          value={kpis.facturesImpayees}
          icon={AlertCircle}
          bgColor="bg-red-100"
          iconColor="text-red-600"
        />
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard
          title="Revenus total"
          value={`${kpis.totalRevenus.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}€`}
          icon={DollarSign}
          bgColor="bg-emerald-100"
          iconColor="text-emerald-600"
        />
        <KPICard
          title="Revenus ce mois"
          value={`${kpis.revenusMonth.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}€`}
          trend={trends.revenus.trend}
          icon={DollarSign}
          bgColor="bg-teal-100"
          iconColor="text-teal-600"
        />
        <KPICard
          title="Revenu moyen/client"
          value={kpis.totalClients > 0 ? `${(kpis.totalRevenus / kpis.totalClients).toLocaleString('fr-FR', { maximumFractionDigits: 0 })}€` : '0€'}
          icon={BarChart3}
          bgColor="bg-cyan-100"
          iconColor="text-cyan-600"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Revenus (6 derniers mois)</h2>
            <p className="text-sm text-gray-600">Évolution de vos revenus mensuels</p>
          </div>
          <ResponsiveContainer width="100%" height={420}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 60, bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="#6b7280"
                tick={{ fontSize: 13, fontWeight: 500, fill: '#374151' }}
                label={{ 
                  value: 'Mois', 
                  position: 'bottom', 
                  offset: 15, 
                  fontSize: 14, 
                  fontWeight: 600, 
                  fill: '#111827' 
                }}
              />
              <YAxis 
                stroke="#6b7280"
                tick={{ fontSize: 13, fontWeight: 500, fill: '#374151' }}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k€`}
                label={{ 
                  value: 'Montant (€)', 
                  angle: -90, 
                  position: 'insideLeft', 
                  offset: -10, 
                  fontSize: 14, 
                  fontWeight: 600, 
                  fill: '#111827' 
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '2px solid #3b82f6',
                  borderRadius: '12px',
                  color: '#111827',
                  padding: '16px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                }}
                labelStyle={{ color: '#111827', fontWeight: '700', fontSize: '15px', marginBottom: '8px', display: 'block' }}
                formatter={(value: number) => [
                  `${value.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}€`,
                  'Revenus'
                ]}
              />
              <Bar 
                dataKey="revenus" 
                fill="#10b981" 
                radius={[12, 12, 0, 0]}
                isAnimationActive={true}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Actions */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Actions rapides</h2>
          <div className="space-y-4">
            <Link
              href="/dashboard/clients/new"
              className="flex items-center justify-between p-4 bg-gray-50 hover:bg-blue-50 rounded-xl transition-all group border border-gray-200 hover:border-blue-300"
            >
              <span className="text-base text-gray-800 group-hover:text-gray-900 font-semibold">Ajouter un client</span>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </Link>
            <Link
              href="/dashboard/prospects/new"
              className="flex items-center justify-between p-4 bg-gray-50 hover:bg-purple-50 rounded-xl transition-all group border border-gray-200 hover:border-purple-300"
            >
              <span className="text-base text-gray-800 group-hover:text-gray-900 font-semibold">Ajouter un prospect</span>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
            </Link>
            <Link
              href="/dashboard/rendez-vous/new"
              className="flex items-center justify-between p-4 bg-gray-50 hover:bg-emerald-50 rounded-xl transition-all group border border-gray-200 hover:border-emerald-300"
            >
              <span className="text-base text-gray-800 group-hover:text-gray-900 font-semibold">Planifier un RDV</span>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 transition-colors" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}