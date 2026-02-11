import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// GET - Récupérer les rendez-vous du propriétaire
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    if (user.role !== "LANDLORD") {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        landlordId: user.id,
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            address: true,
            city: true,
            price: true,
            images: true,
          },
        },
        slot: {
          select: {
            id: true,
            startAt: true,
            endAt: true,
          },
        },
        tenant: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ appointments });
  } catch (error) {
    console.error("[Landlord Appointments GET] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des rendez-vous" },
      { status: 500 }
    );
  }
}
