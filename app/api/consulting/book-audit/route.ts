import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { sendBookingConfirmationEmail, sendBookingNotificationEmail } from '@/lib/email-service'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { fullName, email, phone, company, industry, challenge, preferredDate, preferredTime } = body

    // Validation des champs requis
    if (!fullName || !email || !phone || !company || !industry || !challenge || !preferredDate || !preferredTime) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      )
    }

    // Valider le format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email invalide' },
        { status: 400 }
      )
    }

    // Vérifier que la date est dans le futur
    const bookingDate = new Date(preferredDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (bookingDate < today) {
      return NextResponse.json(
        { error: 'La date doit être dans le futur' },
        { status: 400 }
      )
    }

    // Vérifier qu'il n'y a pas déjà un booking à cette date/heure
    const { data: existingBooking, error: checkError } = await supabase
      .from('consulting_bookings')
      .select('id')
      .eq('preferred_date', preferredDate)
      .eq('preferred_time', preferredTime)
      .in('status', ['pending', 'confirmed'])
      .limit(1)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing booking:', checkError)
      return NextResponse.json(
        { error: 'Erreur lors de la vérification de disponibilité' },
        { status: 500 }
      )
    }

    if (existingBooking) {
      return NextResponse.json(
        { error: 'Ce créneau est déjà réservé. Veuillez choisir un autre horaire.' },
        { status: 409 }
      )
    }

    // Créer le booking
    const { data: booking, error: insertError } = await supabase
      .from('consulting_bookings')
      .insert({
        full_name: fullName,
        email: email,
        phone: phone,
        company: company,
        industry: industry,
        challenge: challenge,
        preferred_date: preferredDate,
        preferred_time: preferredTime,
        status: 'pending',
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating booking:', insertError)
      return NextResponse.json(
        { error: 'Erreur lors de la création de la réservation' },
        { status: 500 }
      )
    }

    // Envoyer les emails de confirmation
    try {
      // Email de confirmation au client
      await sendBookingConfirmationEmail(
        email,
        fullName,
        company,
        preferredDate,
        preferredTime,
        challenge
      )

      // Email de notification à l'admin
      await sendBookingNotificationEmail(
        fullName,
        email,
        phone,
        company,
        industry,
        challenge,
        preferredDate,
        preferredTime
      )

      console.log('Confirmation and notification emails sent successfully')
    } catch (emailError) {
      console.error('Error sending emails:', emailError)
      // On ne bloque pas la réservation si les emails échouent
      // Les emails sont importants mais pas critiques
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Réservation créée avec succès',
        booking: booking,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Booking error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// GET - Récupérer les créneaux disponibles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    if (!date) {
      return NextResponse.json(
        { error: 'Date requise' },
        { status: 400 }
      )
    }

    // Heures disponibles par défaut
    const availableHours = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00']

    // Récupérer les bookings existants pour cette date
    const { data: bookings, error } = await supabase
      .from('consulting_bookings')
      .select('preferred_time')
      .eq('preferred_date', date)
      .in('status', ['pending', 'confirmed'])

    if (error) {
      console.error('Error fetching bookings:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des créneaux' },
        { status: 500 }
      )
    }

    // Filtrer les heures réservées
    const reservedTimes = bookings?.map(b => b.preferred_time) || []
    const availableSlots = availableHours.filter(hour => !reservedTimes.includes(hour))

    return NextResponse.json(
      {
        date: date,
        availableSlots: availableSlots,
        reservedSlots: reservedTimes,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Get slots error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}