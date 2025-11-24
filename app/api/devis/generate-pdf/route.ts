import { NextRequest, NextResponse } from 'next/server'
import jsPDF from 'jspdf'
import { addLogoToHeader, addCompanyHeaderSection, addLegalFooter, calculateTotalsByVAT } from '@/lib/pdf-utils'
import { createClient } from '@supabase/supabase-js'

interface LigneDevis {
  description: string
  quantite: number
  prix_unitaire: number
  taux_tva: number
}

export async function GET(req: NextRequest) {
  try {
    const devisId = req.nextUrl.searchParams.get('devisId')

    if (!devisId) {
      return NextResponse.json(
        { error: 'devisId manquant' },
        { status: 400 }
      )
    }

    // ✅ Créer un client Supabase SERVEUR avec SERVICE ROLE KEY
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // ✅ Récupérer le devis depuis Supabase
    const { data: devis, error: devisError } = await supabaseAdmin
      .from('devis')
      .select(`
        *,
        clients(*),
        entreprises(*)
      `)
      .eq('id', devisId)
      .single()

    if (devisError || !devis) {
      console.error('Erreur récupération devis:', devisError)
      return NextResponse.json(
        { error: 'Devis non trouvé' },
        { status: 404 }
      )
    }

    // ✅ Générer le PDF
    const pdf = await generateDevisPDF({
      devisData: {
        numero_devis: devis.numero_devis,
        date_creation: devis.date_creation,
        montant_total_ht: devis.montant_total_ht,
        montant_tva: devis.montant_tva,
        montant_total_ttc: devis.montant_total_ttc,
      },
      lignes: devis.lignes || [],
      clientData: {
        nom: devis.clients?.nom,
        adresse: devis.clients?.adresse,
        code_postal: devis.clients?.code_postal,
        ville: devis.clients?.ville,
        tva_number: devis.clients?.tva_number,
      },
      entrepriseData: devis.entreprises || {},
    })

    const pdfBuffer = pdf.output('arraybuffer')

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="devis-${devis.numero_devis}.pdf"`,
      },
    })
  } catch (error) {
    console.error('PDF Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur génération PDF' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const { devisData, lignes, clientData, entrepriseData } = await req.json()

    if (!devisData || !lignes || !clientData) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      )
    }

    // ✅ Générer le PDF
    const pdf = await generateDevisPDF({
      devisData,
      lignes,
      clientData,
      entrepriseData,
    })

    const pdfBuffer = pdf.output('arraybuffer')

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="devis-${devisData.numero_devis}.pdf"`,
      },
    })
  } catch (error) {
    console.error('PDF Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur génération PDF' },
      { status: 500 }
    )
  }
}

/**
 * ✅ Fonction générique pour générer le PDF devis
 */
async function generateDevisPDF({
  devisData,
  lignes,
  clientData,
  entrepriseData,
}: {
  devisData: any
  lignes: LigneDevis[]
  clientData: any
  entrepriseData: any
}) {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = pdf.internal.pageSize.getWidth()

  // ===== 1. HEADER AVEC LOGO =====
  if (entrepriseData?.logo_url) {
    await addLogoToHeader(pdf, entrepriseData.logo_url)
  }

  // ===== 2. TITRE DEVIS =====
  pdf.setFontSize(24)
  pdf.setTextColor(59, 130, 246)
  pdf.text('DEVIS', pageWidth - 50, 20)

  pdf.setFontSize(10)
  pdf.setTextColor(0, 0, 0)
  pdf.text(devisData.numero_devis, pageWidth - 50, 28)

  // ===== 3. INFOS ENTREPRISE COMPLÈTES =====
  let yPosition = addCompanyHeaderSection(pdf, entrepriseData, 50)

  // ===== 4. INFOS DEVIS (côté droit) =====
  pdf.setFontSize(9)
  pdf.setFont('helvetica', 'normal')

  yPosition = 50
  const rightColumnX = pageWidth - 70

  pdf.text(`Devis: ${devisData.numero_devis}`, rightColumnX, yPosition)
  yPosition += 5
  pdf.text(`Date: ${new Date(devisData.date_creation).toLocaleDateString('fr-FR')}`, rightColumnX, yPosition)
  yPosition += 5
  pdf.text('Validité: 30 jours', rightColumnX, yPosition)

  // ===== 5. SECTION CLIENT =====
  yPosition += 15
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(10)
  pdf.text('DEVIS ÉTABLI POUR:', 20, yPosition)
  yPosition += 5

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(9)
  pdf.text(clientData.nom, 20, yPosition)
  yPosition += 4

  if (clientData.adresse) {
    pdf.text(clientData.adresse, 20, yPosition)
    yPosition += 4
  }

  if (clientData.code_postal && clientData.ville) {
    pdf.text(`${clientData.code_postal} ${clientData.ville}`, 20, yPosition)
    yPosition += 4
  }

  if (clientData.tva_number) {
    pdf.text(`TVA: ${clientData.tva_number}`, 20, yPosition)
    yPosition += 4
  }

  yPosition += 8

  // ===== 6. TABLEAU DES PRESTATIONS =====
  // En-têtes du tableau
  pdf.setFont('helvetica', 'bold')
  pdf.setFillColor(243, 244, 246)
  pdf.rect(20, yPosition - 5, 170, 6, 'F')

  pdf.setFontSize(9)
  pdf.text('Désignation', 25, yPosition)
  pdf.text('Quantité', 100, yPosition)
  pdf.text('Prix unitaire', 125, yPosition)
  pdf.text('TVA %', 150, yPosition)
  pdf.text('Montant HT', 175, yPosition, { align: 'right' })

  yPosition += 8
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(9)

  // Lignes du devis
  lignes.forEach((ligne: LigneDevis) => {
    if (yPosition > 250) {
      pdf.addPage()
      yPosition = 20
    }

    const montantHT = ligne.quantite * ligne.prix_unitaire

    pdf.text(ligne.description.substring(0, 30), 25, yPosition)
    pdf.text(ligne.quantite.toString(), 100, yPosition)
    pdf.text(`${ligne.prix_unitaire.toFixed(2)}€`, 125, yPosition)
    pdf.text(`${ligne.taux_tva}%`, 150, yPosition)
    pdf.text(`${montantHT.toFixed(2)}€`, 175, yPosition, { align: 'right' })

    yPosition += 7
  })

  // Ligne de séparation
  pdf.setDrawColor(59, 130, 246)
  pdf.line(20, yPosition, 190, yPosition)

  // ===== 7. TOTAUX AVEC TVA PAR TAUX =====
  yPosition += 8
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(10)

  const totals = calculateTotalsByVAT(lignes)

  // Montant HT
  pdf.text('Montant HT:', 130, yPosition)
  pdf.text(`${totals.totalHT.toFixed(2)}€`, 185, yPosition, { align: 'right' })

  yPosition += 7

  // Détail TVA par taux
  pdf.setFontSize(9)
  Object.entries(totals.byRate).forEach(([rate, value]) => {
    pdf.text(`TVA ${rate}% (${value.montantTVA.toFixed(2)}€):`, 130, yPosition)
    pdf.text(`${value.montantTVA.toFixed(2)}€`, 185, yPosition, { align: 'right' })
    yPosition += 5
  })

  yPosition += 2

  // Total TTC
  pdf.setFillColor(59, 130, 246)
  pdf.rect(130, yPosition - 6, 60, 8, 'F')
  pdf.setTextColor(255, 255, 255)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(11)
  pdf.text('TOTAL TTC:', 135, yPosition)
  pdf.text(`${totals.totalTTC.toFixed(2)}€`, 185, yPosition, { align: 'right' })

  // ===== 8. CONDITIONS =====
  yPosition += 15
  pdf.setTextColor(0, 0, 0)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(9)
  pdf.text('Conditions du devis:', 20, yPosition)

  yPosition += 5
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(8)

  const conditions = [
    'Validité du devis: 30 jours',
    `Délai de paiement: ${entrepriseData?.conditions_paiement || 30} jours après signature`,
    'TVA non applicable (franchise de base)',
    'Devis accepté par signature du client',
  ]

  conditions.forEach((condition) => {
    const wrapped = pdf.splitTextToSize(condition, pageWidth - 40)
    wrapped.forEach((line: string) => {
      if (yPosition > 270) {
        pdf.addPage()
        yPosition = 20
      }
      pdf.text(`• ${line}`, 20, yPosition)
      yPosition += 4
    })
  })

  // ===== 9. FOOTER AVEC INFOS LÉGALES =====
  addLegalFooter(pdf, entrepriseData)

  return pdf
}