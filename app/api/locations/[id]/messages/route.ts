import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const messageSchema = z.object({
  content: z.string().min(1, "Le message ne peut pas être vide"),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request);
    const { content } = messageSchema.parse(await request.json());

    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
      include: {
        landlord: true,
        applications: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: { tenant: true, messageThread: true },
        },
      },
    });

    const application = listing?.applications[0];
    if (!listing || !application) {
      return NextResponse.json({ error: "Aucune démarche liée à ce logement" }, { status: 400 });
    }

    const isLandlord = listing.landlord.userId === user.id;
    const isTenant = application.tenant.userId === user.id;
    if (!isLandlord && !isTenant) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const thread =
      application.messageThread ??
      (await prisma.messageThread.create({
        data: {
          applicationId: application.id,
          listingId: listing.id,
          tenantId: application.tenantId,
        },
      }));

    const message = await prisma.message.create({
      data: {
        threadId: thread.id,
        senderId: user.id,
        content,
      },
      include: {
        sender: { select: { name: true, email: true, role: true } },
      },
    });

    return NextResponse.json({ message });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message || "Message invalide" }, { status: 400 });
    }
    if (error instanceof Error && "statusCode" in error) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    console.error("[location messages POST]", error);
    return NextResponse.json({ error: "Impossible d'envoyer le message" }, { status: 500 });
  }
}
