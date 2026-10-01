import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@/lib/types";
import { buildPipeline } from "@/lib/location-pipeline";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireRole(request, Role.LANDLORD);
    const profile = await prisma.landlordProfile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });
    }

    const listing = await prisma.listing.findFirst({
      where: { id: params.id, landlordId: profile.id },
      include: {
        applications: {
          orderBy: { createdAt: "desc" },
          include: {
            steps: true,
            consents: true,
            creditCheck: true,
            answers: true,
            lease: {
              include: {
                payments: { orderBy: { dueDate: "desc" } },
                tenantSignature: true,
                ownerSignature: true,
              },
            },
            messageThread: {
              include: {
                messages: {
                  orderBy: { createdAt: "desc" },
                  take: 8,
                  include: { sender: { select: { name: true, email: true, role: true } } },
                },
              },
            },
            tenant: { include: { user: { select: { id: true, name: true, email: true } } } },
          },
        },
        invitations: {
          where: { used: false, expiresAt: { gt: new Date() } },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!listing) {
      return NextResponse.json({ error: "Logement introuvable" }, { status: 404 });
    }

    const application = listing.applications[0] ?? null;

    return NextResponse.json({
      location: {
        id: listing.id,
        title: listing.title,
        address: listing.address,
        city: listing.city,
        postalCode: listing.postalCode,
        rent: listing.price,
        bedrooms: listing.bedrooms,
        bathrooms: listing.bathrooms,
        deposit: listing.deposit,
        pipeline: buildPipeline({
          application: application
            ? {
                ...application,
                payments: application.lease?.payments ?? [],
              }
            : null,
        }),
        invitations: listing.invitations.map((inv) => ({
          email: inv.email,
          token: inv.token,
          expiresAt: inv.expiresAt,
        })),
        application: application
          ? {
              id: application.id,
              status: application.status,
              tenant: application.tenant.user,
              steps: application.steps,
              consents: application.consents,
              creditCheck: application.creditCheck,
              lease: application.lease,
              messages: application.messageThread?.messages ?? [],
              threadId: application.messageThread?.id ?? null,
            }
          : null,
      },
    });
  } catch (error) {
    if (error instanceof Error && "statusCode" in error) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    console.error("[location GET]", error);
    return NextResponse.json({ error: "Impossible de charger la location" }, { status: 500 });
  }
}
