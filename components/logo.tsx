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
    mark: "h-7 w-7 rounded-md",
    icon: "h-3.5 w-3.5",
    text: "text-base",
  },
  md: {
    mark: "h-8 w-8 rounded-lg",
    icon: "h-4 w-4",
    text: "text-lg",
  },
  lg: {
    mark: "h-10 w-10 rounded-lg",
    icon: "h-5 w-5",
    text: "text-xl md:text-2xl",
  },
} as const;

export function Logo({ className = "", showText = true, size = "md" }: LogoProps) {
  const s = SIZES[size];

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className={cn(
          "flex shrink-0 items-center justify-center border border-neutral-200 bg-white",
          "group-hover:border-neutral-300 transition-colors duration-200",
          s.mark
        )}
      >
        <Home className={cn(s.icon, "text-neutral-700")} strokeWidth={1.5} />
      </div>

      {showText && (
        <span
          className={cn(
            s.text,
            "font-light tracking-tight text-neutral-900 leading-none select-none"
          )}
        >
          My<span className="font-normal">Rent</span>
        </span>
      )}
    </div>
  );
}
