import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { getEntrepriseIdFromRequest } from '@/lib/auth'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const dynamic = 'force-dynamic'

/**
 * POST /api/phone/setup
 * Activer la secrétaire IA pour un artisan
 * 
 * Exemple:
 * POST /api/phone/setup
 * {
 *   "numero_personnel": "+33612345678"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // ✅ Authentifier l'utilisateur
    const entrepriseId = await getEntrepriseIdFromRequest(request)
    console.log('📞 [POST /api/phone/setup] entrepriseId:', entrepriseId)

    // ✅ Parser le body
    const body = await request.json()
    const { numero_personnel } = body

    // ✅ Valider les données
    if (!numero_personnel) {
      return NextResponse.json(
        { error: 'Le numéro personnel est requis' },
        { status: 400 }
      )
    }

    // ✅ Valider le format du numéro (format international)
    const numeroRegex = /^\+?[1-9]\d{1,14}$/
    if (!numeroRegex.test(numero_personnel.replace(/\s/g, ''))) {
      return NextResponse.json(
        { error: 'Format de numéro invalide. Utilisez le format international: +33612345678' },
        { status: 400 }
      )
    }

    const numeroFormate = numero_personnel.replace(/\s/g, '')

    // ✅ Vérifier si ce numéro n'est pas déjà utilisé par une autre entreprise
    const { data: existingPhone, error: checkError } = await supabaseAdmin
      .from('phone_settings')
      .select('entreprise_id')
      .eq('numero_personnel', numeroFormate)
      .single()

    if (existingPhone && existingPhone.entreprise_id !== entrepriseId) {
      console.warn('❌ Numéro déjà utilisé par autre entreprise:', numeroFormate)
      return NextResponse.json(
        { error: 'Ce numéro est déjà utilisé par un autre artisan' },
        { status: 409 }
      )
    }

    // ✅ Vérifier si cette entreprise a déjà un numéro configuré
    const { data: existingConfig, error: existingError } = await supabaseAdmin
      .from('phone_settings')
      .select('*')
      .eq('entreprise_id', entrepriseId)
      .single()

    let phoneSettingId: string

    if (existingConfig) {
      // ✅ Mettre à jour l'existant
      console.log('🔄 Mise à jour du numéro existant:', numeroFormate)

      const { data: updated, error: updateError } = await supabaseAdmin
        .from('phone_settings')
        .update({
          numero_personnel: numeroFormate,
          twilio_config_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingConfig.id)
        .select()
        .single()

      if (updateError) {
        console.error('❌ Erreur mise à jour:', updateError)
        throw updateError
      }

      phoneSettingId = updated.id
      console.log('✅ Numéro mis à jour:', numeroFormate)
    } else {
      // ✅ Créer une nouvelle entrée
      console.log('➕ Création nouvelle config:', numeroFormate)

      const { data: created, error: createError } = await supabaseAdmin
        .from('phone_settings')
        .insert([
          {
            entreprise_id: entrepriseId,
            numero_personnel: numeroFormate,
            timeout_seconds: 15,
            twilio_config_active: true,
          },
        ])
        .select()
        .single()

      if (createError) {
        console.error('❌ Erreur création:', createError)
        throw createError
      }

      phoneSettingId = created.id
      console.log('✅ Config créée:', numeroFormate)
    }

    // ✅ Réponse réussie
    return NextResponse.json(
      {
        success: true,
        message: 'Service de secrétaire IA activé avec succès',
        phone_setting_id: phoneSettingId,
        numero: numeroFormate,
        timeout_seconds: 15,
        status: 'active',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('❌ [POST /api/phone/setup] Error:', error)
    const message = error instanceof Error ? error.message : 'Erreur serveur'
    return NextResponse.json(
      { error: message },
      { status: message.includes('authentifié') ? 401 : 500 }
    )
  }
}

/**
 * GET /api/phone/setup
 * Récupérer la configuration actuelle de l'artisan
 */
export async function GET(request: NextRequest) {
  try {
    // ✅ Authentifier l'utilisateur
    const entrepriseId = await getEntrepriseIdFromRequest(request)
    console.log('📞 [GET /api/phone/setup] entrepriseId:', entrepriseId)

    // ✅ Récupérer la config
    const { data: phoneConfig, error: getError } = await supabaseAdmin
      .from('phone_settings')
      .select('*')
      .eq('entreprise_id', entrepriseId)
      .single()

    if (getError && getError.code === 'PGRST116') {
      // Pas de config trouvée
      return NextResponse.json(
        {
          configured: false,
          message: 'Aucune secrétaire IA configurée',
        },
        { status: 200 }
      )
    }

    if (getError) {
      console.error('❌ Erreur récupération config:', getError)
      throw getError
    }

    console.log('✅ Config trouvée:', phoneConfig.numero_personnel)

    // ✅ Récupérer les stats d'appels
    const { count: callCount, error: countError } = await supabaseAdmin
      .from('phone_calls')
      .select('*', { count: 'exact', head: true })
      .eq('entreprise_id', entrepriseId)

    return NextResponse.json(
      {
        configured: true,
        numero: phoneConfig.numero_personnel,
        timeout_seconds: phoneConfig.timeout_seconds,
        active: phoneConfig.twilio_config_active,
        created_at: phoneConfig.created_at,
        updated_at: phoneConfig.updated_at,
        total_calls: callCount || 0,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('❌ [GET /api/phone/setup] Error:', error)
    const message = error instanceof Error ? error.message : 'Erreur serveur'
    return NextResponse.json(
      { error: message },
      { status: message.includes('authentifié') ? 401 : 500 }
    )
  }
}