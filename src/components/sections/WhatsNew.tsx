// ─────────────────────────────────────────────────────────────────────────────
// components/sections/WhatsNew.tsx
// ─────────────────────────────────────────────────────────────────────────────

import { useInView } from '../../hooks/useInView';
import { FEATURES } from '../../constants';

const ICONS = [
  <svg key="workshops" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085" />
  </svg>,
  <svg key="mentorship" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>,
  <svg key="pitch" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>,
  <svg key="networking" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
  </svg>,
  <svg key="communique" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>,
];

export default function WhatsNew() {
  const headingRef = useInView();
  const c0 = useInView(); const c1 = useInView(); const c2 = useInView();
  const c3 = useInView(); const c4 = useInView();
  const cardRefs = [c0, c1, c2, c3, c4];

  return (
    <section className="py-24 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">

        <div
          ref={headingRef as React.RefObject<HTMLDivElement>}
          className="anim fade-up mb-14"
        >
          <p className="text-vtis-muted text-xs font-semibold tracking-[0.2em] uppercase mb-3">
            What's new in 2026
          </p>
          <h2
            className="font-display font-bold text-vtis-text leading-tight"
            style={{ fontSize: 'clamp(2.2rem, 4vw, 3.5rem)' }}
          >
            Bigger, bolder, more impactful.
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((feature, i) => (
            <div
              key={i}
              ref={cardRefs[i] as React.RefObject<HTMLDivElement>}
              className={`anim fade-up delay-${i + 1}`}
            >
              <div className={`group relative bg-white border ${feature.border} rounded-sm p-7
                              transition-all duration-300 cursor-default shadow-sm hover:shadow-md h-full`}>
                <div className={`absolute inset-0 rounded-sm transition-colors duration-300 ${feature.glow}`} />
                <div className={`relative ${feature.color} mb-4`}>{ICONS[i]}</div>
                <h3 className="relative text-vtis-text font-semibold text-base mb-2">{feature.title}</h3>
                <p className="relative text-vtis-muted text-sm leading-relaxed">{feature.body}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
