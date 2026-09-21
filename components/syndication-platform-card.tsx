"use client";

import { useEffect, useState } from "react";
import { useLanguageContext } from "@/contexts/LanguageContext";
import {
  ExternalLink,
  Copy,
  Check,
  Link2,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { QuebecPlatform, SyndicationStatus } from "@/lib/syndication/platforms";

interface SyndicationPlatformCardProps {
  platform: QuebecPlatform;
  name: string;
  description: string;
  setupGuide?: string;
  status: SyndicationStatus;
  externalUrl: string | null;
  adText: string;
  onUpdate: (data: {
    status: SyndicationStatus;
    externalUrl?: string | null;
  }) => Promise<void>;
  isUpdating: boolean;
}

export function SyndicationPlatformCard({
  platform,
  name,
  description,
  setupGuide,
  status,
  externalUrl,
  adText,
  onUpdate,
  isUpdating,
}: SyndicationPlatformCardProps) {
  const { t } = useLanguageContext();
  const [urlInput, setUrlInput] = useState(externalUrl ?? "");
  const [copied, setCopied] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);

  useEffect(() => {
    setUrlInput(externalUrl ?? "");
  }, [externalUrl]);

  const isPublished = status === "published";
  const platformShortName = name.split(" ")[0];

  const handleCopyAd = async () => {
    await navigator.clipboard.writeText(adText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyMessage = async () => {
    const message = adText.split("\n").slice(-3).join("\n");
    await navigator.clipboard.writeText(message);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2000);
  };

  const handleMarkPublished = async () => {
    await onUpdate({
      status: "published",
      externalUrl: urlInput.trim() || null,
    });
  };

  const handleMarkPending = async () => {
    setUrlInput("");
    await onUpdate({ status: "pending", externalUrl: null });
  };

  if (platform.brokerOnly) {
    return (
      <Card className="border-neutral-200 opacity-75 rounded-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                style={{ backgroundColor: platform.color }}
              >
                {name.charAt(0)}
              </div>
              <div>
                <CardTitle className="text-base font-medium">{name}</CardTitle>
                <p className="text-xs text-neutral-500 mt-0.5">{description}</p>
              </div>
            </div>
            <Badge variant="outline" className="text-neutral-500 shrink-0">
              {t("syndication.broker")}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-neutral-500 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            {setupGuide || description}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={`rounded-xl transition-all ${
        isPublished
          ? "border-green-300 bg-green-50/30"
          : "border-neutral-200 hover:border-neutral-300"
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0"
              style={{ backgroundColor: platform.color }}
            >
              {name.charAt(0)}
            </div>
            <div>
              <CardTitle className="text-base font-medium">{name}</CardTitle>
              <p className="text-xs text-neutral-500 mt-0.5">{description}</p>
            </div>
          </div>
          <Badge
            className={
              isPublished
                ? "bg-green-600 hover:bg-green-600 shrink-0"
                : "bg-neutral-200 text-neutral-600 hover:bg-neutral-200 shrink-0"
            }
          >
            {isPublished ? t("syndication.published") : t("syndication.pending")}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg"
            onClick={handleCopyAd}
          >
            {copied ? (
              <Check className="h-4 w-4 mr-1.5 text-green-600" />
            ) : (
              <Copy className="h-4 w-4 mr-1.5" />
            )}
            {copied ? t("syndication.copied") : t("syndication.copyAd")}
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="rounded-lg"
            asChild
          >
            <a
              href={platform.publishUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4 mr-1.5" />
              {t("syndication.publishOn")} {platformShortName}
            </a>
          </Button>

          {platform.id === "facebook_marketplace" && (
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg"
              onClick={handleCopyMessage}
            >
              {copiedMessage ? (
                <Check className="h-4 w-4 mr-1.5 text-green-600" />
              ) : (
                <Copy className="h-4 w-4 mr-1.5" />
              )}
              {t("syndication.autoMessage")}
            </Button>
          )}
        </div>

        {platform.id === "facebook_marketplace" && setupGuide && (
          <p className="text-xs text-neutral-500 bg-neutral-50 rounded-lg p-3">
            {setupGuide}
          </p>
        )}

        <div className="space-y-2 pt-1">
          <label className="text-xs font-medium text-neutral-600 flex items-center gap-1.5">
            <Link2 className="h-3.5 w-3.5" />
            {t("syndication.externalUrlLabel")}
          </label>
          <Input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder={`https://...`}
            className="rounded-lg text-sm"
          />
        </div>

        <div className="flex gap-2 pt-1">
          {!isPublished ? (
            <Button
              size="sm"
              className="rounded-lg bg-neutral-900 hover:bg-neutral-800 flex-1"
              onClick={handleMarkPublished}
              disabled={isUpdating}
            >
              {t("syndication.markPublished")}
            </Button>
          ) : (
            <>
              {externalUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg"
                  asChild
                >
                  <a href={externalUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-1.5" />
                    {t("syndication.viewListing")}
                  </a>
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg"
                onClick={handleMarkPending}
                disabled={isUpdating}
              >
                {t("syndication.remove")}
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
