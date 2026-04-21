# Authentication and Role-Based Dashboard Updates - TODO

## Plan Steps (from approved plan):

### 1. [ ] Create TODO.md (Current - Done)
### 2. ✅ Read remaining dashboard files to confirm structure: NurseDashboard.jsx, AdminDashboard.jsx, PatientDashboard.jsx
### 3. ✅ Update DoctorDashboard.jsx: Change welcome message to "Welcome, [Capitalized Role] [Name]!"
### 4. ✅ Update NurseDashboard.jsx: Add dashboard-header with role-based welcome
### 5. ✅ Update AdminDashboard.jsx: Add dashboard-header with role-based welcome  
### 6. ✅ Update PatientDashboard.jsx: Add dashboard-header with role-based welcome
### 7. [ ] (Optional) Update AuthRoute.jsx for consistent new redirect paths
### 8. [ ] Test all logins (doctor/nurse/admin test creds) + Google OAuth → verify redirects + welcome messages
### 9. [ ] Run `npm run dev` and verify no errors
### 10. [ ] Mark complete with attempt_completion

**Helper for all dashboards**: `const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';`  
**Welcome format**: `<h1>Welcome, {capitalize(currentUser?.role)} {currentUser?.name}!</h1>`

