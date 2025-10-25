import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { Resend } from 'resend'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { 
      name, 
      email, 
      company, 
      phone, 
      sector, 
      scheduled_date, 
      duration_minutes 
    } = await req.json()

    if (!name || !email || !scheduled_date) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      )
    }

    // 1. Créer/Update lead
    const { data: existingLead, error: checkError } = await supabase
      .from('consulting_leads')
      .select('id')
      .eq('email', email)
      .single()

    let leadId

    if (!existingLead) {
      // Créer nouveau lead
      const { data: newLead, error: createError } = await supabase
        .from('consulting_leads')
        .insert([{
          email,
          name,
          company: company || null,
          phone: phone || null,
          sector: sector || null,
          source: 'website-booking',
          status: 'qualified',
          created_at: new Date(),
        }])
        .select('id')
        .single()

      if (createError) throw createError
      leadId = newLead.id
    } else {
      leadId = existingLead.id
    }

    // 2. Créer audit
    const { data: audit, error: auditError } = await supabase
      .from('consulting_audits')
      .insert([{
        lead_id: leadId,
        scheduled_date,
        duration_minutes: duration_minutes || 30,
        status: 'scheduled',
        created_at: new Date(),
      }])
      .select()
      .single()

    if (auditError) throw auditError

    // 3. Envoyer email de confirmation
    const auditDate = new Date(scheduled_date)
    const formattedDate = auditDate.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    const zoomLink = `https://zoom.us/meeting/schedule` // À remplacer par vrai lien Zoom généré

    await resend.emails.send({
      from: 'consulting@opus.boutique',
      to: email,
      subject: '✅ Votre audit gratuit est confirmé!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; color: #333; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: white; border-radius: 8px; }
            .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { padding: 30px; }
            .info-box { background-color: #f0f9ff; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .button { display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; border-radius: 4px; text-decoration: none; margin-top: 10px; }
            .footer { background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #999; border-radius: 0 0 8px 8px; }
            strong { color: #1d4ed8; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Audit Confirmé!</h1>
            </div>

            <div class="content">
              <p>Bonjour <strong>${name}</strong>,</p>

              <p>Merci! Votre audit gratuit est maintenant confirmé.</p>

              <div class="info-box">
                <p><strong>📅 Date & Heure:</strong></p>
                <p style="font-size: 18px; margin: 10px 0;">${formattedDate}</p>

                <p style="margin-top: 20px;"><strong>🎯 Durée:</strong> 30 minutes</p>

                <p style="margin-top: 20px;"><strong>📍 Format:</strong> Visioconférence Zoom</p>
              </div>

              <h3>Avant votre audit, préparez:</h3>
              <ul>
                <li>Une description de vos tâches administratives les plus chronophages</li>
                <li>Vos outils actuels (CRM, Excel, etc.)</li>
                <li>Votre budget approximatif (optional)</li>
              </ul>

              <p>
                <strong>Lien Zoom sera envoyé 24h avant votre audit.</strong>
              </p>

              <p>
                Vous avez des questions? Répondez directement à cet email.
              </p>

              <p style="margin-top: 30px;">
                À bientôt,<br>
                <strong>L'équipe Opus</strong>
              </p>
            </div>

            <div class="footer">
              <p>© 2025 Opus Automation. Tous droits réservés.</p>
              <p>Vous recevrez un rappel 24h avant votre audit.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    // 4. Envoyer email à l'admin (you)
    await resend.emails.send({
      from: 'consulting@opus.boutique',
      to: 'YOUR_EMAIL@opus.boutique',
      subject: `📅 Nouvel audit réservé: ${name}`,
      html: `
        <html>
        <body style="font-family: Arial;">
          <h2>Nouvel audit réservé!</h2>
          
          <p><strong>Client:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Secteur:</strong> ${sector}</p>
          <p><strong>Date & Heure:</strong> ${formattedDate}</p>
          
          <p><a href="https://opus.boutique/dashboard/consulting">Voir dans le dashboard →</a></p>
        </body>
        </html>
      `,
    })

    return NextResponse.json({ 
      success: true, 
      data: audit 
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur lors de la réservation' },
      { status: 500 }
    )
  }
}