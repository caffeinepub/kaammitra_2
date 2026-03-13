# KaamMitra

## Current State
CreateProfile.tsx has a simple form with: Name, Phone, Category (dropdown from MAIN_CATEGORIES), Experience, Location, Expected Salary. No document/verification fields exist. All fields are shown to every worker regardless of category.

## Requested Changes (Diff)

### Add
- Profession-based document verification section in the profile form, shown dynamically based on selected category
- A `PROFESSION_DOCS` config mapping category groups to required/optional document fields
- Base verification fields (always shown): Mobile OTP (simulated), Aadhaar Card upload (file input), Profile Photo upload
- Driver category docs: Driving Licence upload, Vehicle Type selection (Car, Bolero, Pickup, Truck, Tipper, Trailer)
- Machine Operator docs (JCB, Excavator, Crane, Bulldozer): Machine Operator Licence/Certificate upload, Experience Details
- Construction Worker docs (Mason, Carpenter, Painter, Welder, Electrician, Plumber): Work Experience text, Skill Certificate upload (optional)
- Helper/Labour docs: Mobile Number Verification only (already in base)
- Mechanic/Technician docs: Workshop Experience text, Technical Certificate upload (optional)
- Office Staff docs (HR, Accountant, Supervisor, Foreman, Engineer, etc.): Education Certificate upload, Resume upload
- Builder/Contractor docs: Business Registration/GST upload (optional), Company Name text field
- Visual section separator between basic profile fields and document verification fields
- "Documents Required" badge/label showing which docs are mandatory vs optional for selected category

### Modify
- CreateProfile.tsx: After category selection, dynamically render profession-specific document fields below the base verification fields
- Form state to include document fields: aadhaarFile, profilePhoto, drivingLicence, vehicleType, operatorCertificate, workExperience, skillCertificate, workshopExperience, technicalCertificate, educationCertificate, resumeFile, businessRegistration, companyName, otpVerified
- OTP verification: show a "Send OTP" button next to mobile field, then an OTP input that simulates verification (demo only)

### Remove
- Nothing removed

## Implementation Plan
1. Add `PROFESSION_DOC_GROUPS` config in `src/frontend/src/lib/constants.ts` mapping subcategory names to a document group key (driver, machine_operator, construction, helper, mechanic, office_staff, builder)
2. Create `ProfessionDocs` component or inline logic in CreateProfile.tsx that reads the selected category and renders relevant document fields
3. Implement simulated OTP flow: button sends fake OTP (show it on screen as demo), user types it, mark verified
4. File upload fields use standard HTML `<input type="file">` styled consistently -- no actual upload, just track filename as form state
5. Show a colored "Verification Documents" section card below the base form fields, with conditional rendering based on selected category
6. Maintain all existing form submission logic (Google Sheets, localStorage, backend)
