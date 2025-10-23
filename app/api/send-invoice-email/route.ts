import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { factureData, lignes, clientEmail, clientName, entrepriseData } = await req.json()

    if (!clientEmail || !factureData) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      )
    }

    const resend = new Resend(process.env.RESEND_API_KEY)

    // Générer le PDF
    const pdfResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/generate-invoice-pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ factureData, lignes, clientData: { nom: clientName, email: clientEmail }, entrepriseData }),
    })

    if (!pdfResponse.ok) {
      throw new Error('Erreur génération PDF')
    }

    const pdfBuffer = await pdfResponse.arrayBuffer()

    // Envoyer l'email avec le PDF
    const result = await resend.emails.send({
      from: process.env.SENDER_EMAIL || 'noreply@opus.boutique',
      to: clientEmail,
      subject: `Facture ${factureData.numero_facture}`,
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
            .details { margin: 20px 0; background-color: white; padding: 15px; border-radius: 5px; }
            .total { font-size: 18px; font-weight: bold; color: #3b82f6; margin: 15px 0; }
            .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Votre Facture OPUS</h1>
            </div>
            <div class="content">
              <p>Bonjour <strong>${clientName}</strong>,</p>
              
              <p>Veuillez trouver ci-joint votre facture.</p>
              
              <div class="details">
                <p><strong>Numéro de facture:</strong> ${factureData.numero_facture}</p>
                <p><strong>Date:</strong> ${new Date(factureData.date_creation).toLocaleDateString('fr-FR')}</p>
              </div>

              <div class="details">
                <p><strong>Montant HT:</strong> ${factureData.montant_total_ht.toFixed(2)}€</p>
                <p><strong>TVA:</strong> ${factureData.montant_tva.toFixed(2)}€</p>
                <div class="total">Total TTC: ${factureData.montant_total_ttc.toFixed(2)}€</div>
              </div>

              <p>Conditions de paiement: 30 jours à compter de la date de facturation.</p>
              
              <p>N'hésitez pas à nous contacter si vous avez des questions.</p>
              
              <p>Cordialement,<br>L'équipe OPUS</p>
            </div>
            <div class="footer">
              <p>Cet email a été généré automatiquement. Le PDF est joint à cet email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      attachments: [
        {
          filename: `facture-${factureData.numero_facture}.pdf`,
          content: Buffer.from(pdfBuffer),
        },
      ],
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