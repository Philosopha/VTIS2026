// ─────────────────────────────────────────────────────────────────────────────
// components/sections/Programme.tsx — Surface: vtis-surface2 (alternating)
// ─────────────────────────────────────────────────────────────────────────────

import { useInView } from '../../hooks/useInView';
import { PROGRAMME_DAYS } from '../../constants';

export default function Programme() {
  const headingRef = useInView();
  const cardRefs   = [useInView(), useInView(), useInView()];

  return (
    <section id="programme" className="section-pad bg-vtis-surface2">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">

        {/* Header */}
        <div ref={headingRef as React.RefObject<HTMLDivElement>} className="anim fade-up mb-14">
          <p className="type-label text-vtis-muted mb-4">Programme Preview</p>
          <h2 className="font-display font-bold text-vtis-ink type-h2">
            Three days. One momentum.
          </h2>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-5">
          {PROGRAMME_DAYS.map((day, i) => (
            <div
              key={day.day}
              ref={cardRefs[i] as React.RefObject<HTMLDivElement>}
              className={`anim fade-up delay-${i + 1}`}
            >
              <div
                className={`relative overflow-hidden rounded-2xl flex flex-col
                            transition-all duration-300 group h-full
                            ${i === 0
                              ? 'bg-vtis-ink text-white shadow-xl shadow-vtis-ink/20 hover:shadow-2xl hover:shadow-vtis-ink/30'
                              : 'bg-white border border-vtis-border shadow-sm hover:shadow-md hover:border-vtis-ink/20'
                            }`}
              >
                {/* Watermark number */}
                <span
                  aria-hidden="true"
                  className={`absolute -bottom-4 -right-2 font-display font-bold
                              leading-none select-none pointer-events-none
                              ${i === 0 ? 'text-white/[0.05]' : 'text-vtis-ink/[0.04]'}`}
                  style={{ fontSize: '8rem' }}
                >
                  {i + 1}
                </span>

                <div className="relative p-8 flex flex-col flex-1 min-h-[280px]">

                  {/* Top row */}
                  <div className="flex items-center justify-between mb-7">
                    <span className={`type-label px-3 py-1.5 rounded-full
                                      ${i === 0
                                        ? 'bg-white/12 text-white/80'
                                        : 'bg-vtis-surface text-vtis-muted'}`}>
                      {day.day}
                    </span>
                    <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border
                                      ${i === 0
                                        ? 'border-white/20 text-white/60'
                                        : day.badgeColor}`}>
                      {day.badge}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className={`font-display font-bold type-h3 mb-4
                                  ${i === 0 ? 'text-white' : 'text-vtis-ink'}`}>
                    {day.name}
                  </h3>

                  {/* Divider */}
                  <div className={`w-8 h-px mb-5 ${i === 0 ? 'bg-white/20' : 'bg-vtis-border'}`} />

                  {/* Body */}
                  <p className={`text-sm leading-relaxed mt-auto
                                 ${i === 0 ? 'text-white/60' : 'text-vtis-muted'}`}>
                    {day.body}
                  </p>

                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8 type-label text-vtis-muted/50 text-center normal-case tracking-normal text-xs">
          Day 1 seats are limited and require prior approval to attend.
        </p>

      </div>
    </section>
  );
}
