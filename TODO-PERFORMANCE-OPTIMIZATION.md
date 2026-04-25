# Performance Optimization TODO

## Phase 1: Core Context & Data Layer (`src/context/AppContext.jsx`, `src/supabaseClient.js`)
- [ ] Wrap context `value` with `useMemo` to prevent unnecessary re-renders
- [ ] Wrap exported functions with `useCallback` (only where beneficial)
- [ ] Add `dataFetched` flags for providers and appointments
- [ ] Add `refreshProviders()` and `refreshAppointments()` manual refresh functions
- [ ] Set `appointmentsLoading` properly during fetch
- [ ] Deduplicate auth initialization: use `onAuthStateChange` as single source of truth
- [ ] Remove/clean unnecessary `console.log`, keep `console.error` and wrap logs in `process.env.NODE_ENV === 'development'` checks
- [ ] Replace `select('*')` in supabaseClient with explicit column lists
- [ ] Add API timing logs (`console.time`/`console.timeEnd`)

## Phase 2: Dashboard Optimizations
- [ ] `PatientDashboard.jsx`: Memoize filtered data with `useMemo`, `useCallback` for handlers, add loading states
- [ ] `DoctorDashboard.jsx`: Remove direct Supabase calls (rely on context), memoize data, `useCallback` handlers
- [ ] `NurseDashboard.jsx`: Remove direct Supabase calls, memoize data, `useCallback` handlers
- [ ] `AdminDashboard.jsx`: Memoize analytics and filtered lists, `useCallback` handlers

## Phase 3: Page-Level Fixes
- [ ] `Profile.jsx`: Remove duplicate Supabase fetches, use `currentUser` from context, keep only upsert on save
- [ ] `BookAppointment.jsx`: Clean `useEffect` dependencies, remove logs
- [ ] `Login.jsx`: Remove excessive logs, optimize OAuth effect
- [ ] `Navbar.jsx`: Memoize `unreadCount`, `useCallback` for handlers

## Phase 4: Testing & Verification
- [ ] Verify no duplicate API calls in Network tab
- [ ] Verify faster page loads
- [ ] Verify no broken features (appointments, profiles, dashboards)
- [ ] Verify proper loading states
- [ ] Verify logout works correctly across all dashboards

