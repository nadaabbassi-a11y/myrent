import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const reviewSchema = z.object({
  status: z.enum(["IN_REVIEW", "CLEAR", "CONCERN", "FAILED"]),
  bureau: z.string().optional(),
  score: z.number().int().min(300).max(900).optional(),
  resultSummary: z.string().optional(),
  notes: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request);
    if (user.role !== "LANDLORD") {
      return NextResponse.json({ error: "Réservé au propriétaire" }, { status: 403 });
    }

    const application = await prisma.application.findUnique({
      where: { id: params.id },
      include: { listing: { include: { landlord: true } }, creditCheck: true },
    });

    if (!application || application.listing.landlord.userId !== user.id) {
      return NextResponse.json({ error: "Candidature introuvable" }, { status: 404 });
    }

    const body = reviewSchema.parse(await request.json());
    const reviewed = ["CLEAR", "CONCERN", "FAILED"].includes(body.status);

    const creditCheck = await prisma.creditCheck.upsert({
      where: { applicationId: application.id },
      create: {
        applicationId: application.id,
        status: body.status,
        bureau: body.bureau,
        score: body.score,
        resultSummary: body.resultSummary,
        notes: body.notes,
        reviewedAt: reviewed ? new Date() : null,
      },
      update: {
        status: body.status,
        bureau: body.bureau,
        score: body.score,
        resultSummary: body.resultSummary,
        notes: body.notes,
        reviewedAt: reviewed ? new Date() : application.creditCheck?.reviewedAt,
      },
    });

    return NextResponse.json({ creditCheck });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message || "Données invalides" }, { status: 400 });
    }
    if (error instanceof Error && "statusCode" in error) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    console.error("[credit-check PATCH]", error);
    return NextResponse.json({ error: "Impossible d'enregistrer l'enquête" }, { status: 500 });
  }
}
