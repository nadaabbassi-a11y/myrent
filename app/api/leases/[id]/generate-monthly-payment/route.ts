import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST - Générer un paiement mensuel pour un bail
// Peut être appelé manuellement ou via un cron job
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Optionnel : vérifier l'authentification (peut être appelé par un cron job)
    // const user = await requireRole(request, 'LANDLORD');
    const { id: leaseId } = await params;

    // Récupérer le bail
    const lease = await prisma.lease.findUnique({
      where: { id: leaseId },
      include: {
        application: {
          include: {
            tenant: {
              include: {
                user: true,
              },
            },
          },
        },
        payments: {
          where: {
            type: 'rent',
            status: {
              in: ['pending', 'paid'],
            },
          },
          orderBy: {
            dueDate: 'desc',
          },
          take: 1,
        },
      },
    });

    if (!lease) {
      return NextResponse.json(
        { error: 'Bail introuvable' },
        { status: 404 }
      );
    }

    // Vérifier que le bail est finalisé
    if (lease.status !== 'FINALIZED') {
      return NextResponse.json(
        { error: 'Le bail doit être finalisé pour générer des paiements' },
        { status: 400 }
      );
    }

    // Calculer la date d'échéance du prochain paiement
    const now = new Date();
    const startDate = new Date(lease.startDate);
    const endDate = new Date(lease.endDate);

    // Si le bail n'a pas encore commencé, ne pas créer de paiement
    if (now < startDate) {
      return NextResponse.json(
        { error: 'Le bail n\'a pas encore commencé' },
        { status: 400 }
      );
    }

    // Si le bail est terminé, ne pas créer de paiement
    if (now > endDate) {
      return NextResponse.json(
        { error: 'Le bail est terminé' },
        { status: 400 }
      );
    }

    // Calculer le mois pour lequel créer le paiement
    let paymentMonth: Date;
    if (lease.payments.length === 0) {
      // Premier paiement : premier du mois suivant le début
      paymentMonth = new Date(startDate);
      paymentMonth.setMonth(paymentMonth.getMonth() + 1);
      paymentMonth.setDate(1);
    } else {
      // Paiement suivant : mois suivant le dernier paiement
      const lastPayment = lease.payments[0];
      if (lastPayment.dueDate) {
        paymentMonth = new Date(lastPayment.dueDate);
        paymentMonth.setMonth(paymentMonth.getMonth() + 1);
      } else {
        // Fallback : calculer à partir de la date de début
        const monthsSinceStart = (now.getFullYear() - startDate.getFullYear()) * 12 +
                                 (now.getMonth() - startDate.getMonth());
        paymentMonth = new Date(startDate);
        paymentMonth.setMonth(paymentMonth.getMonth() + monthsSinceStart + 1);
        paymentMonth.setDate(1);
      }
    }

    // Vérifier que le paiement n'existe pas déjà pour ce mois
    const existingPayment = await prisma.payment.findFirst({
      where: {
        leaseId: lease.id,
        type: 'rent',
        dueDate: {
          gte: new Date(paymentMonth.getFullYear(), paymentMonth.getMonth(), 1),
          lt: new Date(paymentMonth.getFullYear(), paymentMonth.getMonth() + 1, 1),
        },
      },
    });

    if (existingPayment) {
      return NextResponse.json(
        { 
          message: 'Un paiement existe déjà pour ce mois',
          payment: existingPayment 
        },
        { status: 200 }
      );
    }

    // Vérifier que le mois du paiement n'est pas après la fin du bail
    if (paymentMonth > endDate) {
      return NextResponse.json(
        { error: 'Le bail se termine avant ce mois' },
        { status: 400 }
      );
    }

    // Créer le paiement mensuel
    const payment = await prisma.payment.create({
      data: {
        leaseId: lease.id,
        userId: lease.application.tenant.user.id,
        amount: lease.monthlyRent,
        type: 'rent',
        status: 'pending',
        dueDate: paymentMonth,
      },
    });

    return NextResponse.json(
      { 
        message: 'Paiement mensuel créé avec succès',
        payment 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de la génération du paiement mensuel:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération du paiement mensuel' },
      { status: 500 }
    );
  }
}

