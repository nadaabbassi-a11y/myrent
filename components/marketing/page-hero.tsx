import Image from "next/image";
import { cn } from "@/lib/utils";

/** Images Unsplash — intérieurs / immeubles lumineux */
export const MARKETING_IMAGES = {
  home: "https://images.unsplash.com/photo-1600607687644-c7171b42498f?q=80&w=2400&auto=format&fit=crop",
  beta: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2400&auto=format&fit=crop",
  listings: "https://images.unsplash.com/photo-1600210492486-724fe994c469?q=80&w=2400&auto=format&fit=crop",
  auth: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=2400&auto=format&fit=crop",
  cta: "https://images.unsplash.com/photo-1600047509807-ba139f83aba1?q=80&w=2400&auto=format&fit=crop",
} as const;

interface PageHeroProps {
  image: string;
  children: React.ReactNode;
  align?: "left" | "center";
  size?: "default" | "compact";
  className?: string;
}

export function PageHero({
  image,
  children,
  align = "left",
  size = "default",
  className,
}: PageHeroProps) {
  const isCenter = align === "center";
  const minH = size === "compact" ? "min-h-[42vh]" : "min-h-[78vh]";

  return (
    <section
      className={cn(
        "relative flex items-center overflow-hidden bg-stone-100",
        minH,
        className
      )}
    >
      <Image src={image} alt="" fill priority className="object-cover object-center" sizes="100vw" />
      {isCenter ? (
        <>
          <div className="absolute inset-0 bg-black/45" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-white/25 md:to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-transparent" />
        </>
      )}
      <div
        className={cn(
          "container mx-auto px-6 relative z-10 w-full",
          size === "compact" ? "py-16 md:py-20" : "py-20 md:py-28",
          isCenter && "text-center"
        )}
      >
        {isCenter ? (
          <div className="max-w-3xl mx-auto">{children}</div>
        ) : (
          <div className="max-w-xl md:max-w-2xl">{children}</div>
        )}
      </div>
    </section>
  );
}
