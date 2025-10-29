import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

/**
 * Client Supabase avec service role key (sécurisé pour le serveur)
 */
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Récupère l'entreprise_id de l'utilisateur connecté
 * À utiliser dans TOUTES les API routes
 * 
 * @throws Error si non authentifié ou entreprise non trouvée
 */
export async function getEntrepriseIdFromRequest(request: NextRequest): Promise<string> {
  try {
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

    if (dataError || !userData) {
      throw new Error('Utilisateur non trouvé')
    }

    return userData.entreprise_id
  } catch (error) {
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