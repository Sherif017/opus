'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { LoginData } from '@/lib/types'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const success = searchParams.get('success')

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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

      // Rediriger vers dashboard
      router.push('/dashboard')
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : 'Erreur serveur',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <h1 className="text-3xl font-bold mb-2">Connexion OPUS</h1>
        <p className="text-gray-600 mb-6">Connectez-vous à votre compte</p>

        {success && (
          <div className="bg-green-50 text-green-700 p-3 rounded mb-4">
            ✓ Inscription réussie! Connectez-vous maintenant.
          </div>
        )}

        {errors.submit && (
          <div className="bg-red-50 text-red-700 p-3 rounded mb-4">
            {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="vous@example.com"
          />

          <Input
            label="Mot de passe"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            placeholder="••••••"
          />

          <Button
            type="submit"
            variant="primary"
            loading={loading}
            className="w-full"
          >
            Se connecter
          </Button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Pas encore de compte?{' '}
          <a href="/auth/signup" className="text-blue-600 hover:underline">
            S&apos;inscrire
          </a>
        </p>
      </Card>
    </div>
  )
}