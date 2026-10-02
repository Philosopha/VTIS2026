// ─────────────────────────────────────────────────────────────────────────────
// components/sections/About.tsx
// ─────────────────────────────────────────────────────────────────────────────

import { useInView } from '../../hooks/useInView';

export default function About() {
  const leftRef  = useInView();
  const rightRef = useInView();

  return (
    <section id="about" className="py-24 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-start">

          <div ref={leftRef as React.RefObject<HTMLDivElement>} className="anim slide-left">
            <h2
              className="font-display font-bold text-vtis-text leading-tight mb-0"
              style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.8rem)' }}
            >
              One summit.<br />One region.<br />
              <span className="text-vtis-gold font-semibold">A bigger future.</span>
            </h2>
          </div>

          <div ref={rightRef as React.RefObject<HTMLDivElement>} className="anim slide-right md:pt-6">
            <p className="text-vtis-muted text-base md:text-lg leading-relaxed mb-8">
              The Volta Tech &amp; Innovation Summit brings together the people shaping Ghana's technology and
              innovation landscape. It connects education, industry, entrepreneurship, and public policy, so
              great ideas leave the room with the right people behind them.
            </p>
            <div className="border-l-2 border-vtis-ink/20 pl-5">
              <p className="text-vtis-text/70 text-sm leading-relaxed">
                Organized by{' '}
                <span className="text-vtis-ink font-medium">Confluence</span>, a Ghana-based organization
                focused on Systems Thinking and Systems Design.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
