import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { Role } from "@/lib/types";
import { sendApplicationInvitation, generateInvitationToken } from "@/lib/email-invitation";

// Schéma pour créer une application directement sans visite
const createDirectApplicationSchema = z.object({
  listingId: z.string().min(1, "L'ID de l'annonce est requis"),
  tenantEmail: z.string().email("Email invalide"),
  // Optionnel : si le locataire existe déjà, on peut passer son ID
  tenantId: z.string().optional(),
});

// POST - Créer une application directement sans visite (pour annonces externes)
export async function POST(request: NextRequest) {
  try {
    const landlord = await requireRole(request, Role.LANDLORD);
    
    const body = await request.json();
    const validatedData = createDirectApplicationSchema.parse(body);

    // Vérifier que l'annonce appartient au propriétaire
    const listing = await prisma.listing.findUnique({
      where: { id: validatedData.listingId },
      include: { landlord: { include: { user: true } } },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Annonce introuvable" },
        { status: 404 }
      );
    }

    if (listing.landlord.userId !== landlord.id) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    // Trouver ou créer le locataire
    let tenant;
    let user;
    
    if (validatedData.tenantId) {
      tenant = await prisma.tenantProfile.findUnique({
        where: { id: validatedData.tenantId },
        include: { user: true },
      });
      user = tenant?.user;
    } else {
      // Chercher par email
      user = await prisma.user.findUnique({
        where: { email: validatedData.tenantEmail },
        include: { tenantProfile: true },
      });

      if (user && user.role === "TENANT") {
        tenant = user.tenantProfile;
      }
    }

    // Si le locataire n'existe pas, créer une invitation
    if (!user || !tenant) {
      // Vérifier qu'il n'y a pas déjà une invitation en attente pour cet email et ce listing
      const existingInvitation = await prisma.invitation.findFirst({
        where: {
          email: validatedData.tenantEmail,
          listingId: validatedData.listingId,
          used: false,
          expiresAt: {
            gt: new Date(),
          },
        },
      });

      if (existingInvitation) {
        return NextResponse.json(
          { 
            error: "Une invitation a déjà été envoyée à cet email",
            invitationSent: true,
          },
          { status: 400 }
        );
      }

      // Créer une invitation
      const token = generateInvitationToken();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // Valide 7 jours

      const invitation = await prisma.invitation.create({
        data: {
          token,
          email: validatedData.tenantEmail,
          listingId: validatedData.listingId,
          landlordId: listing.landlord.userId,
          expiresAt,
        },
        include: {
          listing: true,
          landlord: true,
        },
      });

      // Envoyer l'email d'invitation
      await sendApplicationInvitation({
        email: validatedData.tenantEmail,
        landlordName: listing.landlord.user.name,
        listingTitle: listing.title,
        invitationToken: token,
      });

      return NextResponse.json({
        success: true,
        invitationSent: true,
        message: "Un email d'invitation a été envoyé au locataire. Il pourra créer son compte et accéder directement à la candidature.",
        invitation: {
          id: invitation.id,
          email: invitation.email,
          expiresAt: invitation.expiresAt,
        },
      });
    }

    // Le locataire existe, vérifier qu'il n'y a pas déjà une application
    const existingApplication = await prisma.application.findFirst({
      where: {
        listingId: validatedData.listingId,
        tenantId: tenant.id,
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        { 
          error: "Une candidature existe déjà pour ce locataire",
          applicationId: existingApplication.id,
        },
        { status: 400 }
      );
    }

    // Créer l'application sans appointment
    const application = await prisma.application.create({
      data: {
        listingId: validatedData.listingId,
        tenantId: tenant.id,
        landlordId: listing.landlordId,
        // appointmentId est null - application directe sans visite
        status: "DRAFT",
      },
      include: {
        tenant: { include: { user: true } },
        listing: true,
      },
    });

    return NextResponse.json({
      success: true,
      application: {
        id: application.id,
        status: application.status,
        tenant: {
          id: application.tenant.user.id,
          email: application.tenant.user.email,
          name: application.tenant.user.name,
        },
        listing: {
          id: application.listing.id,
          title: application.listing.title,
        },
        applicationUrl: `/tenant/applications/${application.id}`,
      },
    });
  } catch (error: any) {
    console.error("[Create Direct Application] Error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Erreur lors de la création de l'application" },
      { status: 500 }
    );
  }
}

