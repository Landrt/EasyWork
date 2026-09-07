-- ==============================================================================
-- MIGRATION MODULE PARTENAIRES DE COMMUNICATION - EASYWORK SAAS
-- Affiliation récurrente 30% à vie, gel 30 jours, chargebacks & modération
-- ==============================================================================

-- 1. Évolution de la table existante 'affiliates'
alter table public.affiliates add column if not exists user_id uuid unique references auth.users(id) on delete cascade;
alter table public.affiliates add column if not exists available_balance numeric not null default 0.0;
alter table public.affiliates add column if not exists pending_debt numeric not null default 0.0;
alter table public.affiliates add column if not exists payout_method text not null default 'mobile_money'; -- 'mobile_money' | 'bank'
alter table public.affiliates add column if not exists payout_details jsonb not null default '{}'::jsonb;
alter table public.affiliates add column if not exists code_modified boolean not null default false;
alter table public.affiliates add column if not exists is_active boolean not null default true;

-- 2. Évolution de la table 'profiles' (Attribution définitive du parrain)
alter table public.profiles add column if not exists referred_by_partner_id uuid references public.affiliates(id) on delete set null;
alter table public.profiles add column if not exists referred_at timestamp with time zone null;

-- 3. Trigger SQL : Blocage formel de toute modification de referred_by_partner_id une fois renseigné
create or replace function public.prevent_referred_by_override()
returns trigger as $$
begin
  if old.referred_by_partner_id is not null and new.referred_by_partner_id is distinct from old.referred_by_partner_id then
    raise exception 'referred_by_partner_id est définitif et ne peut plus être modifié après attribution.';
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_prevent_referred_by_override on public.profiles;
create trigger trg_prevent_referred_by_override
before update on public.profiles
for each row
execute function public.prevent_referred_by_override();

-- 4. Table des clics d'affiliation (Tracking de trafic et conversion)
create table if not exists public.affiliate_clicks (
    id uuid primary key default extensions.uuid_generate_v4(),
    affiliate_id uuid not null references public.affiliates(id) on delete cascade,
    referrer text null,
    source text null,
    ip_hash text null,
    created_at timestamp with time zone default timezone('utc'::text, now())
);

create index if not exists idx_affiliate_clicks_affiliate on public.affiliate_clicks(affiliate_id);
create index if not exists idx_affiliate_clicks_created on public.affiliate_clicks(created_at desc);

-- 5. Table des commissions (Gel 30 jours, 30% récurrent à vie, idempotence)
create table if not exists public.affiliate_commissions (
    id uuid primary key default extensions.uuid_generate_v4(),
    affiliate_id uuid not null references public.affiliates(id) on delete cascade,
    payer_user_id uuid null references auth.users(id) on delete set null,
    flutterwave_tx_ref text unique not null, -- Clé stricte d'idempotence
    order_amount numeric not null,
    commission_rate numeric not null default 30.0,
    commission_amount numeric not null,
    currency text not null default 'USD',
    status text not null default 'pending', -- 'pending', 'available', 'paid', 'canceled'
    release_at timestamp with time zone not null default (timezone('utc'::text, now()) + interval '30 days'),
    details jsonb null default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now())
);

create index if not exists idx_affiliate_commissions_affiliate on public.affiliate_commissions(affiliate_id);
create index if not exists idx_affiliate_commissions_status on public.affiliate_commissions(status);
create index if not exists idx_affiliate_commissions_release on public.affiliate_commissions(release_at);

-- 6. Table des demandes et virements de retrait (Flutterwave Transfers)
create table if not exists public.affiliate_payouts (
    id uuid primary key default extensions.uuid_generate_v4(),
    affiliate_id uuid not null references public.affiliates(id) on delete cascade,
    amount numeric not null,
    currency text not null default 'USD',
    flutterwave_transfer_id text null,
    flutterwave_reference text unique not null,
    status text not null default 'pending', -- 'pending', 'successful', 'failed'
    payout_method text not null, -- 'mobile_money' | 'bank'
    account_details jsonb not null default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

create index if not exists idx_affiliate_payouts_affiliate on public.affiliate_payouts(affiliate_id);
create index if not exists idx_affiliate_payouts_ref on public.affiliate_payouts(flutterwave_reference);

-- 7. Activer RLS sur les tables partenaires
alter table public.affiliate_clicks enable row level security;
alter table public.affiliate_commissions enable row level security;
alter table public.affiliate_payouts enable row level security;

-- Politiques RLS de lecture pour le partenaire connecté
create policy "Partners can view their own commissions" on public.affiliate_commissions
for select using (
  affiliate_id in (select id from public.affiliates where user_id = auth.uid())
);

create policy "Partners can view their own payouts" on public.affiliate_payouts
for select using (
  affiliate_id in (select id from public.affiliates where user_id = auth.uid())
);

create policy "Partners can view their own clicks" on public.affiliate_clicks
for select using (
  affiliate_id in (select id from public.affiliates where user_id = auth.uid())
);

