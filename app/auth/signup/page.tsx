'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Lock, User, Building2, Eye, EyeOff, Check } from 'lucide-react'
import Link from 'next/link'

export default function SignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nomEntreprise: '',
    nomArtisan: '',
    prenomArtisan: '',
  })
  const [agreeTerms, setAgreeTerms] = useState(false)

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.email) {
      newErrors.email = 'Email requis'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email invalide'
    }

    if (!formData.password) {
      newErrors.password = 'Mot de passe requis'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Minimum 8 caractères'
    }

    if (!formData.nomEntreprise?.trim()) {
      newErrors.nomEntreprise = 'Nom entreprise requis'
    }

    if (!formData.nomArtisan?.trim()) {
      newErrors.nomArtisan = 'Nom requis'
    }

    if (!agreeTerms) {
      newErrors.terms = 'Vous devez accepter les conditions'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setErrors({})
    setLoading(true)

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur inscription')
      }

      // Rediriger vers page de confirmation d'email
      router.push('/auth/verify-email?email=' + encodeURIComponent(formData.email))
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : 'Erreur serveur',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
            OPUS
          </Link>
        </div>
      </nav>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-2xl p-8 backdrop-blur-sm">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Créer un compte</h1>
              <p className="text-slate-400">Rejoignez Opus gratuitement</p>
            </div>

            {/* Error message */}
            {errors.submit && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-300 text-sm">{errors.submit}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-200">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="vous@example.com"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-900/50 border transition-colors outline-none ${
                      errors.email
                        ? 'border-red-500/50 focus:border-red-500'
                        : 'border-slate-700 focus:border-blue-500'
                    } text-white placeholder-slate-500 text-sm`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-200">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimum 8 caractères"
                    className={`w-full pl-10 pr-10 py-2.5 rounded-lg bg-slate-900/50 border transition-colors outline-none ${
                      errors.password
                        ? 'border-red-500/50 focus:border-red-500'
                        : 'border-slate-700 focus:border-blue-500'
                    } text-white placeholder-slate-500 text-sm`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-400">{errors.password}</p>
                )}
              </div>

              {/* Company Name */}
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-200">
                  Nom de votre entreprise
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    name="nomEntreprise"
                    value={formData.nomEntreprise}
                    onChange={handleChange}
                    placeholder="Ex: ABC Plomberie"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-900/50 border transition-colors outline-none ${
                      errors.nomEntreprise
                        ? 'border-red-500/50 focus:border-red-500'
                        : 'border-slate-700 focus:border-blue-500'
                    } text-white placeholder-slate-500 text-sm`}
                  />
                </div>
                {errors.nomEntreprise && (
                  <p className="mt-1 text-sm text-red-400">{errors.nomEntreprise}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-200">
                  Votre nom
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    name="nomArtisan"
                    value={formData.nomArtisan}
                    onChange={handleChange}
                    placeholder="Dupont"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-900/50 border transition-colors outline-none ${
                      errors.nomArtisan
                        ? 'border-red-500/50 focus:border-red-500'
                        : 'border-slate-700 focus:border-blue-500'
                    } text-white placeholder-slate-500 text-sm`}
                  />
                </div>
                {errors.nomArtisan && (
                  <p className="mt-1 text-sm text-red-400">{errors.nomArtisan}</p>
                )}
              </div>

              {/* First Name */}
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-200">
                  Votre prénom
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    name="prenomArtisan"
                    value={formData.prenomArtisan}
                    onChange={handleChange}
                    placeholder="Jean"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-900/50 border border-slate-700 focus:border-blue-500 transition-colors outline-none text-white placeholder-slate-500 text-sm"
                  />
                </div>
              </div>

              {/* Terms */}
              <div className="flex items-start gap-2 pt-2">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-900/50 border-slate-700 cursor-pointer accent-blue-500 mt-0.5"
                />
                <label className="text-slate-400 text-sm cursor-pointer leading-relaxed">
                  J&apos;accepte les{' '}
                  <a href="#" className="text-blue-400 hover:text-blue-300">
                    conditions d&apos;utilisation
                  </a>
                  {' '}et la{' '}
                  <a href="#" className="text-blue-400 hover:text-blue-300">
                    politique de confidentialité
                  </a>
                </label>
              </div>
              {errors.terms && (
                <p className="text-sm text-red-400">{errors.terms}</p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg font-semibold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-green-500/30 text-white mt-6"
              >
                {loading ? 'Inscription en cours...' : 'Créer mon compte'}
              </button>
            </form>

            {/* Login link */}
            <p className="mt-6 text-center text-slate-400 text-sm">
              Déjà inscrit ?{' '}
              <Link
                href="/auth/login"
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                Se connecter
              </Link>
            </p>
          </div>

          {/* Benefits box */}
          <div className="mt-6 p-4 bg-slate-800/30 border border-slate-700 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-slate-300 text-sm">
              <Check className="w-4 h-4 text-green-400" />
              <span>Accès complet gratuit</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300 text-sm">
              <Check className="w-4 h-4 text-green-400" />
              <span>Sans carte bancaire</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300 text-sm">
              <Check className="w-4 h-4 text-green-400" />
              <span>Aidez-nous à améliorer Opus</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}