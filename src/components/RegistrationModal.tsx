// ─────────────────────────────────────────────────────────────────────────────
// components/RegistrationModal.tsx
//
// Registration modal — calls POST /api/register on the backend.
// On success shows a confirmation screen with the participant's VTIS ID.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from 'react';
import type { FormState } from '../types';
import { EMPTY_FORM, PROFILE_OPTIONS } from '../constants';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const inputCls =
  'w-full bg-white border border-vtis-border rounded-sm px-4 py-3 text-vtis-text text-sm ' +
  'placeholder-vtis-muted/40 focus:outline-none focus:border-vtis-ink focus:ring-2 ' +
  'focus:ring-vtis-ink/10 transition-all duration-200';

// ── Success screen ────────────────────────────────────────────────────────────

function SuccessState({
  form,
  registrationId,
  onClose,
}: {
  form: FormState;
  registrationId: string;
  onClose: () => void;
}) {
  const attendingDays = [
    form.days.day1 && 'Day 1: Altitude Conversation',
    form.days.day2 && 'Day 2: The Gathering',
    form.days.day3 && 'Day 3: The Laboratory',
  ].filter(Boolean);

  return (
    <div className="py-4 text-center">
      {/* Check icon */}
      <div className="mx-auto mb-5 w-16 h-16 rounded-full bg-vtis-ink/8 border border-vtis-ink/20 flex items-center justify-center">
        <svg width="28" height="22" viewBox="0 0 28 22" fill="none">
          <path d="M2 11L10 19L26 2" stroke="#0b0f2e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* VTIS ID badge */}
      <div className="bg-vtis-surface border border-vtis-border rounded-sm px-6 py-4 mb-5 inline-block">
        <p className="text-vtis-muted text-xs font-semibold tracking-[0.2em] uppercase mb-1">
          Your Registration ID
        </p>
        <p className="font-display font-bold text-vtis-ink text-3xl tracking-tight">
          {registrationId}
        </p>
      </div>

      <h3 className="font-display font-bold text-vtis-text text-xl mb-2">
        You're registered, {form.firstName}!
      </h3>
      <p className="text-vtis-muted text-sm mb-6 leading-relaxed max-w-sm mx-auto">
        Your confirmation email and PDF ticket are on their way to{' '}
        <span className="text-vtis-ink font-medium">{form.email}</span>.
      </p>

      {/* Sessions */}
      <div className="bg-vtis-surface border border-vtis-border rounded-sm p-4 mb-7 text-left">
        <p className="text-vtis-muted text-xs uppercase tracking-widest font-semibold mb-3">
          Your sessions
        </p>
        {attendingDays.map((d) => (
          <div key={d as string} className="flex items-center gap-2 text-sm text-vtis-text py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-vtis-ink flex-shrink-0" />
            {d}
          </div>
        ))}
      </div>

      <button
        onClick={onClose}
        className="w-full py-3 text-sm font-semibold bg-vtis-ink text-white hover:bg-vtis-ink2 rounded-sm transition-colors"
      >
        Done
      </button>
    </div>
  );
}

// ── Registration modal ────────────────────────────────────────────────────────

export default function RegistrationModal({ onClose }: { onClose: () => void }) {
  const [form,           setForm]           = useState<FormState>(EMPTY_FORM);
  const [registrationId, setRegistrationId] = useState('');
  const [submitted,      setSubmitted]      = useState(false);
  const [loading,        setLoading]        = useState(false);
  const [apiError,       setApiError]       = useState('');
  const overlayRef = useRef<HTMLDivElement>(null);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Close on Escape
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const setDay = (key: keyof FormState['days'], val: boolean) =>
    setForm((f) => ({ ...f, days: { ...f.days, [key]: val } }));

  const isValid =
    form.firstName.trim() &&
    form.lastName.trim() &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) &&
    form.profile &&
    (form.days.day1 || form.days.day2 || form.days.day3);

  // ── Submit handler — calls the backend ──────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || loading) return;

    setLoading(true);
    setApiError('');

    try {
      const res = await fetch(`${API}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          lastName:  form.lastName.trim(),
          email:     form.email.trim().toLowerCase(),
          profile:   form.profile,
          days:      form.days,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Friendly duplicate-email message
        if (data.error === 'duplicate_email') {
          setApiError(data.message || 'This email address is already registered.');
        } else if (res.status === 429) {
          setApiError('Too many attempts. Please wait a few minutes and try again.');
        } else {
          setApiError(data.error || 'Registration failed. Please try again.');
        }
        return;
      }

      // Success
      setRegistrationId(data.registrationId);
      setSubmitted(true);
    } catch {
      setApiError('Unable to reach the server. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6"
      style={{ background: 'rgba(11,15,46,0.70)', backdropFilter: 'blur(8px)' }}
    >
      <div className="relative w-full max-w-lg bg-white border border-vtis-border rounded-sm shadow-2xl shadow-vtis-ink/20 overflow-hidden">

        {/* Top accent bar */}
        <div className="h-1 flex">
          <div className="flex-1 bg-vtis-ink" />
          <div className="flex-1 bg-vtis-blue" />
          <div className="flex-1 bg-vtis-pink" />
        </div>

        <div className="p-7 md:p-9 max-h-[88vh] overflow-y-auto">

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-vtis-muted hover:text-vtis-text transition-colors p-1"
            aria-label="Close registration modal"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M2 2L16 16M16 2L2 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          {submitted ? (
            <SuccessState form={form} registrationId={registrationId} onClose={onClose} />
          ) : (
            <>
              <div className="mb-7">
                <h2 className="font-display font-bold text-vtis-text text-2xl md:text-3xl mb-1">
                  VTIS 2026 Registration
                </h2>
                <p className="text-vtis-muted text-sm">
                  Volta Tech &amp; Innovation Summit{' '}
                  <span className="text-vtis-muted/60">· Attendee Portal</span>
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate>

                {/* Name */}
                <div className="grid grid-cols-2 gap-4 mb-5">
                  <div>
                    <label className="block text-vtis-text text-xs font-semibold mb-1.5 tracking-wide uppercase">
                      First Name
                    </label>
                    <input type="text" className={inputCls} placeholder="Ama"
                      value={form.firstName}
                      onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                      required />
                  </div>
                  <div>
                    <label className="block text-vtis-text text-xs font-semibold mb-1.5 tracking-wide uppercase">
                      Last Name
                    </label>
                    <input type="text" className={inputCls} placeholder="Mensah"
                      value={form.lastName}
                      onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                      required />
                  </div>
                </div>

                {/* Email */}
                <div className="mb-5">
                  <label className="block text-vtis-text text-xs font-semibold mb-1.5 tracking-wide uppercase">
                    Email Address
                  </label>
                  <input type="email" className={inputCls} placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => { setForm((f) => ({ ...f, email: e.target.value })); setApiError(''); }}
                    required />
                </div>

                {/* Profile */}
                <div className="mb-6">
                  <label className="block text-vtis-text text-xs font-semibold mb-0.5 tracking-wide uppercase">
                    Attendee Profile
                  </label>
                  <p className="text-vtis-gold text-xs mb-1.5 font-medium">
                    Required for TalentDot.V Matchmaking
                  </p>
                  <div className="relative">
                    <select
                      className={`${inputCls} appearance-none pr-10 cursor-pointer`}
                      value={form.profile}
                      onChange={(e) => setForm((f) => ({ ...f, profile: e.target.value }))}
                      required
                    >
                      <option value="" disabled>Select a profile…</option>
                      {PROFILE_OPTIONS.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                    <svg className="absolute right-3 top-1/2 -translate-y-1/2 text-vtis-muted pointer-events-none"
                         width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5"
                            strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>

                {/* Days */}
                <div className="mb-7">
                  <p className="text-vtis-text text-xs font-semibold mb-3 tracking-wide uppercase">
                    Select Days to Attend
                  </p>
                  <div className="flex flex-col gap-2.5">
                    {([
                      { key: 'day1' as const, label: 'Day 1: Altitude Conversation', badge: 'VIP / Approval Required', badgeColor: 'text-vtis-gold' },
                      { key: 'day2' as const, label: 'Day 2: The Gathering',         badge: 'Public',                 badgeColor: 'text-vtis-blue' },
                      { key: 'day3' as const, label: 'Day 3: The Laboratory',        badge: 'Public',                 badgeColor: 'text-vtis-pink' },
                    ] as const).map(({ key, label, badge, badgeColor }) => (
                      <label key={key}
                        className={`flex items-center gap-3.5 border rounded-sm px-4 py-3.5 cursor-pointer transition-all duration-150 ${
                          form.days[key]
                            ? 'border-vtis-ink bg-vtis-ink/5'
                            : 'border-vtis-border hover:border-vtis-ink/40 hover:bg-vtis-surface'
                        }`}
                      >
                        <span className={`flex-shrink-0 w-4 h-4 rounded-sm border flex items-center justify-center transition-colors ${
                          form.days[key] ? 'bg-vtis-ink border-vtis-ink' : 'border-vtis-border bg-transparent'
                        }`}>
                          {form.days[key] && (
                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                              <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5"
                                    strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </span>
                        <input type="checkbox" className="sr-only"
                          checked={form.days[key]}
                          onChange={(e) => setDay(key, e.target.checked)} />
                        <span className="text-vtis-text text-sm flex-1">{label}</span>
                        <span className={`text-xs font-medium ${badgeColor} hidden sm:block`}>{badge}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* API error */}
                {apiError && (
                  <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-sm text-red-700 text-sm">
                    {apiError}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={!isValid || loading}
                  className={`w-full py-3.5 text-sm font-semibold rounded-sm transition-all duration-200 ${
                    isValid && !loading
                      ? 'bg-vtis-ink text-white hover:bg-vtis-ink2 shadow-lg shadow-vtis-ink/20'
                      : 'bg-vtis-surface border border-vtis-border text-vtis-muted cursor-not-allowed'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10"
                                stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor"
                              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                      Registering…
                    </span>
                  ) : 'Submit Registration →'}
                </button>

                <p className="text-vtis-muted/50 text-xs text-center mt-3">
                  You'll receive a numbered ticket straight to your inbox.
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
