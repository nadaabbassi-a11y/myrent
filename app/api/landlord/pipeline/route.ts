import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeListingPipeline } from "@/lib/pipeline/compute-pipeline";
import { PipelineListingSummary } from "@/lib/pipeline/types";

export async function GET(request: NextRequest) {
  try {
    const user = await requireRole(request, "LANDLORD");

    const landlordProfile = await prisma.landlordProfile.findUnique({
      where: { userId: user.id },
    });

    if (!landlordProfile) {
      return NextResponse.json(
        { error: "Profil propriétaire introuvable" },
        { status: 404 }
      );
    }

    const listings = await prisma.listing.findMany({
      where: { landlordId: landlordProfile.id },
      orderBy: { updatedAt: "desc" },
      include: {
        syndications: { where: { status: "published" } },
        visitRequests: true,
        appointments: true,
        messageThreads: true,
        applications: {
          include: {
            lease: {
              include: {
                payments: { take: 1 },
              },
            },
          },
        },
      },
    });

    const summaries: PipelineListingSummary[] = listings.map((listing) => {
      let image: string | null = null;
      if (listing.images) {
        try {
          const parsed = JSON.parse(listing.images);
          image = Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : null;
        } catch {
          image = null;
        }
      }

      const applicationsSubmitted = listing.applications.filter(
        (a) => a.status === "SUBMITTED" || a.status === "DRAFT"
      ).length;
      const applicationsAccepted = listing.applications.filter(
        (a) => a.status === "ACCEPTED"
      ).length;

      const activeLease = listing.applications
        .map((a) => a.lease)
        .find((l) => l != null);

      const finalizedLease = listing.applications
        .map((a) => a.lease)
        .find((l) => l?.status === "FINALIZED");

      const pipeline = computeListingPipeline({
        listingId: listing.id,
        listingStatus: listing.status,
        marketplaceUrl: listing.marketplaceUrl,
        syndicationPublished: listing.syndications.length,
        pendingVisits: listing.visitRequests.filter((v) => v.status === "pending")
          .length,
        totalVisits: listing.visitRequests.length,
        appointments: listing.appointments.length,
        messageThreads: listing.messageThreads.length,
        applicationsSubmitted,
        applicationsAccepted,
        leaseId: activeLease?.id ?? null,
        leaseStatus: activeLease?.status ?? null,
        rentManagementId: finalizedLease?.id ?? null,
      });

      return {
        id: listing.id,
        title: listing.title,
        city: listing.city,
        area: listing.area,
        price: listing.price,
        status: listing.status,
        image,
        pipeline,
      };
    });

    return NextResponse.json({ listings: summaries });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    console.error("GET landlord pipeline:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
