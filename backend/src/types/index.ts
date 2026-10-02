// ─────────────────────────────────────────────────────────────────────────────
// backend/src/types/index.ts — shared TypeScript types
// ─────────────────────────────────────────────────────────────────────────────

export interface Registration {
  id: string;
  registration_number: number;
  registration_id: string;       // "VTIS 01", "VTIS 02", …
  first_name: string;
  last_name: string;
  email: string;
  profile: string;
  day1: boolean;
  day2: boolean;
  day3: boolean;
  registered_at: string;
  ticket_generated: boolean;
  ticket_url: string | null;
  email_sent: boolean;
  email_sent_at: string | null;
  email_error: string | null;
  checked_in: boolean;
  checked_in_at: string | null;
}

export interface RegistrationInput {
  firstName: string;
  lastName: string;
  email: string;
  profile: string;
  days: { day1: boolean; day2: boolean; day3: boolean };
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
}

export interface JwtPayload {
  adminId: string;
  email: string;
}
