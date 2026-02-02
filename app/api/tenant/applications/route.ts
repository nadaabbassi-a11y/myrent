import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = await requireRole(request, 'TENANT')

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
        appointment: {
          include: {
            slot: true,
          },
        },
        messageThread: {
          include: {
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Formater les données pour éviter les problèmes de sérialisation
    const formattedApplications = applications.map((app) => {
      try {
        return {
          id: app.id,
          status: app.status,
          createdAt: app.createdAt.toISOString(),
          listing: {
            id: app.listing.id,
            title: app.listing.title,
            price: app.listing.price,
            city: app.listing.city,
            area: app.listing.area,
            bedrooms: app.listing.bedrooms,
            bathrooms: app.listing.bathrooms,
            landlord: app.listing.landlord
              ? {
                  user: app.listing.landlord.user
                    ? {
                        name: app.listing.landlord.user.name,
                        email: app.listing.landlord.user.email,
                      }
                    : null,
                }
              : null,
          },
          lease: app.lease
            ? {
                id: app.lease.id,
                status: app.lease.status,
                signedAt: app.lease.signedAt ? app.lease.signedAt.toISOString() : null,
                finalizedAt: app.lease.finalizedAt ? app.lease.finalizedAt.toISOString() : null,
              }
            : null,
          appointment: app.appointment
            ? {
                id: app.appointment.id,
                status: app.appointment.status,
                slot: app.appointment.slot
                  ? {
                      startAt: app.appointment.slot.startAt.toISOString(),
                      endAt: app.appointment.slot.endAt.toISOString(),
                    }
                  : null,
              }
            : null,
          messageThread: app.messageThread
            ? {
                id: app.messageThread.id,
                messages: app.messageThread.messages.map((msg) => ({
                  id: msg.id,
                  content: msg.content,
                  createdAt: msg.createdAt.toISOString(),
                })),
              }
            : null,
        }
      } catch (err) {
        console.error('Erreur lors du formatage de l\'application:', app.id, err)
        throw err
      }
    })

    return NextResponse.json({ applications: formattedApplications })
  } catch (error) {
    console.error('Erreur lors de la récupération des candidatures:', error)
    if (error instanceof Error) {
      console.error('Message d\'erreur:', error.message)
      console.error('Stack:', error.stack)
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}


