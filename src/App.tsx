// ─────────────────────────────────────────────────────────────────────────────
// App.tsx — Root application component
//
// This file is intentionally kept thin. It owns only:
//   1. The registration modal open/close state
//   2. The page layout — composing every section in render order
//
// To find any specific section, navigate to the file listed below.
//
// PROJECT STRUCTURE
// ─────────────────
// src/
// ├── types/
// │   └── index.ts              ← Shared TypeScript types (FormState, etc.)
// ├── constants/
// │   └── index.ts              ← All static data (nav links, stats, programme days, etc.)
// ├── assets/                   ← Images (logo, conference photo)
// ├── components/
// │   ├── Navbar.tsx            ← Fixed top navigation bar (desktop + mobile)
// │   ├── RegistrationModal.tsx ← Registration form modal + success screen
// │   └── sections/
// │       ├── Hero.tsx          ← Full-screen hero with headline and CTAs
// │       ├── About.tsx         ← Summit overview and organiser info
// │       ├── StatsStrip.tsx    ← Key metrics from the 2025 maiden edition
// │       ├── StrongStart.tsx   ← Recap of December 2025 edition
// │       ├── WhatsNew.tsx      ← New 2026 feature cards
// │       ├── WhoItsFor.tsx     ← Audience chip tags
// │       ├── Programme.tsx     ← Three-day programme preview cards
// │       └── Footer.tsx        ← Site footer (image card with CTA)
// ├── App.tsx                   ← ← YOU ARE HERE
// ├── main.tsx                  ← React entry point
// └── index.css                 ← Tailwind v4 import + global theme tokens
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';

// Layout
import Navbar            from './components/Navbar';
import RegistrationModal from './components/RegistrationModal';

// Page sections (top → bottom)
import Hero        from './components/sections/Hero';
import About       from './components/sections/About';
import StatsStrip  from './components/sections/StatsStrip';
import StrongStart from './components/sections/StrongStart';
import WhatsNew    from './components/sections/WhatsNew';
import WhoItsFor   from './components/sections/WhoItsFor';
import Programme   from './components/sections/Programme';
import Footer      from './components/sections/Footer';

export default function App() {
  const [modalOpen, setModalOpen] = useState(false);

  const openModal  = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  return (
    <div className="bg-vtis-dark min-h-screen">

      {/* ── Navigation ───────────────────────────────────────────────────── */}
      <Navbar onApply={openModal} />

      {/* ── Page sections (scroll order) ─────────────────────────────────── */}
      <Hero        onApply={openModal} />
      <About />
      <StatsStrip />
      <StrongStart />
      <WhatsNew />
      <WhoItsFor />
      <Programme />
      <Footer      onApply={openModal} />

      {/* ── Registration modal (portal-style overlay) ────────────────────── */}
      {modalOpen && <RegistrationModal onClose={closeModal} />}

    </div>
  );
}
