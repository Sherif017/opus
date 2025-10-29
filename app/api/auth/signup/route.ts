import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// ✅ Client admin (avec service role key)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Client auth normal (pour signUp)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { email, password, nomEntreprise, nomArtisan, prenomArtisan } =
      await req.json()

    // Validation basique
    if (!email || !password || !nomEntreprise || !nomArtisan) {
      return NextResponse.json(
        { error: 'Tous les champs requis sont manquants' },
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

    // Validation mot de passe
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 8 caractères' },
        { status: 400 }
      )
    }

    // ✅ VÉRIFIER SI L'EMAIL EXISTE DÉJÀ - utiliser supabaseAdmin
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('utilisateurs')
      .select('email')
      .eq('email', email)
      .single()

    if (existingUser) {
      // L'email existe déjà
      return NextResponse.json(
        { error: 'Cet email est déjà lié à un compte' },
        { status: 400 }
      )
    }

    // 1. Créer utilisateur Supabase Auth avec confirmation d'email
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?email=${encodeURIComponent(email)}`,
      },
    })

    if (authError) {
      // Détecter si c'est une erreur d'email déjà existant dans Auth
      if (authError.message.includes('already registered') || authError.message.includes('User already exists')) {
        return NextResponse.json(
          { error: 'Cet email est déjà lié à un compte' },
          { status: 400 }
        )
      }
      throw new Error(authError.message)
    }

    if (!authData.user?.id) {
      throw new Error('Erreur lors de la création de l\'utilisateur')
    }

    // 2. Créer l'entreprise - utiliser supabaseAdmin
    const { data: company, error: companyError } = await supabaseAdmin
      .from('entreprises')
      .insert([
        {
          nom: nomEntreprise,
          slug: nomEntreprise.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
        },
      ])
      .select()
      .single()

    if (companyError) {
      console.error('Company creation error:', companyError)
      throw companyError
    }

    // 3. Ajouter l'utilisateur dans la table utilisateurs - utiliser supabaseAdmin
    const { error: userError } = await supabaseAdmin
      .from('utilisateurs')
      .insert([
        {
          id: authData.user.id,
          entreprise_id: company.id,
          email: email,
          nom: nomArtisan,
          prenom: prenomArtisan || '',
          created_at: new Date().toISOString(),
        },
      ])

    if (userError) {
      console.error('User creation error:', userError)
      throw userError
    }

    return NextResponse.json(
      {
        success: true,
        user: authData.user,
        message: 'Un email de confirmation a été envoyé. Veuillez vérifier votre boîte de réception.',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 400 }
    )
  }
}