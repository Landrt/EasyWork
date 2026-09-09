-- ==============================================================================
-- EASYWORK SAAS - SCRIPT D'INITIALISATION COMPLET PRODUCTION SUPABASE
-- Version : 1.0.0
-- Description : Schéma unifié, ordonné et idempotent pour déploiement en 1 clic
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;

-- 2. FONCTIONS GLOBALES
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;

-- 3. TABLE DES PROFILS UTILISATEURS
CREATE TABLE IF NOT EXISTS public.profiles (
    user_id uuid NOT NULL,
    first_name text NULL,
    last_name text NULL,
    email text NULL,
    phone_number text NULL,
    location text NULL,
    website text NULL,
    linkedin_url text NULL,
    github_url text NULL,
    work_experience jsonb NULL DEFAULT '[]'::jsonb,
    education jsonb NULL DEFAULT '[]'::jsonb,
    skills jsonb NULL DEFAULT '[]'::jsonb,
    projects jsonb NULL DEFAULT '[]'::jsonb,
    certifications jsonb NULL DEFAULT '[]'::jsonb,
    is_admin boolean DEFAULT false,
    is_suspended boolean DEFAULT false,
    referred_by text NULL,
    referred_by_partner_id uuid NULL,
    referred_at timestamp with time zone NULL,
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT profiles_pkey PRIMARY KEY (user_id),
    CONSTRAINT profiles_user_id_key UNIQUE (user_id),
    CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE
);

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 4. TABLE DES OFFRES D'EMPLOI CIBLÉES
CREATE TABLE IF NOT EXISTS public.jobs (
    id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    user_id uuid NOT NULL,
    company_name text NOT NULL,
    position_title text NOT NULL,
    job_url text NULL,
    description text NULL,
    location text NULL,
    salary_range text NULL,
    keywords text[] NULL DEFAULT ARRAY[]::text[],
    work_location text NULL,
    employment_type text NULL,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT jobs_pkey PRIMARY KEY (id),
    CONSTRAINT jobs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT jobs_employment_type_check CHECK (
        employment_type = ANY (ARRAY['full_time'::text, 'part_time'::text, 'co_op'::text, 'internship'::text, 'contract'::text])
    ),
    CONSTRAINT jobs_work_location_check CHECK (
        work_location = ANY (ARRAY['remote'::text, 'in_person'::text, 'hybrid'::text])
    )
);

DROP TRIGGER IF EXISTS update_jobs_updated_at ON public.jobs;
CREATE TRIGGER update_jobs_updated_at
    BEFORE UPDATE ON public.jobs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 5. TABLE DES CVS & CANDIDATURES
CREATE TABLE IF NOT EXISTS public.resumes (
    id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    user_id uuid NOT NULL,
    job_id uuid NULL,
    is_base_resume boolean NULL DEFAULT false,
    name text NOT NULL,
    first_name text NULL,
    last_name text NULL,
    email text NULL,
    phone_number text NULL,
    location text NULL,
    website text NULL,
    linkedin_url text NULL,
    github_url text NULL,
    professional_summary text NULL,
    work_experience jsonb NULL DEFAULT '[]'::jsonb,
    education jsonb NULL DEFAULT '[]'::jsonb,
    skills jsonb NULL DEFAULT '[]'::jsonb,
    projects jsonb NULL DEFAULT '[]'::jsonb,
    certifications jsonb NULL DEFAULT '[]'::jsonb,
    section_order jsonb NULL DEFAULT '["professional_summary", "work_experience", "skills", "projects", "education", "certifications"]'::jsonb,
    section_configs jsonb NULL DEFAULT '{"skills": {"style": "grouped", "visible": true}, "projects": {"visible": true, "max_items": 3}, "education": {"visible": true}, "certifications": {"visible": true}, "work_experience": {"visible": true}, "professional_summary": {"visible": true}}'::jsonb,
    document_settings jsonb NULL DEFAULT '{"font_size": "10pt", "document_font": "font-sans", "document_theme": "classic", "document_color": "#2563eb", "document_margin": "normal", "document_line_height": "1.15"}'::jsonb,
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    application_status text NULL DEFAULT 'preparing',
    match_analysis jsonb NULL DEFAULT NULL,
    pending_questions jsonb NULL DEFAULT '[]'::jsonb,
    target_role text NULL,
    score integer NULL,
    cover_letter text NULL,
    CONSTRAINT resumes_pkey PRIMARY KEY (id),
    CONSTRAINT resumes_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT resumes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT resumes_application_status_check CHECK (
        application_status = ANY (ARRAY['preparing'::text, 'applied'::text, 'interviewing'::text, 'rejected'::text, 'offer'::text])
    )
);

DROP TRIGGER IF EXISTS update_resumes_updated_at ON public.resumes;
CREATE TRIGGER update_resumes_updated_at
    BEFORE UPDATE ON public.resumes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 6. TABLE DES ABONNEMENTS
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    paddle_subscription_id text NULL,
    paddle_customer_id text NULL,
    paddle_price_id text NULL,
    paddle_transaction_id text NULL,
    payment_provider text NOT NULL DEFAULT 'paddle',
    subscription_plan text NOT NULL DEFAULT 'free', -- 'free', 'sprint', 'monthly', 'lifetime'
    subscription_status text NOT NULL DEFAULT 'active', -- 'active', 'canceled', 'past_due'
    current_period_end timestamp with time zone NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_paddle_sub ON public.subscriptions(paddle_subscription_id);

-- 7. TABLE DES PAIEMENTS ET TRANSACTIONS
CREATE TABLE IF NOT EXISTS public.payments (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tx_ref text UNIQUE NOT NULL,
    paddle_transaction_id text NULL,
    payment_provider text NOT NULL DEFAULT 'paddle',
    plan text NOT NULL DEFAULT 'sprint',
    amount numeric NOT NULL,
    currency text NOT NULL DEFAULT 'EUR',
    status text NOT NULL DEFAULT 'successful',
    payment_method text NULL DEFAULT 'Carte Bancaire',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_payments_user ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_paddle_tx ON public.payments(paddle_transaction_id);

-- 8. CONFIGURATION DYNAMIQUE DES TARIFS
CREATE TABLE IF NOT EXISTS public.admin_pricing_config (
    id text PRIMARY KEY DEFAULT 'default',
    sprint_price numeric NOT NULL DEFAULT 13,
    monthly_price numeric NOT NULL DEFAULT 22,
    lifetime_price numeric NOT NULL DEFAULT 69,
    founder_quota_total integer NOT NULL DEFAULT 200,
    founder_quota_used integer NOT NULL DEFAULT 0,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

INSERT INTO public.admin_pricing_config (id, sprint_price, monthly_price, lifetime_price, founder_quota_total, founder_quota_used)
VALUES ('default', 13, 22, 69, 200, 0)
ON CONFLICT (id) DO NOTHING;

-- 9. PROGRAMME PARTENAIRES & AFFILIATION (30% Récurrent)
CREATE TABLE IF NOT EXISTS public.affiliates (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    code text UNIQUE NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    commission_rate numeric NOT NULL DEFAULT 30.0,
    total_clicks integer NOT NULL DEFAULT 0,
    total_signups integer NOT NULL DEFAULT 0,
    total_conversions integer NOT NULL DEFAULT 0,
    total_earned numeric NOT NULL DEFAULT 0.0,
    pending_payout numeric NOT NULL DEFAULT 0.0,
    available_balance numeric NOT NULL DEFAULT 0.0,
    pending_debt numeric NOT NULL DEFAULT 0.0,
    payout_method text NOT NULL DEFAULT 'mobile_money',
    payout_details jsonb NOT NULL DEFAULT '{}'::jsonb,
    code_modified boolean NOT NULL DEFAULT false,
    is_active boolean NOT NULL DEFAULT true,
    status text NOT NULL DEFAULT 'active',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Liaison profiles -> affiliates
ALTER TABLE public.profiles 
    ADD CONSTRAINT profiles_referred_by_partner_id_fkey 
    FOREIGN KEY (referred_by_partner_id) REFERENCES public.affiliates(id) ON DELETE SET NULL;

-- Trigger d'attribution définitive du parrain
CREATE OR REPLACE FUNCTION public.prevent_referred_by_override()
RETURNS trigger AS $$
BEGIN
  IF old.referred_by_partner_id IS NOT NULL AND new.referred_by_partner_id IS DISTINCT FROM old.referred_by_partner_id THEN
    RAISE EXCEPTION 'referred_by_partner_id est définitif et ne peut plus être modifié après attribution.';
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_referred_by_override ON public.profiles;
CREATE TRIGGER trg_prevent_referred_by_override
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_referred_by_override();

-- Clics partenaires
CREATE TABLE IF NOT EXISTS public.affiliate_clicks (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    affiliate_id uuid NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
    referrer text NULL,
    source text NULL,
    ip_hash text NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_affiliate ON public.affiliate_clicks(affiliate_id);

-- Commissions partenaires
CREATE TABLE IF NOT EXISTS public.affiliate_commissions (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    affiliate_id uuid NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
    payer_user_id uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    tx_ref text UNIQUE NOT NULL,
    order_amount numeric NOT NULL,
    commission_rate numeric NOT NULL DEFAULT 30.0,
    commission_amount numeric NOT NULL,
    currency text NOT NULL DEFAULT 'EUR',
    status text NOT NULL DEFAULT 'pending',
    release_at timestamp with time zone NOT NULL DEFAULT (timezone('utc'::text, now()) + interval '30 days'),
    details jsonb NULL DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_affiliate ON public.affiliate_commissions(affiliate_id);

-- 10. AUDIT LOGS & CONSOMMATION IA
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    admin_email text NOT NULL,
    action text NOT NULL,
    target_user_id text NULL,
    details jsonb NULL DEFAULT '{}'::jsonb,
    ip_address text NULL,
    severity text NOT NULL DEFAULT 'info',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.ai_usage_logs (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    user_id text NOT NULL,
    user_email text NULL,
    operation text NOT NULL,
    model_used text NOT NULL,
    tokens_used integer NOT NULL DEFAULT 0,
    cost_estimated numeric NOT NULL DEFAULT 0.0,
    status text NOT NULL DEFAULT 'success',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_user ON public.ai_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_created ON public.ai_usage_logs(created_at DESC);

-- 11. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;

-- Policies Profiles
DROP POLICY IF EXISTS "Les utilisateurs gèrent leur propre profil" ON public.profiles;
CREATE POLICY "Les utilisateurs gèrent leur propre profil"
ON public.profiles FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policies Resumes
DROP POLICY IF EXISTS "Les utilisateurs gèrent leurs propres CVs" ON public.resumes;
CREATE POLICY "Les utilisateurs gèrent leurs propres CVs"
ON public.resumes FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policies Jobs
DROP POLICY IF EXISTS "Les utilisateurs gèrent leurs propres offres" ON public.jobs;
CREATE POLICY "Les utilisateurs gèrent leurs propres offres"
ON public.jobs FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policies Subscriptions
DROP POLICY IF EXISTS "Les utilisateurs visualisent leur abonnement" ON public.subscriptions;
CREATE POLICY "Les utilisateurs visualisent leur abonnement"
ON public.subscriptions FOR SELECT
USING (auth.uid() = user_id);

-- Policies Payments
DROP POLICY IF EXISTS "Les utilisateurs visualisent leurs paiements" ON public.payments;
CREATE POLICY "Les utilisateurs visualisent leurs paiements"
ON public.payments FOR SELECT
USING (auth.uid() = user_id);

-- Policies Affiliates
DROP POLICY IF EXISTS "Les utilisateurs visualisent leur profil partenaire" ON public.affiliates;
CREATE POLICY "Les utilisateurs visualisent leur profil partenaire"
ON public.affiliates FOR SELECT
USING (auth.uid() = user_id);
