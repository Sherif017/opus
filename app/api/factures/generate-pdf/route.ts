import { NextRequest, NextResponse } from 'next/server'
import jsPDF from 'jspdf'

interface LigneFacture {
  description: string
  quantite: number
  prix_unitaire: number
  taux_tva: number
}

interface FactureData {
  numero_facture: string
  date_creation: string
  date_echeance: string
  montant_total_ht: number
  montant_tva: number
  montant_total_ttc: number
}

interface ClientData {
  nom: string
}

interface EntrepriseData {
  nom: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { factureData, lignes, clientData, entrepriseData } = body as {
      factureData: FactureData
      lignes: LigneFacture[]
      clientData: ClientData
      entrepriseData: EntrepriseData
    }

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    let yPosition = 20

    // ✅ En-tête
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('FACTURE', 20, yPosition)

    // ✅ Entreprise
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    yPosition += 20
    doc.text(`${entrepriseData.nom}`, 20, yPosition)
    doc.text('OPUS Platform', 20, yPosition + 5)
    doc.text('www.opus.boutique', 20, yPosition + 10)

    // ✅ Infos facture (côté droit)
    doc.setFontSize(9)
    doc.text(`Facture: ${factureData.numero_facture}`, pageWidth - 80, yPosition)
    doc.text(`Date: ${new Date(factureData.date_creation).toLocaleDateString('fr-FR')}`, pageWidth - 80, yPosition + 5)
    doc.text(`Échéance: ${new Date(factureData.date_echeance).toLocaleDateString('fr-FR')}`, pageWidth - 80, yPosition + 10)

    // ✅ Client
    yPosition += 30
    doc.setFont('helvetica', 'bold')
    doc.text('Client:', 20, yPosition)
    doc.setFont('helvetica', 'normal')
    doc.text(clientData.nom, 20, yPosition + 5)

    // ✅ Tableau des lignes
    yPosition += 20

    // En-têtes du tableau
    doc.setFont('helvetica', 'bold')
    doc.setFillColor(41, 128, 185)
    doc.setTextColor(255, 255, 255)
    doc.rect(20, yPosition, pageWidth - 40, 7, 'F')
    
    doc.text('Description', 25, yPosition + 5)
    doc.text('Qté', 120, yPosition + 5)
    doc.text('Prix unitaire', 140, yPosition + 5)
    doc.text('TVA %', 165, yPosition + 5)
    doc.text('Total HT', pageWidth - 35, yPosition + 5)

    yPosition += 10

    // ✅ Lignes
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(0, 0, 0)

    lignes.forEach((ligne, index) => {
      const sousTotal = ligne.quantite * ligne.prix_unitaire
      const rowHeight = 8

      // Alternance de couleur
      if (index % 2 === 0) {
        doc.setFillColor(240, 240, 240)
        doc.rect(20, yPosition, pageWidth - 40, rowHeight, 'F')
      }

      doc.text(ligne.description, 25, yPosition + 5)
      doc.text(ligne.quantite.toString(), 120, yPosition + 5)
      doc.text(`${ligne.prix_unitaire.toFixed(2)}€`, 140, yPosition + 5)
      doc.text(`${ligne.taux_tva}%`, 165, yPosition + 5)
      doc.text(`${sousTotal.toFixed(2)}€`, pageWidth - 35, yPosition + 5)

      yPosition += rowHeight
    })

    // ✅ Totaux
    yPosition += 10

    doc.setFont('helvetica', 'bold')
    doc.setFillColor(230, 230, 230)
    doc.rect(pageWidth - 90, yPosition, 70, 7, 'F')
    doc.text('Montant HT:', pageWidth - 85, yPosition + 5)
    doc.text(`${factureData.montant_total_ht.toFixed(2)}€`, pageWidth - 30, yPosition + 5)

    yPosition += 10

    doc.setFillColor(230, 230, 230)
    doc.rect(pageWidth - 90, yPosition, 70, 7, 'F')
    doc.text('TVA:', pageWidth - 85, yPosition + 5)
    doc.text(`${factureData.montant_tva.toFixed(2)}€`, pageWidth - 30, yPosition + 5)

    yPosition += 10

    doc.setFillColor(41, 128, 185)
    doc.setTextColor(255, 255, 255)
    doc.rect(pageWidth - 90, yPosition, 70, 10, 'F')
    doc.setFontSize(11)
    doc.text('TOTAL TTC:', pageWidth - 85, yPosition + 7)
    doc.text(`${factureData.montant_total_ttc.toFixed(2)}€`, pageWidth - 30, yPosition + 7)

    // ✅ Footer
    doc.setTextColor(100, 100, 100)
    doc.setFontSize(8)
    doc.text('Merci pour votre confiance !', pageWidth / 2, pageHeight - 20, { align: 'center' })

    // ✅ Générer le PDF
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'))

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="facture-${factureData.numero_facture}.pdf"`,
      },
    })
  } catch (error) {
    console.error('❌ API Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}