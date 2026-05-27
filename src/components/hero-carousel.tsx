"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

type Slide = {
  image: string;
  title: string;
  league: string | null;
  slug: string;
  focalX?: number | null;
  focalY?: number | null;
};

type Props = {
  slides: Slide[];
  children: React.ReactNode; // hero text/CTA content passed from server
};

export function HeroCarousel({ slides, children }: Props) {
  const [current, setCurrent] = useState(0);
  const [fading, setFading] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      if (index === current) return;
      setFading(true);
      setTimeout(() => {
        setCurrent(index);
        setFading(false);
      }, 400);
    },
    [current]
  );

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(() => {
      goTo((current + 1) % slides.length);
    }, 6000);
    return () => clearInterval(id);
  }, [current, slides.length, goTo]);

  const slide = slides[current];

  return (
    <section className="relative min-h-[600px] lg:min-h-[680px] flex items-end overflow-hidden bg-[#0d0d0d]">
      {/* Background image */}
      {slide && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={slide.image}
          src={slide.image}
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${fading ? "opacity-0" : "opacity-100"}`}
          style={{ objectPosition: `${slide.focalX ?? 50}% ${slide.focalY ?? 50}%` }}
        />
      )}

      {/* Gradient overlay — transparent top → dark bottom */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, #00000022 0%, #0A0A0Acc 55%, #0A0A0A 95%)" }}
      />

      {/* Hero content (passed from server component) */}
      <div className="relative z-10 w-full">
        {children}
      </div>

      {/* Slide indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-5 right-6 md:right-12 z-10 flex items-center gap-2">
          {slides.map((s, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}: ${s.title}`}
              className={`transition-all duration-300 rounded-sm ${
                i === current
                  ? "w-6 h-1.5 bg-vcl-gold"
                  : "w-1.5 h-1.5 bg-white/30 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      )}

      {/* Current article link — subtle corner badge */}
      {slide && (
        <Link
          href={`/articles/${slide.slug}`}
          className="absolute bottom-5 left-6 md:left-12 z-10 hidden md:flex items-center gap-2 text-[11px] text-white/50 hover:text-white/80 transition-colors"
        >
          {slide.league && (
            <span className="rounded-sm bg-vcl-gold px-1.5 py-0.5 text-[9px] font-bold tracking-widest text-vcl-gold-foreground uppercase">
              {slide.league}
            </span>
          )}
          <span className="line-clamp-1 max-w-[400px]">{slide.title}</span>
        </Link>
      )}
    </section>
  );
}
