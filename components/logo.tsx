"use client";

import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

const SIZES = {
  sm: {
    text: "text-lg",
    tracking: "tracking-[0.22em]",
  },
  md: {
    text: "text-xl sm:text-2xl md:text-[1.65rem]",
    tracking: "tracking-[0.28em] sm:tracking-[0.32em]",
  },
  lg: {
    text: "text-3xl sm:text-4xl",
    tracking: "tracking-[0.34em] sm:tracking-[0.38em]",
  },
} as const;

export function Logo({ className = "", showText = true, size = "md" }: LogoProps) {
  const s = SIZES[size];

  return (
    <span
      className={cn(
        s.text,
        s.tracking,
        "font-medium uppercase text-neutral-900 leading-none select-none whitespace-nowrap",
        "group-hover:text-neutral-700 transition-colors duration-200",
        !showText && "sr-only",
        className
      )}
    >
      MyRent
    </span>
  );
}
