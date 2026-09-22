"use client";

import { Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

const SIZES = {
  sm: {
    mark: "h-9 w-9 rounded-lg",
    icon: "h-4 w-4",
    text: "text-lg",
    gap: "gap-2.5",
  },
  md: {
    mark: "h-10 w-10 sm:h-11 sm:w-11 rounded-lg",
    icon: "h-[18px] w-[18px] sm:h-5 sm:w-5",
    text: "text-xl sm:text-2xl",
    gap: "gap-3",
  },
  lg: {
    mark: "h-12 w-12 rounded-xl",
    icon: "h-6 w-6",
    text: "text-2xl sm:text-3xl",
    gap: "gap-3.5",
  },
} as const;

export function Logo({ className = "", showText = true, size = "md" }: LogoProps) {
  const s = SIZES[size];

  return (
    <div className={cn("flex items-center", s.gap, className)}>
      <div
        className={cn(
          "flex shrink-0 items-center justify-center border border-neutral-200 bg-white",
          "group-hover:border-neutral-300 transition-colors duration-200",
          s.mark
        )}
      >
        <Home className={cn(s.icon, "text-neutral-800")} strokeWidth={1.75} />
      </div>

      {showText && (
        <span
          className={cn(
            s.text,
            "font-light tracking-tight text-neutral-900 leading-none select-none whitespace-nowrap"
          )}
        >
          My<span className="font-normal">Rent</span>
        </span>
      )}
    </div>
  );
}
