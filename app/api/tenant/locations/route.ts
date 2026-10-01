import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@/lib/types";
import { buildPipeline } from "@/lib/location-pipeline";

export async function GET(request: NextRequest) {
  try {
    const user = await requireRole(request, Role.TENANT);
    const profile = await prisma.tenantProfile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return NextResponse.json({ locations: [] });
    }

    const applications = await prisma.application.findMany({
      where: { tenantId: profile.id },
      orderBy: { createdAt: "desc" },
      include: {
        listing: true,
        steps: true,
        consents: true,
        creditCheck: true,
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
              include: { sender: { select: { name: true, role: true } } },
            },
          },
        },
      },
    });

    return NextResponse.json({
      locations: applications.map((application) => ({
        id: application.listing.id,
        applicationId: application.id,
        title: application.listing.title,
        address: application.listing.address,
        city: application.listing.city,
        rent: application.listing.price,
        status: application.status,
        pipeline: buildPipeline({
          application: {
            ...application,
            payments: application.lease?.payments ?? [],
          },
        }),
        creditCheck: application.creditCheck,
        lease: application.lease,
        payments: application.lease?.payments ?? [],
        messages: application.messageThread?.messages ?? [],
        threadId: application.messageThread?.id ?? null,
        firstIncompleteStep: application.steps.find((step) => !step.isComplete)?.stepKey ?? "identity",
      })),
    });
  } catch (error) {
    if (error instanceof Error && "statusCode" in error) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    console.error("[tenant locations GET]", error);
    return NextResponse.json({ error: "Impossible de charger vos démarches" }, { status: 500 });
  }
}
