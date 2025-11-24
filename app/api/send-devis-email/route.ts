import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { devisId, email } = await req.json()
    
    console.log('🔍 send-devis-email called with:', { devisId, email })

    if (!devisId || !email) {
      console.error('❌ Missing data:', { devisId, email })
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      )
    }

    if (!process.env.RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY not configured')
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

    console.log('📦 Fetching devis:', devisId)

    // ✅ Récupérer le devis avec toutes les données
    const { data: devis, error: devisError } = await supabase
      .from('devis')
      .select(`
        *,
        clients(*),
        entreprises(*)
      `)
      .eq('id', devisId)
      .single()

    if (devisError || !devis) {
      console.error('❌ Devis not found:', devisError)
      return NextResponse.json(
        { error: 'Devis non trouvé' },
        { status: 404 }
      )
    }

    console.log('✅ Devis found:', devis.numero_devis)

    // ✅ Générer le PDF - appel interne SANS authentification
    // car generate-pdf ne requiert pas d'auth (c'est une route publique)
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    
    const pdfUrl = `${baseUrl}/api/devis/generate-pdf`
    console.log('🔗 PDF URL:', pdfUrl)
    
    const pdfResponse = await fetch(pdfUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
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
      }),
    })

    console.log('📄 PDF Response status:', pdfResponse.status)

    if (!pdfResponse.ok) {
      const errorText = await pdfResponse.text()
      console.error('❌ PDF generation failed:', {
        status: pdfResponse.status,
        error: errorText,
      })
      return NextResponse.json(
        { error: 'Erreur génération PDF: ' + pdfResponse.status },
        { status: 500 }
      )
    }

    // ✅ CORRECTION : Récupérer le PDF en buffer et le convertir en base64
    const pdfArrayBuffer = await pdfResponse.arrayBuffer()
    const pdfBuffer = Buffer.from(pdfArrayBuffer)
    const pdfBase64 = pdfBuffer.toString('base64')

    console.log('✅ PDF generated successfully:', {
      size: pdfArrayBuffer.byteLength,
      base64Length: pdfBase64.length,
    })

    // ✅ Envoyer l'email avec Resend
    console.log('📧 Sending email to:', email)

    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@opus.boutique',
      to: email,
      subject: `Devis ${devis.numero_devis}`,
      html: `
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
              <p>Bonjour <strong>${devis.clients?.nom}</strong>,</p>
              
              <p>Merci pour votre intérêt. Veuillez trouver ci-joint votre devis détaillé.</p>
              
              <div class="details">
                <p><strong>Numéro:</strong> ${devis.numero_devis}</p>
                <p><strong>Date:</strong> ${new Date(devis.date_creation).toLocaleDateString('fr-FR')}</p>
              </div>

              <div class="details">
                <p><strong>Montant HT:</strong> ${devis.montant_total_ht.toFixed(2)}€</p>
                <p><strong>TVA:</strong> ${devis.montant_tva.toFixed(2)}€</p>
                <div class="total">Total TTC: ${devis.montant_total_ttc.toFixed(2)}€</div>
              </div>

              <p>Ce devis est valable 30 jours à compter de sa date d'émission.</p>
              
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
          filename: `devis-${devis.numero_devis}.pdf`,
          content: pdfBase64,
        },
      ],
    })

    if (result.error) {
      console.error('❌ Resend error:', result.error)
      throw new Error(result.error.message)
    }

    console.log('✅ Email sent successfully:', result.data?.id)

    return NextResponse.json({ 
      success: true, 
      messageId: result.data?.id,
      message: 'Email envoyé avec succès'
    })
  } catch (error) {
    console.error('❌ Email Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur envoi email' },
      { status: 500 }
    )
  }
}