# Logout Fix TODO

## Steps:
- [ ] 1. Create this TODO file ✅
- [✅] 2. Edit HOMECARESERVICE/src/pages/AdminDashboard.jsx (add useApp, useNavigate, handleLogout, update Link onClick)
- [✅] 3. Edit HOMECARESERVICE/src/components/Navbar.jsx (update handleLogout to include navigate('/'))
- [✅] 4. Update this TODO with progress
- [ ] 5. Test all roles: login as admin/doctor/nurse/patient, logout, verify home nav + auth cleared
- [ ] 6. Complete task

Current status: Edits complete. Dev server: cd HOMECARESERVICE && npm run dev

Test manually:
1. Login as admin (/login, email:admin@example.com pass:admin123 -> /dashboard/admin), click sidebar Logout → home + logged out.
2. Doctor (sarah@example.com/pass), /dashboard/doctor → logout.
3. Nurse/Patient similarly.
4. Navbar dropdown if used.

Verify localStorage currentUser cleared, ProtectedRoute redirects.

