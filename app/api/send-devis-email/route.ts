import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    console.log('📧 Starting email send process...')
    const { devisData, lignes, clientEmail, clientName, entrepriseData } = await req.json()

    console.log('✅ Parsed request body')
    console.log('Client Email:', clientEmail)
    console.log('Client Name:', clientName)

    if (!clientEmail || !devisData) {
      console.log('❌ Missing data')
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      )
    }

    if (!process.env.RESEND_API_KEY) {
      console.log('❌ RESEND_API_KEY not configured')
      return NextResponse.json(
        { error: 'Clé API Resend non configurée' },
        { status: 500 }
      )
    }

    console.log('✅ RESEND_API_KEY found')

    const resend = new Resend(process.env.RESEND_API_KEY)

    // Générer le PDF
    const pdfUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/generate-devis-pdf`
    console.log('🔗 PDF URL:', pdfUrl)

    const pdfResponse = await fetch(pdfUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        devisData,
        lignes,
        clientData: { nom: clientName, email: clientEmail },
        entrepriseData,
      }),
    })

    console.log('📄 PDF Response Status:', pdfResponse.status)
    
    if (!pdfResponse.ok) {
      const errorText = await pdfResponse.text()
      console.log('❌ PDF Error:', errorText)
      throw new Error(`Erreur PDF: ${pdfResponse.status} - ${errorText}`)
    }

    console.log('✅ PDF generated successfully')
    const pdfBuffer = await pdfResponse.arrayBuffer()
    console.log('📦 PDF Buffer size:', pdfBuffer.byteLength)

    // Envoyer l'email avec le PDF
    console.log('📬 Sending email to:', clientEmail)
    
    const result = await resend.emails.send({
      from: 'noreply@opus.boutique',
      to: clientEmail,
      subject: `Devis ${devisData.numero_devis}`,
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
              <h1>Votre Devis OPUS</h1>
            </div>
            <div class="content">
              <p>Bonjour <strong>${clientName}</strong>,</p>
              
              <p>Merci pour votre intérêt. Veuillez trouver ci-joint votre devis détaillé.</p>
              
              <div class="details">
                <p><strong>Numéro de devis:</strong> ${devisData.numero_devis}</p>
                <p><strong>Date:</strong> ${new Date(devisData.date_creation).toLocaleDateString('fr-FR')}</p>
                <p><strong>Statut:</strong> ${devisData.statut}</p>
              </div>

              <div class="details">
                <p><strong>Montant HT:</strong> ${devisData.montant_total_ht?.toFixed(2) || '0.00'}€</p>
                <p><strong>TVA:</strong> ${devisData.montant_tva?.toFixed(2) || '0.00'}€</p>
                <div class="total">Total TTC: ${devisData.montant_total_ttc?.toFixed(2) || '0.00'}€</div>
              </div>

              <p>Ce devis est valable 30 jours à compter de sa date d'émission.</p>
              
              <p>Cordialement,<br>L'équipe OPUS</p>
            </div>
            <div class="footer">
              <p>Email généré automatiquement. Le PDF est joint à cet email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      attachments: [
        {
          filename: `devis-${devisData.numero_devis}.pdf`,
          content: Buffer.from(pdfBuffer),
        },
      ],
    })

    console.log('✅ Resend response:', result)

    if (result.error) {
      console.log('❌ Resend error:', result.error)
      throw new Error(result.error.message)
    }

    console.log('✅ Email sent successfully. Message ID:', result.data?.id)
    return NextResponse.json({ success: true, messageId: result.data?.id })
  } catch (error) {
    console.error('❌ Email Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erreur envoi email'
    console.error('Error details:', errorMessage)
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}