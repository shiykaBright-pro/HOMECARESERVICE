# Profile Update Task - TODO

## Task
Update Doctor and Nurse Dashboard profile tabs to match Patient Profile functionality with Supabase backend integration.

## Plan

### Step 1: Update DoctorDashboard.jsx
- [x] Add supabase import and setCurrentUser from context
- [x] Add profile state (profileData, profileLoading, profileSaving, profileError, profileSuccess)
- [x] Add loadProfile function to fetch from Supabase profiles table
- [x] Add handleProfileSubmit function to update Supabase + local state
- [x] Add validation logic
- [x] Rewrite 'profile' case in renderContent with full form (view + edit modes)
- [x] Add loading/error/success states to profile UI

### Step 2: Update NurseDashboard.jsx
- [x] Same changes as DoctorDashboard but with nurse-specific fields

### Step 3: Testing
- [x] Verify profile tabs render for hardcoded users
- [x] Verify profile tabs render for Supabase-authenticated users
- [x] Test edit -> save -> reload persistence
- [x] Confirm responsive behavior

## Key Design Decisions
- Keep existing Dashboard CSS classes (profile-section, profile-card, profile-info, info-row)
- Reuse Profile.jsx Supabase integration pattern
- Persist extra fields (phone, address, experience, hospital) via currentUser context/localStorage
- Show email as read-only
- Disable submit while saving

## Files Updated
- `src/pages/DoctorDashboard.jsx`
- `src/pages/NurseDashboard.jsx`
- `TODO-PROFILE-UPDATE.md`

**Task complete! 🎉**

