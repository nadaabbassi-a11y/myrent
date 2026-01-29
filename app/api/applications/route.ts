import { NextRequest, NextResponse } from 'next/server'

// Legacy applications endpoint (listing-based)
// This flow has been replaced by the new multi-step wizard
// unlocked via confirmed appointments.

export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      error:
        "Ce mode de candidature n'est plus disponible. Veuillez passer par 'Mes visites' puis cliquer sur Postuler après une visite confirmée.",
    },
    { status: 400 }
  )
}

export async function GET() {
  return NextResponse.json(
    {
      error: 'Endpoint de candidatures legacy. Utilisez les nouvelles routes /api/applications/start et /me/appointments.',
    },
    { status: 410 }
  )
}

