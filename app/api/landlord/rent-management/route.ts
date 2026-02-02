import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Récupérer les baux finalisés avec les paiements pour la gestion de loyer
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

    // Récupérer tous les baux finalisés liés aux listings du propriétaire
    const leases = await prisma.lease.findMany({
      where: {
        status: 'FINALIZED',
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
            messageThread: {
              select: {
                id: true,
              },
            },
          },
        },
        payments: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        finalizedAt: 'desc',
      },
    });

    // Calculer la balance pour chaque bail
    const formattedLeases = leases.map((lease) => {
      // Calculer le total payé
      const totalPaid = lease.payments
        .filter((p) => p.status === 'paid')
        .reduce((sum, p) => sum + p.amount, 0);

      // Calculer le total dû (dépôt + loyers dus jusqu'à maintenant)
      const now = new Date();
      const startDate = new Date(lease.startDate);
      const endDate = new Date(lease.endDate);
      
      // Calculer le nombre de mois depuis le début du bail
      let monthsDue = 0;
      if (now >= startDate) {
        const monthsDiff = (now.getFullYear() - startDate.getFullYear()) * 12 + 
                          (now.getMonth() - startDate.getMonth());
        monthsDue = Math.max(0, Math.min(monthsDiff + 1, 
          Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30))));
      }
      
      const totalRentDue = monthsDue * lease.monthlyRent;
      const totalDue = lease.deposit + totalRentDue;
      const balance = totalDue - totalPaid;

      return {
        id: lease.id,
        startDate: lease.startDate.toISOString(),
        endDate: lease.endDate.toISOString(),
        monthlyRent: lease.monthlyRent,
        deposit: lease.deposit,
        status: lease.status,
        finalizedAt: lease.finalizedAt?.toISOString() || null,
        application: {
          listing: {
            id: lease.application.listing.id,
            title: lease.application.listing.title,
            address: lease.application.listing.address,
            city: lease.application.listing.city,
            area: lease.application.listing.area,
          },
          tenant: {
            id: lease.application.tenant.id,
            user: {
              id: lease.application.tenant.user.id,
              name: lease.application.tenant.user.name,
              email: lease.application.tenant.user.email,
            },
            phone: lease.application.tenant.phone,
          },
          messageThreadId: lease.application.messageThread?.id || null,
        },
        payments: lease.payments.map((payment) => ({
          id: payment.id,
          amount: payment.amount,
          type: payment.type,
          status: payment.status,
          dueDate: payment.dueDate?.toISOString() || null,
          paidAt: payment.paidAt?.toISOString() || null,
          createdAt: payment.createdAt.toISOString(),
        })),
        balance: {
          totalDue,
          totalPaid,
          balance,
          monthsDue,
        },
      };
    });

    return NextResponse.json(
      { leases: formattedLeases },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      const statusCode = (error as Error & { statusCode: number }).statusCode;
      if (statusCode === 401 || statusCode === 403) {
        return NextResponse.json(
          { error: 'Non autorisé' },
          { status: statusCode }
        );
      }
    }

    console.error('Erreur lors de la récupération des baux pour la gestion de loyer:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données' },
      { status: 500 }
    );
  }
}

