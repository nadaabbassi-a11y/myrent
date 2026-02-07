"use client";

import { Home } from "lucide-react";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

export function Logo({ className = "", showText = true, size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-14 h-14",
    lg: "w-20 h-20"
  };

  const iconSizes = {
    sm: "h-5 w-5",
    md: "h-7 w-7",
    lg: "h-10 w-10"
  };

  const textSizes = {
    sm: "text-2xl",
    md: "text-3xl",
    lg: "text-5xl"
  };

  return (
    <div className={`flex items-center gap-3 ${className} group`}>
      {/* Logo simple et clair */}
      <div className={`${sizeClasses[size]} relative cursor-pointer`}>
        {/* Cercle principal simple avec couleur unie */}
        <div className="absolute inset-0 rounded-full bg-slate-700 group-hover:bg-slate-600 transition-colors duration-200"></div>
        
        {/* Icône de maison centrée - simple */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Home 
            className={`${iconSizes[size]} text-white`}
            strokeWidth={2}
          />
        </div>
      </div>
      
      {/* Texte simple et clair */}
      {showText && (
        <div className={`relative ${textSizes[size]} font-bold tracking-tight`}>
          {/* Texte simple avec couleur unie et claire */}
          <span className="relative z-10 text-slate-900 group-hover:text-slate-800 transition-colors duration-200 select-none font-bold leading-tight">
            MyRent
          </span>
        </div>
      )}
    </div>
  );
}

