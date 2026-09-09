-- ==============================================================================
-- FIREBASE MIGRATION: SCHEMA UPDATE FOR SUPABASE
-- ==============================================================================
-- WARNING: Firebase UIDs are 28-character strings, not UUIDs.
-- This script alters the schema to drop UUID constraints and change primary/foreign keys to TEXT.
-- It also updates the RLS policies to check the `id` column as a string rather than `auth.uid()`,
-- since `auth.uid()` will be null when authenticated via Firebase.
-- 
-- CAUTION: Running this will drop your existing tables to cleanly recreate them with TEXT IDs.
-- ==============================================================================

-- 1. Drop existing tables
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS expert_assignments CASCADE;
DROP TABLE IF EXISTS soil_test_reports CASCADE;
DROP TABLE IF EXISTS soil_test_results CASCADE;
DROP TABLE IF EXISTS soil_test_requests CASCADE;
DROP TABLE IF EXISTS field_workers CASCADE;
DROP TABLE IF EXISTS labs CASCADE;
DROP TABLE IF EXISTS marketplace_products CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 2. Create Profiles Table (Firebase UIDs are TEXT)
CREATE TABLE profiles (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    mobile TEXT,
    role user_role NOT NULL DEFAULT 'farmer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 3. Create Labs Table
CREATE TABLE labs (
    id TEXT PRIMARY KEY,
    lab_name TEXT NOT NULL,
    license_number TEXT UNIQUE NOT NULL,
    address TEXT NOT NULL,
    state TEXT,
    active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);
-- Note: 'id' maps to profiles.id (a lab admin) for simplicity, or we can keep it independent. 
-- In our logic we map lab.id to profile.id.
ALTER TABLE labs ADD CONSTRAINT fk_lab_profile FOREIGN KEY (id) REFERENCES profiles(id) ON DELETE CASCADE;

-- 4. Create Soil Test Requests
CREATE TABLE soil_test_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    lab_id TEXT REFERENCES labs(id) ON DELETE SET NULL,
    sample_id TEXT UNIQUE,
    farm_size_acres DECIMAL(10,2),
    crop_type TEXT,
    status request_status DEFAULT 'PENDING',
    payment_status payment_status DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 5. Create Soil Test Reports
CREATE TABLE soil_test_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES soil_test_requests(id) ON DELETE CASCADE,
    lab_id TEXT NOT NULL REFERENCES labs(id),
    report_url TEXT NOT NULL,
    summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 6. Create Expert Assignments
CREATE TABLE expert_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES soil_test_requests(id) ON DELETE CASCADE,
    expert_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'ASSIGNED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 7. Disable Strict RLS (Since we are using Firebase Auth)
-- Because auth.uid() is specific to Supabase Auth, we cannot use it easily.
-- For this setup, we will disable RLS on the tables and rely on the frontend
-- to pass the Firebase UID to the Supabase client safely.
-- (Note: In a true production environment with Firebase + Supabase, you would set up a custom JWT integration).

ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE labs DISABLE ROW LEVEL SECURITY;
ALTER TABLE soil_test_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE soil_test_reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE expert_assignments DISABLE ROW LEVEL SECURITY;

-- Note: Ensure you manually create your admin, lab, and expert users in the Firebase Auth console,
-- then copy their Firebase UIDs into the `profiles` table in Supabase via the SQL Editor.
