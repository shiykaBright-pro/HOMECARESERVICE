-- Complete Appointments Table Schema with RLS for HomecareService
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)

-- 1. Create table if not exists (with all columns matching frontend code)
CREATE TABLE IF NOT EXISTS public.appointments (
  id BIGSERIAL PRIMARY KEY,
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  patient_name TEXT NOT NULL,
  provider_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  provider_name TEXT NOT NULL,
  service TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'Completed', 'Cancelled')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  notes TEXT,
  price DECIMAL(10,2) DEFAULT 0,
  type TEXT DEFAULT 'home',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies (updated to match columns)
-- Patients: create/view own appointments
CREATE POLICY "Patients create own appointments" ON public.appointments
FOR INSERT WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Patients view own appointments" ON public.appointments  
FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "Patients update own basic info" ON public.appointments
FOR UPDATE USING (patient_id = auth.uid())
WITH CHECK (patient_id = auth.uid());

-- Providers (doctors/nurses): view/update their appointments
CREATE POLICY "Providers view own appointments" ON public.appointments
FOR SELECT USING (provider_id = auth.uid());

CREATE POLICY "Providers update own appointments" ON public.appointments
FOR UPDATE USING (provider_id = auth.uid());

-- Admin: full access (check profiles role)
CREATE POLICY "Admin full appointments access" ON public.appointments
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_provider_id ON public.appointments(provider_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);

-- Verify policies
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'appointments';

-- View table structure
\dt appointments
\d+ appointments

-- Sample data insert (run after testing connection)
-- INSERT INTO appointments (patient_id, patient_name, provider_id, provider_name, service, date, time, status, price) 
-- VALUES ('00000000-0000-0000-0000-000000000000', 'Test Patient', '11111111-1111-1111-1111-111111111111', 'Test Doctor', 'Consultation', '2026-02-20', '10:00', 'Pending', 50.00);

