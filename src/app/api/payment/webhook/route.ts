import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Simple mock implementation for now
const mollie = {
  payments: {
    get: async (id: string) => ({
      status: 'paid', // Mock as successful for demo
      metadata: { appointmentId: 'mock_id' }
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json(
        { error: 'Service unavailable - configuration missing' },
        { status: 503 }
      )
    }
    const body = await request.text()
    const { id: paymentId } = JSON.parse(body)

    if (!paymentId) {
      return NextResponse.json({ error: 'Payment ID missing' }, { status: 400 })
    }

    // Get payment from Mollie
    const payment = await mollie.payments.get(paymentId)
    const appointmentId = payment.metadata?.appointmentId

    if (!appointmentId) {
      console.error('No appointment ID in payment metadata')
      return NextResponse.json({ error: 'Invalid metadata' }, { status: 400 })
    }

    // Update appointment payment status based on Mollie payment status
    let paymentStatus: 'pending' | 'paid' | 'failed' = 'pending'
    let appointmentStatus: 'pending' | 'confirmed' | 'cancelled' | 'completed' = 'pending'

    switch (payment.status) {
      case 'paid':
        paymentStatus = 'paid'
        appointmentStatus = 'confirmed'
        break
      case 'failed':
      case 'canceled':
      case 'expired':
        paymentStatus = 'failed'
        appointmentStatus = 'cancelled'
        break
      default:
        paymentStatus = 'pending'
        appointmentStatus = 'pending'
    }

    // Update appointment in Supabase
    const { error } = await supabase
      .from('appointments')
      .update({
        payment_status: paymentStatus,
        status: appointmentStatus,
        payment_id: paymentId
      })
      .eq('id', appointmentId)

    if (error) {
      console.error('Database update error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}