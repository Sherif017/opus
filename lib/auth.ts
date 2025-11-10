import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

/**
 * Récupère l'entreprise_id de l'utilisateur connecté
 * À utiliser dans TOUTES les API routes
 * 
 * @throws Error si non authentifié ou entreprise non trouvée
 */
export async function getEntrepriseIdFromRequest(request: NextRequest): Promise<string> {
  try {
    // ✅ Créer le client DANS la fonction
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      throw new Error('Non authentifié - pas de token')
    }

    const token = authHeader.replace('Bearer ', '')

    // Récupérer l'utilisateur avec le token
    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token)

    if (userError || !user) {
      throw new Error('Non authentifié - token invalide')
    }

    // Récupérer l'entreprise_id de l'utilisateur
    const { data: userData, error: dataError } = await supabaseAdmin
      .from('utilisateurs')
      .select('entreprise_id')
      .eq('id', user.id)
      .single()

    // ✅ Si l'utilisateur n'existe pas, le créer automatiquement
    if (dataError && dataError.code === 'PGRST116') {
      console.log('⚠️  Utilisateur non trouvé, création automatique...')
      
      // Créer une entreprise par défaut avec un slug UNIQUE
      const timestamp = Date.now()
      const randomId = Math.random().toString(36).substring(2, 8)
      const slug = `entreprise-${timestamp}-${randomId}`

      const { data: newCompany, error: companyError } = await supabaseAdmin
        .from('entreprises')
        .insert([
          {
            nom: `Entreprise de ${user.email}`,
            slug: slug,
          },
        ])
        .select()
        .single()

      if (companyError) {
        console.error('❌ Erreur création entreprise:', companyError)
        throw new Error(`Erreur création entreprise: ${companyError.message}`)
      }

      if (!newCompany) {
        throw new Error('Entreprise non créée')
      }

      // Créer l'utilisateur
      const { error: userCreateError } = await supabaseAdmin
        .from('utilisateurs')
        .insert([
          {
            id: user.id,
            entreprise_id: newCompany.id,
            email: user.email,
            nom: user.email?.split('@')[0] || 'User',
            prenom: '',
            created_at: new Date().toISOString(),
          },
        ])

      if (userCreateError) {
        console.error('❌ Erreur création utilisateur:', userCreateError)
        throw new Error(`Erreur création utilisateur: ${userCreateError.message}`)
      }

      console.log('✅ Utilisateur et entreprise créés')
      return newCompany.id
    }

    if (dataError || !userData) {
      console.error('❌ Erreur récupération utilisateur:', dataError)
      throw new Error('Utilisateur non trouvé')
    }

    return userData.entreprise_id
  } catch (error) {
    console.error('❌ Error in getEntrepriseIdFromRequest:', error)
    throw error
  }
}

/**
 * Wrapper pour les réponses d'erreur consistent
 */
export function unauthorizedResponse(message: string = 'Non authentifié') {
  return {
    status: 401,
    body: { error: message }
  }
}

export function forbiddenResponse(message: string = 'Non autorisé') {
  return {
    status: 403,
    body: { error: message }
  }
}

export function errorResponse(message: string, status: number = 500) {
  return {
    status,
    body: { error: message }
  }
}