import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Récupérer tous les bails du propriétaire
export async function GET(request: NextRequest) {
  try {
    const user = await requireRole(request, 'LANDLORD');

    // Récupérer le profil propriétaire
    const landlordProfile = await prisma.landlordProfile.findUnique({
      where: { userId: user.id },
    });

    if (!landlordProfile) {
      return NextResponse.json(
        { error: 'Profil propriétaire introuvable' },
        { status: 404 }
      );
    }

    // Récupérer tous les bails liés aux candidatures acceptées des listings du propriétaire
    const leases = await prisma.lease.findMany({
      where: {
        application: {
          listing: {
            landlordId: landlordProfile.id,
          },
        },
      },
      include: {
        application: {
          include: {
            listing: {
              select: {
                id: true,
                title: true,
                address: true,
                city: true,
                area: true,
              },
            },
            tenant: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        tenantSignature: true,
        ownerSignature: true,
        payments: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 5, // Derniers 5 paiements
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Formater les données pour le frontend
    const formattedLeases = leases.map((lease) => ({
      id: lease.id,
      startDate: lease.startDate,
      endDate: lease.endDate,
      monthlyRent: lease.monthlyRent,
      deposit: lease.deposit,
      status: lease.status,
      signedAt: lease.signedAt, // Déprécié mais gardé pour compatibilité
      tenantSignature: lease.tenantSignature ? {
        id: lease.tenantSignature.id,
        signedAt: lease.tenantSignature.signedAt,
        signerName: lease.tenantSignature.signerName,
      } : null,
      ownerSignature: lease.ownerSignature ? {
        id: lease.ownerSignature.id,
        signedAt: lease.ownerSignature.signedAt,
        signerName: lease.ownerSignature.signerName,
      } : null,
      stripeSubscriptionId: lease.stripeSubscriptionId,
      application: {
        listing: {
          id: lease.application.listing.id,
          title: lease.application.listing.title,
          address: lease.application.listing.address,
          city: lease.application.listing.city,
          area: lease.application.listing.area,
        },
        tenant: {
          user: {
            id: lease.application.tenant.user.id,
            name: lease.application.tenant.user.name,
            email: lease.application.tenant.user.email,
          },
        },
      },
      payments: lease.payments.map((payment) => ({
        id: payment.id,
        amount: payment.amount,
        type: payment.type,
        status: payment.status,
        paidAt: payment.paidAt,
        dueDate: payment.dueDate,
        createdAt: payment.createdAt,
      })),
    }));

    return NextResponse.json(
      { leases: formattedLeases },
      { status: 200 }
    );
  } catch (error) {
    // Handle auth errors
    if (error instanceof Error && 'statusCode' in error) {
      const statusCode = (error as Error & { statusCode: number }).statusCode;
      if (statusCode === 401 || statusCode === 403) {
        return NextResponse.json(
          { error: 'Non autorisé' },
          { status: statusCode }
        );
      }
    }

    console.error('Erreur lors de la récupération des bails:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des bails' },
      { status: 500 }
    );
  }
}

