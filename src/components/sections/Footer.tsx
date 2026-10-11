// ─────────────────────────────────────────────────────────────────────────────
// components/sections/Footer.tsx — Full-bleed image card with CTA
// ─────────────────────────────────────────────────────────────────────────────

import { useInView } from '../../hooks/useInView';
import footerPhoto from '../../assets/VTIS 9.JPG';

interface FooterProps { onApply: () => void; }

export default function Footer({ onApply }: FooterProps) {
  const cardRef = useInView({ threshold: 0.1 });

  return (
    <footer className="bg-vtis-dark px-4 md:px-8 pb-8 pt-2">
      <div
        ref={cardRef as React.RefObject<HTMLDivElement>}
        className="anim scale-in group relative w-full overflow-hidden rounded-3xl
                   min-h-[380px] md:min-h-[440px] flex flex-col justify-between"
      >

        {/* Background image */}
        <img
          src={footerPhoto}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-center
                     transition-transform duration-[8000ms] ease-in-out group-hover:scale-105"
        />

        {/* Overlay 1: base tint */}
        <div className="absolute inset-0" style={{ background: 'rgba(6,10,30,0.60)' }} />
        {/* Overlay 2: bottom-up gradient */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(6,10,30,0.96) 0%, rgba(6,10,30,0.38) 50%, rgba(6,10,30,0.08) 100%)' }} />

        {/* Top bar */}
        <div className="relative z-10 flex items-center justify-between px-8 md:px-14 pt-9">
          <span className="font-display font-bold text-white text-xl tracking-tight">
            VTIS <span className="text-vtis-gold">2026</span>
          </span>
          <div className="hidden md:flex items-center gap-7">
            {(['Home', 'About', 'Why Attend', 'Programme'] as const).map((link) => (
              <a
                key={link}
                href={link === 'Home' ? '#' : `#${link.toLowerCase().replace(/\s+/g, '-')}`}
                className="type-label text-white/50 hover:text-white transition-colors"
              >
                {link}
              </a>
            ))}
          </div>
        </div>

        {/* Centre CTA */}
        <div className="relative z-10 flex flex-col items-center text-center px-6 md:px-16 py-12">
          <p className="type-label text-white/45 mb-5">Volta Region · Ghana · 2026</p>

          <h2 className="font-display font-bold text-white type-h2 mb-5 max-w-xl leading-tight">
            The future of the Volta Region<br />
            <span className="text-vtis-gold">starts here.</span>
          </h2>

          <p className="type-body text-white/55 max-w-md mb-9">
            Join 500+ innovators, students, founders, and policymakers at VTIS 2026
            — where ideas become action.
          </p>

          <button onClick={onApply} className="btn btn-primary-light">
            Apply Now →
          </button>
        </div>

        {/* Bottom bar */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center
                        justify-between gap-3 px-8 md:px-14 pb-8">
          <p className="text-white/35 text-xs">
            © 2026 VTIS · Organized by{' '}
            <span className="text-white/60 font-medium">Confluence</span>
          </p>
          <div className="flex gap-1.5">
            <div className="w-4 h-1 bg-vtis-pink rounded-full opacity-80" />
            <div className="w-4 h-1 bg-vtis-blue rounded-full opacity-80" />
            <div className="w-4 h-1 bg-vtis-gold rounded-full opacity-80" />
          </div>
        </div>

      </div>
    </footer>
  );
}
