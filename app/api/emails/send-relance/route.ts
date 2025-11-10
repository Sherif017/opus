import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Clé API Resend non configurée' },
        { status: 500 }
      )
    }

    const { prospectEmail, prospectName, relanceText, companyName, sujet } = await req.json()

    if (!prospectEmail) {
      return NextResponse.json({ error: 'Email du prospect requis' }, { status: 400 })
    }

    // Importer Resend à l'exécution
    const { Resend } = await import('resend')
    const resend = new Resend(apiKey)

    const result = await resend.emails.send({
      from: process.env.SENDER_EMAIL || 'noreply@opus.boutique',
      to: prospectEmail,
      subject: sujet || `Suivi - ${companyName}`,
      html: `
        <!DOCTYPE html>
        <html lang="fr">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 0;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f9fafb;
              }
              .content {
                background-color: white;
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
              }
              .message {
                font-size: 14px;
                line-height: 1.8;
                color: #4b5563;
                margin: 20px 0;
                white-space: pre-wrap;
              }
              .footer {
                text-align: center;
                font-size: 12px;
                color: #9ca3af;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="content">
                <div class="message">${relanceText.replace(/\n/g, '<br>')}</div>
                
                <div class="footer">
                  <p>Cet email a été généré automatiquement par OPUS • <a href="https://opus.boutique" style="color: #9ca3af; text-decoration: none;">opus.boutique</a></p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
    })

    if (result.error) throw new Error(result.error.message)

    return NextResponse.json({
      success: true,
      messageId: result.data?.id,
    })
  } catch (error) {
    console.error('Email Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur envoi email' },
      { status: 500 }
    )
  }
}