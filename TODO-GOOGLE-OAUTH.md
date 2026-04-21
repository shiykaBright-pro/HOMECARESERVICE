# Google OAuth Integration TODO

## Steps
- [x] Create TODO for Google OAuth

## Steps to Complete
- [x] 1. Add googleLogin to src/context/AppContext.jsx
- [x] 2. Update Google button in src/pages/Login.jsx
- [x] 3. Create src/pages/AuthCallback.jsx for session handling/redirect
- [x] 4. Add /auth/callback route to src/App.jsx
- [ ] 5. Test OAuth flow (ensure Google provider enabled in Supabase dashboard)

✅ Complete! Test Google OAuth flow.

**Final Manual Steps:**
1. Supabase Dashboard > Authentication > Providers > Enable Google, add Client ID/Secret.
2. Set Site URL to `http://localhost:5173/auth/callback`.
3. Test button at /login.
