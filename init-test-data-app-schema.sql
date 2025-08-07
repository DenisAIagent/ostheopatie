-- Script pour initialiser des données de test dans le schéma 'app'
-- À exécuter si le schéma 'app' existe mais n'a pas de données

-- Créer le schéma app s'il n'existe pas
CREATE SCHEMA IF NOT EXISTS app;

-- Créer les tables dans le schéma app (si elles n'existent pas)
CREATE TABLE IF NOT EXISTS app.services (
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

CREATE TABLE IF NOT EXISTS app.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    preferred_language TEXT CHECK (preferred_language IN ('fr', 'pt', 'en')) DEFAULT 'fr',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES app.services(id) ON DELETE RESTRICT,
    appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')) DEFAULT 'pending',
    notes TEXT,
    payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'failed')) DEFAULT 'pending',
    payment_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_appointment_time UNIQUE (appointment_date)
);

-- Insérer des services de test dans le schéma app
INSERT INTO app.services (name_fr, name_pt, name_en, description_fr, description_pt, description_en, price, duration, is_active) VALUES
(
    'Consultation Ostéopathique Standard',
    'Consulta Osteopática Padrão',
    'Standard Osteopathic Consultation',
    'Évaluation complète et traitement ostéopathique. Idéale pour les douleurs musculo-squelettiques, les tensions et les problèmes de mobilité.',
    'Avaliação completa e tratamento osteopático. Ideal para dores músculo-esqueléticas, tensões e problemas de mobilidade.',
    'Complete evaluation and osteopathic treatment. Ideal for musculoskeletal pain, tension, and mobility issues.',
    60.00,
    60,
    true
),
(
    'Consultation Première Visite',
    'Consulta Primeira Visita',
    'First Visit Consultation',
    'Consultation initiale approfondie avec anamnèse complète, examen physique détaillé et plan de traitement personnalisé.',
    'Consulta inicial aprofundada com anamnese completa, exame físico detalhado e plano de tratamento personalizado.',
    'Comprehensive initial consultation with complete history taking, detailed physical examination, and personalized treatment plan.',
    80.00,
    90,
    true
),
(
    'Traitement Spécialisé',
    'Tratamento Especializado',
    'Specialized Treatment',
    'Traitement ciblé pour pathologies spécifiques. Techniques avancées d''ostéopathie structurelle et fonctionnelle.',
    'Tratamento direcionado para patologias específicas. Técnicas avançadas de osteopatia estrutural e funcional.',
    'Targeted treatment for specific pathologies. Advanced structural and functional osteopathy techniques.',
    75.00,
    75,
    true
),
(
    'Séance de Suivi',
    'Sessão de Acompanhamento',
    'Follow-up Session',
    'Séance de contrôle et ajustement du traitement. Évaluation des progrès et adaptations thérapeutiques si nécessaire.',
    'Sessão de controlo e ajuste do tratamento. Avaliação do progresso e adaptações terapêuticas se necessário.',
    'Treatment monitoring and adjustment session. Progress evaluation and therapeutic adaptations if necessary.',
    55.00,
    45,
    true
),
(
    'Consultation Express',
    'Consulta Expressa',
    'Express Consultation',
    'Consultation courte pour problèmes ponctuels ou ajustements rapides. Traitement ciblé et efficace.',
    'Consulta curta para problemas pontuais ou ajustes rápidos. Tratamento direcionado e eficaz.',
    'Short consultation for specific issues or quick adjustments. Targeted and efficient treatment.',
    45.00,
    30,
    true
)
ON CONFLICT (id) DO NOTHING;

-- Créer des indexes pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_app_services_active ON app.services(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_app_services_price ON app.services(price);
CREATE INDEX IF NOT EXISTS idx_app_users_email ON app.users(email);
CREATE INDEX IF NOT EXISTS idx_app_appointments_date ON app.appointments(appointment_date);

-- Vérification des données insérées
SELECT 'Services dans le schéma app:' as info, count(*) as total FROM app.services WHERE is_active = true;