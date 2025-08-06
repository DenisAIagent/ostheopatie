-- Enable RLS (Row Level Security)
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create custom schema for our application
CREATE SCHEMA IF NOT EXISTS app;

-- Users table (extends Supabase auth.users)
CREATE TABLE app.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    preferred_language TEXT CHECK (preferred_language IN ('fr', 'pt', 'en')) DEFAULT 'fr',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Services table
CREATE TABLE app.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_fr TEXT NOT NULL,
    name_pt TEXT NOT NULL,
    name_en TEXT NOT NULL,
    description_fr TEXT NOT NULL,
    description_pt TEXT NOT NULL,
    description_en TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL CHECK (price > 0),
    duration INTEGER NOT NULL CHECK (duration > 0), -- in minutes
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Appointments table
CREATE TABLE app.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES app.services(id) ON DELETE RESTRICT,
    appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')) DEFAULT 'pending',
    notes TEXT,
    payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'failed')) DEFAULT 'pending',
    payment_id TEXT, -- Mollie payment ID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure no double booking
    CONSTRAINT unique_appointment_time UNIQUE (appointment_date)
);

-- Availability table for practitioner schedule
CREATE TABLE app.availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure logical time constraints
    CONSTRAINT valid_time_range CHECK (end_time > start_time),
    -- Prevent overlapping time slots
    CONSTRAINT unique_time_slot UNIQUE (date, start_time, end_time)
);

-- Insert initial services
INSERT INTO app.services (name_fr, name_pt, name_en, description_fr, description_pt, description_en, price, duration) VALUES
(
    'Consultation Standard',
    'Consulta Padrão',
    'Standard Consultation',
    'Consultation d''ostéopathie classique pour tous les âges',
    'Consulta de osteopatia clássica para todas as idades',
    'Classic osteopathy consultation for all ages',
    55.00,
    60
),
(
    'Tarif Réduit',
    'Tarifa Reduzida',
    'Reduced Rate',
    'Pour bébés < 1 an, demandeurs d''emploi et salaire minimum',
    'Para bebés < 1 ano, desempregados e salário mínimo',
    'For babies < 1 year, unemployed and minimum wage',
    50.00,
    60
),
(
    'Ostéopathie Aquatique',
    'Osteopatia Aquática',
    'Aquatic Osteopathy',
    'Séances spécialisées en milieu aquatique',
    'Sessões especializadas em ambiente aquático',
    'Specialized sessions in aquatic environment',
    90.00,
    90
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION app.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON app.users
    FOR EACH ROW
    EXECUTE FUNCTION app.update_updated_at();

CREATE TRIGGER update_services_updated_at
    BEFORE UPDATE ON app.services
    FOR EACH ROW
    EXECUTE FUNCTION app.update_updated_at();

CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON app.appointments
    FOR EACH ROW
    EXECUTE FUNCTION app.update_updated_at();

CREATE TRIGGER update_availability_updated_at
    BEFORE UPDATE ON app.availability
    FOR EACH ROW
    EXECUTE FUNCTION app.update_updated_at();

-- Row Level Security Policies
ALTER TABLE app.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.availability ENABLE ROW LEVEL SECURITY;

-- Users can only see/edit their own data
CREATE POLICY "Users can view own profile" ON app.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON app.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON app.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Services are public (read-only for users)
CREATE POLICY "Services are publicly readable" ON app.services
    FOR SELECT USING (true);

-- Appointments: users can only see their own
CREATE POLICY "Users can view own appointments" ON app.appointments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own appointments" ON app.appointments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own appointments" ON app.appointments
    FOR UPDATE USING (auth.uid() = user_id);

-- Availability is public (read-only)
CREATE POLICY "Availability is publicly readable" ON app.availability
    FOR SELECT USING (true);

-- Create indexes for better performance
CREATE INDEX idx_appointments_user_id ON app.appointments(user_id);
CREATE INDEX idx_appointments_date ON app.appointments(appointment_date);
CREATE INDEX idx_appointments_status ON app.appointments(status);
CREATE INDEX idx_availability_date ON app.availability(date);
CREATE INDEX idx_services_active ON app.services(is_active) WHERE is_active = true;