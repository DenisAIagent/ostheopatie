-- SOLUTION IMMÉDIATE : Fonction RPC pour accéder aux services dans le schéma 'app'
-- Cette fonction contourne la limitation de l'API REST Supabase

-- 1. Fonction pour récupérer les services depuis le schéma 'app'
CREATE OR REPLACE FUNCTION public.get_services_from_app()
RETURNS TABLE (
  id UUID,
  name_fr TEXT,
  name_pt TEXT,
  name_en TEXT,
  description_fr TEXT,
  description_pt TEXT,
  description_en TEXT,
  price DECIMAL(10,2),
  duration INTEGER,
  is_active BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT id, name_fr, name_pt, name_en, description_fr, description_pt, description_en, 
         price, duration, is_active, created_at, updated_at
  FROM app.services 
  WHERE is_active = true 
  ORDER BY price;
$$;

-- 2. Fonction pour récupérer les utilisateurs depuis le schéma 'app'
CREATE OR REPLACE FUNCTION public.get_users_from_app()
RETURNS TABLE (
  id UUID,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  preferred_language TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT id, email, first_name, last_name, phone, preferred_language, created_at, updated_at
  FROM app.users;
$$;

-- 3. Fonction pour insérer un utilisateur dans le schéma 'app'
CREATE OR REPLACE FUNCTION public.insert_user_to_app(
  p_id UUID,
  p_email TEXT,
  p_first_name TEXT,
  p_last_name TEXT,
  p_phone TEXT,
  p_preferred_language TEXT DEFAULT 'fr'
)
RETURNS TABLE (
  id UUID,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  preferred_language TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  INSERT INTO app.users (id, email, first_name, last_name, phone, preferred_language)
  VALUES (p_id, p_email, p_first_name, p_last_name, p_phone, p_preferred_language)
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    phone = EXCLUDED.phone,
    preferred_language = EXCLUDED.preferred_language,
    updated_at = NOW()
  RETURNING id, email, first_name, last_name, phone, preferred_language, created_at, updated_at;
$$;

-- 4. Fonction pour insérer un rendez-vous dans le schéma 'app'
CREATE OR REPLACE FUNCTION public.insert_appointment_to_app(
  p_user_id UUID,
  p_service_id UUID,
  p_appointment_date TIMESTAMP WITH TIME ZONE,
  p_notes TEXT DEFAULT NULL,
  p_status TEXT DEFAULT 'pending',
  p_payment_status TEXT DEFAULT 'pending'
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  service_id UUID,
  appointment_date TIMESTAMP WITH TIME ZONE,
  status TEXT,
  notes TEXT,
  payment_status TEXT,
  payment_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  INSERT INTO app.appointments (user_id, service_id, appointment_date, notes, status, payment_status)
  VALUES (p_user_id, p_service_id, p_appointment_date, p_notes, p_status, p_payment_status)
  RETURNING id, user_id, service_id, appointment_date, status, notes, payment_status, payment_id, created_at, updated_at;
$$;

-- 5. Grant permissions pour que l'API puisse utiliser ces fonctions
GRANT EXECUTE ON FUNCTION public.get_services_from_app() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_users_from_app() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.insert_user_to_app(UUID, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.insert_appointment_to_app(UUID, UUID, TIMESTAMP WITH TIME ZONE, TEXT, TEXT, TEXT) TO anon, authenticated;

-- Test rapide (à décommenter pour tester)
-- SELECT * FROM public.get_services_from_app();