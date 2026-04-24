-- Fix RLS Policies for profiles table
-- Allow patients and any authenticated user to view provider (doctor/nurse) profiles
-- This enables the Provider dropdown to work on the booking page

-- Step 1: Check if RLS is enabled (it should be)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop existing restrictive policies that prevent viewing providers
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Step 3: Create new policies with proper access control

-- 3.1: Allow authenticated users to view provider profiles (doctors, nurses)
CREATE POLICY "Authenticated users can view provider profiles" 
ON profiles
FOR SELECT
TO authenticated
USING (role IN ('doctor', 'nurse'));

-- 3.2: Allow all authenticated users to view their own profile
CREATE POLICY "Users can view own profile" 
ON profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- 3.3: Allow users to update their own profile
CREATE POLICY "Users can update own profile" 
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 3.4: Allow users to insert their own profile (for signup)
CREATE POLICY "Users can insert own profile" 
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- 3.5: Allow admin users full access to profiles
CREATE POLICY "Admin full access to profiles" 
ON profiles
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Step 4: Verify policies are in place
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Step 5: Test query (run as authenticated user with patient role)
-- This query should now return all doctors and nurses:
-- SELECT id, name, role, specialty, license FROM profiles WHERE role IN ('doctor', 'nurse');
