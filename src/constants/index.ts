// ─────────────────────────────────────────────────────────────────────────────
// constants/index.ts
//
// All static data used across the landing page lives here.
// Backend devs: update copy, stats, programme details, and attendee profiles
// in this file — no need to touch any component logic.
// ─────────────────────────────────────────────────────────────────────────────

import type { FormState } from '../types';

// ── Navbar ────────────────────────────────────────────────────────────────────

/** Top-level navigation links. href is auto-derived as `#link.toLowerCase()` */
export const NAV_LINKS = ['About', 'Why Attend', 'Programme', 'Register'] as const;

// ── Registration Form ─────────────────────────────────────────────────────────

/** Dropdown options for the "Attendee Profile" field in the registration form */
export const PROFILE_OPTIONS = [
  'Student',
  'Entrepreneur / Founder',
  'Innovator / Researcher',
  'Industry Leader',
  'Policymaker / Government Official',
  'Startup Representative',
  'Institution / Organization',
  'Investor',
  'Sponsor',
  'Other',
] as const;

/** Default/empty state for the registration form */
export const EMPTY_FORM: FormState = {
  firstName: '',
  lastName: '',
  email: '',
  profile: '',
  days: { day1: false, day2: false, day3: false },
};

// ── Stats Strip ───────────────────────────────────────────────────────────────

/** Key metrics displayed in the stats section */
export const STATS = [
  { value: '200+', label: 'participants at our first edition' },
  { value: '160',  label: 'students from four senior high schools' },
  { value: '44,000+', label: 'digital engagements online' },
  { value: '500+', label: 'participants expected in 2026' },
] as const;

// ── What's New ────────────────────────────────────────────────────────────────

/** Feature cards shown in the "What's New in 2026" section */
export const FEATURES = [
  {
    color: 'text-vtis-blue',
    border: 'border-vtis-border hover:border-vtis-blue/60',
    glow: 'group-hover:bg-vtis-blue/4',
    title: 'Interactive Workshops',
    body: 'Get hands-on with real technology, not just talks.',
  },
  {
    color: 'text-vtis-gold',
    border: 'border-vtis-border hover:border-vtis-gold/60',
    glow: 'group-hover:bg-vtis-gold/4',
    title: 'Mentorship & Career Clinics',
    body: "Sit down with people who've walked the path you want.",
  },
  {
    color: 'text-vtis-pink',
    border: 'border-vtis-border hover:border-vtis-pink/60',
    glow: 'group-hover:bg-vtis-pink/4',
    title: 'Startup Pitch Competition',
    body: 'Put your idea in front of the room and the people who can back it.',
  },
  {
    color: 'text-vtis-ink',
    border: 'border-vtis-border hover:border-vtis-ink/60',
    glow: 'group-hover:bg-vtis-ink/4',
    title: 'Networking',
    body: 'Meet fellow innovators, builders, and investors.',
  },
  {
    color: 'text-vtis-gold',
    border: 'border-vtis-border hover:border-vtis-gold/60',
    glow: 'group-hover:bg-vtis-gold/4',
    title: 'The VTIS Communiqué',
    body: 'Formal recommendations presented to the Volta Regional Coordinating Council and national stakeholders — so the summit leads to action.',
  },
] as const;

// ── Programme ─────────────────────────────────────────────────────────────────

/** The three summit days displayed in the Programme section */
export const PROGRAMME_DAYS = [
  {
    day: 'Day 1',
    name: 'Altitude Conversation',
    badge: 'VIP · Approval Required',
    badgeColor: 'bg-vtis-ink/8 text-vtis-ink border border-vtis-ink/20',
    body: 'An exclusive, intimate session for VIP guests. Seats are strictly limited and require prior approval. Apply early.',
  },
  {
    day: 'Day 2',
    name: 'The Gathering',
    badge: 'Open Access',
    badgeColor: 'bg-vtis-ink/5 text-vtis-muted border border-vtis-border',
    body: 'The main summit day — keynotes, panels, and conversations that bring the whole community together.',
  },
  {
    day: 'Day 3',
    name: 'The Laboratory',
    badge: 'Open Access',
    badgeColor: 'bg-vtis-ink/5 text-vtis-muted border border-vtis-border',
    body: 'Workshops, pitches, clinics, and the formal VTIS Communiqué presentation. Where ideas become action.',
  },
] as const;
