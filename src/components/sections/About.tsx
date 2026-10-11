// ─────────────────────────────────────────────────────────────────────────────
// components/sections/About.tsx — Surface: white (bg-vtis-dark)
// ─────────────────────────────────────────────────────────────────────────────

import { useInView } from '../../hooks/useInView';

export default function About() {
  const leftRef  = useInView();
  const rightRef = useInView();

  return (
    <section id="about" className="section-pad-lg bg-vtis-dark">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid md:grid-cols-2 gap-12 md:gap-24 items-start">

          {/* Left — headline */}
          <div ref={leftRef as React.RefObject<HTMLDivElement>} className="anim slide-left">
            <p className="type-label text-vtis-muted mb-5">About the summit</p>
            <h2 className="font-display font-bold text-vtis-text type-h2">
              One summit.<br />One region.<br />
              <span className="text-vtis-gold">A bigger future.</span>
            </h2>
          </div>

          {/* Right — body copy */}
          <div ref={rightRef as React.RefObject<HTMLDivElement>} className="anim slide-right md:pt-14">
            <p className="type-body-lg text-vtis-muted mb-8 leading-relaxed">
              The Volta Tech &amp; Innovation Summit brings together the people shaping
              Ghana's technology and innovation landscape. It connects education,
              industry, entrepreneurship, and public policy — so great ideas leave
              the room with the right people behind them.
            </p>
            <div className="border-l-2 border-vtis-ink/15 pl-5">
              <p className="text-vtis-muted text-sm leading-relaxed">
                Organized by{' '}
                <span className="text-vtis-ink font-semibold">Confluence</span>,
                a Ghana-based organisation focused on Systems Thinking and
                Systems Design.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
