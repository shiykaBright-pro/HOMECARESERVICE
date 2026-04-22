-- Fixed RLS Policies for appointments table
-- Your current policies reference NON-EXISTENT columns: doctor_id, nurse_id
-- Table has provider_id only. Run this to fix 400 error.

-- Enable UUID extension (safe)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Ensure RLS enabled
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- DROP ALL EXISTING BROKEN POLICIES
DROP POLICY IF EXISTS "Patient can create own appointment" ON appointments;
DROP POLICY IF EXISTS "Users can view their appointments" ON appointments;
DROP POLICY IF EXISTS "Users can update their appointments" ON appointments;
DROP POLICY IF EXISTS "Patient can delete own appointment" ON appointments;
DROP POLICY IF EXISTS "Patients create own appointments" ON appointments;  -- from schema.sql

-- 1. INSERT: Patients create own appointments
CREATE POLICY "Patients create own appointments" 
ON appointments
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = patient_id);

-- 2. SELECT: Patients/providers view own
CREATE POLICY "Users view own appointments" 
ON appointments
FOR SELECT
TO authenticated
USING (
  auth.uid() = patient_id 
  OR auth.uid() = provider_id
);

-- 3. UPDATE: Own appointments only
CREATE POLICY "Users update own appointments" 
ON appointments
FOR UPDATE
TO authenticated
USING (
  auth.uid() = patient_id 
  OR auth.uid() = provider_id
)
WITH CHECK (
  auth.uid() = patient_id 
  OR auth.uid() = provider_id
);

-- 4. DELETE: Patients delete own (restrictive)
CREATE POLICY "Patients delete own appointments" 
ON appointments
FOR DELETE
TO authenticated
USING (auth.uid() = patient_id);

-- Admin full access (if profiles table exists)
CREATE POLICY "Admin full access" 
ON appointments
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- VERIFY policies installed
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'appointments';

-- Test insert as authenticated user (replace with real UUID)
-- INSERT INTO appointments (patient_id, patient_name, service) 
-- VALUES (auth.uid(), 'Test Patient', 'Test');
