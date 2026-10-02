// ─────────────────────────────────────────────────────────────────────────────
// components/sections/WhoItsFor.tsx
// ─────────────────────────────────────────────────────────────────────────────

import { useInView } from '../../hooks/useInView';

const AUDIENCE = [
  'Students',
  'Entrepreneurs',
  'Innovators',
  'Industry Leaders',
  'Policymakers',
  'Startups',
  'Institutions',
  'Sponsors',
];

export default function WhoItsFor() {
  const headingRef = useInView();
  const tagsRef    = useInView();

  return (
    <section className="py-24 md:py-32" style={{ backgroundColor: '#f5f6fa' }}>
      <div className="max-w-3xl mx-auto px-6 lg:px-10 text-center">

        {/* Label + headline */}
        <div
          ref={headingRef as React.RefObject<HTMLDivElement>}
          className="anim fade-up mb-10"
        >
          <p className="text-vtis-muted text-xs font-semibold tracking-[0.25em] uppercase mb-5">
            Who attends
          </p>
          <h2
            className="font-display font-bold text-vtis-ink leading-tight mb-4"
            style={{ fontSize: 'clamp(2rem, 4.5vw, 3.2rem)' }}
          >
            If you're building, learning,<br />
            or backing the future <br />
            you belong here.
          </h2>
          <p className="text-vtis-muted text-base max-w-sm mx-auto">
            VTIS 2026 is for every voice in the innovation ecosystem.
          </p>
        </div>

        {/* Tags */}
        <div
          ref={tagsRef as React.RefObject<HTMLDivElement>}
          className="anim fade-up delay-2 flex flex-wrap justify-center gap-2.5"
        >
          {AUDIENCE.map((label, i) => (
            <span
              key={label}
              className="px-5 py-2.5 bg-white border border-vtis-border rounded-full
                         text-vtis-ink text-sm font-medium tracking-wide
                         hover:bg-vtis-ink hover:text-white hover:border-vtis-ink
                         transition-all duration-200 cursor-default"
              style={{ transitionDelay: `${i * 30}ms` }}
            >
              {label}
            </span>
          ))}
        </div>

      </div>
    </section>
  );
}
