"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  User,
  Heart,
  Stethoscope,
  Activity,
  Pill,
  Sparkles,
  Loader2,
  ChevronLeft,
} from "lucide-react";

const STEPS = [
  "About you",
  "Your diagnosis",
  "Disease specifics",
  "Treatment so far",
  "Where you are",
  "Insurance & work",
  "Quick check-in",
  "Review",
  "Priority plan",
];

type OptionMap<T extends string> = { value: T; label: string; hint?: string }[];

type FormData = {
  role: "patient" | "caregiver" | "";
  diagnosis_status: "confirmed" | "suspected" | "caregiver_on_behalf" | "";
  primary_tumor_site: string;
  tumor_size_cm: string;
  is_metastatic: "yes" | "no" | "unknown" | "";
  metastatic_sites: string[];
  gist_mutation: string;
  had_surgery: string;
  current_tki: string;
  tki_duration: string;
  treatment_status: string; // just_diagnosed | in_treatment | post_treatment | surveillance | progression
  treatment_goal: string;
  practical_concerns: string[];
  insurance_type: string;
  employer_size: string;
  notes: string;
};

const INITIAL: FormData = {
  role: "",
  diagnosis_status: "",
  primary_tumor_site: "",
  tumor_size_cm: "",
  is_metastatic: "",
  metastatic_sites: [],
  gist_mutation: "",
  had_surgery: "",
  current_tki: "",
  tki_duration: "",
  treatment_status: "",
  treatment_goal: "",
  practical_concerns: [],
  insurance_type: "",
  employer_size: "",
  notes: "",
};

const PRIMARY_TUMOR_SITES: OptionMap<string> = [
  { value: "gastric", label: "Stomach (gastric)" },
  { value: "small_bowel", label: "Small bowel" },
  { value: "rectum", label: "Rectum" },
  { value: "esophageal", label: "Esophagus" },
  { value: "colon", label: "Colon" },
  { value: "omentum_peritoneum", label: "Omentum / peritoneum" },
  { value: "other", label: "Other" },
  { value: "unknown", label: "I'm not sure" },
];

const TUMOR_SIZES: OptionMap<string> = [
  { value: "under_2", label: "Under 2 cm" },
  { value: "2_to_5", label: "2–5 cm" },
  { value: "5_to_10", label: "5–10 cm" },
  { value: "over_10", label: "Over 10 cm" },
  { value: "unknown", label: "I don't know" },
];

const METASTATIC_SITES: OptionMap<string> = [
  { value: "Liver", label: "Liver" },
  { value: "Peritoneum", label: "Peritoneum" },
  { value: "Omentum", label: "Omentum" },
  { value: "Lymph nodes", label: "Lymph nodes" },
  { value: "Lung", label: "Lung" },
  { value: "Bone", label: "Bone" },
  { value: "Other", label: "Other / not sure" },
];

const MUTATIONS: OptionMap<string> = [
  { value: "kit_exon_11", label: "KIT exon 11", hint: "Most common — responds well to imatinib" },
  { value: "kit_exon_9", label: "KIT exon 9", hint: "Often needs higher imatinib dose" },
  { value: "kit_other", label: "KIT (other exon)" },
  { value: "pdgfra_d842v", label: "PDGFRA D842V", hint: "Treated with avapritinib — not standard TKIs" },
  { value: "pdgfra_other", label: "PDGFRA (non-D842V)" },
  { value: "wild_type", label: "Wild-type (no KIT or PDGFRA)" },
  { value: "sdh_deficient", label: "SDH-deficient" },
  { value: "not_tested", label: "Not yet tested" },
  { value: "unknown", label: "I don't know my mutation" },
];

const SURGERY_STATUSES: OptionMap<string> = [
  { value: "complete_resection", label: "Complete resection (clear margins)" },
  { value: "partial_resection", label: "Partial resection" },
  { value: "scheduled", label: "Scheduled / upcoming" },
  { value: "not_yet", label: "Not yet — being decided" },
  { value: "none", label: "No surgery planned" },
];

const TKIS: OptionMap<string> = [
  { value: "none", label: "None right now" },
  { value: "imatinib", label: "Imatinib (Gleevec)" },
  { value: "sunitinib", label: "Sunitinib (Sutent)" },
  { value: "regorafenib", label: "Regorafenib (Stivarga)" },
  { value: "ripretinib", label: "Ripretinib (Qinlock)" },
  { value: "avapritinib", label: "Avapritinib (Ayvakit)" },
  { value: "clinical_trial", label: "Clinical trial drug" },
  { value: "other", label: "Other" },
];

const TKI_DURATIONS: OptionMap<string> = [
  { value: "not_started", label: "Haven't started yet" },
  { value: "under_3mo", label: "Less than 3 months" },
  { value: "3_to_12mo", label: "3–12 months" },
  { value: "1_to_3yr", label: "1–3 years" },
  { value: "over_3yr", label: "More than 3 years" },
];

const TREATMENT_PHASES: OptionMap<string> = [
  { value: "just_diagnosed", label: "Just diagnosed — figuring it out" },
  { value: "in_treatment", label: "In active treatment" },
  { value: "surveillance", label: "On surveillance / monitoring" },
  { value: "progression", label: "Recent progression / changing treatment" },
  { value: "post_treatment", label: "Post-treatment / in remission" },
];

const PRACTICAL_CONCERNS: OptionMap<string> = [
  { value: "finances", label: "Finances & drug costs" },
  { value: "employment", label: "Work & employment" },
  { value: "family_communication", label: "Telling family & friends" },
  { value: "side_effects", label: "Managing side effects" },
  { value: "fertility", label: "Fertility / family planning" },
  { value: "mental_health", label: "Mental health & support" },
  { value: "second_opinion", label: "Getting a second opinion" },
  { value: "finding_trials", label: "Finding clinical trials" },
  { value: "end_of_life", label: "Advanced care planning" },
];

const INSURANCE_TYPES: OptionMap<string> = [
  { value: "employer", label: "Employer-provided" },
  { value: "marketplace", label: "Marketplace (ACA)" },
  { value: "medicare", label: "Medicare" },
  { value: "medicaid", label: "Medicaid" },
  { value: "va", label: "VA / TRICARE" },
  { value: "none", label: "Uninsured" },
  { value: "other", label: "Other / non-US" },
];

const EMPLOYER_SIZES: OptionMap<string> = [
  { value: "not_employed", label: "Not employed" },
  { value: "self_employed", label: "Self-employed" },
  { value: "under_50", label: "Under 50 employees" },
  { value: "50_plus", label: "50+ employees (FMLA-eligible)" },
];

const MOODS = [
  { value: 1, label: "Very low" },
  { value: 2, label: "Low" },
  { value: 3, label: "Okay" },
  { value: 4, label: "Good" },
  { value: 5, label: "Great" },
];

const LOADING_MESSAGES = [
  "Reviewing your GIST-specific details...",
  "Mapping mutation status to treatment context...",
  "Identifying urgent next steps...",
  "Checking insurance and benefit gaps...",
  "Building your personalized plan...",
  "Almost there...",
];

// Map the chosen mutation to the cancer-types.ts subtype key
function mutationToSubtype(mutation: string): string | null {
  if (mutation.startsWith("kit_")) return "gist_kit";
  if (mutation === "pdgfra_d842v") return "gist_pdgfra_d842v";
  if (mutation === "pdgfra_other") return "gist_kit"; // similar TKI response
  if (mutation === "sdh_deficient") return "gist_sdh_deficient";
  if (mutation === "wild_type") return "gist_wildtype";
  return null;
}

function mutationToMarkers(mutation: string): string[] {
  switch (mutation) {
    case "kit_exon_11": return ["KIT exon 11"];
    case "kit_exon_9": return ["KIT exon 9"];
    case "kit_other": return ["KIT (other exon)"];
    case "pdgfra_d842v": return ["PDGFRA D842V"];
    case "pdgfra_other": return ["PDGFRA (non-D842V)"];
    case "wild_type": return ["Wild-type (no KIT or PDGFRA)"];
    case "sdh_deficient": return ["SDH-deficient"];
    default: return [];
  }
}

function tkiLabel(tki: string, duration: string): string | null {
  if (!tki || tki === "none") return null;
  const tkiName = TKIS.find((t) => t.value === tki)?.label ?? tki;
  const durLabel = TKI_DURATIONS.find((d) => d.value === duration)?.label;
  if (!durLabel || duration === "not_started") return tkiName;
  return `${tkiName} (on it for ${durLabel.toLowerCase()})`;
}

function inferTreatmentGoal(phase: string, mutation: string, isMetastatic: string): string {
  if (phase === "post_treatment" || phase === "surveillance") return "curative";
  if (isMetastatic === "yes") return "control";
  if (phase === "progression") return "control";
  if (mutation === "sdh_deficient") return "control";
  return "curative";
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>(INITIAL);
  const [initialMood, setInitialMood] = useState(3);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [priorityItems, setPriorityItems] = useState<
    { title: string; description: string; priority: string }[]
  >([]);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  const isCaregiver = data.role === "caregiver";
  const possessive = isCaregiver ? "their" : "your";

  useEffect(() => {
    if (!loadingPlan) return;
    const interval = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [loadingPlan]);

  function update<K extends keyof FormData>(field: K, value: FormData[K]) {
    setData((prev) => ({ ...prev, [field]: value }));
  }

  function toggleArrayField(field: "metastatic_sites" | "practical_concerns", value: string) {
    setData((prev) => {
      const current = prev[field];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [field]: next };
    });
  }

  function canAdvance(): boolean {
    switch (step) {
      case 0: return !!data.role;
      case 1: return !!data.diagnosis_status && !!data.primary_tumor_site && !!data.tumor_size_cm;
      case 2: return !!data.is_metastatic && !!data.gist_mutation && (data.is_metastatic !== "yes" || data.metastatic_sites.length > 0);
      case 3: return !!data.had_surgery && !!data.current_tki && (data.current_tki === "none" || !!data.tki_duration);
      case 4: return !!data.treatment_status; // practical_concerns optional
      case 5: return !!data.insurance_type && !!data.employer_size;
      case 6: return true; // mood always has default
      case 7: return true;
      default: return true;
    }
  }

  async function handleSaveProfile() {
    setSaving(true);
    setError(null);
    setLoadingPlan(true);
    setLoadingMessageIndex(0);
    setStep(8);

    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) {
      router.push("/login");
      return;
    }

    const subtype = mutationToSubtype(data.gist_mutation);
    const markers = mutationToMarkers(data.gist_mutation);
    const treatmentGoal = data.treatment_goal || inferTreatmentGoal(data.treatment_status, data.gist_mutation, data.is_metastatic);

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      role: data.role || "patient",
      cancer_type: "GIST / Sarcoma",
      cancer_subtype: subtype,
      molecular_markers: markers.length > 0 ? markers : null,
      treatment_status: data.treatment_status,
      treatment_goal: treatmentGoal,
      primary_tumor_site: data.primary_tumor_site || null,
      tumor_size_cm: data.tumor_size_cm || null,
      had_surgery: data.had_surgery || null,
      current_medications: tkiLabel(data.current_tki, data.tki_duration),
      metastatic_sites: data.is_metastatic === "yes" ? data.metastatic_sites : null,
      practical_concerns: data.practical_concerns,
      onboarding_notes: data.notes.trim() || null,
      insurance_type: data.insurance_type || null,
      employer_size: data.employer_size || null,
      initial_mood: initialMood,
    });

    if (error) {
      setError(error.message);
      setSaving(false);
      setLoadingPlan(false);
      setStep(7);
      return;
    }

    setSaving(false);
    generatePriorityPlan();
  }

  async function generatePriorityPlan() {
    setLoadingPlan(true);
    setLoadingMessageIndex(0);
    try {
      const res = await fetch("/api/ai/priority-plan", { method: "POST" });
      const data = await res.json();
      if (data.items) setPriorityItems(data.items);
    } catch {
      // non-blocking
    } finally {
      setLoadingPlan(false);
    }
  }

  const progress = ((step + 1) / STEPS.length) * 100;
  const showBack = step > 0 && step < 8;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src="/logo.png" alt="WayFlame" className="w-8 h-8 rounded-lg object-cover" />
            <span className="font-semibold text-lg">WayFlame</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Step {step + 1} of {STEPS.length} — {STEPS[step]}
          </p>
          <Progress value={progress} className="mt-3" />
        </div>

        <Card>
          {/* Step 0 — Role */}
          {step === 0 && (
            <>
              <CardHeader>
                <CardTitle>Who is this for?</CardTitle>
                <CardDescription>
                  WayFlame adapts to whether you&apos;re the patient or supporting someone.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ChoiceTile
                    selected={data.role === "patient"}
                    onClick={() => update("role", "patient")}
                    icon={<User className="w-8 h-8" />}
                    label="I'm the patient"
                    hint="Setting this up for myself"
                  />
                  <ChoiceTile
                    selected={data.role === "caregiver"}
                    onClick={() => update("role", "caregiver")}
                    icon={<Heart className="w-8 h-8" />}
                    label="I'm a caregiver"
                    hint="Helping someone I care about"
                  />
                </div>
              </CardContent>
            </>
          )}

          {/* Step 1 — Diagnosis details */}
          {step === 1 && (
            <>
              <CardHeader>
                <CardTitle>About {possessive} GIST diagnosis</CardTitle>
                <CardDescription>
                  GIST (gastrointestinal stromal tumor) behaves differently depending on where it started and how large it is.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Section title="Diagnosis status">
                  <RowGrid>
                    <RowChoice
                      selected={data.diagnosis_status === "confirmed"}
                      onClick={() => update("diagnosis_status", "confirmed")}
                      label="Confirmed by biopsy"
                    />
                    <RowChoice
                      selected={data.diagnosis_status === "suspected"}
                      onClick={() => update("diagnosis_status", "suspected")}
                      label="Suspected — still being worked up"
                    />
                    <RowChoice
                      selected={data.diagnosis_status === "caregiver_on_behalf"}
                      onClick={() => update("diagnosis_status", "caregiver_on_behalf")}
                      label="Filling in on someone's behalf"
                    />
                  </RowGrid>
                </Section>

                <Section title="Primary tumor location">
                  <RowGrid>
                    {PRIMARY_TUMOR_SITES.map((opt) => (
                      <RowChoice
                        key={opt.value}
                        selected={data.primary_tumor_site === opt.value}
                        onClick={() => update("primary_tumor_site", opt.value)}
                        label={opt.label}
                      />
                    ))}
                  </RowGrid>
                </Section>

                <Section title="Approximate tumor size">
                  <RowGrid>
                    {TUMOR_SIZES.map((opt) => (
                      <RowChoice
                        key={opt.value}
                        selected={data.tumor_size_cm === opt.value}
                        onClick={() => update("tumor_size_cm", opt.value)}
                        label={opt.label}
                      />
                    ))}
                  </RowGrid>
                </Section>
              </CardContent>
            </>
          )}

          {/* Step 2 — Spread + mutation */}
          {step === 2 && (
            <>
              <CardHeader>
                <CardTitle>Spread and mutation</CardTitle>
                <CardDescription>
                  Mutation status is the single most important factor for which TKI to use.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Section title="Has it spread beyond the original site?">
                  <RowGrid>
                    <RowChoice
                      selected={data.is_metastatic === "no"}
                      onClick={() => {
                        update("is_metastatic", "no");
                        update("metastatic_sites", []);
                      }}
                      label="No — localized"
                    />
                    <RowChoice
                      selected={data.is_metastatic === "yes"}
                      onClick={() => update("is_metastatic", "yes")}
                      label="Yes — metastatic"
                    />
                    <RowChoice
                      selected={data.is_metastatic === "unknown"}
                      onClick={() => {
                        update("is_metastatic", "unknown");
                        update("metastatic_sites", []);
                      }}
                      label="I don't know yet"
                    />
                  </RowGrid>
                </Section>

                {data.is_metastatic === "yes" && (
                  <Section title="Where has it spread? (select all that apply)">
                    <div className="flex flex-wrap gap-2">
                      {METASTATIC_SITES.map((opt) => (
                        <Chip
                          key={opt.value}
                          selected={data.metastatic_sites.includes(opt.value)}
                          onClick={() => toggleArrayField("metastatic_sites", opt.value)}
                          label={opt.label}
                        />
                      ))}
                    </div>
                  </Section>
                )}

                <Section
                  title="Mutation status"
                  hint="If you've had molecular testing, your oncologist or pathology report will tell you. If not, that's okay — ask about KIT/PDGFRA testing."
                >
                  <div className="space-y-2">
                    {MUTATIONS.map((opt) => (
                      <RowChoice
                        key={opt.value}
                        selected={data.gist_mutation === opt.value}
                        onClick={() => update("gist_mutation", opt.value)}
                        label={opt.label}
                        hint={opt.hint}
                      />
                    ))}
                  </div>
                </Section>
              </CardContent>
            </>
          )}

          {/* Step 3 — Treatment so far */}
          {step === 3 && (
            <>
              <CardHeader>
                <CardTitle>Treatment so far</CardTitle>
                <CardDescription>
                  GIST is usually treated with surgery and/or a targeted drug (TKI). No traditional chemo.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Section title="Surgery status">
                  <div className="space-y-2">
                    {SURGERY_STATUSES.map((opt) => (
                      <RowChoice
                        key={opt.value}
                        selected={data.had_surgery === opt.value}
                        onClick={() => update("had_surgery", opt.value)}
                        label={opt.label}
                      />
                    ))}
                  </div>
                </Section>

                <Section title="Current targeted therapy (TKI)">
                  <div className="space-y-2">
                    {TKIS.map((opt) => (
                      <RowChoice
                        key={opt.value}
                        selected={data.current_tki === opt.value}
                        onClick={() => {
                          update("current_tki", opt.value);
                          if (opt.value === "none") update("tki_duration", "");
                        }}
                        label={opt.label}
                      />
                    ))}
                  </div>
                </Section>

                {data.current_tki && data.current_tki !== "none" && (
                  <Section title="How long have you been on it?">
                    <div className="space-y-2">
                      {TKI_DURATIONS.map((opt) => (
                        <RowChoice
                          key={opt.value}
                          selected={data.tki_duration === opt.value}
                          onClick={() => update("tki_duration", opt.value)}
                          label={opt.label}
                        />
                      ))}
                    </div>
                  </Section>
                )}
              </CardContent>
            </>
          )}

          {/* Step 4 — Where you are + concerns */}
          {step === 4 && (
            <>
              <CardHeader>
                <CardTitle>Where {isCaregiver ? "are they" : "are you"} right now?</CardTitle>
                <CardDescription>
                  This helps us prioritize what shows up first in your dashboard.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Section title="Phase of the journey">
                  <div className="space-y-2">
                    {TREATMENT_PHASES.map((opt) => (
                      <RowChoice
                        key={opt.value}
                        selected={data.treatment_status === opt.value}
                        onClick={() => update("treatment_status", opt.value)}
                        label={opt.label}
                      />
                    ))}
                  </div>
                </Section>

                <Section
                  title="What's weighing on you most? (select any that apply)"
                  hint="We'll surface tools, drafts, and resources for whatever you pick."
                >
                  <div className="flex flex-wrap gap-2">
                    {PRACTICAL_CONCERNS.map((opt) => (
                      <Chip
                        key={opt.value}
                        selected={data.practical_concerns.includes(opt.value)}
                        onClick={() => toggleArrayField("practical_concerns", opt.value)}
                        label={opt.label}
                      />
                    ))}
                  </div>
                </Section>
              </CardContent>
            </>
          )}

          {/* Step 5 — Insurance & work */}
          {step === 5 && (
            <>
              <CardHeader>
                <CardTitle>Insurance & work</CardTitle>
                <CardDescription>
                  GIST drugs are expensive. Insurance type and employer size determine which assistance programs apply.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Section title="Insurance">
                  <div className="space-y-2">
                    {INSURANCE_TYPES.map((opt) => (
                      <RowChoice
                        key={opt.value}
                        selected={data.insurance_type === opt.value}
                        onClick={() => update("insurance_type", opt.value)}
                        label={opt.label}
                      />
                    ))}
                  </div>
                </Section>

                <Section title="Employment">
                  <div className="space-y-2">
                    {EMPLOYER_SIZES.map((opt) => (
                      <RowChoice
                        key={opt.value}
                        selected={data.employer_size === opt.value}
                        onClick={() => update("employer_size", opt.value)}
                        label={opt.label}
                      />
                    ))}
                  </div>
                </Section>
              </CardContent>
            </>
          )}

          {/* Step 6 — Mood */}
          {step === 6 && (
            <>
              <CardHeader>
                <CardTitle>Quick check-in</CardTitle>
                <CardDescription>
                  How are you doing emotionally right now? You can update this any time.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 justify-center">
                  {MOODS.map((m) => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => setInitialMood(m.value)}
                      className={`flex-1 min-w-[100px] py-4 px-3 rounded-xl border-2 transition-all ${
                        initialMood === m.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/40 hover:bg-muted/50"
                      }`}
                    >
                      <p className={`font-medium ${initialMood === m.value ? "text-primary" : ""}`}>
                        {m.label}
                      </p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </>
          )}

          {/* Step 7 — Review */}
          {step === 7 && (
            <>
              <CardHeader>
                <CardTitle>Quick review</CardTitle>
                <CardDescription>
                  Everything looks good? Hit &ldquo;Generate my plan&rdquo; and we&apos;ll build a personalized priority list.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ReviewRow label="Role" value={data.role === "caregiver" ? "Caregiver" : "Patient"} />
                <ReviewRow label="Diagnosis" value={labelFor(PRIMARY_TUMOR_SITES, data.primary_tumor_site) + " · " + labelFor(TUMOR_SIZES, data.tumor_size_cm)} />
                <ReviewRow label="Spread" value={data.is_metastatic === "yes" ? "Metastatic — " + data.metastatic_sites.join(", ") : data.is_metastatic === "no" ? "Localized" : "Unknown"} />
                <ReviewRow label="Mutation" value={labelFor(MUTATIONS, data.gist_mutation)} />
                <ReviewRow label="Surgery" value={labelFor(SURGERY_STATUSES, data.had_surgery)} />
                <ReviewRow label="Current TKI" value={tkiLabel(data.current_tki, data.tki_duration) ?? "None"} />
                <ReviewRow label="Phase" value={labelFor(TREATMENT_PHASES, data.treatment_status)} />
                <ReviewRow label="Insurance" value={labelFor(INSURANCE_TYPES, data.insurance_type)} />

                {data.practical_concerns.length > 0 && (
                  <ReviewRow
                    label="Focus areas"
                    value={data.practical_concerns.map((v) => labelFor(PRACTICAL_CONCERNS, v)).join(", ")}
                  />
                )}

                <div className="pt-2">
                  <p className="text-sm font-medium mb-2">Anything else we should know? (optional)</p>
                  <Textarea
                    value={data.notes}
                    onChange={(e) => update("notes", e.target.value)}
                    placeholder="A line or two about anything specific to your situation — we'll factor it into your plan."
                    rows={3}
                  />
                </div>

                {error && (
                  <p className="text-sm text-destructive mt-2">{error}</p>
                )}
              </CardContent>
            </>
          )}

          {/* Step 8 — Loading / Plan generated */}
          {step === 8 && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {loadingPlan ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      Building your plan
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 text-primary" />
                      Your priority plan is ready
                    </>
                  )}
                </CardTitle>
                <CardDescription>
                  {loadingPlan
                    ? LOADING_MESSAGES[loadingMessageIndex]
                    : `We built ${priorityItems.length} priority items based on your profile. They're already in your dashboard.`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingPlan ? (
                  <div className="space-y-3">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
                    ))}
                  </div>
                ) : priorityItems.length > 0 ? (
                  <ul className="space-y-3">
                    {priorityItems.slice(0, 5).map((item, i) => (
                      <li key={i} className="flex gap-3 p-3 rounded-lg border border-border">
                        <span className="text-primary text-sm font-semibold mt-0.5">
                          {i + 1}.
                        </span>
                        <div>
                          <p className="font-medium text-foreground">{item.title}</p>
                          <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    We saved your profile. Your plan will populate in the dashboard shortly.
                  </p>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={() => router.push("/dashboard")}
                  disabled={loadingPlan}
                >
                  {loadingPlan ? "Just a moment..." : "Go to my dashboard"}
                </Button>
              </CardFooter>
            </>
          )}

          {/* Footer nav (steps 0–7) */}
          {step < 8 && (
            <CardFooter className="flex justify-between gap-3">
              {showBack ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  className="gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </Button>
              ) : (
                <span />
              )}

              {step === 7 ? (
                <Button onClick={handleSaveProfile} disabled={saving} className="ml-auto">
                  {saving ? "Saving..." : "Generate my plan"}
                </Button>
              ) : (
                <Button
                  onClick={() => setStep((s) => s + 1)}
                  disabled={!canAdvance()}
                  className="ml-auto"
                >
                  Continue
                </Button>
              )}
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Reusable sub-components                                                    */
/* -------------------------------------------------------------------------- */

function ChoiceTile({
  selected,
  onClick,
  icon,
  label,
  hint,
}: {
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  hint?: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
        selected
          ? "border-primary bg-primary/5 scale-[1.02]"
          : "border-border hover:border-primary/40 hover:bg-muted/50"
      }`}
    >
      <span className={selected ? "text-primary" : "text-muted-foreground"}>{icon}</span>
      <div className="text-center">
        <p className={`font-medium ${selected ? "text-primary" : ""}`}>{label}</p>
        {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
      </div>
    </button>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <p className="font-medium text-sm">{title}</p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      <div className="pt-1">{children}</div>
    </div>
  );
}

function RowGrid({ children }: { children: React.ReactNode }) {
  return <div className="space-y-2">{children}</div>;
}

function RowChoice({
  selected,
  onClick,
  label,
  hint,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  hint?: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
        selected
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/40 hover:bg-muted/50"
      }`}
    >
      <p className={`text-sm font-medium ${selected ? "text-primary" : "text-foreground"}`}>
        {label}
      </p>
      {hint && <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>}
    </button>
  );
}

function Chip({
  selected,
  onClick,
  label,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
        selected
          ? "border-primary bg-primary/10 text-primary font-medium"
          : "border-border hover:border-primary/40 hover:bg-muted/50 text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}

function labelFor(options: OptionMap<string>, value: string): string {
  return options.find((o) => o.value === value)?.label ?? "—";
}
