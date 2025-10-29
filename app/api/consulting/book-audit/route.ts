import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    // ✅ Créer les clients DANS la fonction
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    )
    const resend = new Resend(process.env.RESEND_API_KEY)

  try {
    // ✅ Créer les clients DANS la fonction
            const body = await request.json()

    const {
      fullName,
      email,
      phone,
      company,
      industry,
      challenge,
      preferredDate,
      preferredTime,
    } = body

    console.log('📝 Données reçues:', { fullName, email, phone, company, industry })

    // Validation
    if (!fullName || !email || !phone || !company || !industry || !challenge || !preferredDate || !preferredTime) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      )
    }

    // Sépare nom et prénom
    const nameParts = fullName.trim().split(' ')
    const prenom = nameParts[0]
    const nom = nameParts.slice(1).join(' ') || prenom

    console.log('👤 Nom séparé:', { nom, prenom })

    // Crée un lead dans consulting_leads (la table correcte!)
    console.log('➕ Créant lead dans consulting_leads...')
    const { data: newLead, error: leadError } = await supabase
      .from('consulting_leads')
      .insert([
        {
          name: fullName,
          email: email,
          phone: phone,
          company: company,
          status: 'pending',
          notes: `Secteur: ${industry}\n\nDéfi: ${challenge}`,
        },
      ])
      .select()

    if (leadError) {
      console.error('❌ Lead creation error:', leadError)
      return NextResponse.json(
        { error: 'Erreur lors de la création du lead' },
        { status: 500 }
      )
    }

    const leadId = newLead?.[0]?.id
    console.log('✅ Lead créé:', leadId)

    if (!leadId) {
      return NextResponse.json(
        { error: 'Impossible de créer le lead' },
        { status: 500 }
      )
    }

    // Combine date et heure en timestamp
    const scheduledDateTime = `${preferredDate}T${preferredTime}:00`
    console.log('📅 Date/Heure:', scheduledDateTime)

    // Insère dans consulting_audits avec le leadId
    const { data, error: dbError } = await supabase
      .from('consulting_audits')
      .insert([
        {
          lead_id: leadId,
          scheduled_date: scheduledDateTime,
          duration_minutes: 30,
          notes: `Entreprise: ${company}\nSecteur: ${industry}\n\nDéfi:\n${challenge}`,
          status: 'pending',
        },
      ])
      .select()

    if (dbError) {
      console.error('❌ Audit creation error:', dbError)
      return NextResponse.json(
        { error: 'Erreur lors de la création de l\'audit' },
        { status: 500 }
      )
    }

    console.log('✅ Audit créé:', data?.[0]?.id)

    // Envoyer email de confirmation au client
    try {
      await resend.emails.send({
        from: 'consulting@opus.boutique',
        to: email,
        subject: 'Confirmation de votre audit gratuit OPUS',
        html: `
          <h2>Bonjour ${prenom},</h2>
          <p>Merci de votre intérêt pour un audit gratuit OPUS!</p>
          
          <h3>Récapitulatif de votre réservation:</h3>
          <ul>
            <li><strong>Date:</strong> ${preferredDate}</li>
            <li><strong>Heure:</strong> ${preferredTime}</li>
            <li><strong>Entreprise:</strong> ${company}</li>
            <li><strong>Secteur:</strong> ${industry}</li>
          </ul>
          
          <p>Nous vous contacterons sous 24h pour confirmer votre rendez-vous au numéro: <strong>${phone}</strong></p>
          
          <p>À bientôt,<br/>L'équipe OPUS</p>
        `,
      })
      console.log('✅ Email confirmation envoyé')
    } catch (emailError) {
      console.error('⚠️ Email error:', emailError)
    }

    // Envoyer email de notification à l'admin
    try {
      await resend.emails.send({
        from: 'consulting@opus.boutique',
        to: 'admin@opus.boutique',
        subject: `Nouvel audit réservé - ${fullName}`,
        html: `
          <h2>Nouvel audit réservé!</h2>
          <p><strong>Nom:</strong> ${fullName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Téléphone:</strong> ${phone}</p>
          <p><strong>Entreprise:</strong> ${company}</p>
          <p><strong>Secteur:</strong> ${industry}</p>
          <p><strong>Date:</strong> ${preferredDate}</p>
          <p><strong>Heure:</strong> ${preferredTime}</p>
          <p><strong>Défi:</strong></p>
          <p>${challenge}</p>
        `,
      })
      console.log('✅ Email admin envoyé')
    } catch (emailError) {
      console.error('⚠️ Admin email error:', emailError)
    }

    return NextResponse.json({
      success: true,
      message: 'Audit réservé avec succès!',
      data: data?.[0] || {},
    })
  } catch (error) {
    console.error('❌ Booking error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la réservation'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}