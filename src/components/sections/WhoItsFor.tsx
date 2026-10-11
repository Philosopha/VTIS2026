// ─────────────────────────────────────────────────────────────────────────────
// components/sections/WhoItsFor.tsx — Surface: vtis-surface (alternating)
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
    <section className="section-pad bg-vtis-surface">
      <div className="max-w-3xl mx-auto px-6 lg:px-10 text-center">

        {/* Label + headline */}
        <div ref={headingRef as React.RefObject<HTMLDivElement>} className="anim fade-up mb-12">
          <p className="type-label text-vtis-muted mb-5">Who attends</p>
          <h2 className="font-display font-bold text-vtis-ink type-h2 mb-5">
            If you're building, learning,<br />
            or backing the future —<br />
            you belong here.
          </h2>
          <p className="type-body text-vtis-muted max-w-sm mx-auto">
            VTIS 2026 is for every voice in the innovation ecosystem.
          </p>
        </div>

        {/* Chips */}
        <div
          ref={tagsRef as React.RefObject<HTMLDivElement>}
          className="anim fade-up delay-2 flex flex-wrap justify-center gap-3"
        >
          {AUDIENCE.map((label) => (
            <span
              key={label}
              className="px-5 py-2.5 bg-white border border-vtis-border rounded-full
                         text-vtis-text text-sm font-medium
                         hover:bg-vtis-ink hover:text-white hover:border-vtis-ink
                         transition-colors duration-200 cursor-default select-none"
            >
              {label}
            </span>
          ))}
        </div>

      </div>
    </section>
  );
}
