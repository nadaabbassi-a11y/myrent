import { PDFDocument, StandardFonts } from 'pdf-lib';
import type { Lease, LeaseSignature, LeaseOwnerSignature, Application, Listing, TenantProfile, LandlordProfile, User } from '@prisma/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface LeaseWithRelations extends Lease {
  application: Application & {
    listing: Listing & {
      landlord: LandlordProfile & {
        user: User;
      };
    };
    tenant: TenantProfile & {
      user: User;
    };
  };
  tenantSignature?: LeaseSignature | null;
  ownerSignature?: LeaseOwnerSignature | null;
}

/**
 * Generate final immutable PDF for a finalized lease
 * Contains: TAL lease content + signature page + document ID
 */
export async function generateLeasePDF(lease: LeaseWithRelations): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]); // US Letter size
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  let yPosition = 750;
  const margin = 50;
  const lineHeight = 14;
  const sectionSpacing = 20;

  // Helper to add text with word wrap
  const addText = (text: string, x: number, y: number, size: number, isBold = false) => {
    const currentFont = isBold ? boldFont : font;
    const words = text.split(' ');
    let line = '';
    let currentY = y;
    
    for (const word of words) {
      const testLine = line + word + ' ';
      const width = currentFont.widthOfTextAtSize(testLine, size);
      
      if (width > (page.getWidth() - 2 * margin - x) && line.length > 0) {
        page.drawText(line, { x, y: currentY, size, font: currentFont });
        line = word + ' ';
        currentY -= lineHeight;
      } else {
        line = testLine;
      }
    }
    if (line.length > 0) {
      page.drawText(line, { x, y: currentY, size, font: currentFont });
    }
    return currentY;
  };

  // Header
  yPosition = addText('BAIL DE LOGEMENT (TAL)', margin, yPosition, 16, true);
  yPosition -= sectionSpacing;
  addText('Ce document reprend le contenu du formulaire officiel du Tribunal administratif du logement (TAL).', margin, yPosition, 8);
  yPosition -= sectionSpacing * 2;

  // Section 1: Locateur
  yPosition = addText('SECTION 1 - LOCATEUR (PROPRIÉTAIRE)', margin, yPosition, 12, true);
  yPosition -= lineHeight;
  addText(`Nom: ${lease.application.listing.landlord.user.name || 'N/A'}`, margin, yPosition, 10);
  yPosition -= lineHeight;
  addText(`Courriel: ${lease.application.listing.landlord.user.email}`, margin, yPosition, 10);
  yPosition -= lineHeight;
  if (lease.application.listing.landlord.phone) {
    addText(`Téléphone: ${lease.application.listing.landlord.phone}`, margin, yPosition, 10);
    yPosition -= lineHeight;
  }
  yPosition -= sectionSpacing;

  // Section 2: Locataire
  yPosition = addText('SECTION 2 - LOCATAIRE', margin, yPosition, 12, true);
  yPosition -= lineHeight;
  addText(`Nom: ${lease.application.tenant.user.name || 'N/A'}`, margin, yPosition, 10);
  yPosition -= lineHeight;
  addText(`Courriel: ${lease.application.tenant.user.email}`, margin, yPosition, 10);
  yPosition -= sectionSpacing;

  // Section 3: Description du logement
  yPosition = addText('SECTION 3 - DESCRIPTION DU LOGEMENT', margin, yPosition, 12, true);
  yPosition -= lineHeight;
  if (lease.application.listing.address) {
    addText(`Adresse: ${lease.application.listing.address}`, margin, yPosition, 10);
    yPosition -= lineHeight;
  }
  addText(`Ville: ${lease.application.listing.city}`, margin, yPosition, 10);
  yPosition -= lineHeight;
  addText(`Type: ${lease.application.listing.bedrooms} chambres, ${lease.application.listing.bathrooms} salle(s) de bain`, margin, yPosition, 10);
  yPosition -= sectionSpacing;

  // Section 4: Durée et conditions
  yPosition = addText('SECTION 4 - DURÉE ET CONDITIONS DU BAIL', margin, yPosition, 12, true);
  yPosition -= lineHeight;
  addText(`Date de début: ${format(new Date(lease.startDate), 'd MMMM yyyy', { locale: fr })}`, margin, yPosition, 10);
  yPosition -= lineHeight;
  addText(`Date de fin: ${format(new Date(lease.endDate), 'd MMMM yyyy', { locale: fr })}`, margin, yPosition, 10);
  yPosition -= lineHeight;
  addText(`Loyer mensuel: ${lease.monthlyRent.toLocaleString('fr-CA')} $`, margin, yPosition, 10);
  yPosition -= lineHeight;
  addText(`Dépôt de garantie: ${lease.deposit.toLocaleString('fr-CA')} $`, margin, yPosition, 10);
  yPosition -= sectionSpacing;

  // Section 5: Conditions particulières
  if (lease.terms) {
    yPosition = addText('SECTION 5 - CONDITIONS PARTICULIÈRES', margin, yPosition, 12, true);
    yPosition -= lineHeight;
    yPosition = addText(lease.terms, margin, yPosition, 10);
    yPosition -= sectionSpacing;
  }

  // If we're running out of space, add a new page
  if (yPosition < 200) {
    const newPage = pdfDoc.addPage([612, 792]);
    yPosition = 750;
  }

  // Signature Page
  yPosition = addText('SECTION 6 - SIGNATURES', margin, yPosition, 12, true);
  yPosition -= sectionSpacing;

  // Tenant Signature
  if (lease.tenantSignature) {
    addText('Signature du locataire:', margin, yPosition, 10, true);
    yPosition -= lineHeight;
    addText(`Nom: ${lease.tenantSignature.signerName || lease.application.tenant.user.name || 'N/A'}`, margin, yPosition, 10);
    yPosition -= lineHeight;
    addText(`Courriel: ${lease.tenantSignature.signerEmail}`, margin, yPosition, 10);
    yPosition -= lineHeight;
    if (lease.tenantSignature.initials) {
      addText(`Initiales: ${lease.tenantSignature.initials}`, margin, yPosition, 10);
      yPosition -= lineHeight;
    }
    addText(`Date: ${format(new Date(lease.tenantSignature.signedAt), 'd MMMM yyyy à HH:mm', { locale: fr })}`, margin, yPosition, 10);
    yPosition -= lineHeight;
    addText(`Consentement donné: ${lease.tenantSignature.consentGiven ? 'Oui' : 'Non'}`, margin, yPosition, 10);
    yPosition -= sectionSpacing;
  }

  // Owner Signature
  if (lease.ownerSignature) {
    addText('Signature du propriétaire:', margin, yPosition, 10, true);
    yPosition -= lineHeight;
    addText(`Nom: ${lease.ownerSignature.signerName || lease.application.listing.landlord.user.name || 'N/A'}`, margin, yPosition, 10);
    yPosition -= lineHeight;
    addText(`Courriel: ${lease.ownerSignature.signerEmail}`, margin, yPosition, 10);
    yPosition -= lineHeight;
    if (lease.ownerSignature.initials) {
      addText(`Initiales: ${lease.ownerSignature.initials}`, margin, yPosition, 10);
      yPosition -= lineHeight;
    }
    addText(`Date: ${format(new Date(lease.ownerSignature.signedAt), 'd MMMM yyyy à HH:mm', { locale: fr })}`, margin, yPosition, 10);
    yPosition -= lineHeight;
    addText(`Consentement donné: ${lease.ownerSignature.consentGiven ? 'Oui' : 'Non'}`, margin, yPosition, 10);
    yPosition -= sectionSpacing;
  }

  // Document ID and Footer
  yPosition -= sectionSpacing;
  addText(`Identifiant du document: ${lease.documentId || 'N/A'}`, margin, yPosition, 10, true);
  yPosition -= lineHeight;
  if (lease.documentHash) {
    addText(`Hash du document: ${lease.documentHash.substring(0, 32)}...`, margin, yPosition, 8);
    yPosition -= lineHeight;
  }
  addText(`Version: ${lease.pdfVersion}`, margin, yPosition, 8);
  yPosition -= sectionSpacing;
  addText('Signé électroniquement via MyRent', margin, 50, 8);
  addText(`Généré le ${format(new Date(), 'd MMMM yyyy à HH:mm', { locale: fr })}`, margin, 35, 8);

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

