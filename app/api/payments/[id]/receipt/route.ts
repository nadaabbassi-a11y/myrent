import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// GET - Générer un reçu de paiement en PDF
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(request, 'LANDLORD');
    const { id: paymentId } = await params;

    // Récupérer le paiement avec toutes les informations nécessaires
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        lease: {
          include: {
            application: {
              include: {
                listing: {
                  include: {
                    landlord: {
                      include: {
                        user: true,
                      },
                    },
                  },
                },
                tenant: {
                  include: {
                    user: true,
                  },
                },
              },
            },
          },
        },
        user: true,
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Paiement introuvable' },
        { status: 404 }
      );
    }

    // Vérifier que le paiement appartient à un bail du propriétaire
    const landlordProfile = await prisma.landlordProfile.findUnique({
      where: { userId: user.id },
    });

    if (!landlordProfile) {
      return NextResponse.json(
        { error: 'Profil propriétaire introuvable' },
        { status: 404 }
      );
    }

    // Vérifier que le listing appartient au propriétaire
    if (payment.lease.application.listing.landlordId !== landlordProfile.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      );
    }

    // Vérifier que le paiement est payé
    if (payment.status !== 'paid') {
      return NextResponse.json(
        { error: 'Ce paiement n\'est pas encore payé' },
        { status: 400 }
      );
    }

    // Générer le PDF du reçu
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]); // US Letter size
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let yPosition = 750;
    const margin = 50;
    const lineHeight = 16;

    // Titre
    page.drawText('REÇU DE PAIEMENT', {
      x: margin,
      y: yPosition,
      size: 20,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    yPosition -= 40;

    // Informations du reçu
    page.drawText(`Numéro de reçu: ${payment.id}`, {
      x: margin,
      y: yPosition,
      size: 10,
      font: font,
    });
    yPosition -= lineHeight;

    if (payment.paidAt) {
      page.drawText(`Date de paiement: ${format(new Date(payment.paidAt), "d MMMM yyyy à HH:mm", { locale: fr })}`, {
        x: margin,
        y: yPosition,
        size: 10,
        font: font,
      });
      yPosition -= lineHeight;
    }

    yPosition -= 20;

    // Informations du propriétaire
    page.drawText('PROPRIÉTAIRE', {
      x: margin,
      y: yPosition,
      size: 12,
      font: boldFont,
    });
    yPosition -= lineHeight;

    page.drawText(`Nom: ${payment.lease.application.listing.landlord.user.name || 'N/A'}`, {
      x: margin,
      y: yPosition,
      size: 10,
      font: font,
    });
    yPosition -= lineHeight;

    page.drawText(`Email: ${payment.lease.application.listing.landlord.user.email}`, {
      x: margin,
      y: yPosition,
      size: 10,
      font: font,
    });
    yPosition -= lineHeight;

    if (payment.lease.application.listing.landlord.phone) {
      page.drawText(`Téléphone: ${payment.lease.application.listing.landlord.phone}`, {
        x: margin,
        y: yPosition,
        size: 10,
        font: font,
      });
      yPosition -= lineHeight;
    }

    yPosition -= 20;

    // Informations du locataire
    page.drawText('LOCATAIRE', {
      x: margin,
      y: yPosition,
      size: 12,
      font: boldFont,
    });
    yPosition -= lineHeight;

    page.drawText(`Nom: ${payment.user.name || 'N/A'}`, {
      x: margin,
      y: yPosition,
      size: 10,
      font: font,
    });
    yPosition -= lineHeight;

    page.drawText(`Email: ${payment.user.email}`, {
      x: margin,
      y: yPosition,
      size: 10,
      font: font,
    });
    yPosition -= lineHeight;

    yPosition -= 20;

    // Informations du logement
    page.drawText('LOGEMENT', {
      x: margin,
      y: yPosition,
      size: 12,
      font: boldFont,
    });
    yPosition -= lineHeight;

    page.drawText(`Adresse: ${payment.lease.application.listing.address || 'N/A'}`, {
      x: margin,
      y: yPosition,
      size: 10,
      font: font,
    });
    yPosition -= lineHeight;

    page.drawText(`Ville: ${payment.lease.application.listing.city}`, {
      x: margin,
      y: yPosition,
      size: 10,
      font: font,
    });
    yPosition -= lineHeight;

    yPosition -= 30;

    // Détails du paiement
    page.drawText('DÉTAILS DU PAIEMENT', {
      x: margin,
      y: yPosition,
      size: 12,
      font: boldFont,
    });
    yPosition -= lineHeight * 2;

    const paymentType = payment.type === 'rent' ? 'Loyer' : payment.type === 'deposit' ? 'Dépôt de garantie' : 'Frais';
    page.drawText(`Type: ${paymentType}`, {
      x: margin,
      y: yPosition,
      size: 10,
      font: font,
    });
    yPosition -= lineHeight;

    page.drawText(`Montant: ${payment.amount.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}`, {
      x: margin,
      y: yPosition,
      size: 10,
      font: font,
    });
    yPosition -= lineHeight;

    if (payment.dueDate) {
      page.drawText(`Date d'échéance: ${format(new Date(payment.dueDate), "d MMMM yyyy", { locale: fr })}`, {
        x: margin,
        y: yPosition,
        size: 10,
        font: font,
      });
      yPosition -= lineHeight;
    }

    page.drawText(`Statut: Payé`, {
      x: margin,
      y: yPosition,
      size: 10,
      font: font,
    });
    yPosition -= lineHeight * 2;

    // Signature
    page.drawText('Ce document certifie que le paiement ci-dessus a été reçu et enregistré.', {
      x: margin,
      y: yPosition,
      size: 10,
      font: font,
      color: rgb(0.3, 0.3, 0.3),
    });
    yPosition -= lineHeight * 2;

    page.drawText(`Généré le ${format(new Date(), "d MMMM yyyy à HH:mm", { locale: fr })}`, {
      x: margin,
      y: yPosition,
      size: 8,
      font: font,
      color: rgb(0.5, 0.5, 0.5),
    });

    // Générer le PDF
    const pdfBytes = await pdfDoc.save();

    // Retourner le PDF - Créer une copie propre du Uint8Array avec un nouveau ArrayBuffer
    const pdfArray = new Uint8Array(pdfBytes);

    return new NextResponse(pdfArray, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="receipt-${paymentId}.pdf"`,
      },
    });
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

    console.error('Erreur lors de la génération du reçu:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération du reçu' },
      { status: 500 }
    );
  }
}

