import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: CORS_HEADERS })
}

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    const { email, password, nomEntreprise, nomArtisan, prenomArtisan } = await req.json()

    if (!email || !password || !nomEntreprise || !nomArtisan) {
      return NextResponse.json(
        { error: 'Tous les champs requis sont manquants' },
        { status: 400, headers: CORS_HEADERS }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email invalide' },
        { status: 400, headers: CORS_HEADERS }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 8 caractères' },
        { status: 400, headers: CORS_HEADERS }
      )
    }

    const { data: existingUser } = await supabaseAdmin
      .from('utilisateurs')
      .select('email')
      .eq('email', email)
      .maybeSingle()

    if (existingUser) {
      return NextResponse.json(
        { error: 'Cet email est déjà lié à un compte' },
        { status: 400, headers: CORS_HEADERS }
      )
    }

    // 1. Créer l'utilisateur dans Supabase Auth
    // Supabase enverra automatiquement l'email de confirmation
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/login`,
      },
    })

    if (authError) {
      if (authError.message.includes('already registered') || authError.message.includes('User already exists')) {
        return NextResponse.json(
          { error: 'Cet email est déjà lié à un compte' },
          { status: 400, headers: CORS_HEADERS }
        )
      }
      throw new Error(authError.message)
    }

    if (!authData.user?.id) {
      throw new Error('Erreur lors de la création de l\'utilisateur')
    }

    // 2. Créer l'entreprise
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

    if (!company || !company.id) {
      throw new Error('Erreur lors de la création de l\'entreprise')
    }

    // 3. Créer l'utilisateur dans la table utilisateurs
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
        message: 'Inscription réussie! Un email de confirmation a été envoyé.',
      },
      { status: 201, headers: CORS_HEADERS }
    )
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 400, headers: CORS_HEADERS }
    )
  }
}