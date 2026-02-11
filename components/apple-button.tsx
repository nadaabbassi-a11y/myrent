"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface AppleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  isLoading?: boolean;
  children: React.ReactNode;
}

export const AppleButton = forwardRef<HTMLButtonElement, AppleButtonProps>(
  ({ variant = "primary", isLoading = false, children, className, disabled, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "relative overflow-hidden font-light text-base px-8 py-6 rounded-full transition-all duration-300",
          "transform hover:scale-[1.02] active:scale-[0.98]",
          variant === "primary" &&
            "bg-neutral-900 text-white hover:bg-neutral-800 disabled:bg-neutral-300 disabled:text-neutral-500",
          variant === "secondary" &&
            "bg-white text-neutral-900 border-2 border-neutral-900 hover:bg-neutral-50",
          variant === "ghost" &&
            "bg-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50",
          isLoading && "cursor-wait",
          className
        )}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Chargement...</span>
          </span>
        ) : (
          children
        )}
      </Button>
    );
  }
);

AppleButton.displayName = "AppleButton";

