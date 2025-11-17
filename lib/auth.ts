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
    console.log('🔐 [AUTH] Starting getEntrepriseIdFromRequest...')
    
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const authHeader = request.headers.get('authorization')
    console.log('🔐 [AUTH] Auth header present:', !!authHeader)

    if (!authHeader) {
      throw new Error('Non authentifié - pas de token')
    }

    const token = authHeader.replace('Bearer ', '')
    console.log('🔐 [AUTH] Token extracted, length:', token.length)

    // Récupérer l'utilisateur avec le token
    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token)

    console.log('🔐 [AUTH] Auth user retrieved:', user?.id)

    if (userError || !user) {
      console.error('🔐 [AUTH] Auth error:', userError)
      throw new Error('Non authentifié - token invalide')
    }

    console.log('🔐 [AUTH] Looking up user in database:', user.id)

    // Récupérer l'entreprise_id de l'utilisateur
    const { data: userData, error: dataError } = await supabaseAdmin
      .from('utilisateurs')
      .select('entreprise_id')
      .eq('id', user.id)
      .single()

    console.log('🔐 [AUTH] Database lookup result:', { userData, dataError })

    // ✅ Si l'utilisateur n'existe pas, le créer automatiquement
    if (dataError && dataError.code === 'PGRST116') {
      console.log('⚠️  [AUTH] User not found in database, creating automatically...')
      
      // Créer une entreprise par défaut avec un slug UNIQUE
      const timestamp = Date.now()
      const randomId = Math.random().toString(36).substring(2, 8)
      const slug = `entreprise-${timestamp}-${randomId}`

      console.log('🏢 [AUTH] Creating new company with slug:', slug)

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
        console.error('❌ [AUTH] Company creation error:', companyError)
        throw new Error(`Erreur création entreprise: ${companyError.message}`)
      }

      if (!newCompany) {
        throw new Error('Entreprise non créée')
      }

      console.log('✅ [AUTH] Company created with ID:', newCompany.id)

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
        console.error('❌ [AUTH] User creation error:', userCreateError)
        throw new Error(`Erreur création utilisateur: ${userCreateError.message}`)
      }

      console.log('✅ [AUTH] User created, returning entrepriseId:', newCompany.id)
      return newCompany.id
    }

    if (dataError || !userData) {
      console.error('❌ [AUTH] User lookup error:', dataError)
      throw new Error('Utilisateur non trouvé')
    }

    console.log('✅ [AUTH] User found, returning entrepriseId:', userData.entreprise_id)
    return userData.entreprise_id
  } catch (error) {
    console.error('❌ [AUTH] Error in getEntrepriseIdFromRequest:', error)
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