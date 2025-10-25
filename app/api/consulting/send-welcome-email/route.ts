import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json()

    const result = await resend.emails.send({
      from: 'consulting@opus.boutique',
      to: email,
      subject: '✅ Audit gratuit réservé - Opus Consulting',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2563eb; color: white; padding: 20px; border-radius: 8px; }
            .content { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 20px; }
            .button { background-color: #2563eb; color: white; padding: 12px 24px; border-radius: 5px; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Bienvenue ${name || '!'}👋</h1>
            </div>

            <div class="content">
              <p>Merci de votre intérêt pour Opus Consulting.</p>

              <p>Voici les 3 prochaines étapes:</p>

              <ol>
                <li><strong>Rendez-vous gratuit:</strong> 30 min pour analyser vos gains</li>
                <li><strong>Proposition:</strong> Plan d'action customisé</li>
                <li><strong>Implémentation:</strong> Automatisation complète</li>
              </ol>

              <p>Vous pouvez réserver votre audit ici:</p>
              <p><a href="https://calendly.com/YOUR-CALENDLY" class="button">Réserver audit gratuit →</a></p>

              <p>À bientôt!</p>
              <p><strong>L'équipe Opus</strong></p>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    if (result.error) {
      throw new Error(result.error.message)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error sending email' },
      { status: 500 }
    )
  }
}