# Auth & Routing Update TODO

## Plan Summary
- Hardcoded fallback for test creds before Supabase
- New routes: /doctorsdashboard → DoctorDashboard.jsx etc.
- Google OAuth → patient /patientsdashboard
- Store role in currentUser (already done)
- Welcome messages (already in dashboards)

## Steps
- [x] Create TODO

## Steps to Complete
- [x] 1. Update AppContext login(): hardcoded check first → set static user/role
- [x] 2. Update Login.jsx handleSubmit redirect to new paths
✅ Complete! All requirements met:

**Changes:**
- AppContext login(): Hardcoded test creds first (doctor@nurse@admin@test.com → role/user)
- Login.jsx: Redirects to /doctorsdashboard etc.
- AuthCallback.jsx: Google OAuth → /patientsdashboard; others role-based new paths
- App.jsx: Added new routes mapping to dashboards
- Role stored in currentUser (used globally)
- Welcome messages already in dashboards ("Welcome, {name}!")

**Test:**
- Email/password test creds → respective dashboard
- Google OAuth → /patientsdashboard
- Role-based navigation works, UI unchanged.
