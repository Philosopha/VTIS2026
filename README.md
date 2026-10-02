# VTIS 2026 — Full Registration System

Complete architecture: landing page → backend API → Supabase DB → Resend email → PDF ticket → Admin portal.

---

## Project Structure

```
├── src/                        # Landing page (React + Vite + Tailwind v4)
├── backend/                    # Node/Express API (TypeScript)
├── admin/                      # Admin portal (React + Vite)
└── supabase/
    └── schema.sql              # Run this first in Supabase SQL Editor
```

---

## 1. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the entire contents of `supabase/schema.sql`
3. From **Project Settings → API**, copy:
   - `Project URL`
   - `service_role` key (secret — backend only, never expose to browser)

---

## 2. Resend Setup

1. Create an account at [resend.com](https://resend.com)
2. Add and verify your sending domain
3. Generate an API key
4. Set `EMAIL_FROM` to e.g. `VTIS 2026 <noreply@yourdomain.com>`

---

## 3. Backend

### Install & configure

```bash
cd backend
npm install
cp .env.example .env   # fill in values
```

**`backend/.env`**
```env
PORT=4000
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
RESEND_API_KEY=re_xxxx
EMAIL_FROM=VTIS 2026 <noreply@yourdomain.com>
JWT_SECRET=a-long-random-secret-min-32-chars
FRONTEND_URL=https://yourdomain.com
ADMIN_URL=https://admin.yourdomain.com
ALLOW_SEED=false
```

### Create the first admin account

Temporarily set `ALLOW_SEED=true` in `.env`, start the server, then:

```bash
curl -X POST http://localhost:4000/api/auth/seed-admin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@yourdomain.com","password":"StrongPass123!","name":"Admin Name"}'
```

**Set `ALLOW_SEED=false` immediately after.**

### Run

```bash
npm run dev      # development (tsx watch)
npm run build    # compile TypeScript
npm start        # production
```

---

## 4. Landing Page

```bash
# project root
cp .env.example .env
# set VITE_API_URL=https://your-backend-url.com

npm install
npm run dev
```

---

## 5. Admin Portal

```bash
cd admin
npm install
cp .env.example .env   # set VITE_API_URL
npm run dev            # runs on port 5174
```

**`admin/.env`**
```env
VITE_API_URL=http://localhost:4000
```

---

## 6. Full Registration Flow

```
User fills form
  → POST /api/register
  → Zod validation
  → Duplicate email check
  → INSERT into Supabase
    → DB trigger assigns sequential registration_number
    → registration_id generated: "VTIS 01", "VTIS 02", …
  → 201 response returned to user immediately
  → (async) Generate PDF ticket with PDFKit + QR code
  → (async) Send confirmation email via Resend with PDF attachment
  → (async) Update ticket_generated / email_sent flags in DB
```

---

## 7. API Reference

### Public

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/register` | Submit registration |
| GET | `/health` | Health check |

### Admin (Bearer JWT required)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/login` | Get JWT token |
| GET | `/api/admin/stats` | Dashboard counts |
| GET | `/api/admin/registrations` | List (search, filter, paginate) |
| GET | `/api/admin/registrations/:id` | Single record |
| GET | `/api/admin/registrations/:id/ticket` | Download PDF ticket |
| POST | `/api/admin/registrations/:id/resend` | Resend confirmation email |
| GET | `/api/admin/export` | Download CSV |
| GET | `/api/verify/:id` | Verify ticket (check-in) |
| POST | `/api/verify/:id/checkin` | Mark as checked in |

### Query params for GET `/api/admin/registrations`

| Param | Type | Description |
|-------|------|-------------|
| `q` | string | Search name, email, or ID |
| `page` | number | Page number (default: 1) |
| `limit` | number | Per page, max 200 (default: 50) |
| `day` | 1 \| 2 \| 3 | Filter by day |
| `checked_in` | true \| false | Filter by check-in status |
| `email_sent` | true \| false | Filter by email status |
| `sort` | string | Field to sort by |
| `order` | asc \| desc | Sort direction |

---

## 8. Admin Portal Pages

| Path | Description |
|------|-------------|
| `/login` | Admin login |
| `/` | Dashboard — stats overview |
| `/registrations` | Full registrations table with search/filter/export |
| `/registrations/:id` | Individual record — download ticket, resend email |
| `/checkin` | QR scanner + manual ID lookup for event check-in |

---

## 9. Security Notes

- The `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS — **never expose it to the browser**
- All `/api/admin/*` and `/api/verify/*` routes require a valid JWT
- Registration is rate-limited to 5 attempts per IP per 15 minutes
- Passwords are hashed with bcrypt (cost factor 12) before storage
- Sequential IDs are generated via a PostgreSQL sequence — concurrent inserts never collide
- `ALLOW_SEED` must be `false` in production

---

## 10. Deployment

### Backend (e.g. Railway, Render, Fly.io)
- Set all env vars in the dashboard
- Build command: `npm run build`
- Start command: `npm start`
- Port: `4000` (or set via `PORT` env var)

### Landing Page (e.g. Vercel, Netlify)
- Set `VITE_API_URL` in build env vars
- Build command: `npm run build`
- Output dir: `dist`

### Admin Portal (e.g. Vercel)
- Set `VITE_API_URL` in build env vars
- Build command: `npm run build`
- Output dir: `dist`
- Add `_redirects` file with `/* /index.html 200` for SPA routing
