"use client";

import { useLanguageContext } from "@/contexts/LanguageContext";

const PIPELINE = [
  "pipeline.stages.published",
  "pipeline.stages.leads",
  "pipeline.stages.application",
  "pipeline.stages.lease",
  "pipeline.stages.renting",
] as const;

export function HeroPreview() {
  const { t } = useLanguageContext();

  return (
    <div className="relative w-full max-w-lg mx-auto lg:mx-0 lg:ml-auto">
      <div className="absolute -inset-4 bg-gradient-to-b from-neutral-100/80 to-transparent rounded-2xl -z-10" />
      <div className="rounded-xl border border-neutral-200 bg-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.12)] overflow-hidden">
        {/* Title bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 bg-neutral-50/50">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-300" />
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-300" />
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-300" />
            </div>
            <span className="text-[11px] font-medium text-ink-muted ml-1">Pipeline</span>
          </div>
          <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
            En direct
          </span>
        </div>

        {/* Pipeline tabs */}
        <div className="px-3 py-3 border-b border-neutral-100 overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {PIPELINE.map((key, i) => (
              <span
                key={key}
                className={`text-[10px] font-medium px-2.5 py-1 rounded-md whitespace-nowrap ${
                  i === 2
                    ? "bg-ink text-white"
                    : i < 2
                      ? "bg-neutral-100 text-ink-muted"
                      : "text-ink-subtle"
                }`}
              >
                {t(key)}
              </span>
            ))}
          </div>
        </div>

        {/* Listing rows */}
        <div className="p-3 space-y-2">
          {[
            { unit: "4½", area: "Plateau", stage: 2, detail: "2 visites cette semaine" },
            { unit: "3½", area: "Rosemont", stage: 3, detail: "Candidature en cours" },
            { unit: "5½", area: "Ville-Marie", stage: 4, detail: "Bail signé hier" },
          ].map((row) => (
            <div
              key={row.area + row.unit}
              className="flex items-center gap-3 p-2.5 rounded-lg border border-neutral-100 hover:border-neutral-200 transition-colors"
            >
              <div className="w-9 h-9 rounded-md bg-neutral-100 flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-semibold text-ink-muted">{row.unit}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-ink truncate">{row.area}</p>
                <p className="text-[10px] text-ink-subtle truncate">{row.detail}</p>
              </div>
              <div className="flex gap-0.5 flex-shrink-0">
                {PIPELINE.map((_, i) => (
                  <span
                    key={i}
                    className={`w-1 h-4 rounded-full ${
                      i <= row.stage ? "bg-ink" : "bg-neutral-200"
                    }`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer stat */}
        <div className="px-4 py-3 border-t border-neutral-100 bg-neutral-50/30 flex justify-between text-[10px] text-ink-subtle">
          <span>3 logements actifs</span>
          <span className="font-medium text-ink">4 850 $ / mois</span>
        </div>
      </div>
    </div>
  );
}
