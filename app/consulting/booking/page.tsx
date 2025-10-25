'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, Check } from 'lucide-react'

const AVAILABLE_HOURS = [
  '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00'
]

export default function BookingPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    sector: '',
    date: '',
    time: '',
  })

  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Générer dates disponibles (7-30 jours à partir d'aujourd'hui)
  const getAvailableDates = () => {
    const dates = []
    const today = new Date()
    
    for (let i = 7; i <= 30; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() + i)
      
      // Exclure weekends
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        dates.push(date)
      }
    }
    
    return dates
  }

  const availableDates = getAvailableDates()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validation
      if (!formData.name || !formData.email || !formData.date || !formData.time) {
        setError('Tous les champs obligatoires doivent être remplis')
        return
      }

      // Combiner date + time
      const [year, month, day] = formData.date.split('-')
      const [hour, minute] = formData.time.split(':')
      const scheduledDate = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hour),
        parseInt(minute)
      )

      const response = await fetch('/api/consulting/book-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          company: formData.company || 'N/A',
          phone: formData.phone || null,
          sector: formData.sector,
          scheduled_date: scheduledDate.toISOString(),
          duration_minutes: 30,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la réservation')
      }

      setSubmitted(true)
      setFormData({
        name: '',
        email: '',
        company: '',
        phone: '',
        sector: '',
        date: '',
        time: '',
      })

      // Rediriger après 3 secondes
      setTimeout(() => {
        window.location.href = '/consulting?success=true'
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-12 text-center max-w-md shadow-2xl">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-green-600" />
          </div>

          <h1 className="text-4xl font-bold text-white mb-4">Réservation confirmée !</h1>

          <p className="text-green-100 text-lg mb-2">
            Un email de confirmation a été envoyé à:
          </p>
          <p className="text-white font-semibold mb-6">{formData.email}</p>

          <div className="bg-white/20 backdrop-blur-sm p-4 rounded-lg mb-6 border border-white/30">
            <p className="text-green-100">
              Nous vous contacterons bientôt pour confirmer votre audit.
            </p>
          </div>

          <Link href="/consulting">
            <button className="w-full px-6 py-3 bg-white text-green-600 rounded-lg font-bold hover:bg-green-50 transition-colors">
              Retour à la page d'accueil
            </button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <Link href="/consulting" className="flex items-center gap-2 text-blue-100 hover:text-white mb-6 transition-colors">
            <ArrowLeft size={20} />
            Retour
          </Link>

          <h1 className="text-4xl font-bold text-white">
            Réserver votre audit gratuit
          </h1>
          <p className="text-blue-100 mt-2">30 minutes pour identifier vos gains</p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 py-12">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-100 p-4 rounded-lg">
              {error}
            </div>
          )}

          {/* Infos personnelles */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">1</span>
              Vos informations
            </h2>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Prénom et Nom *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Jean Dupont"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="jean@exemple.fr"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Entreprise
              </label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="Dupont Électricité"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Téléphone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="06 12 34 56 78"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Secteur d'activité *
              </label>
              <select
                name="sector"
                value={formData.sector}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                required
              >
                <option value="">-- Sélectionnez un secteur --</option>
                <option value="Électricité">Électricité</option>
                <option value="Plomberie">Plomberie</option>
                <option value="Menuiserie">Menuiserie</option>
                <option value="Immobilier">Immobilier</option>
                <option value="Commerce">Commerce</option>
                <option value="Services">Services</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
          </div>

          {/* Date & Time */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">2</span>
              Choisissez une date et heure
            </h2>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Date *
              </label>
              <select
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                required
              >
                <option value="">-- Sélectionnez une date --</option>
                {availableDates.map((date) => {
                  const dateStr = date.toISOString().split('T')[0]
                  const label = date.toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                  })
                  return (
                    <option key={dateStr} value={dateStr}>
                      {label}
                    </option>
                  )
                })}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Heure *
              </label>
              <select
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                required
              >
                <option value="">-- Sélectionnez une heure --</option>
                {AVAILABLE_HOURS.map((hour) => (
                  <option key={hour} value={hour}>
                    {hour}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-blue-500/10 border border-blue-400/30 p-4 rounded-lg">
              <p className="text-sm text-blue-200">
                💡 Les audits se font par Zoom. Vous recevrez un lien de connexion par email.
              </p>
            </div>
          </div>

          {/* Summary */}
          {formData.name && formData.email && formData.date && formData.time && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4">📋 Résumé</h3>
              <div className="space-y-2 text-slate-300">
                <p><strong>Nom:</strong> {formData.name}</p>
                <p><strong>Email:</strong> {formData.email}</p>
                <p><strong>Secteur:</strong> {formData.sector}</p>
                <p><strong>Date & Heure:</strong> {new Date(formData.date).toLocaleDateString('fr-FR')} à {formData.time}</p>
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-600 disabled:to-slate-700 text-white rounded-lg font-bold text-lg transition-all shadow-lg"
          >
            {loading ? 'Réservation en cours...' : '✓ Confirmer ma réservation'}
          </button>

          <p className="text-center text-slate-400 text-sm">
            En réservant, vous acceptez que nous vous contactions par email pour confirmer votre audit.
          </p>
        </form>
      </div>
    </div>
  )
}