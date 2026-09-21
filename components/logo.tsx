"use client";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "light";
}

export function Logo({
  className = "",
  showText = true,
  size = "md",
  variant = "default",
}: LogoProps) {
  const textSizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-xl",
  };

  const textColor = variant === "light" ? "text-white" : "text-ink";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className={`w-2 h-2 rounded-sm ${variant === "light" ? "bg-white" : "bg-ink"} flex-shrink-0`}
      />
      {showText && (
        <span className={`${textSizes[size]} ${textColor} font-semibold tracking-tight`}>
          MyRent
        </span>
      )}
    </div>
  );
}
