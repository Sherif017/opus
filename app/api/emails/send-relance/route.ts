import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.RESEND_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Clé API Resend non configurée' },
        { status: 500 }
      )
    }

    const { prospectEmail, prospectName, relanceText, companyName } = await req.json()

    if (!prospectEmail) {
      return NextResponse.json({ error: 'Email du prospect requis' }, { status: 400 })
    }

    // Importer Resend seulement à l'exécution
    const { Resend } = await import('resend')
    const resend = new Resend(apiKey)

    const result = await resend.emails.send({
      from: 'noreply@opus.local',
      to: prospectEmail,
      subject: `Suivi - ${companyName}`,
      html: `
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2>Bonjour ${prospectName},</h2>
              
              <p>${relanceText.replace(/\n/g, '<br>')}</p>
              
              <p>N'hésitez pas à nous contacter si vous avez des questions.</p>
              
              <p>Cordialement,<br><strong>${companyName}</strong></p>
              
              <hr style="margin-top: 40px; border: none; border-top: 1px solid #ddd;">
              <p style="font-size: 12px; color: #999;">Cet email a été généré automatiquement par OPUS</p>
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