/**
 * TwiML Generation Endpoint for Twilio Voice Calls
 *
 * Generates TwiML (XML) for text-to-speech voice alerts
 * https://www.twilio.com/docs/voice/twiml
 */

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get('token') || 'unknown'
    const condition = searchParams.get('condition') || 'above'
    const target = searchParams.get('target') || '0'
    const current = searchParams.get('current') || '0'

    // Format prices
    const targetPrice = parseFloat(target).toLocaleString()
    const currentPrice = parseFloat(current).toLocaleString()

    // Generate voice message
    const message = `This is an alert from ORBIT. ${token} has ${
      condition === 'above' ? 'risen above' : 'fallen below'
    } your target price of $${targetPrice}. The current price is $${currentPrice}. Log into ORBIT to view details. Thank you.`

    // Generate TwiML XML
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">${message}</Say>
</Response>`

    return new NextResponse(twiml, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml',
      },
    })
  } catch (error) {
    console.error('TwiML generation error:', error)

    // Return error TwiML
    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">We're sorry, there was an error processing your alert. Please check your ORBIT dashboard.</Say>
</Response>`

    return new NextResponse(errorTwiml, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml',
      },
    })
  }
}
