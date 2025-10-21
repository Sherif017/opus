'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { SignupData } from '@/lib/types'

export default function SignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState<SignupData>({
    email: '',
    password: '',
    nomEntreprise: '',
    nomArtisan: '',
    prenomArtisan: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Nettoyer erreur si l'utilisateur corrige
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.email) newErrors.email = 'Email requis'
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email invalide'
    }

    if (!formData.password) newErrors.password = 'Mot de passe requis'
    if (formData.password.length < 6) {
      newErrors.password = 'Minimum 6 caractères'
    }

    if (!formData.nomEntreprise) {
      newErrors.nomEntreprise = 'Nom entreprise requis'
    }

    if (!formData.nomArtisan) newErrors.nomArtisan = 'Nom requis'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

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

      // Rediriger vers login
      router.push('/auth/login?success=true')
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
        <h1 className="text-3xl font-bold mb-2">Inscription OPUS</h1>
        <p className="text-gray-600 mb-6">Créez votre compte artisan</p>

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

          <Input
            label="Nom entreprise"
            type="text"
            name="nomEntreprise"
            value={formData.nomEntreprise}
            onChange={handleChange}
            error={errors.nomEntreprise}
            placeholder="Ex: ABC Plomberie"
          />

          <Input
            label="Votre nom"
            type="text"
            name="nomArtisan"
            value={formData.nomArtisan}
            onChange={handleChange}
            error={errors.nomArtisan}
            placeholder="Dupont"
          />

          <Input
            label="Votre prénom"
            type="text"
            name="prenomArtisan"
            value={formData.prenomArtisan}
            onChange={handleChange}
            placeholder="Jean"
          />

          <Button
            type="submit"
            variant="primary"
            loading={loading}
            className="w-full"
          >
            S&apos;inscrire
          </Button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Déjà inscrit?{' '}
          <a href="/auth/login" className="text-blue-600 hover:underline">
            Connectez-vous
          </a>
        </p>
      </Card>
    </div>
  )
}