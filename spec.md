# KaamMitra — Job Apply System

## Current State
- `CompanyDetails.tsx` page exists with basic job listings and a simple inline ApplyModal (no persistence).
- `AssociatedCompanies.tsx` and `Companies.tsx` company cards have NO click/tap action — they are static.
- No route exists for `/company/:companyId`.
- `constants.ts` has a `JobApplication` interface for contractor jobs, but NO system for company-based job applications.
- No worker dashboard for tracking applied company jobs.
- No company dashboard for viewing and managing applicants.

## Requested Changes (Diff)

### Add
- `lib/companyJobs.ts` — job listings per company + `CompanyJobApplication` interface/CRUD (collection: `kaam_mitra_company_applications`). Fields: id, workerId, workerName, workerMobile, workerCategory, companyId, companyName, jobId, jobTitle, salary, appliedAt, status (pending/selected/rejected).
- Route `/company/:companyId` in `App.tsx` pointing to `CompanyDetails`.
- `pages/WorkerAppliedJobs.tsx` — worker dashboard listing their company job applications with live status badges, company name, job title, applied date. Accessible from Profile/Settings menu.
- Route `/my-applications` in `App.tsx`.
- Smart job matching section in `CompanyDetails.tsx`: shows "Recommended for You" based on worker's registered category.
- Smart worker matching section in company dashboard (ContractorDashboard): shows best-fit workers per open job.

### Modify
- `AssociatedCompanies.tsx` — make each card `cursor-pointer` with `onClick` navigating to `/company/:id`.
- `Companies.tsx` — make each card fully tappable (entire card is clickable) navigating to `/company/:id`; keep Contact + View Jobs buttons but add card-level tap.
- `CompanyDetails.tsx` — replace inline ApplyModal with persistent apply system: save `CompanyJobApplication` to localStorage, block duplicate applications, require mobile number (logged-in check via `getMyExtendedProfile`), send in-app notification on apply. Add worker's applied-jobs status if already applied (show badge instead of button).
- `ContractorDashboard.tsx` — add "Job Applicants" tab showing all applications for this company's jobs with Approve/Reject buttons that update status and send notification to worker.

### Remove
- Nothing removed.

## Implementation Plan
1. Create `src/frontend/src/lib/companyJobs.ts` with: job listings data per company, `CompanyJobApplication` type, CRUD helpers (`applyToCompanyJob`, `loadCompanyApplications`, `getApplicationsForCompany`, `getApplicationsForWorker`, `updateApplicationStatus`).
2. Update `CompanyDetails.tsx`: wire apply button to persistent system, show "Already Applied" badge, add recommended jobs section based on worker category match.
3. Add click handlers to `AssociatedCompanies.tsx` and `Companies.tsx` company cards.
4. Create `WorkerAppliedJobs.tsx` page.
5. Update `ContractorDashboard.tsx` to add applicants tab.
6. Register new routes in `App.tsx`.
