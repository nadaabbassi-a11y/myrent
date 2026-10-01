"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const UNSPLASH = (id: string) =>
  `https://images.unsplash.com/${id}?q=80&w=2400&auto=format&fit=crop`;

/** Logements — maisons, appartements, intérieurs */
export const MARKETING_IMAGES = {
  home: UNSPLASH("photo-1522708323590-d24dbb6b0267"),
  beta: UNSPLASH("photo-1568605114967-8130f3a36994"),
  listings: UNSPLASH("photo-1600585154340-be6161a56a0c"),
  auth: UNSPLASH("photo-1522871465649-53a34924fdcc"),
  cta: UNSPLASH("photo-1564013799919-ab600027ffc6"),
  homeCarousel: [
    UNSPLASH("photo-1522708323590-d24dbb6b0267"),
    UNSPLASH("photo-1568605114967-8130f3a36994"),
    UNSPLASH("photo-1600585154340-be6161a56a0c"),
    UNSPLASH("photo-1570129477492-45c003edd2be"),
    UNSPLASH("photo-1560448204-e02f11c3d0e2"),
  ],
} as const;

const FADE_MS = 2000;

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
    const next = slides[(index + 1) % slides.length];
    const img = new window.Image();
    img.src = next;
  }, [index, slides]);

  useEffect(() => {
    if (slides.length <= 1 || reduceMotion) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, slideInterval);
    return () => window.clearInterval(id);
  }, [slides.length, reduceMotion, slideInterval]);

  if (slides.length <= 1) {
    return (
      <Image
        src={slides[0]}
        alt=""
        fill
        priority
        className={cn("object-cover object-center", !reduceMotion && "hero-kenburns")}
        sizes="100vw"
      />
    );
  }

  return (
    <>
      <div className="absolute inset-0" aria-hidden>
        {slides.map((src, i) => (
          <div
            key={src}
            className={cn(
              "absolute inset-0 overflow-hidden",
              reduceMotion
                ? i === index
                  ? "opacity-100 z-10"
                  : "opacity-0 z-0 pointer-events-none"
                : cn(
                    "transition-opacity",
                    i === index ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                  )
            )}
            style={
              reduceMotion
                ? undefined
                : {
                    transitionDuration: `${FADE_MS}ms`,
                    transitionTimingFunction: "cubic-bezier(0.25, 0.1, 0.25, 1)",
                  }
            }
          >
            <Image
              src={src}
              alt=""
              fill
              priority
              className={cn(
                "object-cover object-center",
                !reduceMotion && i === index && "hero-kenburns"
              )}
              sizes="100vw"
            />
          </div>
        ))}
      </div>

      <div className="absolute bottom-6 right-6 z-20 flex items-center gap-2">
        {slides.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Photo ${i + 1}`}
            className={cn(
              "h-1.5 rounded-full transition-all duration-500",
              i === index ? "w-6 bg-white" : "w-1.5 bg-white/40 hover:bg-white/70"
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
  slideInterval = 7000,
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
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
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
          <div className="hero-copy max-w-3xl mx-auto">{children}</div>
        ) : (
          <div className="hero-copy max-w-3xl md:max-w-5xl">{children}</div>
        )}
      </div>
    </section>
  );
}
