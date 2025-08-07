-- Migration script: Move tables from 'app' schema to 'public' schema
-- This will help resolve the schema mismatch issue

-- 1. Create tables in public schema (if they don't exist)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    preferred_language TEXT CHECK (preferred_language IN ('fr', 'pt', 'en')) DEFAULT 'fr',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_fr TEXT NOT NULL,
    name_pt TEXT NOT NULL,
    name_en TEXT NOT NULL,
    description_fr TEXT NOT NULL,
    description_pt TEXT NOT NULL,
    description_en TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL CHECK (price > 0),
    duration INTEGER NOT NULL CHECK (duration > 0),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
    appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')) DEFAULT 'pending',
    notes TEXT,
    payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'failed')) DEFAULT 'pending',
    payment_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_appointment_time UNIQUE (appointment_date)
);

CREATE TABLE IF NOT EXISTS public.availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_time_range CHECK (end_time > start_time),
    CONSTRAINT unique_time_slot UNIQUE (date, start_time, end_time)
);

-- 2. Copy data from app schema to public schema (if app schema exists)
INSERT INTO public.services (id, name_fr, name_pt, name_en, description_fr, description_pt, description_en, price, duration, is_active, created_at, updated_at)
SELECT id, name_fr, name_pt, name_en, description_fr, description_pt, description_en, price, duration, is_active, created_at, updated_at
FROM app.services
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id, email, first_name, last_name, phone, preferred_language, created_at, updated_at)
SELECT id, email, first_name, last_name, phone, preferred_language, created_at, updated_at
FROM app.users
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.appointments (id, user_id, service_id, appointment_date, status, notes, payment_status, payment_id, created_at, updated_at)
SELECT id, user_id, service_id, appointment_date, status, notes, payment_status, payment_id, created_at, updated_at
FROM app.appointments
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.availability (id, date, start_time, end_time, is_available, created_at, updated_at)
SELECT id, date, start_time, end_time, is_available, created_at, updated_at
FROM app.availability
ON CONFLICT (id) DO NOTHING;

-- 3. Set up RLS policies for public schema
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;

-- Services are publicly readable
CREATE POLICY "Services are publicly readable" ON public.services
    FOR SELECT USING (true);

-- Availability is publicly readable
CREATE POLICY "Availability is publicly readable" ON public.availability
    FOR SELECT USING (true);

-- Users and appointments policies (basic for now)
CREATE POLICY "Users can manage own data" ON public.users
    FOR ALL USING (true);

CREATE POLICY "Appointments can be managed" ON public.appointments
    FOR ALL USING (true);

-- 4. Create indexes
CREATE INDEX IF NOT EXISTS idx_services_active ON public.services(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_availability_date ON public.availability(date);

-- 5. Add trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_services_updated_at
    BEFORE UPDATE ON public.services
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON public.appointments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_availability_updated_at
    BEFORE UPDATE ON public.availability
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();