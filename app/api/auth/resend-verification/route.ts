import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import crypto from 'crypto'

const resend = new Resend(process.env.RESEND_API_KEY)

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export async function POST(req: NextRequest) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      )
    }

    // Validation email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email invalide' },
        { status: 400 }
      )
    }

    // 1. Récupérer l'utilisateur
    const { data: user, error: userError } = await supabaseAdmin
      .from('utilisateurs')
      .select('id, prenom, nom, email_verified')
      .eq('email', email)
      .maybeSingle()

    if (userError) {
      console.error('User fetch error:', userError)
      throw new Error('Erreur lors de la recherche de l\'utilisateur')
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Cet email n\'existe pas' },
        { status: 404 }
      )
    }

    // 2. Vérifier si l'email est déjà vérifié
    if (user.email_verified) {
      return NextResponse.json(
        { error: 'Cet email est déjà vérifié' },
        { status: 400 }
      )
    }

    // 3. Supprimer les anciens tokens
    const { error: deleteError } = await supabaseAdmin
      .from('email_verification_tokens')
      .delete()
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Old tokens delete error:', deleteError)
    }

    // 4. Générer un nouveau token de vérification
    const verificationToken = generateToken()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 heures

    const { error: tokenError } = await supabaseAdmin
      .from('email_verification_tokens')
      .insert([
        {
          user_id: user.id,
          email: email,
          token: verificationToken,
          expires_at: expiresAt.toISOString(),
        },
      ])

    if (tokenError) {
      console.error('Token creation error:', tokenError)
      throw new Error('Erreur lors de la génération du token')
    }

    // 5. Envoyer l'email de vérification via Resend
    const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${verificationToken}`

    const { error: emailError } = await resend.emails.send({
      from: `Opus <noreply@${process.env.NEXT_PUBLIC_APP_DOMAIN || 'resend.dev'}>`,
      to: email,
      subject: 'Vérifiez votre email - Opus',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">Vérifiez votre email 📧</h2>
          
          <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
            Bonjour <strong>${user.prenom || user.nom}</strong>,
          </p>
          
          <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
            Veuillez cliquer sur le bouton ci-dessous pour vérifier votre email et activer votre compte Opus:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" style="display: inline-block; padding: 14px 32px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
              Vérifier mon email
            </a>
          </div>
          
          <p style="font-size: 14px; color: #666; margin-bottom: 20px;">
            Ou copiez ce lien:
          </p>
          
          <code style="display: block; background-color: #f3f4f6; padding: 12px; border-radius: 4px; word-break: break-all; font-size: 13px; color: #1f2937;">
            ${verificationLink}
          </code>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #999;">
            <p>Ce lien expire dans 24 heures.</p>
            <p>Si vous n'avez pas demandé ceci, vous pouvez ignorer cet email.</p>
            <p style="margin-top: 10px;">© 2024 Opus. Tous droits réservés.</p>
          </div>
        </div>
      `,
    })

    if (emailError) {
      console.error('Email sending error:', emailError)
      // Affiche l'erreur exacte de Resend
      throw new Error(`Erreur Resend: ${JSON.stringify(emailError)}`)
    }

    return NextResponse.json(
      { success: true, message: 'Email de vérification renvoyé avec succès' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Resend verification error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 400 }
    )
  }
}