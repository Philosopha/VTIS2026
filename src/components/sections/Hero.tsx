// ─────────────────────────────────────────────────────────────────────────────
// components/sections/Hero.tsx — Full-screen crossfade image slider
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef } from 'react';
import slide1 from '../../assets/VTIS 14.jpg';
import slide2 from '../../assets/VTIS 4.JPG';
import slide3 from '../../assets/VTIS 5.JPG';
import slide4 from '../../assets/VTIS 9.JPG';
import slide5 from '../../assets/VTIS 1.JPG';
import slide6 from '../../assets/VTIS 11.jpg';

const SLIDES        = [slide1, slide2, slide3, slide4, slide5, slide6];
const SLIDE_DURATION = 5000;
const FADE_MS        = 900;

interface HeroProps { onApply: () => void; }

export default function Hero({ onApply }: HeroProps) {
  const [current, setCurrent] = useState(0);
  const [prev,    setPrev]    = useState<number | null>(null);
  const [paused,  setPaused]  = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const goTo = useCallback((index: number) => {
    if (index === current) return;
    setPrev(current);
    setCurrent(index);
    setTimeout(() => setPrev(null), FADE_MS);
  }, [current]);

  const next = useCallback(() => goTo((current + 1) % SLIDES.length), [current, goTo]);
  const back = useCallback(() => goTo((current - 1 + SLIDES.length) % SLIDES.length), [current, goTo]);

  useEffect(() => {
    if (paused || prefersReduced) return;
    timerRef.current = setTimeout(next, SLIDE_DURATION);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [current, paused, prefersReduced, next]);

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
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Hero image slider"
    >
      {/* ── Slide images ───────────────────────────────────────────────── */}
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
              transition: prefersReduced ? 'none' : `opacity ${FADE_MS}ms ease-in-out`,
            }}
          />
        );
      })}

      {/* ── Overlays — three-layer system for text legibility ──────────── */}
      {/* 1. Base tint */}
      <div className="absolute inset-0" style={{ background: 'rgba(5,10,30,0.48)', zIndex: 2 }} />
      {/* 2. Bottom-up gradient grounds the text block */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(5,10,30,0.97) 0%, rgba(5,10,30,0.50) 40%, rgba(5,10,30,0.05) 100%)', zIndex: 2 }} />
      {/* 3. Left directional fade frames the headline */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(5,10,30,0.72) 0%, rgba(5,10,30,0.18) 55%, transparent 100%)', zIndex: 2 }} />

      {/* ── Tricolour top accent ────────────────────────────────────────── */}
      <div className="absolute top-0 left-0 right-0 h-[3px] flex" style={{ zIndex: 10 }}>
        <div className="flex-1 bg-vtis-pink" />
        <div className="flex-1 bg-vtis-blue" />
        <div className="flex-1 bg-vtis-gold" />
      </div>

      {/* ── Arrow controls ──────────────────────────────────────────────── */}
      {(['back', 'next'] as const).map((dir) => (
        <button
          key={dir}
          onClick={() => manualNav(dir === 'back' ? back : next)}
          aria-label={dir === 'back' ? 'Previous slide' : 'Next slide'}
          className={`absolute top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full
                      flex items-center justify-center
                      bg-white/10 border border-white/20
                      hover:bg-white/20 hover:border-white/40
                      backdrop-blur-sm transition-all duration-200
                      ${dir === 'back' ? 'left-4 md:left-8' : 'right-4 md:right-8'}`}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            {dir === 'back'
              ? <path d="M10 3L5 8l5 5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              : <path d="M6 3l5 5-5 5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            }
          </svg>
        </button>
      ))}

      {/* ── Hero content ────────────────────────────────────────────────── */}
      <div className="relative max-w-7xl mx-auto px-6 lg:px-10 pb-28 md:pb-36 pt-32 w-full" style={{ zIndex: 5 }}>

        <p className="type-label text-vtis-blue mb-5">
          Volta Tech &amp; Innovation Summit 2026
        </p>

        <h1 className="font-display font-bold text-white type-hero mb-6">
          Where the Volta{' '}
          <span className="text-vtis-gold">Region</span>
          <br />builds what's next.
        </h1>

        <p className="type-body-lg text-white/70 max-w-lg mb-2">
          Join students, founders, innovators, investors, and policymakers in Ho
          for a summit where ideas meet opportunity.
        </p>

        <p className="text-white/40 text-sm mb-10 tracking-wide">
          [Summit dates] · [Venue], Ho, Volta Region
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <button onClick={onApply} className="btn btn-primary-light">
            Apply Now →
          </button>
          <a
            href="#about"
            className="text-white/60 hover:text-white text-sm font-medium transition-colors flex items-center gap-1.5"
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
              width:  i === current ? '24px' : '7px',
              height: '7px',
              background: i === current ? '#ffffff' : 'rgba(255,255,255,0.30)',
            }}
          />
        ))}
      </div>
    </section>
  );
}
