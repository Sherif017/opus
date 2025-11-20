import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    const { token } = await req.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Token requis' },
        { status: 400 }
      )
    }

    // 1. Récupérer le token et vérifier s'il est valide et non expiré
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('email_verification_tokens')
      .select('*')
      .eq('token', token)
      .maybeSingle()

    if (tokenError) {
      console.error('Token fetch error:', tokenError)
      throw new Error('Erreur lors de la vérification du token')
    }

    if (!tokenData) {
      return NextResponse.json(
        { error: 'Token invalide ou expiré' },
        { status: 400 }
      )
    }

    // 2. Vérifier si le token a expiré
    const now = new Date()
    const expiresAt = new Date(tokenData.expires_at)

    if (now > expiresAt) {
      return NextResponse.json(
        { error: 'Ce lien de vérification a expiré. Veuillez en demander un nouveau.' },
        { status: 400 }
      )
    }

    // 3. Marquer l'utilisateur comme vérifié
    const { error: updateError } = await supabaseAdmin
      .from('utilisateurs')
      .update({
        email_verified: true,
        email_verified_at: new Date().toISOString(),
      })
      .eq('id', tokenData.user_id)

    if (updateError) {
      console.error('User update error:', updateError)
      throw new Error('Erreur lors de la vérification de l\'email')
    }

    // 4. Supprimer le token utilisé
    const { error: deleteError } = await supabaseAdmin
      .from('email_verification_tokens')
      .delete()
      .eq('id', tokenData.id)

    if (deleteError) {
      console.error('Token delete error:', deleteError)
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Email vérifié avec succès! Vous pouvez maintenant vous connecter.',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 400 }
    )
  }
}

// GET endpoint pour vérifier via URL (optionnel, pour les liens directs)
export async function GET(req: NextRequest) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    const searchParams = req.nextUrl.searchParams
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Token requis' },
        { status: 400 }
      )
    }

    // 1. Récupérer le token et vérifier s'il est valide et non expiré
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('email_verification_tokens')
      .select('*')
      .eq('token', token)
      .maybeSingle()

    if (tokenError) {
      console.error('Token fetch error:', tokenError)
      throw new Error('Erreur lors de la vérification du token')
    }

    if (!tokenData) {
      return NextResponse.json(
        { error: 'Token invalide ou expiré' },
        { status: 400 }
      )
    }

    // 2. Vérifier si le token a expiré
    const now = new Date()
    const expiresAt = new Date(tokenData.expires_at)

    if (now > expiresAt) {
      return NextResponse.json(
        { error: 'Ce lien de vérification a expiré. Veuillez en demander un nouveau.' },
        { status: 400 }
      )
    }

    // 3. Marquer l'utilisateur comme vérifié
    const { error: updateError } = await supabaseAdmin
      .from('utilisateurs')
      .update({
        email_verified: true,
        email_verified_at: new Date().toISOString(),
      })
      .eq('id', tokenData.user_id)

    if (updateError) {
      console.error('User update error:', updateError)
      throw new Error('Erreur lors de la vérification de l\'email')
    }

    // 4. Supprimer le token utilisé
    const { error: deleteError } = await supabaseAdmin
      .from('email_verification_tokens')
      .delete()
      .eq('id', tokenData.id)

    if (deleteError) {
      console.error('Token delete error:', deleteError)
    }

    // Rediriger vers la page de connexion
    return NextResponse.redirect(new URL('/auth/login?verified=true', req.url))
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.redirect(new URL('/auth/login?verified=false', req.url))
  }
}