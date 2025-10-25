'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Mail, Calendar, Zap } from 'lucide-react'

interface Lead {
  id: string
  email: string
  name: string
  company?: string
  status: string
  created_at: string
  audits?: any[]
}

export default function ConsultingDashboard() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLeads()
  }, [])

  const loadLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('consulting_leads')
        .select('*, consulting_audits(id, status, scheduled_date)')
        .order('created_at', { ascending: false })

      if (error) throw error
      setLeads(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: 'bg-blue-100 text-blue-700',
      qualified: 'bg-green-100 text-green-700',
      proposed: 'bg-yellow-100 text-yellow-700',
      won: 'bg-purple-100 text-purple-700',
      lost: 'bg-red-100 text-red-700',
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Consulting CRM</h1>
        <p className="text-gray-600 mt-2">Manage your leads & audits</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Leads</p>
              <p className="text-3xl font-bold">{leads.length}</p>
            </div>
            <Mail className="w-12 h-12 text-blue-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Qualified</p>
              <p className="text-3xl font-bold">{leads.filter(l => l.status === 'qualified').length}</p>
            </div>
            <Calendar className="w-12 h-12 text-green-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Won</p>
              <p className="text-3xl font-bold">{leads.filter(l => l.status === 'won').length}</p>
            </div>
            <Zap className="w-12 h-12 text-purple-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-orange-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Conversion %</p>
              <p className="text-3xl font-bold">
                {leads.length > 0
                  ? Math.round(
                      (leads.filter(l => l.status === 'won').length / leads.length) * 100
                    )
                  : 0}
                %
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Company</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Joined</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{lead.name}</td>
                <td className="px-6 py-4 text-sm">{lead.email}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{lead.company || '-'}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(lead.status)}`}>
                    {lead.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(lead.created_at).toLocaleDateString('fr-FR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}