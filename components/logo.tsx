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
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-4xl"
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo moderne avec icône */}
      <div className={`${sizeClasses[size]} relative group cursor-pointer`}>
        {/* Cercle avec gradient animé */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 group-hover:from-violet-500 group-hover:via-purple-500 group-hover:to-indigo-500 transition-all duration-500 shadow-lg group-hover:shadow-xl group-hover:scale-110"></div>
        
        {/* Cercle intérieur pour effet de profondeur */}
        <div className="absolute inset-1 rounded-full bg-gradient-to-br from-violet-400/20 to-transparent"></div>
        
        {/* Icône de maison centrée */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Home 
            className={`${iconSizes[size]} text-white drop-shadow-lg group-hover:scale-110 transition-transform duration-300`}
            strokeWidth={2.5}
          />
        </div>
        
        {/* Lueur au survol */}
        <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-violet-400/40 to-purple-400/40 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
      </div>
      
      {/* Texte avec gradient */}
      {showText && (
        <span className={`font-extrabold bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent ${textSizes[size]} tracking-tight group-hover:from-violet-500 group-hover:via-purple-500 group-hover:to-indigo-500 transition-all duration-300`}>
          MyRent
        </span>
      )}
    </div>
  );
}

