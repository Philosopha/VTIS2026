// ─────────────────────────────────────────────────────────────────────────────
// components/sections/StrongStart.tsx
// ─────────────────────────────────────────────────────────────────────────────

import { useInView } from '../../hooks/useInView';
import logoSrc from '../../assets/vtis logo.png';

export default function StrongStart() {
  const logoRef = useInView();
  const copyRef = useInView();

  return (
    <section id="why-attend" className="py-24 md:py-32" style={{ backgroundColor: '#eef0f6' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid md:grid-cols-5 gap-10 md:gap-16 items-center">

          <div
            ref={logoRef as React.RefObject<HTMLDivElement>}
            className="anim scale-in md:col-span-2 order-2 md:order-1
                       flex items-center justify-center md:justify-start"
          >
            <img
              src={logoSrc}
              alt="VTIS logo"
              className="w-full max-w-xs md:max-w-sm h-auto object-contain"
            />
          </div>

          <div
            ref={copyRef as React.RefObject<HTMLDivElement>}
            className="anim slide-right md:col-span-3 order-1 md:order-2"
          >
            <p className="text-vtis-muted text-xs font-semibold tracking-[0.2em] uppercase mb-4">
              Building on a strong start
            </p>
            <h2
              className="font-display font-bold text-vtis-text leading-tight mb-6"
              style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)' }}
            >
              We started in December 2025.<br />
              <span className="text-vtis-ink">Now we're going bigger.</span>
            </h2>
            <p className="text-vtis-muted text-base leading-relaxed">
              Our maiden edition at the University of Health and Allied Sciences (UHAS) in Ho drew around
              200 participants, most of them young students eager to explore tech. The response told us the
              Volta Region is ready. VTIS 2026 is our answer: a larger, bolder summit built for 500+ people.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
