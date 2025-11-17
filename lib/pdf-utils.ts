import jsPDF from 'jspdf'

/**
 * ✅ Convertir une image en base64 (pour jsPDF)
 */
export async function imageToBase64(imageUrl: string): Promise<string> {
  try {
    const response = await fetch(imageUrl)
    const blob = await response.blob()
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.error('Erreur conversion image:', error)
    return ''
  }
}

/**
 * ✅ Ajouter le logo en haut du PDF
 */
export async function addLogoToHeader(
  pdf: jsPDF,
  logoUrl: string | null | undefined
): Promise<void> {
  if (!logoUrl) return

  try {
    const logoBase64 = await imageToBase64(logoUrl)
    if (logoBase64) {
      // Logo en haut à gauche, 30x30mm
      pdf.addImage(logoBase64, 'PNG', 15, 12, 30, 30)
    }
  } catch (error) {
    console.error('Erreur ajout logo:', error)
  }
}

/**
 * ✅ Ajouter les infos légales en bas du PDF (footer)
 */
export function addLegalFooter(
  pdf: jsPDF,
  entrepriseData: {
    nom?: string
    siret?: string | null
    siren?: string | null
    tva_number?: string | null
    adresse?: string | null
    code_postal?: string | null
    ville?: string | null
    telephone?: string | null
    email?: string | null
    conditions_paiement?: number
  }
): void {
  const pageHeight = pdf.internal.pageSize.getHeight()
  const pageWidth = pdf.internal.pageSize.getWidth()
  const footerY = pageHeight - 25
  const margin = 10

  pdf.setFontSize(7)
  pdf.setTextColor(120, 120, 120)

  // Ligne séparatrice
  pdf.setDrawColor(200, 200, 200)
  pdf.line(margin, footerY - 3, pageWidth - margin, footerY - 3)

  // Colonne 1 : Infos légales
  let yPos = footerY + 1
  pdf.text('Informations légales:', margin, yPos)
  yPos += 3

  const legalInfo = []
  if (entrepriseData.siret) legalInfo.push(`SIRET: ${entrepriseData.siret}`)
  if (entrepriseData.siren) legalInfo.push(`SIREN: ${entrepriseData.siren}`)
  if (entrepriseData.tva_number) legalInfo.push(`TVA: ${entrepriseData.tva_number}`)

  legalInfo.forEach((info) => {
    pdf.text(info, margin + 2, yPos)
    yPos += 2.5
  })

  // Colonne 2 : Conditions de paiement et contact
  yPos = footerY + 1
  const contactX = pageWidth / 2

  const contactInfo = []
  if (entrepriseData.telephone) contactInfo.push(`Tél: ${entrepriseData.telephone}`)
  if (entrepriseData.email) contactInfo.push(`Email: ${entrepriseData.email}`)
  if (entrepriseData.conditions_paiement) {
    contactInfo.push(`Délai paiement: ${entrepriseData.conditions_paiement}j`)
  }

  contactInfo.forEach((info) => {
    pdf.text(info, contactX, yPos)
    yPos += 2.5
  })

  // Colonne 3 : Adresse
  yPos = footerY + 1
  const addressX = pageWidth - 40

  const addressInfo = []
  if (entrepriseData.adresse) addressInfo.push(entrepriseData.adresse)
  if (entrepriseData.code_postal && entrepriseData.ville) {
    addressInfo.push(`${entrepriseData.code_postal} ${entrepriseData.ville}`)
  }

  addressInfo.forEach((info) => {
    pdf.text(info, addressX, yPos)
    yPos += 2.5
  })
}

/**
 * ✅ Ajouter les infos entreprise complètes en section header
 */
export function addCompanyHeaderSection(
  pdf: jsPDF,
  entrepriseData: {
    nom?: string
    adresse?: string | null
    code_postal?: string | null
    ville?: string | null
    telephone?: string | null
    email?: string | null
    siret?: string | null
    siren?: string | null
    tva_number?: string | null
  },
  startY: number = 50
): number {
  let yPos = startY

  // Nom entreprise
  pdf.setFontSize(11)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(0, 0, 0)
  pdf.text(entrepriseData.nom || 'Entreprise', 20, yPos)
  yPos += 5

  // Infos de contact
  pdf.setFontSize(9)
  pdf.setFont('helvetica', 'normal')

  const contactLines = [
    entrepriseData.adresse,
    entrepriseData.code_postal && entrepriseData.ville ? `${entrepriseData.code_postal} ${entrepriseData.ville}` : null,
    entrepriseData.telephone ? `Tél: ${entrepriseData.telephone}` : null,
    entrepriseData.email ? `Email: ${entrepriseData.email}` : null,
    entrepriseData.siret ? `SIRET: ${entrepriseData.siret}` : null,
    entrepriseData.siren ? `SIREN: ${entrepriseData.siren}` : null,
    entrepriseData.tva_number ? `TVA: ${entrepriseData.tva_number}` : null,
  ]

  contactLines.filter(Boolean).forEach((line) => {
    if (line) {
      pdf.text(line, 20, yPos)
      yPos += 4
    }
  })

  return yPos + 5
}

/**
 * ✅ Formater un montant en euros
 */
export function formatCurrency(amount: number): string {
  return `${amount.toFixed(2)}€`
}

/**
 * ✅ Calculer les totaux avec TVA par taux
 */
export function calculateTotalsByVAT(
  items: Array<{
    quantite: number
    prix_unitaire: number
    taux_tva: number
  }>
): {
  byRate: { [key: number]: { montantHT: number; montantTVA: number } }
  totalHT: number
  totalTVA: number
  totalTTC: number
} {
  const byRate: { [key: number]: { montantHT: number; montantTVA: number } } = {}

  items.forEach((item) => {
    const montantHT = item.quantite * item.prix_unitaire
    const montantTVA = montantHT * (item.taux_tva / 100)
    const rate = item.taux_tva

    if (!byRate[rate]) {
      byRate[rate] = { montantHT: 0, montantTVA: 0 }
    }

    byRate[rate].montantHT += montantHT
    byRate[rate].montantTVA += montantTVA
  })

  const totalHT = Object.values(byRate).reduce((sum, line) => sum + line.montantHT, 0)
  const totalTVA = Object.values(byRate).reduce((sum, line) => sum + line.montantTVA, 0)
  const totalTTC = totalHT + totalTVA

  return {
    byRate,
    totalHT,
    totalTVA,
    totalTTC,
  }
}

/**
 * ✅ Générer un numéro de document simple et intuitif
 * Format: DEV-2025-001 ou FAC-2025-001
 */
export function generateDocumentNumber(
  type: 'devis' | 'facture',
  existingNumber?: string
): string {
  // Si un numéro existe déjà, le retourner
  if (existingNumber) return existingNumber

  const year = new Date().getFullYear()
  const prefix = type === 'devis' ? 'DEV' : 'FAC'
  const timestamp = Date.now()
  const sequence = Math.floor((timestamp % 1000000) / 1000)

  return `${prefix}-${year}-${String(sequence).padStart(3, '0')}`
}