-- ==============================================================================
-- MIGRATION DASHBOARD ADMIN - EASYWORK SAAS
-- ==============================================================================

-- 1. Ajout de la colonne is_suspended et is_admin sur les profils si non présents
alter table public.profiles add column if not exists is_admin boolean default false;
alter table public.profiles add column if not exists is_suspended boolean default false;

-- 2. Table des abonnements Flutterwave
create table if not exists public.subscriptions (
    id uuid primary key default extensions.uuid_generate_v4(),
    user_id uuid unique not null references auth.users(id) on delete cascade,
    flutterwave_transaction_id text null,
    flutterwave_tx_ref text null,
    flutterwave_customer_id text null,
    subscription_plan text not null default 'free', -- 'free', 'sprint', 'monthly', 'lifetime'
    subscription_status text not null default 'active', -- 'active', 'canceled', 'past_due'
    current_period_end timestamp with time zone null,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2.b Table des paiements et transactions Flutterwave
create table if not exists public.payments (
    id uuid primary key default extensions.uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    tx_ref text unique not null,
    flw_id text null,
    plan text not null default 'sprint',
    amount numeric not null,
    currency text not null default 'EUR',
    status text not null default 'successful', -- 'successful', 'refunded', 'failed'
    payment_method text null default 'Carte Bancaire',
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Table de configuration dynamique des tarifs et quotas
create table if not exists public.admin_pricing_config (
    id text primary key default 'default',
    sprint_price numeric not null default 13,
    monthly_price numeric not null default 22,
    lifetime_price numeric not null default 69,
    founder_quota_total integer not null default 200,
    founder_quota_used integer not null default 0,
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

insert into public.admin_pricing_config (id, sprint_price, monthly_price, lifetime_price, founder_quota_total, founder_quota_used)
values ('default', 13, 22, 69, 200, 0)
on conflict (id) do nothing;

-- 3. Table des affiliés et commissions
create table if not exists public.affiliates (
    id uuid primary key default extensions.uuid_generate_v4(),
    code text unique not null,
    name text not null,
    email text not null,
    commission_rate numeric not null default 30.0, -- en %
    total_clicks integer not null default 0,
    total_signups integer not null default 0,
    total_conversions integer not null default 0,
    total_earned numeric not null default 0.0,
    pending_payout numeric not null default 0.0,
    status text not null default 'active', -- active, paused
    created_at timestamp with time zone default timezone('utc'::text, now()),
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. Table des logs d'audit des actions administratives
create table if not exists public.admin_audit_logs (
    id uuid primary key default extensions.uuid_generate_v4(),
    admin_email text not null,
    action text not null,
    target_user_id text null,
    details jsonb null default '{}'::jsonb,
    ip_address text null,
    severity text not null default 'info', -- info, warning, critical
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 5. Table de suivi de la consommation IA (DeepSeek & LLMs)
create table if not exists public.ai_usage_logs (
    id uuid primary key default extensions.uuid_generate_v4(),
    user_id text not null,
    user_email text null,
    operation text not null, -- 'resume_score', 'job_match', 'resume_rewrite', 'cover_letter'
    model text not null default 'deepseek-chat',
    prompt_tokens integer not null default 0,
    completion_tokens integer not null default 0,
    total_tokens integer not null default 0,
    estimated_cost_usd numeric not null default 0.0,
    is_free_user boolean not null default true,
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Index de performance
create index if not exists idx_ai_usage_user on public.ai_usage_logs(user_id);
create index if not exists idx_ai_usage_operation on public.ai_usage_logs(operation);
create index if not exists idx_audit_created on public.admin_audit_logs(created_at desc);

-- 6. Table de configuration du Rate Limiting IA et paramètres système
create table if not exists public.admin_system_config (
    id text primary key default 'default',
    rate_limit_capacity integer not null default 80,
    rate_limit_duration_hours integer not null default 5,
    rate_limit_enabled boolean not null default true,
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

insert into public.admin_system_config (id, rate_limit_capacity, rate_limit_duration_hours, rate_limit_enabled)
values ('default', 80, 5, true)
on conflict (id) do nothing;

