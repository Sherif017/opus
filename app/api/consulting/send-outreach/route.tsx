import { Resend } from 'resend'
import { NextRequest, NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

interface Prospect {
  email: string
  name?: string
}

export async function POST(request: NextRequest) {
  try {
    const { emails } = await request.json()

    if (!emails || !Array.isArray(emails)) {
      return NextResponse.json(
        { error: 'emails array is required' },
        { status: 400 }
      )
    }

    const results = await Promise.all(
      emails.map((prospect: Prospect) =>
        resend.emails.send({
          from: 'consulting@opus.boutique',
          to: prospect.email,
          subject: 'Audit gratuit OPUS Consulting',
          html: `
            <h2>Bonjour ${prospect.name || 'Prospect'},</h2>
            <p>Nous aimerions vous proposer un audit gratuit pour explorer les opportunités d'automation dans votre business.</p>
            <p>Cet audit de 30 minutes est sans engagement et vous permettra de découvrir comment économiser du temps et augmenter votre revenue.</p>
            <p><a href="https://opus.boutique/consulting/booking">Réserver votre audit gratuit →</a></p>
            <p>À bientôt,<br/>L'équipe OPUS</p>
          `,
        })
      )
    )

    return NextResponse.json({
      success: true,
      sent: results.length,
      results,
    })
  } catch (error) {
    console.error('Error sending outreach:', error)
    return NextResponse.json(
      { error: 'Failed to send outreach emails' },
      { status: 500 }
    )
  }
}