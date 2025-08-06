import { NextRequest, NextResponse } from 'next/server'

// Simple mock implementation for now
const mollie = {
  payments: {
    create: async (data: any) => ({
      id: 'test_payment_' + Math.random().toString(36).substr(2, 9),
      getCheckoutUrl: () => 'https://checkout.mollie.com/test'
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { appointmentId, amount, description, redirectUrl } = await request.json()

    // Simple validation
    if (!appointmentId || !amount || !description) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      )
    }

    // Create Mollie payment
    const payment = await mollie.payments.create({
      amount: {
        currency: 'EUR',
        value: amount.toFixed(2)
      },
      description,
      redirectUrl: redirectUrl || `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
      webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/webhook`,
      metadata: {
        appointmentId
      }
    })

    return NextResponse.json({
      paymentId: payment.id,
      checkoutUrl: payment.getCheckoutUrl()
    })

  } catch (error) {
    console.error('Payment creation error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du paiement' },
      { status: 500 }
    )
  }
}