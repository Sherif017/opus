'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'
import { Card } from '@/components/ui/Card'
import { Calendar, Mail, Phone, Building2, CheckCircle, Clock, XCircle } from 'lucide-react'

interface Booking {
  id: string
  full_name: string
  email: string
  phone: string
  company: string
  industry: string
  challenge: string
  preferred_date: string
  preferred_time: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  created_at: string
}

const ADMIN_EMAIL = 'cheryfhanfo@gmail.com'

export default function AuditsPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all')
  const [isAdmin, setIsAdmin] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    checkAdmin()
  }, [])

  const checkAdmin = async () => {
    try {
      setLoading(true)

      // Récupérer l'utilisateur connecté
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        console.error('Not authenticated')
        router.push('/login')
        return
      }

      setUserEmail(user.email || null)

      // Vérifier si c'est l'admin
      if (user.email === ADMIN_EMAIL) {
        setIsAdmin(true)
        await loadBookings()
      } else {
        console.warn('Access denied: Not admin')
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error checking admin:', error)
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const loadBookings = async () => {
    try {
      let query = supabase
        .from('consulting_bookings')
        .select('*')
        .order('preferred_date', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data, error } = await query

      if (error) throw error

      setBookings(data || [])
    } catch (error) {
      console.error('Error loading bookings:', error)
    }
  }

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('consulting_bookings')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error

      // Mettre à jour l'interface
      setBookings(bookings.map(b => b.id === id ? { ...b, status: newStatus as any } : b))
    } catch (error) {
      console.error('Error updating booking:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-200'
      case 'confirmed':
        return 'bg-blue-500/20 text-blue-200'
      case 'completed':
        return 'bg-green-500/20 text-green-200'
      case 'cancelled':
        return 'bg-red-500/20 text-red-200'
      default:
        return 'bg-gray-500/20 text-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />
      case 'completed':
        return <CheckCircle className="w-4 h-4" />
      case 'cancelled':
        return <XCircle className="w-4 h-4" />
      default:
        return null
    }
  }

  const filteredBookings = filter === 'all' ? bookings : bookings.filter(b => b.status === filter)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-gray-600">Vérification des droits d'accès...</p>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-red-600">Accès refusé. Vous n'avez pas les droits pour accéder à cette page.</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">📅 Audits Réservés</h1>
        <p className="text-gray-600">Gestion des réservations d'audits gratuits</p>
        <p className="text-sm text-gray-500 mt-2">Connecté en tant que : <span className="font-semibold">{userEmail}</span></p>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status === 'all' && 'Tous'}
            {status === 'pending' && `⏳ En attente (${bookings.filter(b => b.status === 'pending').length})`}
            {status === 'confirmed' && `✅ Confirmés (${bookings.filter(b => b.status === 'confirmed').length})`}
            {status === 'completed' && `🎉 Complétés (${bookings.filter(b => b.status === 'completed').length})`}
            {status === 'cancelled' && `❌ Annulés (${bookings.filter(b => b.status === 'cancelled').length})`}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">En attente</p>
              <p className="text-3xl font-bold text-yellow-700">{bookings.filter(b => b.status === 'pending').length}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Confirmés</p>
              <p className="text-3xl font-bold text-blue-700">{bookings.filter(b => b.status === 'confirmed').length}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Complétés</p>
              <p className="text-3xl font-bold text-green-700">{bookings.filter(b => b.status === 'completed').length}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Annulés</p>
              <p className="text-3xl font-bold text-red-700">{bookings.filter(b => b.status === 'cancelled').length}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
        </Card>
      </div>

      {/* Liste des bookings */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Aucun audit trouvé</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map(booking => (
            <Card key={booking.id} className="p-6 bg-white border border-gray-200 hover:shadow-md transition-all">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Infos personnelles */}
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Nom</p>
                    <p className="font-bold text-gray-900">{booking.full_name}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-600" />
                    <a href={`mailto:${booking.email}`} className="text-blue-600 hover:underline">
                      {booking.email}
                    </a>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-600" />
                    <a href={`tel:${booking.phone}`} className="text-blue-600 hover:underline">
                      {booking.phone}
                    </a>
                  </div>
                </div>

                {/* Infos entreprise & rendez-vous */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Building2 className="w-4 h-4 text-gray-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Entreprise</p>
                      <p className="font-bold text-gray-900">{booking.company}</p>
                      <p className="text-sm text-gray-500">{booking.industry}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-gray-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Rendez-vous</p>
                      <p className="font-bold text-gray-900">
                        {new Date(booking.preferred_date).toLocaleDateString('fr-FR')} à {booking.preferred_time}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Défi */}
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600 mb-2">Défi</p>
                <p className="text-gray-700 line-clamp-2">{booking.challenge}</p>
              </div>

              {/* Actions */}
              <div className="mt-4 flex items-center justify-between">
                <div className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2 ${getStatusColor(booking.status)}`}>
                  {getStatusIcon(booking.status)}
                  {booking.status === 'pending' && 'En attente'}
                  {booking.status === 'confirmed' && 'Confirmé'}
                  {booking.status === 'completed' && 'Complété'}
                  {booking.status === 'cancelled' && 'Annulé'}
                </div>

                <div className="flex gap-2">
                  {booking.status === 'pending' && (
                    <button
                      onClick={() => updateStatus(booking.id, 'confirmed')}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-semibold transition-colors"
                    >
                      Confirmer
                    </button>
                  )}
                  {['pending', 'confirmed'].includes(booking.status) && (
                    <button
                      onClick={() => updateStatus(booking.id, 'cancelled')}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-semibold transition-colors"
                    >
                      Annuler
                    </button>
                  )}
                  {booking.status === 'confirmed' && (
                    <button
                      onClick={() => updateStatus(booking.id, 'completed')}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-semibold transition-colors"
                    >
                      Marquer comme complété
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}