// ─────────────────────────────────────────────────────────────────────────────
// components/Navbar.tsx
// Fixed top nav. Transparent at top → solid ink after 60px scroll.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';
import logoSrc from '../assets/vtis-logo-new.png';
import { NAV_LINKS } from '../constants';

interface NavbarProps { onApply: () => void; }

export default function Navbar({ onApply }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-vtis-ink shadow-lg shadow-vtis-ink/20' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between h-16">

        {/* Logo */}
        <a href="#" className="flex-shrink-0 flex items-center gap-2.5">
          <img src={logoSrc} alt="VTIS logo" className="h-8 w-auto" />
          <span className="font-display font-bold text-white text-lg tracking-tight leading-none">
            VTIS <span className="text-vtis-gold">2026</span>
          </span>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link}
              href={link === 'Home' ? '#' : `#${link.toLowerCase().replace(/\s+/g, '-')}`}
              className="type-label text-white/65 hover:text-white transition-colors duration-200"
            >
              {link}
            </a>
          ))}
        </div>

        {/* Desktop CTA */}
        <button
          onClick={onApply}
          className="hidden md:inline-flex btn btn-primary-light text-sm px-5 py-2"
        >
          Apply Now
        </button>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-white p-2 -mr-2"
          aria-label="Toggle navigation menu"
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            {menuOpen
              ? <path d="M4 4L18 18M18 4L4 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              : <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            }
          </svg>
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-vtis-ink border-t border-white/10 px-6 pb-6 pt-4 flex flex-col gap-4">
          {NAV_LINKS.map((link) => (
            <a
              key={link}
              href={link === 'Home' ? '#' : `#${link.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => setMenuOpen(false)}
              className="type-label text-white/65 hover:text-white transition-colors py-1"
            >
              {link}
            </a>
          ))}
          <button
            onClick={() => { setMenuOpen(false); onApply(); }}
            className="mt-2 btn btn-primary-light text-sm justify-center"
          >
            Apply Now
          </button>
        </div>
      )}
    </nav>
  );
}
