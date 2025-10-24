import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import jsPDF from 'jspdf'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

interface LigneDevis {
  description: string
  quantite: number
  prix_unitaire: number
  taux_tva: number
}

export async function POST(req: NextRequest) {
  try {
    const { devisData, lignes, clientEmail, clientName, entrepriseData } = await req.json()

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

    // Générer PDF localement
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    // Header
    pdf.setFontSize(24)
    pdf.setTextColor(59, 130, 246)
    pdf.text('DEVIS', 20, 20)
    pdf.setFontSize(10)
    pdf.setTextColor(0, 0, 0)
    pdf.text(devisData.numero_devis, 20, 28)

    // De / À
    pdf.setFontSize(9)
    pdf.setFont('Helvetica', 'bold')
    pdf.text('De:', 20, 45)
    pdf.setFont('Helvetica', 'normal')
    pdf.text(entrepriseData?.nom || 'OPUS', 20, 51)
    pdf.setFont('Helvetica', 'bold')
    pdf.text('À:', 110, 45)
    pdf.setFont('Helvetica', 'normal')
    pdf.text(clientName, 110, 51)

    // Ligne horizontale
    pdf.setDrawColor(200, 200, 200)
    pdf.line(20, 60, 190, 60)

    // Table header
    let yPosition = 70
    pdf.setFontSize(9)
    pdf.setFont('Helvetica', 'bold')
    pdf.setFillColor(243, 244, 246)
    pdf.rect(20, yPosition - 5, 170, 6, 'F')

    pdf.text('Description', 25, yPosition)
    pdf.text('Quantité', 100, yPosition)
    pdf.text('Prix unitaire', 125, yPosition)
    pdf.text('TVA %', 150, yPosition)
    pdf.text('Total HT', 175, yPosition, { align: 'right' })
    yPosition += 8
    pdf.setFont('Helvetica', 'normal')
    pdf.setFontSize(9)

    // Lignes du devis
    lignes?.forEach((ligne: LigneDevis) => {
      if (yPosition > 250) {
        pdf.addPage()
        yPosition = 20
      }

      pdf.text(ligne.description.substring(0, 30), 25, yPosition)
      pdf.text(ligne.quantite.toString(), 100, yPosition)
      pdf.text(ligne.prix_unitaire.toFixed(2) + '€', 125, yPosition)
      pdf.text(ligne.taux_tva.toString() + '%', 150, yPosition)
      pdf.text((ligne.quantite * ligne.prix_unitaire).toFixed(2) + '€', 175, yPosition, { align: 'right' })

      yPosition += 7
    })

    // Ligne de séparation
    pdf.setDrawColor(59, 130, 246)
    pdf.line(20, yPosition, 190, yPosition)

    // Totaux
    yPosition += 8
    pdf.setFont('Helvetica', 'normal')
    pdf.setFontSize(10)

    pdf.text('Montant HT:', 130, yPosition)
    pdf.text((devisData.montant_total_ht || 0).toFixed(2) + '€', 185, yPosition, { align: 'right' })
    yPosition += 7
    pdf.text('TVA:', 130, yPosition)
    pdf.text((devisData.montant_tva || 0).toFixed(2) + '€', 185, yPosition, { align: 'right' })
    yPosition += 10
    pdf.setFillColor(59, 130, 246)
    pdf.rect(130, yPosition - 6, 60, 8, 'F')
    pdf.setTextColor(255, 255, 255)
    pdf.setFont('Helvetica', 'bold')
    pdf.setFontSize(11)
    pdf.text('TOTAL TTC:', 135, yPosition)
    pdf.text((devisData.montant_total_ttc || 0).toFixed(2) + '€', 185, yPosition, { align: 'right' })

    // Footer
    yPosition = 275
    pdf.setTextColor(100, 100, 100)
    pdf.setFont('Helvetica', 'normal')
    pdf.setFontSize(9)
    pdf.text('Merci pour votre confiance. Ce devis est valable 30 jours.', 20, yPosition)
    pdf.text('Généré automatiquement par OPUS', 20, yPosition + 5)

    const pdfBuffer = pdf.output('arraybuffer')

    // Envoyer email avec PDF
    const resend = new Resend(process.env.RESEND_API_KEY)

    const result = await resend.emails.send({
      from: 'noreply@opus.boutique',
      to: clientEmail,
      subject: `Devis ${devisData.numero_devis}`,
      html: `
        <html>
        <body style="font-family: Arial; color: #333;">
          <h1>Votre Devis OPUS</h1>
          <p>Bonjour <strong>${clientName}</strong>,</p>
          <p>Merci pour votre intérêt. Veuillez trouver ci-joint votre devis détaillé.</p>
          <p><strong>Numéro:</strong> ${devisData.numero_devis}</p>
          <p><strong>Date:</strong> ${new Date(devisData.date_creation).toLocaleDateString('fr-FR')}</p>
          <p><strong>Montant TTC:</strong> ${(devisData.montant_total_ttc || 0).toFixed(2)}€</p>
          <p>Ce devis est valable 30 jours à compter de sa date d'émission.</p>
          <p>Cordialement,<br>L'équipe OPUS</p>
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