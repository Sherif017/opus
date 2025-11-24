import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * POST /api/phone/incoming-call
 * 
 * Webhook Twilio - Reçoit tous les appels entrants
 * Génère le script TwiML avec les questions de la secrétaire IA
 * 
 * Paramètres Twilio:
 * - From: Numéro du client (+33612345678)
 * - To: Numéro appelé (numéro personnel de l'artisan)
 * - CallSid: ID unique de l'appel
 */
export async function POST(req: NextRequest) {
  try {
    // ✅ Parser les données Twilio
    const formData = await req.formData()
    const from = formData.get('From') as string
    const to = formData.get('To') as string
    const callSid = formData.get('CallSid') as string

    console.log('📞 [incoming-call] Appel reçu:')
    console.log('  From (client):', from)
    console.log('  To (artisan):', to)
    console.log('  CallSid:', callSid)

    // ✅ Valider les données
    if (!from || !to || !callSid) {
      console.error('❌ Données Twilio manquantes')
      return new NextResponse(
        `<Response><Say>Erreur technique. Veuillez réessayer.</Say></Response>`,
        { headers: { 'Content-Type': 'text/xml' } }
      )
    }

    // ✅ Formater le numéro appelé (supprimer les espaces)
    const numeroFormate = to.replace(/\s/g, '')

    // ✅ Trouver l'artisan via le numéro appelé
    const { data: phoneConfig, error: phoneError } = await supabaseAdmin
      .from('phone_settings')
      .select('entreprise_id, timeout_seconds')
      .eq('numero_personnel', numeroFormate)
      .single()

    if (phoneError || !phoneConfig) {
      console.error('❌ Artisan non trouvé pour le numéro:', numeroFormate)
      return new NextResponse(
        `<Response><Say>Le numéro appelé n'est pas configuré.</Say><Hangup/></Response>`,
        { headers: { 'Content-Type': 'text/xml' } }
      )
    }

    const entrepriseId = phoneConfig.entreprise_id
    const timeoutSeconds = phoneConfig.timeout_seconds || 15

    console.log('✅ Artisan trouvé:')
    console.log('  entreprise_id:', entrepriseId)
    console.log('  timeout:', timeoutSeconds, 'secondes')

    // ✅ Récupérer les infos de l'entreprise (nom)
    const { data: entreprise, error: entrepriseError } = await supabaseAdmin
      .from('entreprises')
      .select('nom')
      .eq('id', entrepriseId)
      .single()

    if (entrepriseError || !entreprise) {
      console.error('❌ Entreprise non trouvée:', entrepriseId)
      return new NextResponse(
        `<Response><Say>Erreur système. Veuillez réessayer plus tard.</Say><Hangup/></Response>`,
        { headers: { 'Content-Type': 'text/xml' } }
      )
    }

    const nomEntreprise = entreprise.nom

    console.log('✅ Entreprise:', nomEntreprise)

    // ✅ ENREGISTRER L'APPEL EN COURS
    // On crée un record phone_call avec le call_sid
    const { data: phoneCall, error: insertError } = await supabaseAdmin
      .from('phone_calls')
      .insert([
        {
          entreprise_id: entrepriseId,
          caller_phone: from,
          call_sid: callSid,
          statut: 'in_progress',
        },
      ])
      .select()
      .single()

    if (insertError) {
      console.error('❌ Erreur création phone_call:', insertError)
      // On continue quand même
    }

    console.log('✅ phone_call créé:', phoneCall?.id)

    // ✅ GÉNÉRER LE SCRIPT TwiML
    // C'est le XML que Twilio va jouer et exécuter
    const twiml = generateTwiML(nomEntreprise, callSid)

    console.log('✅ TwiML généré')

    // ✅ Retourner le TwiML à Twilio
    return new NextResponse(twiml, {
      headers: { 'Content-Type': 'text/xml' },
      status: 200,
    })
  } catch (error) {
    console.error('❌ [incoming-call] Erreur:', error)
    return new NextResponse(
      `<Response><Say>Une erreur s'est produite. Veuillez réessayer.</Say><Hangup/></Response>`,
      { headers: { 'Content-Type': 'text/xml' }, status: 500 }
    )
  }
}

/**
 * Générer le script TwiML (XML) que Twilio va jouer
 * C'est la "voix" de la secrétaire IA
 */
function generateTwiML(nomEntreprise: string, callSid: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <!-- Message d'accueil -->
  <Say voice="woman" language="fr-FR">
    Bonjour ! Vous êtes en relation avec la secrétaire 
    de ${nomEntreprise}.
    Je vais prendre soin de vous et noter votre demande 
    pour un rendez-vous.
    
    Quel est votre nom, s'il vous plaît ?
  </Say>
  
  <!-- Question 1: Nom du client -->
  <Gather
    input="speech"
    action="/api/phone/handle-response?callSid=${callSid}&question=1"
    method="POST"
    maxSpeechTime="10"
    timeout="5"
    speechTimeout="auto"
    language="fr-FR"
  >
    <Say voice="woman" language="fr-FR">
      Veuillez dire votre réponse.
    </Say>
  </Gather>
  
  <!-- Si pas de réponse après Question 1 -->
  <Say voice="woman" language="fr-FR">
    Je n'ai pas bien compris. Veuillez réessayer.
  </Say>
  <Redirect>/api/phone/incoming-call</Redirect>
</Response>`
}