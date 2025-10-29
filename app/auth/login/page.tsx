'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const success = searchParams.get('success')

  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

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
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur connexion')
      }

      console.log('✅ Connexion réussie, token:', data.session?.access_token)

      // Stocke la session dans Supabase côté client
      if (data.session?.access_token) {
        const { error } = await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token || '',
        })

        if (error) {
          console.error('❌ Erreur set session:', error)
          throw error
        }

        console.log('✅ Session stockée dans Supabase')
      }

      // Sauvegarder "Se souvenir de moi"
      if (rememberMe) {
        localStorage.setItem('rememberEmail', formData.email)
      } else {
        localStorage.removeItem('rememberEmail')
      }

      router.push('/dashboard')
    } catch (error) {
      console.error('❌ Erreur login:', error)
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
              <h1 className="text-3xl font-bold mb-2">Connexion</h1>
              <p className="text-slate-400">Accédez à votre compte Opus</p>
            </div>

            {/* Success message */}
            {success && (
              <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <p className="text-green-300 text-sm">
                  ✓ Inscription réussie ! Connectez-vous maintenant.
                </p>
              </div>
            )}

            {/* Error message */}
            {errors.submit && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-300 text-sm">{errors.submit}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
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
                    } text-white placeholder-slate-500`}
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
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-10 py-2.5 rounded-lg bg-slate-900/50 border transition-colors outline-none ${
                      errors.password
                        ? 'border-red-500/50 focus:border-red-500'
                        : 'border-slate-700 focus:border-blue-500'
                    } text-white placeholder-slate-500`}
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

              {/* Remember me & Forgot password */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-900/50 border-slate-700 cursor-pointer accent-blue-500"
                  />
                  <span className="text-slate-400 hover:text-slate-300">Se souvenir de moi</span>
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Mot de passe oublié ?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg font-semibold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/30 text-white mt-6"
              >
                {loading ? 'Connexion en cours...' : 'Se connecter'}
              </button>
            </form>

            {/* Signup link */}
            <p className="mt-6 text-center text-slate-400 text-sm">
              Pas encore de compte ?{' '}
              <Link
                href="/auth/signup"
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                S&apos;inscrire
              </Link>
            </p>
          </div>

          {/* Info box */}
          <div className="mt-6 p-4 bg-slate-800/30 border border-slate-700 rounded-lg">
            <p className="text-slate-400 text-sm text-center">
              💡 Compte de test : test@example.com / password123
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-slate-400">Chargement...</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}