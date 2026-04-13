# Supabase Reviews + Prescriptions Implementation Plan

**Status:** Ready to implement

## Files to Edit:
1. src/lib/supabase.js - CRUD functions
2. src/context/AppContext.jsx - Connect CRUD to supabaseDB
3. src/pages/Reviews.jsx - Add review form + dynamic data
4. src/pages/PatientDashboard.jsx - Display prescriptions tab
5. src/pages/DoctorDashboard.jsx - Prescription form validation
6. src/pages/NurseDashboard.jsx - Prescription access

## Backend SQL (run in Supabase):
```
-- Reviews table (already from previous)
CREATE TABLE IF NOT EXISTS reviews (
  id BIGSERIAL PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES auth.users(id),
  provider_id UUID NOT NULL REFERENCES auth.users(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
-- RLS
CREATE POLICY "Patients create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "Users view public reviews" ON reviews FOR SELECT USING (true);
```

## Next: Create supabase.js CRUD
