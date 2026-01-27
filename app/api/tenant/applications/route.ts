import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Role } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const user = await requireRole(request, Role.TENANT)

    // Trouver le profil tenant
    const tenantProfile = await prisma.tenantProfile.findUnique({
      where: { userId: user.id },
    })

    if (!tenantProfile) {
      return NextResponse.json(
        { error: 'Profil non trouvé' },
        { status: 404 }
      )
    }

    // Récupérer toutes les candidatures avec les détails du listing
    const applications = await prisma.application.findMany({
      where: { tenantId: tenantProfile.id },
      include: {
        listing: {
          include: {
            landlord: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        lease: true,
        messageThread: {
          include: {
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
      orderBy: { appliedAt: 'desc' },
    })

    return NextResponse.json({ applications })
  } catch (error) {
    console.error('Erreur lors de la récupération des candidatures:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}


