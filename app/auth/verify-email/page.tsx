'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Mail, ArrowRight, CheckCircle } from 'lucide-react'
import Link from 'next/link'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [timeLeft])

  const handleResendEmail = async () => {
    setResending(true)
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setResent(true)
        setTimeLeft(60)
        setTimeout(() => setResent(false), 3000)
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setResending(false)
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
        <div className="w-full max-w-md text-center">
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center">
              <Mail className="w-10 h-10 text-blue-400" />
            </div>
          </div>

          {/* Content */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-2xl p-8 backdrop-blur-sm">
            <h1 className="text-3xl font-bold mb-2">Vérifiez votre email</h1>
            <p className="text-slate-400 mb-6">
              Nous avons envoyé un lien de confirmation à<br />
              <span className="text-blue-400 font-medium">{email}</span>
            </p>

            {/* Steps */}
            <div className="space-y-4 text-left mb-8">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/50 flex items-center justify-center text-blue-400 text-sm font-bold">
                  1
                </div>
                <div>
                  <p className="text-slate-300 text-sm">Ouvrez votre email</p>
                  <p className="text-slate-500 text-xs">Vérifiez le dossier spam si nécessaire</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/50 flex items-center justify-center text-blue-400 text-sm font-bold">
                  2
                </div>
                <div>
                  <p className="text-slate-300 text-sm">Cliquez sur le lien de confirmation</p>
                  <p className="text-slate-500 text-xs">Valide votre adresse email</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center text-green-400 text-sm font-bold">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-slate-300 text-sm">Accédez à votre compte</p>
                  <p className="text-slate-500 text-xs">Commencez à utiliser Opus</p>
                </div>
              </div>
            </div>

            {/* Info box */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
              <p className="text-blue-300 text-sm">
                💡 Assurez-vous que l&apos;email de confirmation a été reçu. Le lien expires dans 24 heures.
              </p>
            </div>

            {/* Resend button */}
            <div className="space-y-3">
              {resent && (
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <p className="text-green-300 text-sm">✓ Email de confirmation renvoyé</p>
                </div>
              )}

              <button
                onClick={handleResendEmail}
                disabled={resending || timeLeft > 0}
                className="w-full py-2.5 rounded-lg font-semibold bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-slate-200 text-sm"
              >
                {resending ? 'Envoi en cours...' : timeLeft > 0 ? `Renvoyer dans ${timeLeft}s` : `Renvoyer l&apos;email`}
              </button>

              <Link
                href="/auth/login"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg font-semibold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-500/30 text-white"
              >
                Continuer vers la connexion
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Help text */}
          <p className="mt-6 text-slate-500 text-sm">
            Besoin d&apos;aide ?{' '}
            <a href="mailto:support@opus.app" className="text-blue-400 hover:text-blue-300">
              Contactez le support
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-slate-400">Chargement...</div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}