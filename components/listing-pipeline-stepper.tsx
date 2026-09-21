"use client";

import Link from "next/link";
import {
  Megaphone,
  Users,
  FileText,
  PenTool,
  DollarSign,
  Check,
} from "lucide-react";
import { useLanguageContext } from "@/contexts/LanguageContext";
import {
  PipelineStage,
  PipelineStageId,
  PipelineStepStatus,
} from "@/lib/pipeline/types";
import { cn } from "@/lib/utils";

const STAGE_ICONS: Record<PipelineStageId, typeof Megaphone> = {
  published: Megaphone,
  leads: Users,
  application: FileText,
  lease: PenTool,
  renting: DollarSign,
};

interface ListingPipelineStepperProps {
  stages: PipelineStage[];
  compact?: boolean;
}

function stepColors(status: PipelineStepStatus) {
  switch (status) {
    case "completed":
      return {
        circle: "bg-green-600 text-white border-green-600",
        line: "bg-green-500",
        label: "text-green-700",
      };
    case "active":
      return {
        circle: "bg-neutral-900 text-white border-neutral-900 ring-4 ring-neutral-900/10",
        line: "bg-neutral-300",
        label: "text-neutral-900 font-medium",
      };
    default:
      return {
        circle: "bg-white text-neutral-400 border-neutral-200",
        line: "bg-neutral-200",
        label: "text-neutral-400",
      };
  }
}

export function ListingPipelineStepper({
  stages,
  compact = false,
}: ListingPipelineStepperProps) {
  const { t } = useLanguageContext();

  return (
    <div className={cn("w-full", compact ? "py-2" : "py-4")}>
      <div className="flex items-start justify-between relative">
        {stages.map((stage, index) => {
          const Icon = STAGE_ICONS[stage.id];
          const colors = stepColors(stage.status);
          const isLast = index === stages.length - 1;

          return (
            <div
              key={stage.id}
              className="flex flex-col items-center relative flex-1 min-w-0"
            >
              {!isLast && (
                <div
                  className={cn(
                    "absolute top-5 left-[calc(50%+20px)] right-[calc(-50%+20px)] h-0.5 z-0",
                    stages[index + 1]?.status === "completed" ||
                      stage.status === "completed"
                      ? "bg-green-500"
                      : "bg-neutral-200"
                  )}
                />
              )}

              <Link
                href={stage.href}
                className="flex flex-col items-center group z-10"
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all group-hover:scale-105",
                    colors.circle
                  )}
                >
                  {stage.status === "completed" ? (
                    <Check className="h-4 w-4" strokeWidth={2.5} />
                  ) : (
                    <Icon className="h-4 w-4" strokeWidth={1.75} />
                  )}
                </div>

                <span
                  className={cn(
                    "mt-2 text-xs text-center leading-tight px-1",
                    colors.label,
                    compact ? "hidden sm:block" : "block"
                  )}
                >
                  {t(stage.labelKey)}
                </span>

                {stage.count > 0 && (
                  <span
                    className={cn(
                      "mt-1 text-[10px] font-semibold rounded-full px-2 py-0.5",
                      stage.status === "active"
                        ? "bg-neutral-900 text-white"
                        : stage.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : "bg-neutral-100 text-neutral-500"
                    )}
                  >
                    {stage.count}
                  </span>
                )}

              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
