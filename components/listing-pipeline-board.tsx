"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { GitBranch, ImageIcon, ArrowRight } from "lucide-react";
import { useLanguageContext } from "@/contexts/LanguageContext";
import { ListingPipelineStepper } from "@/components/listing-pipeline-stepper";
import { PipelineListingSummary } from "@/lib/pipeline/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ListingPipelineBoard() {
  const { t } = useLanguageContext();
  const [listings, setListings] = useState<PipelineListingSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPipeline = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch("/api/landlord/pipeline");
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      setListings(data.listings ?? []);
    } catch {
      setError(t("pipeline.loadError"));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchPipeline();
  }, [fetchPipeline]);

  if (isLoading) {
    return (
      <div className="text-center py-16 text-neutral-500">{t("common.loading")}</div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 text-red-600 text-sm">{error}</div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="text-center py-16 border-2 border-dashed border-neutral-200 rounded-2xl">
        <GitBranch className="h-12 w-12 mx-auto mb-4 text-neutral-300" />
        <p className="text-neutral-600 mb-4">{t("pipeline.noListings")}</p>
        <Link
          href="/landlord/listings/new"
          className="text-sm font-medium text-neutral-900 underline underline-offset-4"
        >
          {t("landlordHub.createListing")}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {listings.map((listing) => (
        <Card
          key={listing.id}
          className="rounded-2xl border-neutral-200 overflow-hidden hover:shadow-md transition-shadow"
        >
          <CardContent className="p-0">
            <div className="flex flex-col lg:flex-row">
              <div className="flex items-center gap-4 p-6 lg:w-72 shrink-0 border-b lg:border-b-0 lg:border-r border-neutral-100">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-neutral-100 shrink-0">
                  {listing.image ? (
                    <Image
                      src={listing.image}
                      alt={listing.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-6 w-6 text-neutral-400" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-neutral-900 truncate">
                    {listing.title}
                  </h3>
                  <p className="text-sm text-neutral-500 truncate">
                    {listing.area ? `${listing.area}, ` : ""}
                    {listing.city}
                  </p>
                  <p className="text-sm font-medium text-neutral-800 mt-1">
                    {listing.price.toLocaleString("fr-CA")} $/mois
                  </p>
                  <Badge
                    variant="outline"
                    className="mt-2 text-xs capitalize"
                  >
                    {t(`pipeline.currentStage.${listing.pipeline.currentStage}`)}
                  </Badge>
                </div>
              </div>

              <div className="flex-1 p-6 lg:px-8 flex flex-col justify-center">
                <ListingPipelineStepper stages={listing.pipeline.stages} />
                <div className="flex justify-end mt-2">
                  <Link
                    href={`/landlord/publish/${listing.id}`}
                    className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900 transition-colors"
                  >
                    {t("pipeline.viewDetails")}
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
