-- Fix RLS for profiles table to allow authenticated users to insert/update own profile
-- Run this in Supabase SQL Editor

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admin full access profiles" ON profiles;

-- Allow authenticated users to view own profile
CREATE POLICY "Users can view own profile" ON profiles
FOR SELECT USING (auth.uid() = id);

-- Allow authenticated users to insert their own profile (key for signup flow)
CREATE POLICY "Users can insert own profile" ON profiles
FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow authenticated users to update their own profile
CREATE POLICY "Users can update own profile" ON profiles
FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Admin can do everything
CREATE POLICY "Admin full access profiles" ON profiles
FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Verify policies
SELECT schemaname, tablename, policyname FROM pg_policies WHERE tablename = 'profiles';

