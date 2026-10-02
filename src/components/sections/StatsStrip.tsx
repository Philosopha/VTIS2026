// ─────────────────────────────────────────────────────────────────────────────
// components/sections/StatsStrip.tsx
//
// Each stat counts up from 0 to its target number when it scrolls into view.
// The suffix (e.g. "+") and formatting (comma separator for 44,000) are
// preserved. Animation duration is 1.6 s with an ease-out curve.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react';
import { useInView } from '../../hooks/useInView';
import { STATS } from '../../constants';

const STAT_COLORS = ['text-vtis-pink', 'text-vtis-blue', 'text-vtis-gold', 'text-vtis-ink'] as const;

/** Parse a stat value string into its numeric part and suffix string.
 *  e.g. "44,000+" → { target: 44000, suffix: "+", format: "comma" }
 *       "160"     → { target: 160,   suffix: "",  format: "plain" }
 */
function parseStat(value: string): { target: number; suffix: string; comma: boolean } {
  const suffix = value.endsWith('+') ? '+' : '';
  const digits = value.replace(/,/g, '').replace('+', '');
  const target = parseInt(digits, 10);
  const comma  = value.includes(',');
  return { target, suffix, comma };
}

function formatNumber(n: number, comma: boolean): string {
  if (!comma) return String(n);
  return n.toLocaleString('en-US');
}

/** Easing: ease-out quad */
function easeOut(t: number): number {
  return 1 - (1 - t) * (1 - t);
}

const DURATION = 1600; // ms

interface CountUpProps {
  value: string;
  color: string;
  delay: number; // ms
}

function CountUp({ value, color, delay }: CountUpProps) {
  const { target, suffix, comma } = parseStat(value);
  const [display, setDisplay] = useState(0);
  const hasRun = useRef(false);
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasRun.current) {
          hasRun.current = true;
          observer.disconnect();

          // Wait for the stagger delay then start counting
          setTimeout(() => {
            const start = performance.now();
            const tick = (now: number) => {
              const elapsed = now - start;
              const progress = Math.min(elapsed / DURATION, 1);
              const eased = easeOut(progress);
              setDisplay(Math.round(eased * target));
              if (progress < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          }, delay);
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, delay]);

  return (
    <span ref={containerRef}>
      <span
        className={`font-display font-bold ${color}`}
        style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', lineHeight: 1 }}
      >
        {formatNumber(display, comma)}{suffix}
      </span>
    </span>
  );
}

export default function StatsStrip() {
  const sectionRef = useInView({ threshold: 0.1 });

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="anim fade-in py-16 bg-vtis-surface border-y border-vtis-border"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
          {STATS.map((stat, i) => (
            <div
              key={i}
              className="text-center md:text-left md:border-r md:border-vtis-border last:border-0 md:pr-8"
            >
              <CountUp
                value={stat.value}
                color={STAT_COLORS[i]}
                delay={i * 120}
              />
              <p className="text-vtis-muted text-sm leading-snug mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
