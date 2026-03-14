# KaamMitra — Gender Inclusive & Female Worker Safety

## Current State
- Gender selection (Male/Female/Other) already exists in CreateProfile.tsx
- Gender badge shown on worker profile cards
- Gender filter (All/Male/Female) exists in FindWorker.tsx
- Verified badge shown for document-verified workers
- No Report/Block feature exists for safety
- No female-specific safety features exist

## Requested Changes (Diff)

### Add
- **Report/Block button** in the worker detail sheet (FindWorker.tsx) — opens a dialog to report or block a worker. Saves blocked workers to `kaam_mitra_blocked_workers` in localStorage. Blocked workers are filtered out of search results.
- **Female Worker Safety Banner** — shown only when a female worker is selected in the detail sheet. Small info card: "🛡️ Verified female workers are protected. Phone numbers are shared only after both parties confirm."
- **Safety Tips Card** on CreateProfile.tsx for female workers — shown after gender is selected as Female. Informs: OTP verification required, profile reviewed by admin before activation.
- **Inclusive category display** — ensure all categories in CreateProfile show for all genders. Add a note on the category selection step: "All categories open to all genders — KaamMitra supports every worker equally."
- **Profile completeness indicator** in worker detail sheet — show which safety/verification steps are complete (Mobile Verified, Email Verified, ID Verified, Payment Verified) as checklist chips.
- **Report count** stored per worker mobile in localStorage `kaam_mitra_reports`.

### Modify
- FindWorker.tsx worker detail sheet: add Report/Block action button (⚠️ Report / Block), Safety banner for female workers, and verification checklist
- CreateProfile.tsx: add female safety tips card after gender selection, add inclusive note on category step

### Remove
Nothing removed.

## Implementation Plan
1. FindWorker.tsx: add `blockedWorkers` state loaded from localStorage, filter out blocked workers from results
2. Add Report/Block sheet/dialog triggered from worker detail — select reason (Harassment, Fake Profile, Spam, Other), submit stores report to `kaam_mitra_reports` and optionally blocks the worker
3. Add female safety info banner inside worker detail sheet when `selectedWorker.ext?.gender === 'Female'`
4. Add verification checklist chips in worker detail sheet
5. CreateProfile.tsx: add safety tips card shown when `form.gender === 'Female'`
6. CreateProfile.tsx: add inclusive note text near category selection
7. All new interactive elements get proper data-ocid markers
