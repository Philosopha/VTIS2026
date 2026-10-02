// ─────────────────────────────────────────────────────────────────────────────
// lib/api.ts — typed API client for the VTIS backend
// ─────────────────────────────────────────────────────────────────────────────

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function getToken(): string | null {
  return localStorage.getItem('vtis_admin_token');
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  if (res.status === 401) {
    localStorage.removeItem('vtis_admin_token');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }

  return res.json();
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export async function login(email: string, password: string) {
  const data = await request<{ token: string; admin: { id: string; email: string; name: string } }>(
    '/api/auth/login',
    { method: 'POST', body: JSON.stringify({ email, password }) },
  );
  localStorage.setItem('vtis_admin_token', data.token);
  return data;
}

export function logout() {
  localStorage.removeItem('vtis_admin_token');
}

// ── Stats ─────────────────────────────────────────────────────────────────────
export interface Stats {
  total: number;
  emailsSent: number;
  checkedIn: number;
  byDay: { day1: number; day2: number; day3: number };
}

export async function getStats(): Promise<Stats> {
  return request('/api/admin/stats');
}

// ── Registrations ─────────────────────────────────────────────────────────────
export interface Registration {
  id: string;
  registration_id: string;
  registration_number: number;
  first_name: string;
  last_name: string;
  email: string;
  profile: string;
  day1: boolean;
  day2: boolean;
  day3: boolean;
  registered_at: string;
  ticket_generated: boolean;
  email_sent: boolean;
  email_sent_at: string | null;
  email_error: string | null;
  checked_in: boolean;
  checked_in_at: string | null;
}

export interface RegistrationListResponse {
  data: Registration[];
  meta: { total: number; page: number; limit: number; pages: number };
}

export interface ListParams {
  q?: string;
  page?: number;
  limit?: number;
  day?: string;
  checked_in?: string;
  email_sent?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export async function listRegistrations(params: ListParams = {}): Promise<RegistrationListResponse> {
  const qs = new URLSearchParams(
    Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== '')
      .map(([k, v]) => [k, String(v)]),
  ).toString();
  return request(`/api/admin/registrations${qs ? `?${qs}` : ''}`);
}

export async function getRegistration(id: string): Promise<Registration> {
  return request(`/api/admin/registrations/${id}`);
}

export async function resendEmail(id: string): Promise<{ success: boolean; message?: string }> {
  return request(`/api/admin/registrations/${id}/resend`, { method: 'POST' });
}

export function downloadTicketURL(id: string): string {
  const token = getToken();
  return `${BASE}/api/admin/registrations/${id}/ticket?token=${token}`;
}

export function exportCSVURL(params: Omit<ListParams, 'page' | 'limit'>): string {
  const token = getToken();
  const qs = new URLSearchParams(
    Object.entries({ ...params, token: token ?? '' })
      .filter(([, v]) => v !== undefined && v !== '')
      .map(([k, v]) => [k, String(v)]),
  ).toString();
  return `${BASE}/api/admin/export${qs ? `?${qs}` : ''}`;
}

// ── Check-in (verify QR) ──────────────────────────────────────────────────────
export interface VerifyResult {
  valid: boolean;
  registrationId?: string;
  name?: string;
  profile?: string;
  days?: { day1: boolean; day2: boolean; day3: boolean };
  registeredAt?: string;
  checkedIn?: boolean;
  checkedInAt?: string | null;
  ticketGenerated?: boolean;
  error?: string;
}

export async function verifyTicket(id: string): Promise<VerifyResult> {
  return request(`/api/verify/${encodeURIComponent(id)}`);
}

export async function checkInTicket(id: string): Promise<{ success?: boolean; message?: string; error?: string }> {
  return request(`/api/verify/${encodeURIComponent(id)}/checkin`, { method: 'POST' });
}
