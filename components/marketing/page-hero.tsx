"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** Images Unsplash — intérieurs / immeubles lumineux */
export const MARKETING_IMAGES = {
  home: "https://images.unsplash.com/photo-1600607687644-c7171b42498f?q=80&w=2400&auto=format&fit=crop",
  beta: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2400&auto=format&fit=crop",
  listings: "https://images.unsplash.com/photo-1600210492486-724fe994c469?q=80&w=2400&auto=format&fit=crop",
  auth: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=2400&auto=format&fit=crop",
  cta: "https://images.unsplash.com/photo-1600047509807-ba139f83aba1?q=80&w=2400&auto=format&fit=crop",
  homeCarousel: [
    "https://images.unsplash.com/photo-1600607687644-c7171b42498f?q=80&w=2400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600210492486-724fe994c469?q=80&w=2400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=2400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600047509807-ba139f83aba1?q=80&w=2400&auto=format&fit=crop",
  ],
} as const;

interface PageHeroProps {
  image?: string;
  images?: readonly string[];
  slideInterval?: number;
  children: React.ReactNode;
  align?: "left" | "center";
  size?: "default" | "compact";
  className?: string;
}

function HeroBackground({
  slides,
  slideInterval,
}: {
  slides: string[];
  slideInterval: number;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const goTo = useCallback(
    (next: number) => {
      setIndex((next + slides.length) % slides.length);
    },
    [slides.length]
  );

  useEffect(() => {
    if (slides.length <= 1 || paused || reduceMotion) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, slideInterval);
    return () => window.clearInterval(id);
  }, [slides.length, paused, reduceMotion, slideInterval]);

  if (slides.length <= 1) {
    return (
      <Image
        src={slides[0]}
        alt=""
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />
    );
  }

  return (
    <>
      <div
        className="absolute inset-0 overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        aria-hidden
      >
        <div
          className={cn(
            "flex h-full w-full",
            reduceMotion ? "" : "transition-transform duration-[1400ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
          )}
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {slides.map((src, i) => (
            <div key={src} className="relative h-full min-w-full flex-shrink-0">
              <Image
                src={src}
                alt=""
                fill
                priority={i === 0}
                className="object-cover object-center"
                sizes="100vw"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-6 right-6 z-20 flex items-center gap-2">
        {slides.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Photo ${i + 1}`}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              i === index ? "w-6 bg-neutral-900/80" : "w-1.5 bg-neutral-900/30 hover:bg-neutral-900/50"
            )}
          />
        ))}
      </div>
    </>
  );
}

export function PageHero({
  image,
  images,
  slideInterval = 5500,
  children,
  align = "left",
  size = "default",
  className,
}: PageHeroProps) {
  const isCenter = align === "center";
  const minH =
    size === "compact"
      ? "min-h-[38vh] sm:min-h-[42vh]"
      : "min-h-[62vh] sm:min-h-[72vh] lg:min-h-[78vh]";
  const slides = images ? [...images] : image ? [image] : [MARKETING_IMAGES.home];

  return (
    <section
      className={cn(
        "relative flex items-center overflow-hidden bg-stone-100",
        minH,
        className
      )}
    >
      <HeroBackground slides={slides} slideInterval={slideInterval} />
      {isCenter ? (
        <>
          <div className="absolute inset-0 bg-black/45" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-gradient-to-r from-white/97 via-white/90 to-white/70 sm:to-white/25 md:to-transparent" />
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
