// ─────────────────────────────────────────────────────────────────────────────
// types/index.ts
//
// Shared TypeScript types used across components.
// Backend devs: this is the single source of truth for data shapes.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The registration form's field values.
 * Submitted by the user in the RegistrationModal.
 */
export type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  /** Attendee profile category — drives TalentDot.V matchmaking */
  profile: string;
  /** Which summit days the attendee selected */
  days: {
    day1: boolean; // Altitude Conversation (VIP / approval required)
    day2: boolean; // The Gathering (public)
    day3: boolean; // The Laboratory (public)
  };
};
