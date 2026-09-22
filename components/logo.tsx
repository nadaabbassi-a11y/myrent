"use client";

import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

const SIZES = {
  sm: {
    bar: "h-7 w-[3px]",
    text: "text-xl",
    my: "text-[0.92em]",
    rent: "text-[1em]",
    gap: "gap-2.5",
  },
  md: {
    bar: "h-9 w-[3px] sm:h-10",
    text: "text-[1.65rem] sm:text-[1.9rem] md:text-[2.15rem]",
    my: "text-[0.88em]",
    rent: "text-[1em]",
    gap: "gap-3",
  },
  lg: {
    bar: "h-11 w-1 sm:h-12",
    text: "text-3xl sm:text-4xl",
    my: "text-[0.88em]",
    rent: "text-[1em]",
    gap: "gap-3.5",
  },
} as const;

export function Logo({ className = "", showText = true, size = "md" }: LogoProps) {
  const s = SIZES[size];

  if (!showText) {
    return (
      <div
        className={cn(
          "rounded-full bg-neutral-900 shrink-0",
          size === "sm" ? "h-7 w-7" : size === "md" ? "h-9 w-9 sm:h-10 sm:w-10" : "h-11 w-11 sm:h-12 sm:w-12",
          className
        )}
        aria-hidden
      />
    );
  }

  return (
    <div className={cn("flex items-center", s.gap, className)}>
      <span
        className={cn(
          "shrink-0 rounded-full bg-neutral-900 group-hover:bg-neutral-700 transition-colors duration-200",
          s.bar
        )}
        aria-hidden
      />
      <span
        className={cn(
          s.text,
          "leading-none tracking-tight select-none whitespace-nowrap"
        )}
      >
        <span className={cn(s.my, "font-light text-neutral-400")}>My</span>
        <span className={cn(s.rent, "font-semibold text-neutral-900")}>Rent</span>
      </span>
    </div>
  );
}
