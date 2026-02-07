import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// GET - Récupérer les disponibilités d'une annonce
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: listingId } = await params;
    
    const slots = await prisma.availabilitySlot.findMany({
      where: {
        listingId,
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        startAt: "asc",
      },
    });

    return NextResponse.json({ slots });
  } catch (error) {
    console.error("[Availability GET] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des disponibilités" },
      { status: 500 }
    );
  }
}

// POST - Créer une disponibilité (propriétaire uniquement)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { id: listingId } = await params;

    if (user.role !== "LANDLORD") {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { startAt, endAt } = body;

    if (!startAt || !endAt) {
      return NextResponse.json(
        { error: "Les dates de début et de fin sont requises" },
        { status: 400 }
      );
    }

    const startDate = new Date(startAt);
    const endDate = new Date(endAt);

    if (endDate <= startDate) {
      return NextResponse.json(
        { error: "La date de fin doit être après la date de début" },
        { status: 400 }
      );
    }

    // Vérifier que le propriétaire possède cette annonce
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        landlord: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Annonce introuvable" },
        { status: 404 }
      );
    }

    if (listing.landlord.userId !== user.id) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    // Créer la disponibilité
    const slot = await prisma.availabilitySlot.create({
      data: {
        listingId,
        startAt: startDate,
        endAt: endDate,
        isBooked: false,
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json({ slot }, { status: 201 });
  } catch (error) {
    console.error("[Availability POST] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la disponibilité" },
      { status: 500 }
    );
  }
}

