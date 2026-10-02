// ─────────────────────────────────────────────────────────────────────────────
// components/sections/Hero.tsx
//
// Full-screen image slider hero.
//
// BEHAVIOUR
// ─────────
// • Images crossfade every 5 s automatically (pauses on hover / user interaction)
// • Left / right arrow controls for manual navigation
// • Dot indicators at the bottom show the active slide
// • Respects prefers-reduced-motion — disables auto-advance + crossfade
//
// OVERLAY SYSTEM
// ──────────────
// Three stacked layers sit on top of each image:
//   1. Flat blue-black base tint     → mutes busy backgrounds
//   2. Bottom-up gradient            → grounds the text block
//   3. Left-side directional fade    → frames the left-aligned headline
//
// ADDING / REMOVING IMAGES
// ────────────────────────
// Edit the SLIDES array below — no other changes needed.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef } from 'react';

// ── Slide images ──────────────────────────────────────────────────────────────
import slide1 from '../../assets/VTIS 14.jpg';
import slide2 from '../../assets/VTIS 4.JPG';
import slide3 from '../../assets/VTIS 5.JPG';
import slide4 from '../../assets/VTIS 9.JPG';
import slide5 from '../../assets/VTIS 1.JPG';
import slide6 from '../../assets/VTIS 11.jpg';

const SLIDES = [slide1, slide2, slide3, slide4, slide5, slide6];

/** How long each slide is shown before auto-advancing (ms) */
const SLIDE_DURATION = 5000;

/** Crossfade transition duration — must match the CSS transition below */
const FADE_DURATION_MS = 900;

interface HeroProps {
  onApply: () => void;
}

export default function Hero({ onApply }: HeroProps) {
  const [current, setCurrent]         = useState(0);
  const [prev, setPrev]               = useState<number | null>(null);
  const [fading, setFading]           = useState(false);
  const [paused, setPaused]           = useState(false);
  const timerRef                      = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Detect prefers-reduced-motion
  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Slide transition ────────────────────────────────────────────────────────
  const goTo = useCallback(
    (index: number) => {
      if (index === current) return;
      setPrev(current);
      setFading(true);
      setCurrent(index);
      // Clear the "previous" image after the fade completes
      setTimeout(() => {
        setPrev(null);
        setFading(false);
      }, FADE_DURATION_MS);
    },
    [current],
  );

  const next = useCallback(() => goTo((current + 1) % SLIDES.length), [current, goTo]);
  const back = useCallback(() => goTo((current - 1 + SLIDES.length) % SLIDES.length), [current, goTo]);

  // ── Auto-advance ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (paused || prefersReduced) return;
    timerRef.current = setTimeout(next, SLIDE_DURATION);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [current, paused, prefersReduced, next]);

  // Pause on hover / touch
  const handleMouseEnter = () => setPaused(true);
  const handleMouseLeave = () => setPaused(false);

  // Resume after a manual nav interaction (gives the user time to look)
  const manualNav = (fn: () => void) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPaused(true);
    fn();
    setTimeout(() => setPaused(false), SLIDE_DURATION);
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col justify-end overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-label="Hero image slider"
    >

      {/* ── Slide images (crossfade stack) ──────────────────────────────── */}
      {SLIDES.map((src, i) => {
        const isActive = i === current;
        const isPrev   = i === prev;
        if (!isActive && !isPrev) return null;

        return (
          <img
            key={src}
            src={src}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover object-center"
            style={{
              zIndex: isActive ? 1 : 0,
              opacity: isActive ? 1 : 0,
              transition: prefersReduced
                ? 'none'
                : `opacity ${FADE_DURATION_MS}ms ease-in-out`,
            }}
          />
        );
      })}

      {/* ── Overlay 1: flat blue-black tint ─────────────────────────────── */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(5, 10, 30, 0.52)', zIndex: 2 }}
      />

      {/* ── Overlay 2: bottom-up gradient for text legibility ───────────── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to top, rgba(5,10,30,0.96) 0%, rgba(5,10,30,0.55) 45%, rgba(5,10,30,0.08) 100%)',
          zIndex: 2,
        }}
      />

      {/* ── Overlay 3: left-side directional fade ───────────────────────── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to right, rgba(5,10,30,0.75) 0%, rgba(5,10,30,0.20) 55%, transparent 100%)',
          zIndex: 2,
        }}
      />

      {/* ── Top tricolour accent line ────────────────────────────────────── */}
      <div className="absolute top-0 left-0 right-0 h-1 flex" style={{ zIndex: 10 }}>
        <div className="flex-1 bg-vtis-pink" />
        <div className="flex-1 bg-vtis-blue" />
        <div className="flex-1 bg-vtis-gold" />
      </div>

      {/* ── Left / right arrow controls ─────────────────────────────────── */}
      <button
        onClick={() => manualNav(back)}
        aria-label="Previous slide"
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20
                   w-11 h-11 rounded-full flex items-center justify-center
                   bg-white/10 border border-white/20
                   hover:bg-white/20 hover:border-white/40
                   backdrop-blur-sm transition-all duration-200"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M11 4L6 9l5 5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <button
        onClick={() => manualNav(next)}
        aria-label="Next slide"
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20
                   w-11 h-11 rounded-full flex items-center justify-center
                   bg-white/10 border border-white/20
                   hover:bg-white/20 hover:border-white/40
                   backdrop-blur-sm transition-all duration-200"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M7 4l5 5-5 5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* ── Hero content ────────────────────────────────────────────────── */}
      <div
        className="relative max-w-7xl mx-auto px-6 lg:px-10 pb-28 md:pb-36 pt-32 w-full"
        style={{ zIndex: 5 }}
      >
        <p className="text-vtis-blue text-xs font-semibold tracking-[0.2em] uppercase mb-4">
          Volta Tech &amp; Innovation Summit 2026
        </p>

        <h1
          className="font-display font-bold text-white mb-6 leading-tight"
          style={{ fontSize: 'clamp(2.8rem, 7vw, 6rem)' }}
        >
          Where the Volta{' '}
          <span className="text-vtis-gold">Region</span>
          <br />builds what's next.
        </h1>

        <p className="text-white/75 text-base md:text-lg leading-relaxed max-w-xl mb-2">
          Join students, founders, innovators, investors, and policymakers in Ho for a summit where ideas meet opportunity.
        </p>

        {/* TODO: Replace placeholders with confirmed date and venue */}
        <p className="text-white/45 text-sm mb-10">
          [Summit dates] · [Venue], Ho, Volta Region
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={onApply}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-vtis-ink font-semibold text-base hover:bg-vtis-surface transition-all duration-200 rounded-sm shadow-lg shadow-black/30"
          >
            Apply Now →
          </button>
          <a
            href="#about"
            className="text-white/70 hover:text-white text-sm font-medium transition-colors flex items-center gap-1.5"
          >
            Learn more ↓
          </a>
        </div>
      </div>

      {/* ── Dot indicators ──────────────────────────────────────────────── */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2"
        style={{ zIndex: 10 }}
        role="tablist"
        aria-label="Slide indicators"
      >
        {SLIDES.map((_, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={i === current}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => manualNav(() => goTo(i))}
            className="transition-all duration-300 rounded-full"
            style={{
              width:  i === current ? '28px' : '8px',
              height: '8px',
              background: i === current ? '#ffffff' : 'rgba(255,255,255,0.35)',
            }}
          />
        ))}
      </div>

    </section>
  );
}
