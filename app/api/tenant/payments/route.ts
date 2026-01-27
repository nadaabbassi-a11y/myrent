import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Role } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const user = await requireRole(request, Role.TENANT)

    // Récupérer tous les paiements de l'utilisateur avec les détails du bail
    const payments = await prisma.payment.findMany({
      where: { userId: user.id },
      include: {
        lease: {
          include: {
            application: {
              include: {
                listing: {
                  select: {
                    id: true,
                    title: true,
                    city: true,
                    area: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ payments })
  } catch (error) {
    console.error('Erreur lors de la récupération des paiements:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}


