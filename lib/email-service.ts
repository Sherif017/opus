import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendBookingConfirmationEmail(
  email: string,
  fullName: string,
  company: string,
  preferredDate: string,
  preferredTime: string,
  challenge: string
) {
  try {
    const bookingDate = new Date(preferredDate)
    const formattedDate = bookingDate.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9f9f9;
              border-radius: 8px;
            }
            .header {
              background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
              color: white;
              padding: 30px;
              border-radius: 8px 8px 0 0;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
            }
            .content {
              background: white;
              padding: 30px;
              border-radius: 0 0 8px 8px;
            }
            .booking-details {
              background-color: #f0f9ff;
              border-left: 4px solid #2563eb;
              padding: 20px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .booking-details h3 {
              margin-top: 0;
              color: #1e40af;
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px solid #e0e7ff;
            }
            .detail-row:last-child {
              border-bottom: none;
            }
            .detail-label {
              font-weight: bold;
              color: #1e40af;
            }
            .detail-value {
              text-align: right;
            }
            .cta-button {
              display: inline-block;
              background-color: #2563eb;
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 4px;
              margin: 20px 0;
              font-weight: bold;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e0e7ff;
              font-size: 12px;
              color: #666;
              text-align: center;
            }
            .logo {
              font-weight: bold;
              font-size: 24px;
              color: white;
              margin-bottom: 10px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">📈 OPUS</div>
              <h1>Audit gratuit réservé! 🎉</h1>
            </div>

            <div class="content">
              <p>Bonjour <strong>${fullName}</strong>,</p>

              <p>Nous avons bien reçu votre réservation pour un audit gratuit. C'est fantastique!</p>

              <div class="booking-details">
                <h3>📋 Détails de votre rendez-vous</h3>
                <div class="detail-row">
                  <span class="detail-label">Date:</span>
                  <span class="detail-value"><strong>${formattedDate}</strong></span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Heure:</span>
                  <span class="detail-value"><strong>${preferredTime}</strong></span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Entreprise:</span>
                  <span class="detail-value"><strong>${company}</strong></span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Format:</span>
                  <span class="detail-value"><strong>Appel vidéo - 30 minutes</strong></span>
                </div>
              </div>

              <p><strong>Prochaines étapes :</strong></p>
              <ul>
                <li>Nous vous contacterons dans les <strong>24 heures</strong> pour confirmer et vous envoyer le lien de la réunion</li>
                <li>Préparez une description de vos défis actuels (vous l'avez mentionné: <em>"${challenge.substring(0, 50)}..."</em>)</li>
                <li>Pensez aux points que vous aimeriez aborder</li>
              </ul>

              <p><strong>Questions avant votre rendez-vous?</strong></p>
              <p>N'hésitez pas à nous contacter à <a href="mailto:contact@opus.boutique">contact@opus.boutique</a></p>

              <div style="text-align: center; margin-top: 30px;">
                <a href="https://opus.boutique" class="cta-button">Visitez OPUS →</a>
              </div>

              <div class="footer">
                <p>© 2025 OPUS - Automatisation pour artisans et PME</p>
                <p>opus.boutique</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `

    const result = await resend.emails.send({
      from: 'OPUS <noreply@opus.boutique>',
      to: email,
      subject: `Audit gratuit confirmé - ${formattedDate} à ${preferredTime}`,
      html: emailHtml,
    })

    return result
  } catch (error) {
    console.error('Error sending confirmation email:', error)
    throw error
  }
}

export async function sendBookingNotificationEmail(
  fullName: string,
  email: string,
  phone: string,
  company: string,
  industry: string,
  challenge: string,
  preferredDate: string,
  preferredTime: string
) {
  try {
    const bookingDate = new Date(preferredDate)
    const formattedDate = bookingDate.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9f9f9;
            }
            .header {
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              color: white;
              padding: 30px;
              border-radius: 8px 8px 0 0;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
            }
            .content {
              background: white;
              padding: 30px;
              border-radius: 0 0 8px 8px;
            }
            .booking-details {
              background-color: #f0fdf4;
              border-left: 4px solid #10b981;
              padding: 20px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              border-bottom: 1px solid #dcfce7;
            }
            .detail-row:last-child {
              border-bottom: none;
            }
            .detail-label {
              font-weight: bold;
              color: #059669;
            }
            .cta-button {
              display: inline-block;
              background-color: #10b981;
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 4px;
              margin: 20px 0;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🆕 Nouvelle réservation d'audit</h1>
            </div>

            <div class="content">
              <p>Une nouvelle réservation d'audit gratuit a été effectuée!</p>

              <div class="booking-details">
                <h3 style="margin-top: 0; color: #059669;">📋 Détails du prospect</h3>
                <div class="detail-row">
                  <span class="detail-label">Nom:</span>
                  <span><strong>${fullName}</strong></span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Email:</span>
                  <span><a href="mailto:${email}">${email}</a></span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Téléphone:</span>
                  <span><a href="tel:${phone}">${phone}</a></span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Entreprise:</span>
                  <span><strong>${company}</strong></span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Secteur:</span>
                  <span><strong>${industry}</strong></span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Date demandée:</span>
                  <span><strong>${formattedDate} à ${preferredTime}</strong></span>
                </div>
              </div>

              <div style="background-color: #f9fafb; padding: 15px; border-radius: 4px; margin: 20px 0;">
                <p><strong>🎯 Défi mentionné:</strong></p>
                <p><em>"${challenge}"</em></p>
              </div>

              <p style="text-align: center; margin-top: 30px;">
                <a href="https://opus.boutique/dashboard/audits" class="cta-button">Voir tous les audits →</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `

    const result = await resend.emails.send({
      from: 'OPUS <noreply@opus.boutique>',
      to: 'cheryfhanfo@gmail.com',
      subject: `📋 Nouvelle réservation d'audit - ${fullName}`,
      html: emailHtml,
    })

    return result
  } catch (error) {
    console.error('Error sending notification email:', error)
    throw error
  }
}