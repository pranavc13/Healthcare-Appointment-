# System Design — DocConnect Healthcare Appointment & Follow-up Manager

## Double-booking prevention

The `Appointment` collection carries a **partial unique index** on `{doctorId, date, startTime}`, scoped with `partialFilterExpression: { status: { $in: ['pending', 'confirmed'] } }`. Only documents that are actively holding or occupying a slot participate in the uniqueness constraint — cancelled, completed, or rescheduled documents don't, so a slot key can be freely reused once it's no longer active.

`POST /api/appointments/hold` performs a single atomic operation:

```js
Appointment.findOneAndUpdate(
  { doctorId, date, startTime,
    $or: [
      { status: { $in: ['cancelled', 'completed', 'rescheduled'] } },
      { status: 'pending', heldUntil: { $lte: now } }, // expired hold, reclaimable
    ] },
  { $set: { doctorId, date, startTime, endTime, patientId, status: 'pending', heldUntil, symptoms: '' } },
  { upsert: true, new: true, runValidators: true }
);
```

Three cases fall out of this one call. No document yet for that key → filter matches nothing, Mongo inserts fresh. Document exists but reclaimable (cancelled or expired hold) → filter matches it, updated in place, no index conflict since it's the same document. Document exists and is actively `pending` (unexpired) or `confirmed` → filter matches nothing *but the key is taken*, so the upsert's insert attempt collides with the partial unique index and MongoDB raises `E11000`; the route catches that and responds `409 Conflict`. That's the whole mechanism for simultaneous requests: two patients racing for the same slot both call `findOneAndUpdate`, and the storage engine's own index guarantees exactly one write succeeds — no application-level locking or transaction needed. Verified directly: two concurrent `hold` requests for the same slot return one `200` and one `409`.

## Slot hold mechanism

A hold is not a separate table — it's an `Appointment` document in `status: 'pending'` with `heldUntil = now + 5 minutes`. This lets the same double-booking index above do double duty: a `GET /slots` query excludes any doctor/date/time where a `confirmed` document exists, or a `pending` document exists with `heldUntil` still in the future. An expired-but-not-yet-cleaned hold is treated as available immediately by both the slots query and the hold `findOneAndUpdate` (via the `heldUntil: { $lte: now }` branch), so correctness never depends on the cron having run yet — the cron is a cleanup convenience, not a correctness requirement.

The cron (`jobs/slotHoldCleanup.js`, every 1 minute) deletes `{status: 'pending', heldUntil: {$lt: now}}` documents outright, keeping the collection from accumulating abandoned holds from patients who picked a slot and closed the tab. This is what prevents the "fill the symptom form while someone else books the same slot" race: the slot is reserved the instant `hold` succeeds, not when `confirm` is submitted, so a second patient viewing the same grid seconds later won't see it offered.

## Doctor leave conflict handling

`PUT /api/admin/doctors/:id/leave` first adds the date(s) to `DoctorProfile.leaveDays` via a duplicate-checked push (idempotent — marking the same day twice is a no-op, and re-running the whole request is safe since the second run finds nothing left in `confirmed` status). It then queries every `Appointment` for that `doctorId`, one of the leave dates, and `status: 'confirmed'`, and for each: flips status to `cancelled`, sends a `leave_notice` email to the patient (logged via the same retry path below), and best-effort deletes both Google Calendar events. Only `confirmed` appointments are touched — `pending` holds expire via the TTL cron regardless, and `cancelled`/`completed` ones are irrelevant — which is what makes re-running the operation safe.

## Notification failure handling

Every outbound email goes through `services/email.js`'s `sendAndLog()`, which always writes a `Notification` row before attempting delivery and updates `status` to `sent` or `failed` afterward — callers never need their own try/catch, and a failed send never throws back into the request that triggered it (booking, cancellation, etc. all still succeed). The Notification schema (fixed by the spec) has no dedicated "next retry time" field, so the retry cron reuses `scheduledAt`: on each failed attempt it's pushed forward by `10min × 2^retryCount` (exponential backoff), and the 10-minute cron (`jobs/emailRetry.js`) only picks up rows where `status: 'failed'`, `retryCount < 3`, and `scheduledAt <= now`. Once a row exhausts 3 retries it stays `failed` permanently (excluded by the `retryCount < 3` filter) and a `console.error` serves as the alert — sufficient here, though production would forward that to a real alerting channel.

LLM generation degrades the same way: every Gemini call is wrapped in try/catch; on failure the summary sub-document gets `llmFailed: true` and `llmError`, the appointment save still proceeds (booking still confirms, completion still saves), and the frontend shows "AI summary unavailable — being generated" instead of blocking. A 15-minute cron (`jobs/llmRetry.js`) retries up to 3 times, clearing `llmFailed` on success. Pre-visit generation is fire-and-forget (booking doesn't wait on it); post-visit generation is awaited during completion since that email needs the summary, falling back to a plain-text rendering of the raw notes on failure.
