-- Phase 5: Deep Personalization — Subtype-Aware Cancer Profiles

alter table public.profiles add column if not exists cancer_subtype text;
alter table public.profiles add column if not exists treatment_goal text;
alter table public.profiles add column if not exists molecular_markers text[];
alter table public.profiles add column if not exists current_medications text;
alter table public.profiles add column if not exists metastatic_sites text[];
alter table public.profiles add column if not exists hereditary_syndrome text;
