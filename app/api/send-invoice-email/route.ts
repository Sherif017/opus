import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { factureId, email } = await req.json()

    if (!factureId || !email) {
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

    // ✅ Créer un client Supabase serveur
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const resend = new Resend(process.env.RESEND_API_KEY)

    // ✅ Récupérer la facture avec toutes les données
    const { data: facture, error: factureError } = await supabase
      .from('factures')
      .select(`
        *,
        clients(*),
        entreprises(*)
      `)
      .eq('id', factureId)
      .single()

    if (factureError || !facture) {
      console.error('Erreur récupération facture:', factureError)
      return NextResponse.json(
        { error: 'Facture non trouvée' },
        { status: 404 }
      )
    }

    // ✅ Récupérer les lignes de la facture
    const { data: lignes } = await supabase
      .from('factures_lignes')
      .select('*')
      .eq('facture_id', factureId)

    // ✅ Générer le PDF avec la route améliorée
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const pdfResponse = await fetch(`${appUrl}/api/factures/generate-pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        factureData: {
          numero_facture: facture.numero_facture,
          date_creation: facture.date_creation,
          date_echeance: facture.date_echeance,
          montant_total_ht: facture.montant_total_ht,
          montant_tva: facture.montant_tva,
          montant_total_ttc: facture.montant_total_ttc,
          montant_paye: facture.montant_paye,
        },
        lignes: lignes || [],
        clientData: {
          nom: facture.clients?.nom,
          adresse: facture.clients?.adresse,
          code_postal: facture.clients?.code_postal,
          ville: facture.clients?.ville,
          tva_number: facture.clients?.tva_number,
        },
        entrepriseData: facture.entreprises || {},
      }),
    })

    if (!pdfResponse.ok) {
      console.error('Erreur génération PDF:', pdfResponse.status)
      return NextResponse.json(
        { error: 'Erreur génération PDF' },
        { status: 500 }
      )
    }

    // ✅ Récupérer le PDF en buffer et le convertir en base64
    const pdfArrayBuffer = await pdfResponse.arrayBuffer()
    const pdfBuffer = Buffer.from(pdfArrayBuffer)
    const pdfBase64 = pdfBuffer.toString('base64')

    console.log('✅ PDF généré, taille:', pdfArrayBuffer.byteLength, 'bytes')
    console.log('✅ Base64 taille:', pdfBase64.length, 'characters')

    // ✅ Envoyer l'email avec Resend
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@opus.boutique',
      to: email,
      subject: `Facture ${facture.numero_facture}`,
      html: `
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #10b981; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
            .details { margin: 20px 0; background-color: white; padding: 15px; border-radius: 5px; }
            .total { font-size: 18px; font-weight: bold; color: #10b981; margin: 15px 0; }
            .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Votre Facture OPUS</h1>
            </div>
            <div class="content">
              <p>Bonjour <strong>${facture.clients?.nom}</strong>,</p>
              
              <p>Merci pour votre confiance. Veuillez trouver ci-joint votre facture détaillée.</p>
              
              <div class="details">
                <p><strong>Numéro:</strong> ${facture.numero_facture}</p>
                <p><strong>Date:</strong> ${new Date(facture.date_creation).toLocaleDateString('fr-FR')}</p>
              </div>

              <div class="details">
                <p><strong>Montant HT:</strong> ${facture.montant_total_ht.toFixed(2)}€</p>
                <p><strong>TVA:</strong> ${facture.montant_tva.toFixed(2)}€</p>
                <div class="total">Total TTC: ${facture.montant_total_ttc.toFixed(2)}€</div>
              </div>

              <p>Veuillez effectuer le paiement selon les conditions convenues.</p>
              
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
          filename: `facture-${facture.numero_facture}.pdf`,
          content: pdfBase64,
        },
      ],
    })

    if (result.error) {
      console.error('Erreur Resend:', result.error)
      throw new Error(result.error.message)
    }

    return NextResponse.json({ 
      success: true, 
      messageId: result.data?.id,
      message: 'Email envoyé avec succès'
    })
  } catch (error) {
    console.error('Email Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur envoi email' },
      { status: 500 }
    )
  }
}