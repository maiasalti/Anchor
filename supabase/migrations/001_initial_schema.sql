-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles (extends Supabase auth.users)
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  name text,
  cancer_type text,
  stage text,
  diagnosis_date date,
  employer_name text,
  employer_size text,          -- for FMLA eligibility (50+ employees)
  insurance_type text,         -- employer | marketplace | medicare | medicaid | none
  insurance_provider text,
  treatment_status text,       -- just_diagnosed | in_treatment | post_treatment
  stripe_customer_id text,
  subscription_status text default 'none', -- trialing | active | canceled | none
  created_at timestamptz default now()
);

-- Action Items
create table public.action_items (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles on delete cascade,
  title text not null,
  description text,
  category text,               -- insurance | employment | financial | legal | medical
  priority text,               -- urgent | high | medium | low
  status text default 'pending', -- pending | in_progress | completed | skipped
  due_date date,
  notes text,
  created_at timestamptz default now()
);

-- Benefits
create table public.benefits (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles on delete cascade,
  name text not null,
  type text,                   -- government | employer | nonprofit | pharmaceutical
  description text,
  eligibility_met boolean,
  application_url text,
  status text default 'not_started', -- not_started | applied | approved | denied
  created_at timestamptz default now()
);

-- Documents
create table public.documents (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles on delete cascade,
  document_type text,          -- fmla_request | appeal_letter | cobra_notice | etc.
  title text not null,
  content text,
  created_at timestamptz default now()
);

-- Deadlines
create table public.deadlines (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles on delete cascade,
  title text not null,
  date date not null,
  description text,
  action_item_id uuid references public.action_items on delete set null,
  is_completed boolean default false,
  created_at timestamptz default now()
);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.action_items enable row level security;
alter table public.benefits enable row level security;
alter table public.documents enable row level security;
alter table public.deadlines enable row level security;

-- RLS Policies: users can only access their own data
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

create policy "Users can manage own action items"
  on public.action_items for all using (auth.uid() = user_id);

create policy "Users can manage own benefits"
  on public.benefits for all using (auth.uid() = user_id);

create policy "Users can manage own documents"
  on public.documents for all using (auth.uid() = user_id);

create policy "Users can manage own deadlines"
  on public.deadlines for all using (auth.uid() = user_id);

-- Trigger to create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (new.id, new.raw_user_meta_data->>'name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
