# KaamMitra

## Current State
- Backend creates jobs/workers with `approved = false` — they need admin approval before appearing in lists
- PostJob form submits to backend but jobs stay hidden (awaiting approval), making it look like data disappeared
- CreateProfile similarly saves but workers stay hidden, and no session persistence exists
- No payment flow exists
- No success confirmation modals with saved data confirmation

## Requested Changes (Diff)

### Add
- `createJobApproved` backend function — creates job with `approved = true` (used after successful payment)
- Demo Razorpay-style payment modal on Job Post screen (UPI, Card, Net Banking) — ₹99 fee
- Job only created and visible in Find Work after payment success
- Payment error screen if payment fails — job not saved
- Success pop-up dialog for both Job Post (after payment) and Create Profile (after save)
- localStorage persistence for worker profile — user stays "logged in" with their profile visible
- Worker profile view screen showing saved profile details

### Modify
- PostJob.tsx: Add payment step before form submission; call createJobApproved on success
- CreateProfile.tsx: Save worker data to localStorage after successful backend save; show persistent profile view
- useQueries.ts: Add useCreateJobApproved mutation hook

### Remove
- Nothing removed

## Implementation Plan
1. Add `createJobApproved` to main.mo
2. Add `createJobApproved` to backend.d.ts and useQueries.ts
3. Rewrite PostJob.tsx with multi-step flow: form → payment modal → success
4. Rewrite CreateProfile.tsx with localStorage save and profile persistence
5. Validate and deploy
