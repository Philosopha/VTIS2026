// ─────────────────────────────────────────────────────────────────────────────
// hooks/useInView.ts
//
// Scroll-triggered animation hook.
//
// USAGE
// ─────
//   const ref = useInView();
//   <div ref={ref} className="anim fade-up">...</div>
//
// When the element enters the viewport the hook adds the `in-view` class,
// which triggers the CSS animation defined in index.css.
// Once triggered the observer disconnects so the animation only fires once.
//
// STAGGER CHILDREN
//   <div ref={ref} className="anim fade-up delay-1">child 1</div>
//   <div ref={ref} className="anim fade-up delay-2">child 2</div>
//   (each element gets its own ref call)
//
// THRESHOLD / MARGIN
//   Pass options to control when the observer fires:
//   const ref = useInView({ threshold: 0.2, rootMargin: '0px 0px -60px 0px' });
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef } from 'react';

interface UseInViewOptions {
  /** 0–1: fraction of element visible before triggering (default 0.15) */
  threshold?: number;
  /** CSS margin around the root — negative bottom value triggers earlier (default '-40px') */
  rootMargin?: string;
}

export function useInView(options?: UseInViewOptions) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('in-view');
          observer.disconnect(); // fire once only
        }
      },
      {
        threshold: options?.threshold ?? 0.15,
        rootMargin: options?.rootMargin ?? '0px 0px -40px 0px',
      },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [options?.threshold, options?.rootMargin]);

  return ref as React.RefObject<HTMLElement>;
}
