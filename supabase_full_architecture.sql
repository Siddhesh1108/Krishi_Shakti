-- Supabase Full Architecture for Agriculture Platform

-- 1. Custom Types
CREATE TYPE user_role AS ENUM ('admin', 'lab', 'expert', 'farmer');
CREATE TYPE request_status AS ENUM ('Pending', 'Accepted', 'Sample Received', 'Testing', 'Report Generated', 'Completed', 'Rejected');

-- 2. Tables

-- Profiles table (extends auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'farmer',
    full_name TEXT,
    mobile TEXT,
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Labs table
CREATE TABLE public.labs (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    lab_name TEXT NOT NULL,
    license_number TEXT,
    address TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Field Workers table
CREATE TABLE public.field_workers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lab_id UUID NOT NULL REFERENCES public.labs(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    mobile TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Soil Test Requests
CREATE TABLE public.soil_test_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    lab_id UUID REFERENCES public.labs(id),
    assigned_worker_id UUID REFERENCES public.field_workers(id),
    status request_status DEFAULT 'Pending',
    sample_id TEXT UNIQUE,
    farm_size TEXT,
    crop_intended TEXT,
    location TEXT,
    notes TEXT,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Soil Test Results (Data)
CREATE TABLE public.soil_test_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL UNIQUE REFERENCES public.soil_test_requests(id) ON DELETE CASCADE,
    ph_level NUMERIC,
    nitrogen NUMERIC,
    phosphorus NUMERIC,
    potassium NUMERIC,
    organic_carbon NUMERIC,
    moisture NUMERIC,
    recommendations TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Soil Test Reports (PDF Metadata)
CREATE TABLE public.soil_test_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL UNIQUE REFERENCES public.soil_test_requests(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    lab_id UUID NOT NULL REFERENCES public.labs(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    file_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expert Assignments
CREATE TABLE public.expert_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    expert_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES public.profiles(id),
    active BOOLEAN DEFAULT true,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, expert_id)
);

-- Conversations
CREATE TABLE public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    expert_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, expert_id)
);

-- Messages
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Marketplace Products
CREATE TABLE public.marketplace_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    stock INTEGER DEFAULT 0,
    category TEXT,
    image_url TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES public.profiles(id)
);

-- 4. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.labs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.field_workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soil_test_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soil_test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soil_test_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expert_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_products ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies

-- Profiles
CREATE POLICY "Public profiles are viewable by all authenticated users."
    ON public.profiles FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert their own profile."
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile."
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Fix for infinite recursion: avoid querying profiles table in a FOR ALL policy.
-- Admins can update/delete any profile. The subquery is isolated.
CREATE POLICY "Admins can update all profiles."
    ON public.profiles FOR UPDATE
    USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admins can delete all profiles."
    ON public.profiles FOR DELETE
    USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Labs
CREATE POLICY "Labs viewable by authenticated users"
    ON public.labs FOR SELECT
    USING (auth.role() = 'authenticated');
    
CREATE POLICY "Admins can manage labs"
    ON public.labs FOR ALL
    USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Labs can update own record"
    ON public.labs FOR UPDATE
    USING (auth.uid() = id);

-- Field Workers
CREATE POLICY "Field workers viewable by admins and respective lab"
    ON public.field_workers FOR SELECT
    USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') OR
        lab_id = auth.uid()
    );

CREATE POLICY "Labs can manage own field workers"
    ON public.field_workers FOR ALL
    USING (lab_id = auth.uid());

CREATE POLICY "Admins can manage field workers"
    ON public.field_workers FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Soil Test Requests
CREATE POLICY "Users view own requests"
    ON public.soil_test_requests FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Labs view assigned requests"
    ON public.soil_test_requests FOR SELECT
    USING (lab_id = auth.uid() OR lab_id IS NULL);

CREATE POLICY "Experts view requests of assigned clients"
    ON public.soil_test_requests FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.expert_assignments 
            WHERE expert_assignments.expert_id = auth.uid() 
            AND expert_assignments.user_id = soil_test_requests.user_id
            AND expert_assignments.active = true
        )
    );

CREATE POLICY "Admins view all requests"
    ON public.soil_test_requests FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users create requests"
    ON public.soil_test_requests FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Labs update assigned requests"
    ON public.soil_test_requests FOR UPDATE
    USING (lab_id = auth.uid() OR lab_id IS NULL);

CREATE POLICY "Admins manage all requests"
    ON public.soil_test_requests FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Soil Test Results
CREATE POLICY "Users view own results"
    ON public.soil_test_results FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.soil_test_requests 
            WHERE soil_test_requests.id = soil_test_results.request_id 
            AND soil_test_requests.user_id = auth.uid()
        )
    );

CREATE POLICY "Labs view own results"
    ON public.soil_test_results FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.soil_test_requests 
            WHERE soil_test_requests.id = soil_test_results.request_id 
            AND soil_test_requests.lab_id = auth.uid()
        )
    );

CREATE POLICY "Experts view results of assigned clients"
    ON public.soil_test_results FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.soil_test_requests r
            JOIN public.expert_assignments e ON r.user_id = e.user_id
            WHERE r.id = soil_test_results.request_id 
            AND e.expert_id = auth.uid()
            AND e.active = true
        )
    );

CREATE POLICY "Admins view all results"
    ON public.soil_test_results FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Labs insert/update own results"
    ON public.soil_test_results FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.soil_test_requests 
            WHERE soil_test_requests.id = soil_test_results.request_id 
            AND soil_test_requests.lab_id = auth.uid()
        )
    );

CREATE POLICY "Admins manage all results"
    ON public.soil_test_results FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Soil Test Reports
CREATE POLICY "Users view own reports"
    ON public.soil_test_reports FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Labs view own reports"
    ON public.soil_test_reports FOR SELECT
    USING (lab_id = auth.uid());

CREATE POLICY "Experts view reports of assigned clients"
    ON public.soil_test_reports FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.expert_assignments 
            WHERE expert_assignments.expert_id = auth.uid() 
            AND expert_assignments.user_id = soil_test_reports.user_id
            AND expert_assignments.active = true
        )
    );

CREATE POLICY "Admins view all reports"
    ON public.soil_test_reports FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Labs insert own reports"
    ON public.soil_test_reports FOR INSERT
    WITH CHECK (lab_id = auth.uid());

CREATE POLICY "Labs delete own reports"
    ON public.soil_test_reports FOR DELETE
    USING (lab_id = auth.uid());

CREATE POLICY "Admins manage all reports"
    ON public.soil_test_reports FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Expert Assignments
CREATE POLICY "Users view own assignments"
    ON public.expert_assignments FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Experts view own assignments"
    ON public.expert_assignments FOR SELECT
    USING (expert_id = auth.uid());

CREATE POLICY "Admins manage assignments"
    ON public.expert_assignments FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Conversations
CREATE POLICY "Users view own conversations"
    ON public.conversations FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Experts view own conversations"
    ON public.conversations FOR SELECT
    USING (expert_id = auth.uid());

CREATE POLICY "Admins view all conversations"
    ON public.conversations FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users and Experts can create conversations"
    ON public.conversations FOR INSERT
    WITH CHECK (user_id = auth.uid() OR expert_id = auth.uid());

-- Messages
CREATE POLICY "Users view own messages"
    ON public.messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.conversations 
            WHERE conversations.id = messages.conversation_id 
            AND (conversations.user_id = auth.uid() OR conversations.expert_id = auth.uid())
        )
    );

CREATE POLICY "Users can send messages"
    ON public.messages FOR INSERT
    WITH CHECK (
        sender_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.conversations 
            WHERE conversations.id = messages.conversation_id 
            AND (conversations.user_id = auth.uid() OR conversations.expert_id = auth.uid())
        )
    );

-- Marketplace Products
CREATE POLICY "Public view active products"
    ON public.marketplace_products FOR SELECT
    USING (active = true);

CREATE POLICY "Admins view all products"
    ON public.marketplace_products FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins manage products"
    ON public.marketplace_products FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Storage Policies for soil-test-reports
-- NOTE: Need to run these manually in Supabase SQL Editor if storage is enabled via dashboard
-- CREATE POLICY "Labs can upload reports" ON storage.objects FOR INSERT TO authenticated WITH CHECK ( bucket_id = 'soil-test-reports' AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('lab', 'admin'))) );
-- CREATE POLICY "Users can view their reports" ON storage.objects FOR SELECT TO authenticated USING ( bucket_id = 'soil-test-reports' );

-- Triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_modtime
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_soil_requests_modtime
    BEFORE UPDATE ON public.soil_test_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
