import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@/lib/types";
import { z } from "zod";
import { generateInvitationToken } from "@/lib/email-invitation";

const inviteSchema = z.object({
  email: z.string().email("Email invalide"),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const landlord = await requireRole(request, Role.LANDLORD);
    const { email } = inviteSchema.parse(await request.json());

    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
      include: { landlord: { include: { user: true } } },
    });

    if (!listing || listing.landlord.userId !== landlord.id) {
      return NextResponse.json({ error: "Logement introuvable" }, { status: 404 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: { tenantProfile: true },
    });

    if (existingUser?.role === "TENANT" && existingUser.tenantProfile) {
      const existingApplication = await prisma.application.findFirst({
        where: {
          listingId: listing.id,
          tenantId: existingUser.tenantProfile.id,
        },
      });

      if (existingApplication) {
        return NextResponse.json({
          applicationId: existingApplication.id,
          alreadyExists: true,
        });
      }

      const application = await prisma.application.create({
        data: {
          listingId: listing.id,
          tenantId: existingUser.tenantProfile.id,
          landlordId: listing.landlordId,
          status: "DRAFT",
          creditCheck: { create: { status: "PENDING_CONSENT" } },
        },
      });

      return NextResponse.json({
        applicationId: application.id,
        tenantExists: true,
      });
    }

    const token = generateInvitationToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14);

    const invitation = await prisma.invitation.create({
      data: {
        token,
        email,
        listingId: listing.id,
        landlordId: listing.landlord.userId,
        expiresAt,
      },
    });

    return NextResponse.json({
      invitationSent: true,
      inviteUrl: `/invite/${invitation.token}`,
      email,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message || "Email invalide" }, { status: 400 });
    }
    if (error instanceof Error && "statusCode" in error) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    console.error("[invite POST]", error);
    return NextResponse.json({ error: "Impossible d'inviter le locataire" }, { status: 500 });
  }
}
