import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@/lib/types";
import { z } from "zod";

const paymentSchema = z.object({
  amount: z.number().positive(),
  type: z.enum(["rent", "deposit", "fee"]).optional().default("rent"),
  markPaid: z.boolean().optional().default(true),
  paymentId: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireRole(request, Role.LANDLORD);
    const body = paymentSchema.parse(await request.json());

    const listing = await prisma.listing.findFirst({
      where: { id: params.id, landlord: { userId: user.id } },
      include: {
        applications: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: { lease: true, tenant: true },
        },
      },
    });

    const application = listing?.applications[0];
    if (!listing || !application?.lease) {
      return NextResponse.json({ error: "Aucun bail actif pour ce logement" }, { status: 400 });
    }

    if (body.paymentId) {
      const payment = await prisma.payment.update({
        where: { id: body.paymentId },
        data: body.markPaid
          ? { status: "paid", paidAt: new Date() }
          : { status: "pending", paidAt: null },
      });
      return NextResponse.json({ payment });
    }

    const payment = await prisma.payment.create({
      data: {
        leaseId: application.lease.id,
        userId: application.tenant.userId,
        amount: body.amount,
        type: body.type,
        status: body.markPaid ? "paid" : "pending",
        dueDate: new Date(),
        paidAt: body.markPaid ? new Date() : null,
      },
    });

    return NextResponse.json({ payment });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message || "Données invalides" }, { status: 400 });
    }
    if (error instanceof Error && "statusCode" in error) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    console.error("[payments POST]", error);
    return NextResponse.json({ error: "Impossible d'enregistrer le paiement" }, { status: 500 });
  }
}
