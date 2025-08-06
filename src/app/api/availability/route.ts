import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { format, parseISO } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    if (!date) {
      return NextResponse.json({ error: 'Date parameter is required' }, { status: 400 })
    }

    // Get availability for the specific date
    const { data: availability, error: availabilityError } = await supabase
      .from('availability')
      .select('*')
      .eq('date', date)
      .eq('is_available', true)

    if (availabilityError) throw availabilityError

    // Get existing appointments for the date
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('appointment_date, services(duration)')
      .gte('appointment_date', `${date} 00:00:00`)
      .lt('appointment_date', `${date} 23:59:59`)
      .neq('status', 'cancelled')

    if (appointmentsError) throw appointmentsError

    // Generate available time slots
    const availableSlots: string[] = []

    for (const avail of availability) {
      const startTime = avail.start_time // e.g., "09:00"
      const endTime = avail.end_time     // e.g., "18:00"

      // Convert to minutes for easier calculation
      const startMinutes = timeToMinutes(startTime)
      const endMinutes = timeToMinutes(endTime)

      // Generate 30-minute slots
      for (let minutes = startMinutes; minutes < endMinutes; minutes += 30) {
        const slotTime = minutesToTime(minutes)
        
        // Check if this slot conflicts with existing appointments
        const hasConflict = appointments.some(apt => {
          const aptTime = format(parseISO(apt.appointment_date), 'HH:mm')
          return aptTime === slotTime
        })

        if (!hasConflict) {
          availableSlots.push(slotTime)
        }
      }
    }

    // Remove duplicates and sort
    const uniqueSlots = [...new Set(availableSlots)].sort()

    return NextResponse.json({ availableSlots: uniqueSlots })

  } catch (error) {
    console.error('Availability API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch availability' },
      { status: 500 }
    )
  }
}

// Helper functions
function timeToMinutes(timeString: string): number {
  const [hours, minutes] = timeString.split(':').map(Number)
  return hours * 60 + minutes
}

function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}