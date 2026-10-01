import { cn } from "@/lib/utils";

type IconProps = {
  className?: string;
};

function Svg({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-7 w-7", className)}
      aria-hidden
    >
      {children}
    </svg>
  );
}

/** Dossier / formulaire */
export function IconClipboard({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="6" y="4.5" width="12" height="16" rx="1.6" />
      <path d="M9 4.5h6v2.2H9z" />
      <path d="M8.8 10.2h6.4M8.8 13.4h6.4M8.8 16.6h4" />
    </Svg>
  );
}

/** Carte d’identité / crédit */
export function IconIdCard({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="3" y="6.2" width="18" height="11.6" rx="1.8" />
      <circle cx="8.2" cy="11.2" r="1.7" />
      <path d="M12.2 10h5.4M12.2 13.2h3.6" />
    </Svg>
  );
}

/** Clé — après le bail */
export function IconKey({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="8.2" cy="12" r="3.4" />
      <path d="M11.2 12h9.2l-2.1 2.1M17.4 12v2.4" />
    </Svg>
  );
}

/** Écran / dossier à l’écran */
export function IconScreen({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="3" y="4.5" width="18" height="12.2" rx="1.8" />
      <path d="M8 20h8M12 16.7V20" />
    </Svg>
  );
}

/** Carte / paiement */
export function IconCard({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="3" y="6.2" width="18" height="11.6" rx="1.8" />
      <path d="M3 10.2h18" />
      <path d="M7 14.4h4" />
    </Svg>
  );
}

/** Coche simple, sans cercle */
export function IconTick({ className }: IconProps) {
  return (
    <Svg className={cn("h-5 w-5", className)}>
      <path d="M4.5 12.2 9.2 17 19.5 6.8" />
    </Svg>
  );
}

/** Chevron — boutons */
export function IconChevron({ className }: IconProps) {
  return (
    <Svg className={cn("h-5 w-5", className)}>
      <path d="M9 5.5 16 12 9 18.5" />
    </Svg>
  );
}

export function IconChevronLeft({ className }: IconProps) {
  return (
    <Svg className={cn("h-5 w-5", className)}>
      <path d="M15 5.5 8 12l7 6.5" />
    </Svg>
  );
}
