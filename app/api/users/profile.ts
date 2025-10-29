import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  try {
    // Récupère le token du header Authorization
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Récupère l'utilisateur avec le token
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Récupère les données du client
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('email', user.email)
      .single()

    if (clientError && clientError.code !== 'PGRST116') {
      throw clientError
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
      },
      client: clientData || null,
    })
  } catch (error) {
    console.error('Erreur API:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}