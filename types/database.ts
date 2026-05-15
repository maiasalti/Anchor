export type Profile = {
  id: string;
  name: string | null;
  role: string | null;
  cancer_type: string | null;
  cancer_subtype: string | null;
  treatment_goal: string | null;
  molecular_markers: string[] | null;
  current_medications: string | null;
  metastatic_sites: string[] | null;
  hereditary_syndrome: string | null;
  stage: string | null;
  diagnosis_date: string | null;
  employer_name: string | null;
  employer_size: string | null;
  insurance_type: string | null;
  insurance_provider: string | null;
  treatment_status: string | null;
  stripe_customer_id: string | null;
  subscription_status: string;
  created_at: string;
};

export type ActionItem = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: string | null;
  priority: string | null;
  status: string;
  due_date: string | null;
  notes: string | null;
  why_it_matters: string | null;
  estimated_minutes: number | null;
  timeline_bucket: string | null;
  resource_url: string | null;
  created_at: string;
};

export type Benefit = {
  id: string;
  user_id: string;
  name: string;
  type: string | null;
  description: string | null;
  eligibility_met: boolean | null;
  application_url: string | null;
  why_you_qualify: string | null;
  status: string;
  created_at: string;
};

export type Document = {
  id: string;
  user_id: string;
  document_type: string | null;
  title: string;
  content: string | null;
  created_at: string;
};

export type Deadline = {
  id: string;
  user_id: string;
  title: string;
  date: string;
  description: string | null;
  action_item_id: string | null;
  is_completed: boolean;
  notify_email: boolean;
  created_at: string;
};

export type MedicalBill = {
  id: string;
  user_id: string;
  provider: string;
  description: string | null;
  billed_amount: number;
  insurance_paid: number;
  out_of_pocket: number;
  date_of_service: string | null;
  date_billed: string | null;
  status: string;
  eob_notes: string | null;
  created_at: string;
};

export type VisitQuestion = {
  id: string;
  user_id: string;
  appointment_type: string;
  context: string | null;
  concerns: string | null;
  questions: QuestionSection[];
  created_at: string;
};

export type QuestionSection = {
  category: string;
  questions: string[];
};

export type Medication = {
  id: string;
  user_id: string;
  name: string;
  dosage: string | null;
  frequency: string | null;
  prescriber: string | null;
  pharmacy: string | null;
  start_date: string | null;
  end_date: string | null;
  refill_date: string | null;
  notes: string | null;
  is_active: boolean;
  reminder_enabled: boolean;
  created_at: string;
};

export type SideEffectEntry = {
  id: string;
  user_id: string;
  date: string;
  symptoms: Symptom[];
  energy_level: number | null;
  notes: string | null;
  created_at: string;
};

export type Symptom = {
  name: string;
  severity: number;
};

export type ClinicalTrial = {
  id: string;
  user_id: string;
  trial_name: string;
  phase: string | null;
  location: string | null;
  eligibility: string | null;
  url: string | null;
  status: string;
  description: string | null;
  created_at: string;
};

export type SecondOpinionTask = {
  id: string;
  user_id: string;
  step_number: number;
  title: string;
  description: string | null;
  status: string;
  created_at: string;
};

export type JournalEntry = {
  id: string;
  user_id: string;
  mood: number | null;
  energy: number | null;
  content: string | null;
  tag: string | null;
  date: string;
  created_at: string;
};

export type SupportGroup = {
  id: string;
  user_id: string;
  name: string;
  type: string | null;
  description: string | null;
  url: string | null;
  location: string | null;
  status: string;
  created_at: string;
};

export type Therapist = {
  id: string;
  user_id: string;
  name: string;
  specialty: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  location: string | null;
  accepts_insurance: boolean | null;
  notes: string | null;
  session_notes: string | null;
  status: string;
  created_at: string;
};

export type ConversationScript = {
  id: string;
  user_id: string;
  relationship: string;
  context: string | null;
  format: string;
  script: string;
  created_at: string;
};

export type MedicalRecord = {
  id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  mime_type: string | null;
  category: string;
  ai_summary: string | null;
  created_at: string;
};

export type CareUpdate = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  is_public: boolean;
  share_token: string;
  view_count: number;
  created_at: string;
  updated_at: string;
};

export type ReportTranslation = {
  id: string;
  user_id: string;
  file_name: string | null;
  report_text: string | null;
  translation: string;
  created_at: string;
};

export type MealPlanRecord = {
  id: string;
  user_id: string;
  plan: Record<string, unknown>;
  dietary_restrictions: string[] | null;
  created_at: string;
};

export type CostEstimateRecord = {
  id: string;
  user_id: string;
  procedure_name: string;
  estimate: Record<string, unknown>;
  created_at: string;
};
