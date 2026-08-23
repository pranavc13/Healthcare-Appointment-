# Jeevan Chakra — Healthcare Appointment & Follow-up Manager

Jeevan Chakra is a full-stack healthcare platform for booking and managing doctor appointments, with AI-assisted pre-visit triage and post-visit summaries, automated email notifications, Google Calendar sync, and role-based portals for patients, doctors, and admins.

## What it does

- **Patients** search doctors by specialisation, pick an open slot, describe their symptoms, and get a confirmed appointment with an AI-generated pre-visit triage summary (urgency level, chief complaint, questions for the doctor).
- **Doctors** see their schedule with urgency indicators, review the AI pre-visit summary and reported symptoms, and complete a visit with clinical notes and a prescription — which is automatically turned into a patient-friendly post-visit summary and emailed out.
- **Admins** manage the doctor roster (create/update/deactivate, set working hours and slot duration) and mark leave days, which automatically cancels affected bookings and notifies patients.
- The public directory is backed by a **17,636-row practitioner dataset** (`server/data/doctors.jsonl`) imported as real, bookable doctors — searchable by speciality, city, fee and experience.
- Behind the scenes: atomic slot-holding prevents double-booking, email delivery retries with backoff, failed AI generations retry on a schedule, and confirmed appointments sync to both parties' Google Calendars.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router v7, Tailwind CSS, Framer Motion |
| Backend | Node.js, Express |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcrypt, role-based (`patient` / `doctor` / `admin`) |
| AI | Google Gemini API (`@google/generative-ai`) |
| Email | Nodemailer (any SMTP provider) |
| Calendar | Google Calendar API (OAuth 2.0, `googleapis`) |
| Background jobs | node-cron |

## Project structure

```
docconnect/
├── client/           React frontend (Vite)
│   └── src/
│       ├── components/   Shared UI (Navbar, Toast, ui.jsx primitives, booking widgets…)
│       ├── pages/        Route pages, organized by role: patient/, doctor/, admin/
│       ├── context/      AuthContext (JWT session)
│       ├── hooks/        useAuth
│       ├── services/     Thin axios wrappers per API domain
│       └── utils/        Helpers (date formatting, localStorage persistence)
├── server/           Express API
│   ├── data/             doctors.jsonl — practitioner dataset (17,636 rows, JSON Lines)
│   ├── scripts/          importDoctors.js, normaliseSpecialities.js
│   ├── models/           User, DoctorProfile, Appointment, Notification
│   ├── routes/            /controllers/     Route handlers by domain
│   ├── middleware/        auth.js (JWT verify), roleGuard.js, errorHandler.js
│   ├── services/           llm.js, email.js, calendar.js, slots.js, crypto.js, appointmentEvents.js
│   ├── jobs/                node-cron background jobs
│   ├── templates/            Inline-styled HTML email templates
│   └── seed.js                Admin account seeder
├── .env.example
├── README.md
└── SYSTEM_DESIGN.md
```

## Setup guide

### Prerequisites

- Node.js 18+
- MongoDB running locally (`mongodb://localhost:27017`) — either installed natively, or via Docker: `docker run -d -p 27017:27017 --name docconnect-mongo mongo:7`
- (Optional, for full functionality) A Gemini API key, an SMTP account (e.g. a Gmail App Password), and a Google Cloud OAuth client — see below. The app runs and the core booking flow works without these; AI summaries and emails just log a graceful failure and retry in the background.

### 1. Clone and install

```bash
git clone <this-repo-url> docconnect
cd docconnect
npm run install:all   # installs both server/ and client/ dependencies
```

### 2. Configure environment variables

```bash
cp .env.example server/.env
cp client/.env.example client/.env
```

Edit `server/.env` and fill in the values described in [.env.example](.env.example) — at minimum `MONGODB_URI`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`. Add `GEMINI_API_KEY`, `SMTP_*`, and `GOOGLE_*` when you're ready to exercise those integrations live.

`client/.env` just needs `VITE_API_URL` (defaults to `http://localhost:5000/api`, matching the server's default port).

### 3. Seed the admin account

```bash
npm run seed
```

This creates (or promotes) the admin user from `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `server/.env`. Log in with these credentials to reach `/admin/dashboard` and start adding doctors.

### 3b. Import the practitioner directory (optional but recommended)

The repo ships with `server/data/doctors.jsonl` — 17,636 real practitioner records (name, degree,
speciality, city, locality, consultation fee, years of experience, recommendation score). The import
script turns each row into a `User` (role `doctor`) plus a `DoctorProfile` with a generated working
schedule, so every imported doctor is genuinely bookable.

```bash
cd server
npm run import:doctors              # import all 17,636 rows (~2 minutes)
node scripts/importDoctors.js --limit 500   # or just a sample
node scripts/importDoctors.js --fresh       # wipe previously imported rows first
```

Re-running is safe: rows already present (matched on their generated email) are skipped. Imported
doctors sign in with their generated `…@doctors.jeevanchakra.health` address and the password in
`DATASET_DOCTOR_PASSWORD` (default `Doctor@123`).

If you imported before the speciality-normalisation fix, repair the stored labels in place with:

```bash
node scripts/normaliseSpecialities.js
```

### 4. Run the app

```bash
npm run dev   # runs server (port 5000) and client (port 5173) together
```

Or run them separately: `npm run server` / `npm run client`.

Visit `http://localhost:5173`. Register a patient account at `/register`, log in as the seeded admin to add a doctor (set their working hours and slot duration from the doctor's edit page), then log in as the patient to book against them.

### Testing the core flow

1. Log in as admin → **Doctors** → **Add Doctor** → set working hours on their edit page.
2. Log in (or register) as a patient → **Find Doctors** → pick the doctor → pick a date and slot (this places a 5-minute hold) → describe symptoms → confirm.
3. Check the terminal running the server — you'll see the pre-visit LLM call attempted and the booking-confirmation email attempted (both log gracefully if `GEMINI_API_KEY` / `SMTP_*` aren't configured).
4. Log in as the doctor → **Dashboard** → open the appointment → see the symptoms and (once generated) the AI summary → **Complete Visit** with notes and a prescription.
5. Back as the patient → **My Appointments** → open the completed appointment → see the post-visit summary and prescription.

## API documentation

All routes are mounted under `/api`. Protected routes require `Authorization: Bearer <token>`.

### Auth (`/api/auth`)

| Method | Path | Auth | Request | Response |
|---|---|---|---|---|
| POST | `/register` | Public | `{ name, email, password, phone? }` | `201` `{ token, user }` — always created with `role: 'patient'` |
| POST | `/login` | Public | `{ email, password }` | `200` `{ token, user }` |
| GET | `/me` | Any role | — | `200` current user profile |

### Doctors — public browse (`/api/doctors`)

| Method | Path | Auth | Request | Response |
|---|---|---|---|---|
| GET | `/` | Public | query: `specialisation?`, `city?`, `search?`, `minFee?`, `maxFee?`, `minExperience?`, `sort?`, `page?`, `limit?` | `200` `{ doctors: [...], page, limit, total, totalPages }` |
| GET | `/facets` | Public | — | `200` `{ cities: [{name,count}], specialities: [{name,count}], stats: { totalDoctors, totalCities, avgRating, maxFee } }` |
| GET | `/:id` | Public | — | `200` `DoctorProfile` or `404` |
| GET | `/:id/slots` | Public | query: `date=YYYY-MM-DD` | `200` `{ date, slotDuration, slots: ["09:00", ...] }` |

`sort` accepts `rating` (default), `experience`, `fee_asc`, `fee_desc`. `limit` is capped at 60.
The listing endpoint is paginated because the directory holds ~17.6k profiles after import.

### Appointments — patient portal (`/api/appointments`, role: `patient`)

| Method | Path | Request | Response |
|---|---|---|---|
| POST | `/hold` | `{ doctorId, date, startTime }` | `200` `{ appointmentId, heldUntil }` or `409` if the slot is taken |
| POST | `/confirm` | `{ appointmentId, symptoms }` | `200` confirmed `Appointment`, or `410` if the hold expired |
| GET | `/my` | — | `200` array of the patient's appointments |
| PUT | `/:id/cancel` | — | `200` cancelled `Appointment` |
| PUT | `/:id/reschedule` | `{ date, startTime }` | `200` new confirmed `Appointment` (old one marked `rescheduled`) |

### Doctor portal (`/api/doctor`, role: `doctor`)

| Method | Path | Request | Response |
|---|---|---|---|
| GET | `/appointments` | — | `200` the doctor's appointments (excludes others' pending holds) |
| GET | `/appointments/:id` | — | `200` single appointment with patient details |
| PUT | `/appointments/:id/complete` | `{ notes, prescription: [{medication, dosage, frequency, duration, instructions}] }` | `200` completed `Appointment` with generated `postVisitSummary` |
| GET | `/profile` | — | `200` own `DoctorProfile` |
| PUT | `/profile` | `{ bio?, qualifications?, profileImage? }` | `200` updated `DoctorProfile` |

### Admin portal (`/api/admin`, role: `admin`)

| Method | Path | Request | Response |
|---|---|---|---|
| GET | `/doctors` | — | `200` all doctors (active + inactive) |
| POST | `/doctors` | `{ name, email, password, phone?, specialisation, qualifications?, bio?, slotDuration?, workingHours? }` | `201` `{ user, profile }` |
| PUT | `/doctors/:id` | any subset of profile fields incl. `workingHours`, `isActive` | `200` updated `DoctorProfile` |
| DELETE | `/doctors/:id` | — | `200` — soft delete, sets `isActive: false` |
| PUT | `/doctors/:id/leave` | `{ date }` or `{ dates: [...] }` | `200` `{ doctor, cancelledAppointments }` |

### Calendar (`/api/calendar`)

| Method | Path | Auth | Response |
|---|---|---|---|
| GET | `/auth-url` | Any role | `200` `{ url }` — Google OAuth consent URL |
| GET | `/callback` | Public (Google redirects here) | `302` redirect back to the frontend with `?connected=1|0` |

### Notifications (`/api/notifications`)

| Method | Path | Auth | Response |
|---|---|---|---|
| GET | `/my` | Any role | `200` the current user's last 50 notification log entries (type, subject, status, timestamps) |

## Database schema

**User**
```
name: String
email: String (unique)
passwordHash: String
role: 'patient' | 'doctor' | 'admin'
phone: String
googleCalendarRefreshToken: String (encrypted, select:false)
googleCalendarConnected: Boolean
createdAt: Date
```

**DoctorProfile**
```
userId: ObjectId → User
specialisation: String            display label, e.g. "Cardiologist, Interventional Cardiologist"
specialities: [String]            individually searchable tags split out of the above
qualifications: String
workingHours: [{ day, startTime, endTime }]
slotDuration: Number (minutes, default 30)
leaveDays: [Date]
bio: String
profileImage: String
isActive: Boolean
city: String                      indexed — directory filter
locality: String
consultationFee: Number           indexed — ₹, directory filter
experienceYears: Number           indexed — directory filter
rating: Number                    0–5, derived from the dataset recommendation %
reviewCount: Number
source: 'manual' | 'dataset'      'dataset' rows are the ones importDoctors.js created
```

Indexes: text index on `specialisation/qualifications/city/locality` for free-text search, and a
compound `{ isActive, rating, experienceYears }` index backing the default directory sort.

**Appointment**
```
patientId: ObjectId → User
doctorId: ObjectId → DoctorProfile
date: Date
startTime, endTime: String ("HH:MM")
status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled'
symptoms: String
preVisitSummary: { urgencyLevel, chiefComplaint, suggestedQuestions[], generatedAt, llmFailed, llmError, llmRetryCount }
postVisitSummary: { patientFriendlySummary, medicationSchedule, followUpSteps, generatedAt, llmFailed, llmError, llmRetryCount }
doctorNotes: String
prescription: [{ medication, dosage, frequency, duration, instructions }]
googleCalendarEventId_patient, googleCalendarEventId_doctor: String
heldUntil: Date
reminderSent: Boolean
createdAt, updatedAt: Date
```
Indexes: unique partial `{doctorId, date, startTime}` (only while `status` is `pending`/`confirmed` — see SYSTEM_DESIGN.md), plus `{heldUntil}`, `{patientId, date}`, `{doctorId, date}`.

**Notification**
```
userId: ObjectId → User
type: 'booking_confirmation' | 'reminder' | 'cancellation' | 'leave_notice' | 'medication_reminder' | 'post_visit_summary'
channel: 'email'
status: 'sent' | 'failed' | 'pending'
retryCount: Number
appointmentId: ObjectId → Appointment
subject, message: String
scheduledAt: Date (also doubles as "don't retry before this time")
sentAt: Date
lastError: String
```
Index: `{status, retryCount, scheduledAt}` for the retry cron's query.

## LLM prompts

Both use Gemini and are wrapped in try/catch with markdown-fence stripping before `JSON.parse`; a parse or API failure sets `llmFailed: true` + `llmError` on the appointment instead of breaking the request, and is retried by the 15-minute `llmRetry` cron (max 3 attempts).

**Pre-visit summary** (`services/llm.js: generatePreVisitSummary`) — runs when a patient confirms a booking, fire-and-forget so it doesn't delay the confirmation response. Gives the doctor a triage snapshot before the visit.

> You are a medical triage assistant. Analyse these patient-reported symptoms and return a JSON response with:
> 1. urgencyLevel: 'Low' | 'Medium' | 'High'
> 2. chiefComplaint: one-line summary of the main concern
> 3. suggestedQuestions: array of exactly 3 questions the doctor should ask during the visit
>
> Patient symptoms: `<symptoms>`
>
> Respond ONLY with valid JSON, no markdown formatting.

**Post-visit summary** (`services/llm.js: generatePostVisitSummary`) — runs when a doctor completes a visit, awaited because the confirmation email includes its content. Turns clinical shorthand into something a patient can actually act on.

> You are a patient communication specialist. Convert these clinical notes and prescription into a patient-friendly summary. Use simple language a non-medical person can understand. Include:
> 1. patientFriendlySummary: 2-3 paragraph explanation of the diagnosis and treatment plan
> 2. medicationSchedule: clear table/list of when to take each medication
> 3. followUpSteps: numbered list of what the patient should do next
>
> Clinical notes: `<notes>`
> Prescription: `<prescription_json>`
>
> Respond ONLY with valid JSON, no markdown formatting.

## Google Calendar setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/) and create a new project (or select an existing one).
2. **APIs & Services → Library** → search for "Google Calendar API" → **Enable**.
3. **APIs & Services → OAuth consent screen** → choose **External** (unless you have a Workspace org), fill in the app name/support email, and add your own account as a test user while the app is unpublished.
4. **APIs & Services → Credentials → Create Credentials → OAuth client ID** → Application type **Web application**.
   - Authorized redirect URI: `http://localhost:5000/api/calendar/callback` (must match `GOOGLE_REDIRECT_URI` exactly).
5. Copy the generated **Client ID** and **Client secret** into `server/.env` as `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
6. In the app, visit `/patient/calendar-connect` or `/doctor/calendar-connect` and click **Connect Google Calendar** — you'll be sent through Google's consent screen and redirected back with the connection stored (refresh token encrypted at rest using `ENCRYPTION_KEY`).

If calendar sync fails for any reason (not connected, expired token, API error), the appointment operation itself still succeeds — the failure is logged, never blocking.
