"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Megaphone,
  Copy,
  Check,
  Plus,
  ChevronDown,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SyndicationPlatformCard } from "@/components/syndication-platform-card";
import { QUEBEC_PLATFORMS, SyndicationStatus } from "@/lib/syndication/platforms";
import { useLanguageContext } from "@/contexts/LanguageContext";

interface ListingOption {
  id: string;
  title: string;
  city: string;
  area: string | null;
  price: number;
  status: string;
}

interface SyndicationState {
  listing: ListingOption;
  adText: string;
  myrentUrl: string;
  platforms: Array<{
    platform: string;
    status: SyndicationStatus;
    externalUrl: string | null;
    publishedAt: string | null;
  }>;
  publishedCount: number;
  totalPlatforms: number;
}

interface PublishEverywherePanelProps {
  initialListingId?: string;
}

export function PublishEverywherePanel({
  initialListingId,
}: PublishEverywherePanelProps) {
  const { t } = useLanguageContext();
  const [listings, setListings] = useState<ListingOption[]>([]);
  const [selectedId, setSelectedId] = useState<string>(initialListingId ?? "");
  const [state, setState] = useState<SyndicationState | null>(null);
  const [isLoadingListings, setIsLoadingListings] = useState(true);
  const [isLoadingState, setIsLoadingState] = useState(false);
  const [updatingPlatform, setUpdatingPlatform] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await fetch("/api/landlord/listings");
        if (!res.ok) throw new Error("Erreur chargement annonces");
        const data = await res.json();
        const items: ListingOption[] = data.listings ?? [];
        setListings(items);
        if (!selectedId && items.length > 0) {
          setSelectedId(initialListingId ?? items[0].id);
        }
      } catch {
        setError(t("syndication.loadError"));
      } finally {
        setIsLoadingListings(false);
      }
    };
    fetchListings();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialListingId]);

  const fetchSyndication = useCallback(async (listingId: string) => {
    if (!listingId) return;
    setIsLoadingState(true);
    setError(null);
    try {
      const res = await fetch(`/api/listings/${listingId}/syndication`);
      if (!res.ok) throw new Error("Erreur chargement syndication");
      const data = await res.json();
      setState(data);
    } catch {
      setError(t("syndication.loadError"));
      setState(null);
    } finally {
      setIsLoadingState(false);
    }
  }, [t]);

  useEffect(() => {
    if (selectedId) fetchSyndication(selectedId);
  }, [selectedId, fetchSyndication]);

  const handleUpdate = async (
    platformId: string,
    data: { status: SyndicationStatus; externalUrl?: string | null }
  ) => {
    if (!selectedId) return;
    setUpdatingPlatform(platformId);
    try {
      const res = await fetch(`/api/listings/${selectedId}/syndication`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: platformId, ...data }),
      });
      if (!res.ok) throw new Error("Erreur mise à jour");
      const updated = await res.json();
      setState(updated);
    } catch {
      setError(t("syndication.updateError"));
    } finally {
      setUpdatingPlatform(null);
    }
  };

  const handleCopyLink = async () => {
    if (!state?.myrentUrl) return;
    await navigator.clipboard.writeText(state.myrentUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const progressPct = state
    ? Math.round((state.publishedCount / state.totalPlatforms) * 100)
    : 0;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-neutral-900 rounded-xl flex items-center justify-center">
            <Megaphone className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-medium text-neutral-900 tracking-tight">
              {t("syndication.title")}
            </h1>
            <p className="text-neutral-600 mt-1">{t("syndication.subtitle")}</p>
          </div>
        </div>
      </div>

      {isLoadingListings ? (
        <div className="text-center py-16 text-neutral-500">{t("common.loading")}</div>
      ) : listings.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-neutral-200 rounded-2xl">
          <Megaphone className="h-12 w-12 mx-auto mb-4 text-neutral-300" />
          <p className="text-neutral-600 mb-4">{t("syndication.noListings")}</p>
          <Button asChild className="bg-neutral-900 hover:bg-neutral-800 rounded-xl">
            <Link href="/landlord/listings/new">
              <Plus className="h-4 w-4 mr-2" />
              {t("landlordHub.createListing")}
            </Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-8 p-6 bg-neutral-50 rounded-2xl border border-neutral-200">
            <label className="text-sm font-medium text-neutral-700 mb-2 block">
              {t("syndication.selectListing")}
            </label>
            <Select value={selectedId} onValueChange={setSelectedId}>
              <SelectTrigger className="w-full h-12 rounded-xl bg-white text-base">
                <SelectValue placeholder={t("syndication.selectListing")} />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {listings.map((l) => (
                  <SelectItem key={l.id} value={l.id} className="py-3">
                    {l.title} — {l.city} ({l.price.toLocaleString("fr-CA")} $/mois)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {state && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-neutral-600">
                    {t("syndication.progress")
                      .replace("{count}", String(state.publishedCount))
                      .replace("{total}", String(state.totalPlatforms))}
                  </span>
                  <span className="text-sm font-medium text-neutral-900">{progressPct}%</span>
                </div>
                <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg"
                    onClick={handleCopyLink}
                  >
                    {copiedLink ? (
                      <Check className="h-4 w-4 mr-1.5 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4 mr-1.5" />
                    )}
                    {t("syndication.copyMyrentLink")}
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-lg" asChild>
                    <Link href={`/listings/${selectedId}`} target="_blank">
                      <ExternalLink className="h-4 w-4 mr-1.5" />
                      {t("syndication.previewListing")}
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-lg" asChild>
                    <Link href={`/landlord/listings/${selectedId}/edit`}>
                      {t("syndication.editListing")}
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          {isLoadingState ? (
            <div className="text-center py-12 text-neutral-500">
              {t("common.loading")}
            </div>
          ) : state ? (
            <>
              <div className="mb-6">
                <details className="group">
                  <summary className="flex items-center gap-2 cursor-pointer text-sm font-medium text-neutral-700 list-none">
                    <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                    {t("syndication.previewAd")}
                  </summary>
                  <pre className="mt-3 p-4 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-700 whitespace-pre-wrap font-sans leading-relaxed max-h-64 overflow-y-auto">
                    {state.adText}
                  </pre>
                </details>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {QUEBEC_PLATFORMS.map((platform) => {
                  const platformState = state.platforms.find(
                    (p) => p.platform === platform.id
                  );
                  return (
                    <SyndicationPlatformCard
                      key={platform.id}
                      platform={platform}
                      name={t(platform.nameKey)}
                      description={t(platform.descriptionKey)}
                      setupGuide={
                        platform.setupGuideKey
                          ? t(platform.setupGuideKey)
                          : undefined
                      }
                      status={platformState?.status ?? "pending"}
                      externalUrl={platformState?.externalUrl ?? null}
                      adText={state.adText}
                      onUpdate={(data) => handleUpdate(platform.id, data)}
                      isUpdating={updatingPlatform === platform.id}
                    />
                  );
                })}
              </div>

              <p className="mt-8 text-sm text-neutral-400 text-center">
                {t("syndication.manualNote")}
              </p>
            </>
          ) : null}
        </>
      )}
    </div>
  );
}
