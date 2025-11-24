import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'
import { getEntrepriseIdFromRequest } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * POST /api/emails/send-relance
 * Envoie une relance par email ET l'enregistre dans relances_historique
 */
export async function POST(req: NextRequest) {
  try {
    console.log('📧 [SEND-RELANCE] Starting POST /api/emails/send-relance')

    // ✅ Récupérer l'entreprise_id
    const entrepriseId = await getEntrepriseIdFromRequest(req)
    console.log('✅ [SEND-RELANCE] Enterprise ID:', entrepriseId)

    // ✅ Parser le body
    const body = await req.json()
    const {
      prospectEmail,
      prospectName,
      relanceText,
      companyName,
      sujet,
      numeroRelance,
      prospectId,
    } = body

    console.log('📋 [SEND-RELANCE] Body received:', {
      prospectEmail,
      prospectName,
      numeroRelance,
      prospectId,
    })

    // ✅ Validation
    if (!prospectEmail || !prospectName || !relanceText || !sujet) {
      console.error('❌ [SEND-RELANCE] Missing required fields')
      return NextResponse.json(
        { error: 'Paramètres manquants: prospectEmail, prospectName, relanceText, sujet' },
        { status: 400 }
      )
    }

    if (!process.env.RESEND_API_KEY) {
      console.error('❌ [SEND-RELANCE] RESEND_API_KEY not configured')
      return NextResponse.json(
        { error: 'Clé API Resend non configurée' },
        { status: 500 }
      )
    }

    // ✅ Initialiser Resend
    const resend = new Resend(process.env.RESEND_API_KEY)

    console.log('📧 [SEND-RELANCE] Sending email with Resend...')

    // ✅ Envoyer l'email avec Resend
    const sendResult = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@opus.boutique',
      to: prospectEmail,
      subject: sujet,
      html: `
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #3b82f6; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
            .message { background-color: white; padding: 20px; border-radius: 5px; margin: 15px 0; }
            .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${companyName || 'OPUS'}</h1>
            </div>
            <div class="content">
              <div class="message">
                <p style="white-space: pre-wrap; line-height: 1.6;">${relanceText}</p>
              </div>
            </div>
            <div class="footer">
              <p>Cet email a été généré automatiquement par ${companyName || 'OPUS'}</p>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    if (sendResult.error) {
      console.error('❌ [SEND-RELANCE] Resend error:', sendResult.error)
      throw new Error(`Resend API error: ${sendResult.error.message}`)
    }

    console.log('✅ [SEND-RELANCE] Email sent successfully:', sendResult.data?.id)

    // ✅ Enregistrer la relance dans relances_historique
    console.log('📝 [SEND-RELANCE] Recording relance in database...')

    const { data: relanceRecord, error: dbError } = await supabaseAdmin
      .from('relances_historique')
      .insert([
        {
          entreprise_id: entrepriseId,
          prospect_id: prospectId,
          numero_relance: numeroRelance || 1,
          texte_relance: relanceText,
          email_recipient: prospectEmail,
          date_envoi: new Date().toISOString(),
          statut: 'envoyé',
        },
      ])
      .select()
      .single()

    if (dbError) {
      console.error('❌ [SEND-RELANCE] Database error:', dbError)
      // On ne throw pas l'erreur ici car l'email a déjà été envoyé
      // On retourne quand même une réponse positive pour le client
      console.warn('⚠️  [SEND-RELANCE] Email sent but failed to record in database')
    } else {
      console.log('✅ [SEND-RELANCE] Relance recorded in database:', relanceRecord?.id)
    }

    return NextResponse.json({
      success: true,
      message: 'Relance envoyée avec succès',
      emailId: sendResult.data?.id,
      relanceId: relanceRecord?.id,
    })
  } catch (error) {
    console.error('❌ [SEND-RELANCE] Error:', error)
    const message = error instanceof Error ? error.message : 'Erreur serveur'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}