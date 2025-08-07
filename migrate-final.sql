-- MIGRATION FINALE : Déplacer les données app.* vers public.*
-- EXÉCUTEZ CE SCRIPT dans votre dashboard Supabase

-- 1. Créer les tables dans le schéma public (si elles n'existent pas)
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

-- 2. Insérer les données de test si aucune donnée n'existe
INSERT INTO public.services (id, name_fr, name_pt, name_en, description_fr, description_pt, description_en, price, duration, is_active)
VALUES 
    (gen_random_uuid(), 'Consultation Ostéopathique', 'Consulta Osteopática', 'Osteopathic Consultation', 'Consultation complète avec diagnostic et traitement ostéopathique personnalisé', 'Consulta completa com diagnóstico e tratamento osteopático personalizado', 'Complete consultation with diagnosis and personalized osteopathic treatment', 65.00, 60, true),
    (gen_random_uuid(), 'Thérapie Manuelle', 'Terapia Manual', 'Manual Therapy', 'Techniques de thérapie manuelle pour soulager les douleurs et améliorer la mobilité', 'Técnicas de terapia manual para aliviar dores e melhorar a mobilidade', 'Manual therapy techniques to relieve pain and improve mobility', 55.00, 45, true),
    (gen_random_uuid(), 'Consultation de Suivi', 'Consulta de Acompanhamento', 'Follow-up Consultation', 'Séance de suivi pour évaluer les progrès et ajuster le traitement', 'Sessão de acompanhamento para avaliar progressos e ajustar o tratamento', 'Follow-up session to assess progress and adjust treatment', 50.00, 30, true)
ON CONFLICT (id) DO NOTHING;

-- 3. Copier les données existantes depuis app.* si elles existent (optionnel)
DO $$
BEGIN
    -- Copier services si la table app.services existe
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'app' AND table_name = 'services') THEN
        INSERT INTO public.services (id, name_fr, name_pt, name_en, description_fr, description_pt, description_en, price, duration, is_active, created_at, updated_at)
        SELECT id, name_fr, name_pt, name_en, description_fr, description_pt, description_en, price, duration, is_active, created_at, updated_at
        FROM app.services
        ON CONFLICT (id) DO UPDATE SET
            name_fr = EXCLUDED.name_fr,
            name_pt = EXCLUDED.name_pt,
            name_en = EXCLUDED.name_en,
            description_fr = EXCLUDED.description_fr,
            description_pt = EXCLUDED.description_pt,
            description_en = EXCLUDED.description_en,
            price = EXCLUDED.price,
            duration = EXCLUDED.duration,
            is_active = EXCLUDED.is_active,
            updated_at = NOW();
    END IF;

    -- Copier users si la table app.users existe
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'app' AND table_name = 'users') THEN
        INSERT INTO public.users (id, email, first_name, last_name, phone, preferred_language, created_at, updated_at)
        SELECT id, email, first_name, last_name, phone, preferred_language, created_at, updated_at
        FROM app.users
        ON CONFLICT (email) DO UPDATE SET
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name,
            phone = EXCLUDED.phone,
            preferred_language = EXCLUDED.preferred_language,
            updated_at = NOW();
    END IF;

    -- Copier appointments si la table app.appointments existe
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'app' AND table_name = 'appointments') THEN
        INSERT INTO public.appointments (id, user_id, service_id, appointment_date, status, notes, payment_status, payment_id, created_at, updated_at)
        SELECT id, user_id, service_id, appointment_date, status, notes, payment_status, payment_id, created_at, updated_at
        FROM app.appointments
        ON CONFLICT (id) DO NOTHING;
    END IF;
END $$;

-- 4. Configurer RLS (Row Level Security)
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Services sont lisibles par tous
DROP POLICY IF EXISTS "Services are publicly readable" ON public.services;
CREATE POLICY "Services are publicly readable" ON public.services
    FOR SELECT USING (true);

-- Users peuvent être créés et lus
DROP POLICY IF EXISTS "Users can be created and read" ON public.users;
CREATE POLICY "Users can be created and read" ON public.users
    FOR ALL USING (true);

-- Appointments peuvent être créés et lus
DROP POLICY IF EXISTS "Appointments can be managed" ON public.appointments;
CREATE POLICY "Appointments can be managed" ON public.appointments
    FOR ALL USING (true);

-- 5. Créer les index pour les performances
CREATE INDEX IF NOT EXISTS idx_services_active ON public.services(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date);

-- 6. Fonction pour mise à jour automatique de updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ajouter les triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_services_updated_at ON public.services;
CREATE TRIGGER update_services_updated_at
    BEFORE UPDATE ON public.services
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_appointments_updated_at ON public.appointments;
CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON public.appointments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- 7. Test final
SELECT 'Services created:', count(*) FROM public.services;
SELECT 'Users created:', count(*) FROM public.users;
SELECT 'Appointments created:', count(*) FROM public.appointments;

-- Afficher les services pour vérifier
SELECT id, name_fr, price, duration, is_active FROM public.services WHERE is_active = true ORDER BY price;