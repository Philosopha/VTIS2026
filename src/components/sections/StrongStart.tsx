// ─────────────────────────────────────────────────────────────────────────────
// components/sections/StrongStart.tsx — Surface: vtis-surface2 (alternating)
// ─────────────────────────────────────────────────────────────────────────────

import { useInView } from '../../hooks/useInView';
import logoSrc from '../../assets/vtis logo.png';

export default function StrongStart() {
  const logoRef = useInView();
  const copyRef = useInView();

  return (
    <section id="why-attend" className="section-pad bg-vtis-surface2">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid md:grid-cols-5 gap-12 md:gap-16 items-center">

          {/* Logo */}
          <div
            ref={logoRef as React.RefObject<HTMLDivElement>}
            className="anim scale-in md:col-span-2 order-2 md:order-1
                       flex items-center justify-center md:justify-start"
          >
            <img
              src={logoSrc}
              alt="VTIS logo"
              className="w-full max-w-[260px] md:max-w-[320px] h-auto object-contain"
            />
          </div>

          {/* Copy */}
          <div
            ref={copyRef as React.RefObject<HTMLDivElement>}
            className="anim slide-right md:col-span-3 order-1 md:order-2"
          >
            <p className="type-label text-vtis-muted mb-5">Building on a strong start</p>
            <h2 className="font-display font-bold text-vtis-text type-h2 mb-6">
              We started in December 2025.<br />
              <span className="text-vtis-ink">Now we're going bigger.</span>
            </h2>
            <p className="type-body text-vtis-muted leading-relaxed">
              Our maiden edition at the University of Health and Allied Sciences (UHAS)
              in Ho drew around 200 participants — most of them young students eager to
              explore tech. The response told us the Volta Region is ready. VTIS 2026
              is our answer: a larger, bolder summit built for 500+ people.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
