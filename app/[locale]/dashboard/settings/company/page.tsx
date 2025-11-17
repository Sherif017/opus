'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Loader, Upload, X, Eye, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase-client'

interface CompanyData {
  id: string
  nom: string
  logo_url: string | null
  siret: string | null
  siren: string | null
  tva_number: string | null
  adresse: string | null
  code_postal: string | null
  ville: string | null
  telephone: string | null
  email: string | null
  conditions_paiement: number
}

interface FormData {
  nom: string
  siret: string
  siren: string
  tva_number: string
  adresse: string
  code_postal: string
  ville: string
  telephone: string
  email: string
  conditions_paiement: number
}

export default function CompanySettingsPage() {
  const router = useRouter()
  const [userData, setUserData] = useState<{ entreprise_id: string } | null>(null)
  const [companyData, setCompanyData] = useState<CompanyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [previewLogo, setPreviewLogo] = useState<string | null>(null)
  const [showLogoPreview, setShowLogoPreview] = useState(false)

  const [formData, setFormData] = useState<FormData>({
    nom: '',
    siret: '',
    siren: '',
    tva_number: '',
    adresse: '',
    code_postal: '',
    ville: '',
    telephone: '',
    email: '',
    conditions_paiement: 30,
  })

  // Charge les données au mount
  useEffect(() => {
    let isMounted = true

    const initPage = async () => {
      try {
        setLoading(true)

        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!isMounted) return

        if (session?.user) {
          await loadUserData(session.user.id)
        } else {
          const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, newSession) => {
              if (!isMounted) return

              if (newSession?.user) {
                await loadUserData(newSession.user.id)
              } else {
                router.push('/auth/login')
              }

              setLoading(false)
            }
          )

          return () => subscription?.unsubscribe()
        }

        setLoading(false)
      } catch (err) {
        console.error('❌ Erreur init:', err)
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    const cleanup = initPage()

    return () => {
      isMounted = false
      cleanup?.then(fn => fn?.())
    }
  }, [router])

  /**
   * ✅ Charger les infos utilisateur et entreprise
   */
  const loadUserData = async (userId: string) => {
    try {
      // Récupère l'entreprise_id depuis la table utilisateurs
      const { data: userData, error: userError } = await supabase
        .from('utilisateurs')
        .select('entreprise_id')
        .eq('id', userId)
        .single()

      if (userError) throw userError

      if (!userData?.entreprise_id) {
        throw new Error('Entreprise non trouvée')
      }

      setUserData({
        entreprise_id: userData.entreprise_id,
      })

      // Récupère les données de l'entreprise
      await loadCompanyData(userData.entreprise_id)
    } catch (err) {
      console.error('❌ Erreur chargement utilisateur:', err)
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement')
    }
  }

  /**
   * ✅ Charger les données de l'entreprise
   */
  const loadCompanyData = async (entrepriseId: string) => {
    try {
      const { data: company, error: companyError } = await supabase
        .from('entreprises')
        .select('*')
        .eq('id', entrepriseId)
        .single()

      if (companyError) throw companyError

      if (!company) {
        throw new Error('Données entreprise non trouvées')
      }

      setCompanyData(company)
      setFormData({
        nom: company.nom || '',
        siret: company.siret || '',
        siren: company.siren || '',
        tva_number: company.tva_number || '',
        adresse: company.adresse || '',
        code_postal: company.code_postal || '',
        ville: company.ville || '',
        telephone: company.telephone || '',
        email: company.email || '',
        conditions_paiement: company.conditions_paiement || 30,
      })

      if (company.logo_url) {
        setPreviewLogo(company.logo_url)
      }
    } catch (err) {
      console.error('❌ Erreur chargement entreprise:', err)
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'conditions_paiement' ? parseInt(value) : value,
    }))
  }

  /**
   * ✅ Upload du logo
   */
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setError('')
      const file = e.target.files?.[0]

      if (!file) return
      if (!userData) {
        setError('Données utilisateur non trouvées')
        return
      }

      setUploading(true)

      // Créer un nom unique pour le fichier
      const fileName = `${userData.entreprise_id}-${Date.now()}-${file.name}`
      const filePath = `${fileName}`

      // Uploader le fichier
      const { data, error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, file, {
          upsert: false,
        })

      if (uploadError) throw uploadError

      // Obtenir l'URL publique
      const { data: publicUrlData } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath)

      const logoUrl = publicUrlData.publicUrl

      // Mettre à jour la base de données
      const { error: updateError } = await supabase
        .from('entreprises')
        .update({ logo_url: logoUrl })
        .eq('id', userData.entreprise_id)

      if (updateError) throw updateError

      // Mettre à jour l'état
      setPreviewLogo(logoUrl)
      setCompanyData((prev) => prev ? { ...prev, logo_url: logoUrl } : null)

      // Réinitialiser l'input
      e.target.value = ''
    } catch (err) {
      console.error('❌ Erreur upload:', err)
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'upload')
    } finally {
      setUploading(false)
    }
  }

  /**
   * ✅ Supprimer le logo
   */
  const handleDeleteLogo = async () => {
    try {
      setError('')

      if (!userData || !companyData?.logo_url) {
        setError('Logo non trouvé')
        return
      }

      setUploading(true)

      // Extraire le nom du fichier de l'URL
      const url = new URL(companyData.logo_url)
      const fileName = url.pathname.split('/').pop()

      if (!fileName) {
        throw new Error('Impossible de déterminer le nom du fichier')
      }

      // Supprimer du storage
      const { error: deleteError } = await supabase.storage
        .from('logos')
        .remove([fileName])

      if (deleteError) throw deleteError

      // Mettre à jour la base de données
      const { error: updateError } = await supabase
        .from('entreprises')
        .update({ logo_url: null })
        .eq('id', userData.entreprise_id)

      if (updateError) throw updateError

      // Mettre à jour l'état
      setPreviewLogo(null)
      setCompanyData((prev) => prev ? { ...prev, logo_url: null } : null)
    } catch (err) {
      console.error('❌ Erreur suppression:', err)
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression')
    } finally {
      setUploading(false)
    }
  }

  /**
   * ✅ Sauvegarder les données
   */
  const handleSave = async () => {
    try {
      setSaving(true)
      setError('')
      setSaved(false)

      if (!userData) {
        setError('Données utilisateur non trouvées')
        return
      }

      // Valider les champs obligatoires
      if (!formData.nom.trim()) {
        setError('Le nom de l\'entreprise est obligatoire')
        return
      }

      console.log('💾 Sauvegarde des données...', formData)

      // Mettre à jour la base de données
      const { error: updateError } = await supabase
        .from('entreprises')
        .update({
          nom: formData.nom,
          siret: formData.siret || null,
          siren: formData.siren || null,
          tva_number: formData.tva_number || null,
          adresse: formData.adresse || null,
          code_postal: formData.code_postal || null,
          ville: formData.ville || null,
          telephone: formData.telephone || null,
          email: formData.email || null,
          conditions_paiement: formData.conditions_paiement,
        })
        .eq('id', userData.entreprise_id)

      if (updateError) {
        console.error('❌ Erreur update:', updateError)
        throw updateError
      }

      console.log('✅ Données sauvegardées avec succès')
      setSaved(true)
      
      // Garder le message visible 5 secondes
      setTimeout(() => setSaved(false), 5000)
    } catch (err) {
      console.error('❌ Erreur sauvegarde:', err)
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/dashboard" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft size={20} />
            <span>Retour</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Paramètres de l'entreprise</h1>
          <p className="text-gray-600">Gérez les informations légales et le logo de votre entreprise</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Success Message - PLUS VISIBLE ET DURABLE */}
        {saved && (
          <div className="mb-6 p-4 bg-green-50 border-2 border-green-300 rounded-lg text-green-700 flex items-center gap-3 shadow-md animate-in fade-in slide-in-from-top">
            <Check className="w-6 h-6 flex-shrink-0" />
            <div>
              <p className="font-semibold">Succès!</p>
              <p className="text-sm">Vos paramètres ont été enregistrés avec succès.</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-300 rounded-lg text-red-700 flex items-center gap-3 shadow-md">
            <span className="text-xl">❌</span>
            <div>
              <p className="font-semibold">Erreur</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Logo Section */}
        <div className="bg-white rounded-lg p-8 border border-gray-200 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Logo de l'entreprise</h2>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Preview */}
            <div className="flex-1">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center min-h-64 bg-gray-50">
                {previewLogo ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-32 h-32 flex items-center justify-center">
                      <img
                        src={previewLogo}
                        alt="Logo de l'entreprise"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowLogoPreview(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                      >
                        <Eye size={16} />
                        <span>Aperçu</span>
                      </button>
                      <button
                        onClick={handleDeleteLogo}
                        disabled={uploading}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 disabled:opacity-50"
                      >
                        <X size={16} />
                        <span>Supprimer</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4 text-gray-500">
                    <Upload size={32} />
                    <p className="text-center">Glissez votre logo ici ou cliquez pour importer</p>
                    <p className="text-sm text-gray-400">PNG, JPG, SVG, WebP acceptés</p>
                  </div>
                )}
              </div>
            </div>

            {/* Upload */}
            <div className="flex-1 flex flex-col justify-center">
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer bg-blue-50 hover:bg-blue-100 transition">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-10 h-10 text-blue-600 mb-2" />
                  <p className="mb-2 text-sm text-blue-600 font-semibold">Cliquez pour importer</p>
                  <p className="text-xs text-blue-500">PNG, JPG, SVG, WebP</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*,.svg"
                  onChange={handleLogoUpload}
                  disabled={uploading}
                />
              </label>
              {uploading && (
                <div className="mt-4 flex items-center justify-center gap-2 text-blue-600">
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Téléchargement en cours...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Company Info Form */}
        <div className="bg-white rounded-lg p-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Informations légales</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Nom */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nom de l'entreprise <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleInputChange}
                placeholder="SARL Dupont Plomberie"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* SIRET */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">SIRET</label>
              <input
                type="text"
                name="siret"
                value={formData.siret}
                onChange={handleInputChange}
                placeholder="12345678901234"
                maxLength={14}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">14 chiffres</p>
            </div>

            {/* SIREN */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">SIREN</label>
              <input
                type="text"
                name="siren"
                value={formData.siren}
                onChange={handleInputChange}
                placeholder="123456789"
                maxLength={9}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">9 chiffres</p>
            </div>

            {/* TVA */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">N° TVA Intra-Communautaire</label>
              <input
                type="text"
                name="tva_number"
                value={formData.tva_number}
                onChange={handleInputChange}
                placeholder="FR12345678901"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Adresse */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Adresse</label>
              <input
                type="text"
                name="adresse"
                value={formData.adresse}
                onChange={handleInputChange}
                placeholder="123 rue de la Paix"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Code Postal */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Code postal</label>
              <input
                type="text"
                name="code_postal"
                value={formData.code_postal}
                onChange={handleInputChange}
                placeholder="75000"
                maxLength={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Ville */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Ville</label>
              <input
                type="text"
                name="ville"
                value={formData.ville}
                onChange={handleInputChange}
                placeholder="Paris"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Téléphone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Téléphone</label>
              <input
                type="tel"
                name="telephone"
                value={formData.telephone}
                onChange={handleInputChange}
                placeholder="01 23 45 67 89"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="contact@entreprise.fr"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Conditions de paiement */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Délai de paiement (jours)</label>
              <select
                name="conditions_paiement"
                value={formData.conditions_paiement}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={0}>À réception</option>
                <option value={7}>7 jours</option>
                <option value={15}>15 jours</option>
                <option value={30}>30 jours</option>
                <option value={45}>45 jours</option>
                <option value={60}>60 jours</option>
              </select>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 font-semibold"
            >
              {saving ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Enregistrement...</span>
                </>
              ) : (
                <>
                  <Save size={20} />
                  <span>Enregistrer</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Logo Preview Modal */}
      {showLogoPreview && previewLogo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full relative">
            <button
              onClick={() => setShowLogoPreview(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg"
            >
              <X size={24} />
            </button>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Aperçu du logo</h3>
            <div className="flex justify-center items-center min-h-64">
              <img
                src={previewLogo}
                alt="Aperçu du logo"
                className="max-w-full max-h-96 object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}