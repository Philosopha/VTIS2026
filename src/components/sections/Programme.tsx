// ─────────────────────────────────────────────────────────────────────────────
// components/sections/Programme.tsx
// ─────────────────────────────────────────────────────────────────────────────

import { useInView } from '../../hooks/useInView';
import { PROGRAMME_DAYS } from '../../constants';

export default function Programme() {
  const headingRef = useInView();
  const c0 = useInView(); const c1 = useInView(); const c2 = useInView();
  const cardRefs = [c0, c1, c2];

  return (
    <section id="programme" className="py-24 md:py-32" style={{ backgroundColor: '#f0f2f8' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10">

        {/* Header */}
        <div
          ref={headingRef as React.RefObject<HTMLDivElement>}
          className="anim fade-up mb-14"
        >
          <p className="text-vtis-muted text-xs font-semibold tracking-[0.2em] uppercase mb-3">
            Programme Preview
          </p>
          <h2
            className="font-display font-bold text-vtis-ink leading-tight"
            style={{ fontSize: 'clamp(2.2rem, 4vw, 3.5rem)' }}
          >
            Three days. One momentum.
          </h2>
        </div>

        {/* 3-column card grid */}
        <div className="grid md:grid-cols-3 gap-5">
          {PROGRAMME_DAYS.map((day, i) => (
            <div
              key={day.day}
              ref={cardRefs[i] as React.RefObject<HTMLDivElement>}
              className={`anim fade-up delay-${i + 1}`}
            >
              {/* Card — Day 1 gets dark ink treatment, Days 2 & 3 stay light */}
              <div
                className={`relative overflow-hidden rounded-2xl flex flex-col
                            transition-all duration-300 group
                            ${i === 0
                              ? 'bg-vtis-ink text-white shadow-xl shadow-vtis-ink/25 hover:shadow-2xl hover:shadow-vtis-ink/35'
                              : 'bg-white border border-vtis-border shadow-sm hover:shadow-md hover:border-vtis-ink/20'
                            }`}
              >
                {/* Ghost day number watermark */}
                <span
                  aria-hidden="true"
                  className={`absolute -bottom-4 -right-3 font-display font-bold leading-none select-none pointer-events-none
                              ${i === 0 ? 'text-white/[0.06]' : 'text-vtis-ink/[0.05]'}`}
                  style={{ fontSize: '9rem' }}
                >
                  {i + 1}
                </span>

                <div className="relative p-8 flex flex-col flex-1 min-h-[280px]">

                  {/* Top row: day pill + badge */}
                  <div className="flex items-center justify-between mb-6">
                    <span
                      className={`text-xs font-bold tracking-[0.2em] uppercase px-3 py-1.5 rounded-full
                                  ${i === 0
                                    ? 'bg-white/15 text-white/90'
                                    : 'bg-vtis-surface text-vtis-muted'}`}
                    >
                      {day.day}
                    </span>
                    <span
                      className={`text-xs font-semibold px-3 py-1.5 rounded-full border
                                  ${i === 0
                                    ? 'border-white/20 text-white/70 bg-transparent'
                                    : day.badgeColor}`}
                    >
                      {day.badge}
                    </span>
                  </div>

                  {/* Title */}
                  <h3
                    className={`font-display font-bold leading-tight mb-4
                                ${i === 0 ? 'text-white' : 'text-vtis-ink'}`}
                    style={{ fontSize: '1.6rem' }}
                  >
                    {day.name}
                  </h3>

                  {/* Divider */}
                  <div className={`w-10 h-px mb-5 ${i === 0 ? 'bg-white/25' : 'bg-vtis-border'}`} />

                  {/* Body */}
                  <p
                    className={`text-sm leading-relaxed mt-auto
                                ${i === 0 ? 'text-white/65' : 'text-vtis-muted'}`}
                  >
                    {day.body}
                  </p>

                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8 text-vtis-muted/60 text-sm text-center">
          Day 1 seats are limited and require prior approval to attend.
        </p>

      </div>
    </section>
  );
}
