import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { clientEmail, clientName, numeroFacture, montant } = await request.json()

    if (!clientEmail || !numeroFacture) {
      return NextResponse.json(
        { message: 'Email ou numéro de facture manquant' },
        { status: 400 }
      )
    }

    const result = await resend.emails.send({
      from: process.env.SENDER_EMAIL || 'noreply@opus.local',
      to: clientEmail,
      subject: `Facture ${numeroFacture}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #3b82f6; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
              .content { background-color: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
              .invoice-details { margin: 20px 0; }
              .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
              .detail-label { font-weight: bold; color: #666; }
              .detail-value { color: #333; }
              .total { background-color: #dbeafe; padding: 15px; border-radius: 5px; margin: 20px 0; }
              .total-row { display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; }
              .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎵 OPUS - Facture</h1>
              </div>
              <div class="content">
                <p>Bonjour <strong>${clientName}</strong>,</p>
                
                <p>Nous vous remercions pour votre confiance. Veuillez trouver ci-dessous les détails de votre facture.</p>
                
                <div class="invoice-details">
                  <div class="detail-row">
                    <span class="detail-label">Numéro de facture:</span>
                    <span class="detail-value">${numeroFacture}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Date:</span>
                    <span class="detail-value">${new Date().toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>

                <div class="total">
                  <div class="total-row">
                    <span>Montant à payer:</span>
                    <span>${montant}€</span>
                  </div>
                </div>

                <p>Si vous avez des questions concernant cette facture, n&apos;hésitez pas à nous contacter.</p>
                
                <p>Cordialement,<br>L&apos;équipe OPUS</p>
              </div>
              <div class="footer">
                <p>Cet email a été généré automatiquement par OPUS. Veuillez ne pas répondre directement à cet email.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    })

    if (result.error) {
      console.error('Resend error:', result.error)
      throw new Error(result.error.message)
    }

    return NextResponse.json({ message: 'Email envoyé avec succès' })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { message: 'Erreur lors de l\'envoi de l\'email' },
      { status: 500 }
    )
  }
}