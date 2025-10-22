import OpenAI from 'openai'
import { NextRequest, NextResponse } from 'next/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { prospectName, lastContact, companyName, prospectEmail } = await req.json()

    const message = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 200,
      messages: [
        {
          role: 'user',
          content: `Tu es un expert en vente B2B pour artisans. Génère un court message de relance personnalisé en français pour relancer un prospect.

Informations:
- Nom du prospect: ${prospectName}
- Email: ${prospectEmail}
- Dernière prise de contact: ${lastContact}
- Entreprise artisan: ${companyName}

Génère UNIQUEMENT le texte du message (2-3 phrases max), sans formule de politesse, très direct et orienté action.`,
        },
      ],
    })

    const relanceText = message.choices[0].message.content || ''

    return NextResponse.json({
      success: true,
      relanceText: relanceText.trim(),
    })
  } catch (error) {
    console.error('AI Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur IA' },
      { status: 500 }
    )
  }
}