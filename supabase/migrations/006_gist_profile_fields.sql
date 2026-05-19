-- GIST-focused launch: add a few fields the existing schema doesn't yet have.
-- Existing fields handle most of it (cancer_type, cancer_subtype, molecular_markers,
-- current_medications, metastatic_sites, treatment_status, treatment_goal), so we
-- only need columns for the GIST-specific facts that aren't captured elsewhere.

alter table public.profiles add column if not exists primary_tumor_site text;
-- gastric | small_bowel | rectum | esophageal | colon | omentum_peritoneum | other | unknown

alter table public.profiles add column if not exists tumor_size_cm text;
-- under_2 | 2_to_5 | 5_to_10 | over_10 | unknown

alter table public.profiles add column if not exists had_surgery text;
-- complete_resection | partial_resection | scheduled | not_yet | none

alter table public.profiles add column if not exists practical_concerns text[] default '{}';
-- multi-select chips: finances, employment, family_communication, side_effects,
-- fertility, mental_health, second_opinion, finding_trials, end_of_life

alter table public.profiles add column if not exists onboarding_notes text;
-- optional free-text from the review step ("anything else we should know?")
