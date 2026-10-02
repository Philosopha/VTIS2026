// ─────────────────────────────────────────────────────────────────────────────
// components/sections/Footer.tsx
//
// Large rounded image-card footer.
// The container floats with padding on all sides and clips to rounded-3xl.
// A deep blue-black overlay keeps text readable while the photo shows through.
// ─────────────────────────────────────────────────────────────────────────────

import { useInView } from '../../hooks/useInView';
import footerPhoto from '../../assets/VTIS 9.JPG';

interface FooterProps {
  /** Opens the registration modal */
  onApply: () => void;
}

export default function Footer({ onApply }: FooterProps) {
  const cardRef = useInView({ threshold: 0.1 });
  return (
    <footer className="bg-white px-4 md:px-8 pb-8 pt-2">
      <div
        ref={cardRef as React.RefObject<HTMLDivElement>}
        className="anim scale-in group relative w-full overflow-hidden rounded-3xl min-h-[380px] md:min-h-[420px] flex flex-col justify-between"
      >

        {/* ── Background image ──────────────────────────────────────────── */}
        <img
          src={footerPhoto}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-[7000ms] ease-in-out group-hover:scale-105"
        />

        {/* ── Overlay layer 1: base blue-black tint ─────────────────────── */}
        <div
          className="absolute inset-0"
          style={{ background: 'rgba(8, 12, 35, 0.62)' }}
        />

        {/* ── Overlay layer 2: bottom-up gradient for text legibility ───── */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(8,12,35,0.92) 0%, rgba(8,12,35,0.40) 50%, rgba(8,12,35,0.10) 100%)' }}
        />

        {/* ── Top bar: logo + nav links ────────────────────────────────── */}
        <div className="relative z-10 flex items-center justify-between px-8 md:px-14 pt-8">
          <span className="font-display font-bold text-white text-xl tracking-tight">
            VTIS <span className="text-vtis-gold">2026</span>
          </span>
          <div className="hidden md:flex items-center gap-6 text-sm text-white/60">
            <a href="#about"     className="hover:text-white transition-colors">About</a>
            <a href="#why-attend" className="hover:text-white transition-colors">Why Attend</a>
            <a href="#programme" className="hover:text-white transition-colors">Programme</a>
            <a href="#register"  className="hover:text-white transition-colors">Register</a>
          </div>
        </div>

        {/* ── Centre: main headline + CTA ─────────────────────────────── */}
        <div className="relative z-10 flex flex-col items-center text-center px-6 md:px-16 py-10">
          {/* Label */}
          <p className="text-white/50 text-xs font-semibold tracking-[0.25em] uppercase mb-4">
            Volta Region · Ghana · 2026
          </p>

          {/* Headline — forced to two lines with a manual break */}
          <h2
            className="font-display font-bold text-white leading-tight mb-5 max-w-xl"
            style={{ fontSize: 'clamp(2rem, 4.5vw, 3.4rem)' }}
          >
            The future of the Volta Region<br />
            <span className="text-vtis-gold">starts here.</span>
          </h2>

          {/* Supporting text */}
          <p className="text-white/60 text-sm md:text-base leading-relaxed max-w-lg mb-8">
            Join 500+ innovators, students, founders, and policymakers at VTIS 2026 — where ideas become action.
          </p>

          {/* CTA */}
          <button
            onClick={onApply}
            className="inline-flex items-center gap-2 px-9 py-3.5 bg-white text-vtis-ink font-semibold text-sm rounded-sm hover:bg-vtis-surface transition-colors duration-200 shadow-xl shadow-black/30"
          >
            Apply Now →
          </button>
        </div>

        {/* ── Bottom bar: legal + tricolour mark ─────────────────────── */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3 px-8 md:px-14 pb-8">
          <p className="text-white/40 text-xs">
            © 2026 VTIS · Organized by{' '}
            <span className="text-white/70 font-medium">Confluence</span>
          </p>
          <div className="flex gap-1.5">
            <div className="w-5 h-1 bg-vtis-pink rounded-full" />
            <div className="w-5 h-1 bg-vtis-blue rounded-full" />
            <div className="w-5 h-1 bg-vtis-gold rounded-full" />
          </div>
        </div>

      </div>
    </footer>
  );
}
