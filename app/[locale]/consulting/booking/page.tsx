'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check } from 'lucide-react'

export default function BookingPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    industry: '',
    challenge: '',
    preferredDate: '',
    preferredTime: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const validateStep = () => {
    if (step === 1) {
      if (!formData.fullName.trim()) {
        setError('Veuillez entrer votre nom')
        return false
      }
      if (!formData.email.trim() || !formData.email.includes('@')) {
        setError('Veuillez entrer un email valide')
        return false
      }
      if (!formData.phone.trim()) {
        setError('Veuillez entrer votre téléphone')
        return false
      }
    } else if (step === 2) {
      if (!formData.company.trim()) {
        setError('Veuillez entrer le nom de votre entreprise')
        return false
      }
      if (!formData.industry) {
        setError('Veuillez sélectionner votre secteur')
        return false
      }
    } else if (step === 3) {
      if (!formData.challenge.trim()) {
        setError('Veuillez décrire votre défi')
        return false
      }
      if (!formData.preferredDate) {
        setError('Veuillez sélectionner une date')
        return false
      }
      if (!formData.preferredTime) {
        setError('Veuillez sélectionner une heure')
        return false
      }
    }
    return true
  }

  const handleNext = () => {
    setError('')
    if (validateStep()) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    setError('')
    setStep(step - 1)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!formData.fullName || !formData.email || !formData.phone || !formData.company || !formData.industry || !formData.challenge || !formData.preferredDate || !formData.preferredTime) {
        setError('Veuillez remplir tous les champs')
        setLoading(false)
        return
      }

      const response = await fetch('/api/consulting/book-audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          company: formData.company,
          industry: formData.industry,
          challenge: formData.challenge,
          preferredDate: formData.preferredDate,
          preferredTime: formData.preferredTime,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || `Erreur ${response.status}`)
      }

      setSuccess(true)
      setStep(4)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue'
      setError(errorMessage)
      console.error('Booking error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 to-blue-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-8 sm:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/consulting" className="flex items-center gap-2 mb-4 sm:mb-6 hover:opacity-80 transition-opacity w-fit text-sm sm:text-base">
            <ArrowLeft size={20} />
            <span>Retour</span>
          </Link>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-4">Réserver votre audit gratuit</h1>
          <p className="text-sm sm:text-base md:text-xl opacity-90">30 minutes pour identifier vos gains</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 sm:px-6 py-3 sm:py-4 rounded-lg mb-6 sm:mb-8 text-sm sm:text-base">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && step === 4 && (
          <div className="bg-green-500/20 border border-green-500 rounded-lg p-6 sm:p-8 text-center">
            <div className="flex justify-center mb-3 sm:mb-4">
              <div className="bg-green-500 rounded-full p-3 sm:p-4">
                <Check size={32} className="text-white" />
              </div>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Audit réservé! 🎉</h2>
            <p className="text-sm sm:text-base text-gray-200 mb-6">
              Vérifiez votre email pour les détails de votre rendez-vous.
              Nous vous contacterons dans les 24h pour confirmer.
            </p>
            <Link href="/">
              <button className="w-full sm:w-auto px-6 py-2 sm:py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-colors text-sm sm:text-base">
                Retour à l'accueil
              </button>
            </Link>
          </div>
        )}

        {step < 4 && (
          <form onSubmit={handleSubmit} className="bg-gray-900 rounded-lg sm:rounded-xl p-6 sm:p-8 text-white">
            {/* Step Indicator */}
            <div className="flex gap-3 sm:gap-4 mb-8">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`flex-1 h-2 rounded-full transition-colors ${
                    s <= step ? 'bg-blue-500' : 'bg-gray-700'
                  }`}
                />
              ))}
            </div>

            {/* Step 1: Personal Info */}
            {step === 1 && (
              <div>
                <div className="flex items-center gap-3 mb-6 sm:mb-8">
                  <div className="w-9 sm:w-10 h-9 sm:h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold text-sm sm:text-base">1</div>
                  <h2 className="text-xl sm:text-2xl font-bold">Vos informations</h2>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold mb-2">Prénom et Nom *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Jean Dupont"
                      className="w-full px-4 py-2.5 sm:py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-colors text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold mb-2">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="jean@example.com"
                      className="w-full px-4 py-2.5 sm:py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-colors text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold mb-2">Téléphone *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+33 6 12 34 56 78"
                      className="w-full px-4 py-2.5 sm:py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-colors text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Company Info */}
            {step === 2 && (
              <div>
                <div className="flex items-center gap-3 mb-6 sm:mb-8">
                  <div className="w-9 sm:w-10 h-9 sm:h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold text-sm sm:text-base">2</div>
                  <h2 className="text-xl sm:text-2xl font-bold">Votre entreprise</h2>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold mb-2">Entreprise *</label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      placeholder="Votre entreprise"
                      className="w-full px-4 py-2.5 sm:py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-colors text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold mb-2">Secteur *</label>
                    <select
                      name="industry"
                      value={formData.industry}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 sm:py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none transition-colors text-sm"
                    >
                      <option value="">Sélectionner un secteur</option>
                      <option value="artisan">Artisan</option>
                      <option value="pme">PME</option>
                      <option value="agence">Agence</option>
                      <option value="immobilier">Immobilier</option>
                      <option value="services">Services</option>
                      <option value="commerce">Commerce</option>
                      <option value="other">Autre</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Challenge & Availability */}
            {step === 3 && (
              <div>
                <div className="flex items-center gap-3 mb-6 sm:mb-8">
                  <div className="w-9 sm:w-10 h-9 sm:h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold text-sm sm:text-base">3</div>
                  <h2 className="text-xl sm:text-2xl font-bold">Votre situation</h2>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold mb-2">Quel est votre plus grand défi? *</label>
                    <textarea
                      name="challenge"
                      value={formData.challenge}
                      onChange={handleInputChange}
                      placeholder="Ex: On passe 40h/mois sur les devis et relances..."
                      rows={4}
                      className="w-full px-4 py-2.5 sm:py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-colors resize-none text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold mb-2">Date préférée *</label>
                    <input
                      type="date"
                      name="preferredDate"
                      value={formData.preferredDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 sm:py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none transition-colors text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold mb-2">Heure préférée *</label>
                    <select
                      name="preferredTime"
                      value={formData.preferredTime}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 sm:py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none transition-colors text-sm"
                    >
                      <option value="">Sélectionner une heure</option>
                      <option value="09:00">09:00</option>
                      <option value="10:00">10:00</option>
                      <option value="11:00">11:00</option>
                      <option value="14:00">14:00</option>
                      <option value="15:00">15:00</option>
                      <option value="16:00">16:00</option>
                      <option value="17:00">17:00</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-8">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 px-6 py-2.5 sm:py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold transition-colors text-sm sm:text-base"
                >
                  Retour
                </button>
              )}

              {step < 3 && (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 px-6 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors text-sm sm:text-base"
                >
                  Suivant
                </button>
              )}

              {step === 3 && (
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-2.5 sm:py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white rounded-lg font-bold transition-colors text-sm sm:text-base"
                >
                  {loading ? 'Réservation en cours...' : 'Réserver'}
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  )
}