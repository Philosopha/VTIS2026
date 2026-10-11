// ─────────────────────────────────────────────────────────────────────────────
// components/sections/StatsStrip.tsx — Surface: vtis-surface (alternating)
// Animated count-up numbers on scroll.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react';
import { useInView } from '../../hooks/useInView';
import { STATS } from '../../constants';

const STAT_COLORS = [
  'text-vtis-pink',
  'text-vtis-blue',
  'text-vtis-gold',
  'text-vtis-ink',
] as const;

function parseStat(value: string) {
  const suffix = value.endsWith('+') ? '+' : '';
  const target = parseInt(value.replace(/,/g, '').replace('+', ''), 10);
  const comma  = value.includes(',');
  return { target, suffix, comma };
}

function formatNumber(n: number, comma: boolean): string {
  return comma ? n.toLocaleString('en-US') : String(n);
}

function easeOut(t: number) { return 1 - (1 - t) * (1 - t); }

const DURATION = 1500;

function CountUp({ value, color, delay }: { value: string; color: string; delay: number }) {
  const { target, suffix, comma } = parseStat(value);
  const [display, setDisplay]     = useState(0);
  const hasRun                    = useRef(false);
  const containerRef              = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasRun.current) {
        hasRun.current = true;
        observer.disconnect();
        setTimeout(() => {
          const start = performance.now();
          const tick = (now: number) => {
            const progress = Math.min((now - start) / DURATION, 1);
            setDisplay(Math.round(easeOut(progress) * target));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }, delay);
      }
    }, { threshold: 0.3 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, delay]);

  return (
    <span ref={containerRef}>
      <span className={`font-display font-bold ${color}`}
        style={{ fontSize: 'clamp(2.4rem, 5vw, 3.2rem)', lineHeight: 1 }}>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-4">
          {STATS.map((stat, i) => (
            <div
              key={i}
              className="text-center md:text-left md:border-r md:border-vtis-border last:border-0 md:pr-8"
            >
              <CountUp value={stat.value} color={STAT_COLORS[i]} delay={i * 100} />
              <p className="text-vtis-muted text-sm leading-snug mt-2">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
