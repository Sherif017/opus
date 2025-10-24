import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { devisData, clientEmail, clientName } = await req.json()

    if (!clientEmail || !devisData) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      )
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: 'Clé API Resend non configurée' },
        { status: 500 }
      )
    }

    const resend = new Resend(process.env.RESEND_API_KEY)

    // Envoyer email SIMPLE sans PDF
    const result = await resend.emails.send({
      from: 'noreply@opus.boutique',
      to: clientEmail,
      subject: `Devis ${devisData.numero_devis}`,
      html: `
        <html>
        <body style="font-family: Arial; color: #333;">
          <h1>Votre Devis OPUS</h1>
          <p>Bonjour <strong>${clientName}</strong>,</p>
          <p>Merci pour votre intérêt.</p>
          <p><strong>Devis:</strong> ${devisData.numero_devis}</p>
          <p><strong>Montant TTC:</strong> ${devisData.montant_total_ttc?.toFixed(2) || '0.00'}€</p>
          <p>Cordialement,<br>L'équipe OPUS</p>
        </body>
        </html>
      `,
    })

    if (result.error) {
      throw new Error(result.error.message)
    }

    return NextResponse.json({ success: true, messageId: result.data?.id })
  } catch (error) {
    console.error('Email Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur envoi email' },
      { status: 500 }
    )
  }
}