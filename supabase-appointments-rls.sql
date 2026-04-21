-- RLS Policies for Appointments Table
-- Run in Supabase SQL Editor

-- Enable RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Patients can create and view their appointments
CREATE POLICY "Patients can create appointments" ON appointments
FOR INSERT WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Patients view own appointments" ON appointments
FOR SELECT USING (patient_id = auth.uid());

-- Doctors/Nurses can view/update their appointments
CREATE POLICY "Providers view own appointments" ON appointments
FOR SELECT USING (doctor_id = auth.uid() OR nurse_id = auth.uid());

CREATE POLICY "Providers update appointments" ON appointments
FOR UPDATE USING (doctor_id = auth.uid() OR nurse_id = auth.uid());

-- Admin full access
CREATE POLICY "Admin full appointments access" ON appointments
FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Verify
SELECT schemaname, tablename, policyname FROM pg_policies WHERE tablename = 'appointments';

