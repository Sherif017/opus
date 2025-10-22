import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { email, password, nomEntreprise, nomArtisan, prenomArtisan } =
      await req.json()

    // 1. Créer utilisateur Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) throw new Error(authError.message)
    if (!authData.user?.id) throw new Error('Erreur création utilisateur')

    // 2. Créer l'entreprise
    const { data: company, error: companyError } = await supabase
      .from('entreprises')
      .insert([
        {
          nom: nomEntreprise,
          slug: nomEntreprise.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
        },
      ])
      .select()
      .single()

    if (companyError) throw companyError

    // 3. Ajouter l'utilisateur
    const { error: userError } = await supabase
      .from('utilisateurs')
      .insert([
        {
          id: authData.user.id,
          entreprise_id: company.id,
          role: 'admin',
          nom: nomArtisan,
          prenom: prenomArtisan,
        },
      ])

    if (userError) throw userError

    return NextResponse.json(
      { success: true, user: authData.user },
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