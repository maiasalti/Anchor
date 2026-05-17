-- Add `role` column to profiles. The onboarding form has been upserting this
-- field since launch, but the column was missing from the schema, so the value
-- was silently dropped. Distinguishes patient vs caregiver accounts for
-- downstream features (caregiver-specific dashboard variants, copy, etc.).

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT;
CREATE INDEX IF NOT EXISTS profiles_role_idx ON profiles(role);
