import { NextRequest, NextResponse } from 'next/server'
import jsPDF from 'jspdf'

interface LigneFacture {
  description: string
  quantite: number
  prix_unitaire: number
  taux_tva: number
}

export async function POST(req: NextRequest) {
  try {
    const { factureData, lignes, clientData, entrepriseData } = await req.json()

    if (!factureData || !lignes || !clientData) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      )
    }

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    // Header
    pdf.setFontSize(24)
    pdf.setTextColor(59, 130, 246)
    pdf.text('FACTURE', 20, 20)

    pdf.setFontSize(10)
    pdf.setTextColor(0, 0, 0)
    pdf.text(factureData.numero_facture, 20, 28)

    // De / À
    pdf.setFontSize(9)
    pdf.setFont('Helvetica', 'bold')
    pdf.text('De:', 20, 45)
    pdf.setFont('Helvetica', 'normal')
    pdf.text(entrepriseData?.nom || 'OPUS', 20, 51)

    pdf.setFont('Helvetica', 'bold')
    pdf.text('À:', 110, 45)
    pdf.setFont('Helvetica', 'normal')
    pdf.text(clientData.nom, 110, 51)

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
    
    // Lignes de la facture
    lignes.forEach((ligne: LigneFacture) => {
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
    pdf.text(factureData.montant_total_ht.toFixed(2) + '€', 185, yPosition, { align: 'right' })

    yPosition += 7
    pdf.text('TVA:', 130, yPosition)
    pdf.text(factureData.montant_tva.toFixed(2) + '€', 185, yPosition, { align: 'right' })

    yPosition += 7
    pdf.text('Montant payé:', 130, yPosition)
    pdf.text((factureData.montant_paye || 0).toFixed(2) + '€', 185, yPosition, { align: 'right' })

    const resteAPayer = factureData.montant_total_ttc - (factureData.montant_paye || 0)
    yPosition += 7
    pdf.text('Reste à payer:', 130, yPosition)
    pdf.setTextColor(220, 38, 38) // Rouge
    pdf.text(resteAPayer.toFixed(2) + '€', 185, yPosition, { align: 'right' })

    yPosition += 10
    pdf.setFillColor(59, 130, 246)
    pdf.rect(130, yPosition - 6, 60, 8, 'F')
    pdf.setTextColor(255, 255, 255)
    pdf.setFont('Helvetica', 'bold')
    pdf.setFontSize(11)
    pdf.text('TOTAL TTC:', 135, yPosition)
    pdf.text(factureData.montant_total_ttc.toFixed(2) + '€', 185, yPosition, { align: 'right' })

    // Footer
    yPosition = 275
    pdf.setTextColor(100, 100, 100)
    pdf.setFont('Helvetica', 'normal')
    pdf.setFontSize(9)
    pdf.text('Conditions de paiement: 30 jours à compter de la date de facturation', 20, yPosition)
    pdf.text('Généré automatiquement par OPUS', 20, yPosition + 5)

    const pdfBuffer = pdf.output('arraybuffer')

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="facture-${factureData.numero_facture}.pdf"`,
      },
    })
  } catch (error) {
    console.error('PDF Error:', error)
    return NextResponse.json(
      { error: 'Erreur génération PDF' },
      { status: 500 }
    )
  }
}