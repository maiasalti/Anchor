-- Phase 3: 16 New Features — Database Migration
-- Run this in the Supabase SQL Editor before using new features.

-- ============================================================
-- TABLES
-- ============================================================

-- Medical Bills (Bill Tracker)
create table public.medical_bills (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles on delete cascade,
  provider text not null,
  description text,
  billed_amount numeric(10,2) default 0,
  insurance_paid numeric(10,2) default 0,
  out_of_pocket numeric(10,2) default 0,
  date_of_service date,
  date_billed date,
  status text default 'unpaid', -- unpaid | paid | disputed | in_review
  eob_notes text,
  created_at timestamptz default now()
);

-- Visit Questions (Question Builder)
create table public.visit_questions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles on delete cascade,
  appointment_type text not null,
  context text,
  concerns text,
  questions jsonb not null, -- structured question sections
  created_at timestamptz default now()
);

-- Medications (Medication Tracker)
create table public.medications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles on delete cascade,
  name text not null,
  dosage text,
  frequency text,
  prescriber text,
  pharmacy text,
  start_date date,
  end_date date,
  refill_date date,
  notes text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Side Effect Entries (Side Effect Journal)
create table public.side_effect_entries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles on delete cascade,
  date date not null default current_date,
  symptoms jsonb not null default '[]', -- [{name, severity}]
  energy_level integer check (energy_level between 1 and 10),
  notes text,
  created_at timestamptz default now()
);

-- Clinical Trials (Clinical Trial Matcher)
create table public.clinical_trials (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles on delete cascade,
  trial_name text not null,
  phase text,
  location text,
  eligibility text,
  url text,
  status text default 'saved', -- saved | interested | applied | enrolled | not_eligible
  description text,
  created_at timestamptz default now()
);

-- Second Opinion Tasks (Second Opinion Coordinator)
create table public.second_opinion_tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles on delete cascade,
  step_number integer not null,
  title text not null,
  description text,
  status text default 'pending', -- pending | in_progress | completed
  created_at timestamptz default now()
);

-- Journal Entries (Journaling / Emotional Check-in)
create table public.journal_entries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles on delete cascade,
  mood integer check (mood between 1 and 5),
  energy integer check (energy between 1 and 5),
  content text,
  date date not null default current_date,
  created_at timestamptz default now()
);

-- Support Groups (Support Group Finder)
create table public.support_groups (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles on delete cascade,
  name text not null,
  type text, -- online | in_person | both
  description text,
  url text,
  location text,
  status text default 'saved', -- saved | joined | not_interested
  created_at timestamptz default now()
);

-- Therapists (Therapist/Counselor Directory)
create table public.therapists (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles on delete cascade,
  name text not null,
  specialty text,
  phone text,
  email text,
  website text,
  location text,
  accepts_insurance boolean,
  notes text,
  status text default 'saved', -- saved | contacted | active
  created_at timestamptz default now()
);

-- Conversation Scripts ("How to Tell People")
create table public.conversation_scripts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles on delete cascade,
  relationship text not null, -- boss | children | parents | partner | friends | coworkers
  context text,
  script text not null,
  created_at timestamptz default now()
);

-- Medical Records (Medical Records Vault + Document Summarizer)
create table public.medical_records (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles on delete cascade,
  file_name text not null,
  file_path text not null, -- storage path: {user_id}/{uuid}_{filename}
  file_size bigint,
  mime_type text,
  category text default 'other', -- pathology | imaging | lab | insurance | other
  ai_summary text, -- populated by Document Summarizer
  created_at timestamptz default now()
);

-- Care Updates (Care Update Broadcaster)
create table public.care_updates (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles on delete cascade,
  title text not null,
  content text not null,
  is_public boolean default false,
  share_token uuid default uuid_generate_v4(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- Add columns to action_items for API fields (if not already present)
-- ============================================================

alter table public.action_items add column if not exists why_it_matters text;
alter table public.action_items add column if not exists estimated_minutes integer;
alter table public.action_items add column if not exists timeline_bucket text;
alter table public.action_items add column if not exists resource_url text;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.medical_bills enable row level security;
alter table public.visit_questions enable row level security;
alter table public.medications enable row level security;
alter table public.side_effect_entries enable row level security;
alter table public.clinical_trials enable row level security;
alter table public.second_opinion_tasks enable row level security;
alter table public.journal_entries enable row level security;
alter table public.support_groups enable row level security;
alter table public.therapists enable row level security;
alter table public.conversation_scripts enable row level security;
alter table public.medical_records enable row level security;
alter table public.care_updates enable row level security;

-- RLS Policies: users can only access their own data
create policy "Users can manage own medical_bills"
  on public.medical_bills for all using (auth.uid() = user_id);

create policy "Users can manage own visit_questions"
  on public.visit_questions for all using (auth.uid() = user_id);

create policy "Users can manage own medications"
  on public.medications for all using (auth.uid() = user_id);

create policy "Users can manage own side_effect_entries"
  on public.side_effect_entries for all using (auth.uid() = user_id);

create policy "Users can manage own clinical_trials"
  on public.clinical_trials for all using (auth.uid() = user_id);

create policy "Users can manage own second_opinion_tasks"
  on public.second_opinion_tasks for all using (auth.uid() = user_id);

create policy "Users can manage own journal_entries"
  on public.journal_entries for all using (auth.uid() = user_id);

create policy "Users can manage own support_groups"
  on public.support_groups for all using (auth.uid() = user_id);

create policy "Users can manage own therapists"
  on public.therapists for all using (auth.uid() = user_id);

create policy "Users can manage own conversation_scripts"
  on public.conversation_scripts for all using (auth.uid() = user_id);

create policy "Users can manage own medical_records"
  on public.medical_records for all using (auth.uid() = user_id);

create policy "Users can manage own care_updates"
  on public.care_updates for all using (auth.uid() = user_id);

-- Public read access to care_updates by share_token (for public share links)
create policy "Anyone can read public care_updates by share_token"
  on public.care_updates for select using (is_public = true);

-- ============================================================
-- STORAGE BUCKET for Medical Records
-- ============================================================

insert into storage.buckets (id, name, public)
values ('medical-records', 'medical-records', false)
on conflict (id) do nothing;

-- Storage RLS: users can only access their own folder
create policy "Users can upload own medical records"
  on storage.objects for insert
  with check (bucket_id = 'medical-records' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can view own medical records"
  on storage.objects for select
  using (bucket_id = 'medical-records' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can delete own medical records"
  on storage.objects for delete
  using (bucket_id = 'medical-records' and (storage.foldername(name))[1] = auth.uid()::text);
