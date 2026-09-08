-- =========================================================
-- KRISHI SHAKTI - SOIL TESTING LAB PORTAL SUPABASE SETUP
-- =========================================================

-- 1. Create soil_test_requests table
CREATE TABLE IF NOT EXISTS public.soil_test_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sample_id VARCHAR(50) NOT NULL UNIQUE,
    farmer_name VARCHAR(255) NOT NULL,
    farm_location VARCHAR(255) NOT NULL,
    village VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    land_area NUMERIC(10, 2) NOT NULL,
    current_crop VARCHAR(100) NOT NULL,
    planned_crop VARCHAR(100) NOT NULL,
    soil_type VARCHAR(100) NOT NULL,
    collection_date DATE NOT NULL,
    notes TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending', -- 'Pending', 'Sample Received', 'Testing', 'Report Ready', 'Completed'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create soil_test_reports table
CREATE TABLE IF NOT EXISTS public.soil_test_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES public.soil_test_requests(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lab_id VARCHAR(100) NOT NULL DEFAULT 'central-lab-01',
    report_file_path TEXT NOT NULL,
    report_name VARCHAR(255) NOT NULL,
    remarks TEXT,
    tested_by VARCHAR(255) DEFAULT 'Senior Soil Chemist',
    status VARCHAR(50) NOT NULL DEFAULT 'Available',
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create lab_profiles table
CREATE TABLE IF NOT EXISTS public.lab_profiles (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    reg_no VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'VERIFIED', -- 'VERIFIED', 'PENDING_APPROVAL', 'REJECTED'
    active_tests INT DEFAULT 0,
    tests_completed INT DEFAULT 0,
    contact_email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    accreditation VARCHAR(255) DEFAULT 'NABL & ICAR Accredited',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexing for high-performance user data lookups
CREATE INDEX IF NOT EXISTS idx_soil_requests_user_id ON public.soil_test_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_soil_reports_user_id ON public.soil_test_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_soil_reports_request_id ON public.soil_test_requests(id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.soil_test_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soil_test_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_profiles ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES FOR soil_test_requests
CREATE POLICY "Users can view own soil test requests"
    ON public.soil_test_requests
    FOR SELECT
    USING (auth.uid() = user_id OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'lab' OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

CREATE POLICY "Users can insert own soil test requests"
    ON public.soil_test_requests
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Lab and Admin can update soil test request status"
    ON public.soil_test_requests
    FOR UPDATE
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('lab', 'admin'))
    WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('lab', 'admin'));

-- RLS POLICIES FOR soil_test_reports
CREATE POLICY "Users can view own soil test reports"
    ON public.soil_test_reports
    FOR SELECT
    USING (auth.uid() = user_id OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('lab', 'admin'));

CREATE POLICY "Lab can insert soil test reports"
    ON public.soil_test_reports
    FOR INSERT
    WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('lab', 'admin'));

-- RLS POLICIES FOR lab_profiles
CREATE POLICY "Public read for lab profiles"
    ON public.lab_profiles
    FOR SELECT
    USING (true);
