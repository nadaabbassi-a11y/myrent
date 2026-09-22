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
    pill: "h-10 pl-1 pr-3.5 gap-2",
    mark: "h-8 w-8",
    icon: "h-4 w-4",
    text: "text-base",
  },
  md: {
    pill: "h-12 sm:h-[3.25rem] pl-1.5 pr-5 sm:pr-6 gap-2.5",
    mark: "h-9 w-9 sm:h-10 sm:w-10",
    icon: "h-[18px] w-[18px] sm:h-5 sm:w-5",
    text: "text-lg sm:text-xl",
  },
  lg: {
    pill: "h-14 pl-2 pr-7 gap-3",
    mark: "h-11 w-11",
    icon: "h-6 w-6",
    text: "text-2xl sm:text-[1.75rem]",
  },
} as const;

export function Logo({ className = "", showText = true, size = "md" }: LogoProps) {
  const s = SIZES[size];

  const mark = (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-white",
        "ring-2 ring-white/20",
        s.mark
      )}
    >
      <Home className={cn(s.icon, "text-neutral-900")} strokeWidth={2.25} />
    </div>
  );

  if (!showText) {
    return (
      <div
        className={cn(
          "inline-flex items-center justify-center rounded-full bg-neutral-900 shadow-lg shadow-neutral-900/25",
          s.mark,
          className
        )}
      >
        <Home className={cn(s.icon, "text-white")} strokeWidth={2.25} />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full bg-neutral-900",
        "shadow-lg shadow-neutral-900/20",
        "group-hover:bg-neutral-800 group-hover:shadow-neutral-900/30",
        "transition-all duration-200",
        s.pill,
        className
      )}
    >
      {mark}
      <span
        className={cn(
          s.text,
          "font-semibold text-white tracking-tight leading-none select-none whitespace-nowrap pr-0.5"
        )}
      >
        MyRent
      </span>
    </div>
  );
}
