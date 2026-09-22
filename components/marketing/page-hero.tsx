"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const UNSPLASH = (id: string) =>
  `https://images.unsplash.com/${id}?q=80&w=2400&auto=format&fit=crop`;

/** Images Unsplash — intérieurs / immeubles lumineux */
export const MARKETING_IMAGES = {
  home: UNSPLASH("photo-1600607687644-c7171b42498f"),
  beta: UNSPLASH("photo-1600585154340-be6161a56a0c"),
  listings: UNSPLASH("photo-1600210492486-724fe994c469"),
  auth: UNSPLASH("photo-1600566753190-17f0baa2a6c3"),
  cta: UNSPLASH("photo-1600047509807-ba139f83aba1"),
  homeCarousel: [
    UNSPLASH("photo-1600607687644-c7171b42498f"),
    UNSPLASH("photo-1600585154340-be6161a56a0c"),
    UNSPLASH("photo-1600210492486-724fe994c469"),
    UNSPLASH("photo-1600566753190-17f0baa2a6c3"),
    UNSPLASH("photo-1600047509807-ba139f83aba1"),
    UNSPLASH("photo-1600585154526-990dced4db0d"),
    UNSPLASH("photo-1600607687939-26356196d8a2"),
    UNSPLASH("photo-1600573472591-ee6988702d1c"),
    UNSPLASH("photo-1616486338812-3ada6784b698"),
    UNSPLASH("photo-1600121848594-d87add6152b2"),
    UNSPLASH("photo-1605276374104-de6862c64906"),
    UNSPLASH("photo-1600607687920-4d2a7f4d6738"),
  ],
} as const;

const FADE_MS = 2200;

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

  // Précharger la photo suivante pour éviter les trous pendant le fade
  useEffect(() => {
    const next = slides[(index + 1) % slides.length];
    const img = new window.Image();
    img.src = next;
  }, [index, slides]);

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
        className="absolute inset-0 bg-stone-200"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        aria-hidden
      >
        {slides.map((src, i) => (
          <div
            key={src}
            className={cn(
              "absolute inset-0",
              reduceMotion
                ? i === index
                  ? "opacity-100 z-10"
                  : "opacity-0 z-0"
                : cn(
                    "transition-opacity ease-in-out",
                    i === index ? "opacity-100 z-10" : "opacity-0 z-0"
                  )
            )}
            style={reduceMotion ? undefined : { transitionDuration: `${FADE_MS}ms` }}
          >
            <Image
              src={src}
              alt=""
              fill
              priority={i < 2}
              className="object-cover object-center"
              sizes="100vw"
            />
          </div>
        ))}
      </div>

      <div className="absolute bottom-6 right-6 z-20 flex flex-wrap justify-end gap-1.5 max-w-[60%]">
        {slides.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Photo ${i + 1}`}
            className={cn(
              "h-1.5 rounded-full transition-all duration-500",
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
  slideInterval = 8000,
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
