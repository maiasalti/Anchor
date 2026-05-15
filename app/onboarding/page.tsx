"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { CANCER_TYPE_OPTIONS, getSubtypeOptions, TREATMENT_GOAL_OPTIONS } from "@/lib/cancer-types";
import { User, Heart } from "lucide-react";

const STEPS = ["About You", "Diagnosis", "Employer", "Insurance", "Support Preferences", "Review", "Priority Plan"];

type FormData = {
  role: string;
  cancer_type: string;
  cancer_type_other?: string;
  cancer_subtype: string;
  treatment_goal: string;
  stage: string;
  diagnosis_date: string;
  treatment_status: string;
  employer_name: string;
  employer_size: string;
  insurance_type: string;
  insurance_provider: string;
};

const INITIAL: FormData = {
  role: "",
  cancer_type: "",
  cancer_type_other: "",
  cancer_subtype: "",
  treatment_goal: "",
  stage: "",
  diagnosis_date: "",
  treatment_status: "",
  employer_name: "",
  employer_size: "",
  insurance_type: "",
  insurance_provider: "",
};

const MOODS = [
  { value: 1, label: "Very Low", color: "bg-red-500" },
  { value: 2, label: "Low", color: "bg-orange-500" },
  { value: 3, label: "Okay", color: "bg-yellow-500" },
  { value: 4, label: "Good", color: "bg-lime-500" },
  { value: 5, label: "Great", color: "bg-green-500" },
];

const SUPPORT_OPTIONS = [
  { id: "journaling", label: "Private journaling" },
  { id: "therapist", label: "Finding a therapist or counselor" },
  { id: "support_group", label: "Joining a support group" },
  { id: "conversations", label: "Help telling people about my diagnosis" },
  { id: "wellness", label: "Nutrition and wellness guidance" },
];

const LOADING_MESSAGES = [
  "Analyzing your insurance situation...",
  "Checking FMLA eligibility...",
  "Finding relevant benefits...",
  "Identifying critical deadlines...",
  "Building your personalized plan...",
  "Almost there...",
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>(INITIAL);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [priorityItems, setPriorityItems] = useState<{ title: string; description: string; priority: string }[]>([]);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [initialMood, setInitialMood] = useState(3);
  const [supportPreferences, setSupportPreferences] = useState<string[]>([]);

  const isCaregiver = data.role === "caregiver";
  const possessive = isCaregiver ? "their" : "your";
  const subject = isCaregiver ? "the patient" : "you";

  useEffect(() => {
    if (!loadingPlan) return;
    const interval = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [loadingPlan]);

  function update(field: keyof FormData, value: string) {
    setData((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "cancer_type") {
        next.cancer_subtype = "";
      }
      return next;
    });
  }

  function togglePreference(id: string) {
    setSupportPreferences((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }

  async function handleSaveProfile() {
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) {
      router.push("/login");
      return;
    }
    const resolvedCancerType = data.cancer_type === "other"
      ? (data.cancer_type_other || "other")
      : data.cancer_type;

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      role: data.role || "patient",
      cancer_type: resolvedCancerType,
      cancer_subtype: data.cancer_subtype && data.cancer_subtype !== "unknown" ? data.cancer_subtype : null,
      treatment_goal: data.treatment_goal || null,
      stage: data.stage,
      diagnosis_date: data.diagnosis_date || null,
      treatment_status: data.treatment_status,
      employer_name: data.employer_name,
      employer_size: data.employer_size,
      insurance_type: data.insurance_type,
      insurance_provider: data.insurance_provider,
      initial_mood: initialMood,
      support_preferences: supportPreferences,
    });
    if (error) {
      setError(error.message);
      setSaving(false);
    } else {
      setSaving(false);
      setStep(6);
      generatePriorityPlan();
    }
  }

  async function generatePriorityPlan() {
    setLoadingPlan(true);
    setLoadingMessageIndex(0);
    try {
      const res = await fetch("/api/ai/priority-plan", { method: "POST" });
      const data = await res.json();
      if (data.items) {
        setPriorityItems(data.items);
      }
    } catch {
      // Non-blocking
    } finally {
      setLoadingPlan(false);
    }
  }

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src="/logo.png" alt="Anchor" className="w-8 h-8 rounded-lg object-cover" />
            <span className="font-semibold text-lg">Anchor</span>
          </div>
          <p className="text-sm text-gray-500">
            Step {step + 1} of {STEPS.length} — {STEPS[step]}
          </p>
          <Progress value={progress} className="mt-3" />
        </div>

        <Card>
          {/* Step 0: About You */}
          {step === 0 && (
            <>
              <CardHeader>
                <CardTitle>Who is this for?</CardTitle>
                <CardDescription>
                  Let us know so we can personalize the experience.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => update("role", "patient")}
                    className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all ${
                      data.role === "patient"
                        ? "border-primary bg-primary/5 scale-[1.02]"
                        : "border-border hover:border-primary/40 hover:bg-muted/50"
                    }`}
                  >
                    <User className={`w-8 h-8 ${data.role === "patient" ? "text-primary" : "text-muted-foreground"}`} />
                    <div className="text-center">
                      <p className={`font-medium ${data.role === "patient" ? "text-primary" : ""}`}>I&apos;m the patient</p>
                      <p className="text-xs text-muted-foreground mt-1">Setting this up for myself</p>
                    </div>
                  </button>
                  <button
                    onClick={() => update("role", "caregiver")}
                    className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all ${
                      data.role === "caregiver"
                        ? "border-primary bg-primary/5 scale-[1.02]"
                        : "border-border hover:border-primary/40 hover:bg-muted/50"
                    }`}
                  >
                    <Heart className={`w-8 h-8 ${data.role === "caregiver" ? "text-primary" : "text-muted-foreground"}`} />
                    <div className="text-center">
                      <p className={`font-medium ${data.role === "caregiver" ? "text-primary" : ""}`}>I&apos;m a caregiver</p>
                      <p className="text-xs text-muted-foreground mt-1">Helping someone I care about</p>
                    </div>
                  </button>
                </div>
              </CardContent>
            </>
          )}

          {/* Step 1: Diagnosis */}
          {step === 1 && (
            <>
              <CardHeader>
                <CardTitle>About {possessive} diagnosis</CardTitle>
                <CardDescription>
                  This helps us personalize {possessive} action plan and find relevant benefits.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Cancer type</Label>
                  <Select value={data.cancer_type} onValueChange={(v) => update("cancer_type", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select cancer type" />
                    </SelectTrigger>
                    <SelectContent>
                      {CANCER_TYPE_OPTIONS.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {data.cancer_type === "other" && (
                    <Input
                      placeholder="Please specify the cancer type"
                      value={data.cancer_type_other ?? ""}
                      onChange={(e) => setData((prev) => ({ ...prev, cancer_type_other: e.target.value }))}
                      className="mt-2"
                    />
                  )}
                </div>
                {data.cancer_type && data.cancer_type !== "other" && getSubtypeOptions(data.cancer_type).length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Subtype (if known)</Label>
                      {data.cancer_subtype && (
                        <button onClick={() => update("cancer_subtype", "")} className="text-xs text-muted-foreground hover:text-foreground underline">
                          Skip for now
                        </button>
                      )}
                    </div>
                    <Select value={data.cancer_subtype} onValueChange={(v) => update("cancer_subtype", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subtype (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {getSubtypeOptions(data.cancer_type).map((sub) => (
                          <SelectItem key={sub.value} value={sub.value}>
                            {sub.label}
                          </SelectItem>
                        ))}
                        <SelectItem value="unknown">Not sure / Don&apos;t know yet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Treatment goal</Label>
                    {data.treatment_goal && (
                      <button onClick={() => update("treatment_goal", "")} className="text-xs text-muted-foreground hover:text-foreground underline">
                        Skip for now
                      </button>
                    )}
                  </div>
                  <Select value={data.treatment_goal} onValueChange={(v) => update("treatment_goal", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select treatment goal (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {TREATMENT_GOAL_OPTIONS.map((goal) => (
                        <SelectItem key={goal.value} value={goal.value}>
                          {goal.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Stage (if known)</Label>
                  <Select value={data.stage} onValueChange={(v) => update("stage", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stage_1">Stage I</SelectItem>
                      <SelectItem value="stage_2">Stage II</SelectItem>
                      <SelectItem value="stage_3">Stage III</SelectItem>
                      <SelectItem value="stage_4">Stage IV</SelectItem>
                      <SelectItem value="unknown">Unknown / Not staged</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Approximate diagnosis date</Label>
                    {data.diagnosis_date && (
                      <button onClick={() => update("diagnosis_date", "")} className="text-xs text-muted-foreground hover:text-foreground underline">
                        Skip for now
                      </button>
                    )}
                  </div>
                  <Input
                    type="date"
                    value={data.diagnosis_date}
                    onChange={(e) => update("diagnosis_date", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Where {isCaregiver ? "are they" : "are you"} in {possessive} journey?</Label>
                  <Select value={data.treatment_status} onValueChange={(v) => update("treatment_status", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="just_diagnosed">Just diagnosed</SelectItem>
                      <SelectItem value="in_treatment">Currently in treatment</SelectItem>
                      <SelectItem value="post_treatment">Post-treatment / Survivorship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </>
          )}

          {/* Step 2: Employer */}
          {step === 2 && (
            <>
              <CardHeader>
                <CardTitle>{isCaregiver ? "Their" : "Your"} employment situation</CardTitle>
                <CardDescription>
                  We&apos;ll use this to determine FMLA eligibility and employer benefits.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Employer name (optional)</Label>
                    {data.employer_name && (
                      <button onClick={() => update("employer_name", "")} className="text-xs text-muted-foreground hover:text-foreground underline">
                        Skip for now
                      </button>
                    )}
                  </div>
                  <Input
                    placeholder="Company name"
                    value={data.employer_name}
                    onChange={(e) => update("employer_name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>How large is {possessive} employer?</Label>
                  <Select value={data.employer_size} onValueChange={(v) => update("employer_size", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="under_50">Under 50 employees</SelectItem>
                      <SelectItem value="50_plus">50+ employees (FMLA eligible)</SelectItem>
                      <SelectItem value="self_employed">Self-employed / Freelance</SelectItem>
                      <SelectItem value="not_employed">Not currently employed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </>
          )}

          {/* Step 3: Insurance */}
          {step === 3 && (
            <>
              <CardHeader>
                <CardTitle>{isCaregiver ? "Their" : "Your"} insurance coverage</CardTitle>
                <CardDescription>
                  This helps us identify COBRA deadlines, appeals rights, and alternative coverage options.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Insurance type</Label>
                  <Select value={data.insurance_type} onValueChange={(v) => update("insurance_type", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employer">Employer-sponsored</SelectItem>
                      <SelectItem value="marketplace">Marketplace / ACA plan</SelectItem>
                      <SelectItem value="medicare">Medicare</SelectItem>
                      <SelectItem value="medicaid">Medicaid</SelectItem>
                      <SelectItem value="none">No insurance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Insurance provider (optional)</Label>
                    {data.insurance_provider && (
                      <button onClick={() => update("insurance_provider", "")} className="text-xs text-muted-foreground hover:text-foreground underline">
                        Skip for now
                      </button>
                    )}
                  </div>
                  <Input
                    placeholder="e.g. Aetna, Blue Cross, UnitedHealth"
                    value={data.insurance_provider}
                    onChange={(e) => update("insurance_provider", e.target.value)}
                  />
                </div>
              </CardContent>
            </>
          )}

          {/* Step 4: Support Preferences */}
          {step === 4 && (
            <>
              <CardHeader>
                <CardTitle>{isCaregiver ? "Support Preferences" : "Your Support Preferences"}</CardTitle>
                <CardDescription>
                  We&apos;re here for more than paperwork. Let us know how we can support {isCaregiver ? "you and the patient" : "you"}.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>How {isCaregiver ? "are they" : "are you"} feeling right now?</Label>
                  <div className="flex gap-2">
                    {MOODS.map((m) => (
                      <button
                        key={m.value}
                        onClick={() => setInitialMood(m.value)}
                        className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                          initialMood === m.value
                            ? `${m.color} text-white scale-105`
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>What kind of support interests you?</Label>
                  {SUPPORT_OPTIONS.map((opt) => (
                    <div key={opt.id} className="flex items-center space-x-3">
                      <Checkbox
                        id={opt.id}
                        checked={supportPreferences.includes(opt.id)}
                        onCheckedChange={() => togglePreference(opt.id)}
                      />
                      <label
                        htmlFor={opt.id}
                        className="text-sm text-gray-700 cursor-pointer"
                      >
                        {opt.label}
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </>
          )}

          {/* Step 5: Review */}
          {step === 5 && (
            <>
              <CardHeader>
                <CardTitle>Review {possessive} information</CardTitle>
                <CardDescription>
                  Confirm everything looks right before we build {possessive} plan.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-md">
                    {error}
                  </div>
                )}
                {[
                  { label: "Role", value: data.role === "caregiver" ? "Caregiver" : "Patient" },
                  { label: "Cancer type", value: (data.cancer_type === "other" ? data.cancer_type_other : data.cancer_type) || "—" },
                  ...(data.cancer_subtype && data.cancer_subtype !== "unknown"
                    ? [{ label: "Subtype", value: getSubtypeOptions(data.cancer_type).find(s => s.value === data.cancer_subtype)?.label || data.cancer_subtype }]
                    : []),
                  ...(data.treatment_goal
                    ? [{ label: "Treatment goal", value: TREATMENT_GOAL_OPTIONS.find(g => g.value === data.treatment_goal)?.label || data.treatment_goal }]
                    : []),
                  { label: "Stage", value: data.stage || "—" },
                  { label: "Diagnosis date", value: data.diagnosis_date || "—" },
                  { label: "Treatment status", value: data.treatment_status || "—" },
                  { label: "Employer size", value: data.employer_size || "—" },
                  { label: "Insurance type", value: data.insurance_type || "—" },
                  { label: "Insurance provider", value: data.insurance_provider || "—" },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between text-sm py-1 border-b last:border-0">
                    <span className="text-gray-500">{row.label}</span>
                    <span className="font-medium capitalize">{row.value.replace(/_/g, " ")}</span>
                  </div>
                ))}
              </CardContent>
            </>
          )}

          {/* Step 6: Priority Plan */}
          {step === 6 && (
            <>
              <CardHeader>
                <CardTitle>{isCaregiver ? "Their" : "Your"} Priority Plan</CardTitle>
                <CardDescription>
                  Here&apos;s what to focus on this week based on {possessive} situation.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {loadingPlan ? (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <svg className="animate-spin w-6 h-6 mb-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <p className="text-sm font-medium animate-pulse">
                      {LOADING_MESSAGES[loadingMessageIndex]}
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-2">
                      This usually takes 10-15 seconds
                    </p>
                  </div>
                ) : priorityItems.length > 0 ? (
                  priorityItems.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 py-2 border-b last:border-0">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium">{item.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    {possessive.charAt(0).toUpperCase() + possessive.slice(1)} priority plan will appear on the dashboard.
                  </p>
                )}
              </CardContent>
            </>
          )}

          <CardFooter className="flex justify-between">
            {step > 0 && step < 6 ? (
              <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
                Back
              </Button>
            ) : (
              <div />
            )}
            {step === 0 ? (
              <Button onClick={() => setStep(1)} disabled={!data.role}>
                Continue
              </Button>
            ) : step < 5 ? (
              <div className="flex items-center gap-2">
                {(step === 2 || step === 3) && (
                  <Button variant="ghost" className="text-muted-foreground" onClick={() => setStep((s) => s + 1)}>
                    Skip this step
                  </Button>
                )}
                <Button onClick={() => setStep((s) => s + 1)}>
                  Continue
                </Button>
              </div>
            ) : step === 5 ? (
              <Button onClick={handleSaveProfile} disabled={saving}>
                {saving ? "Saving..." : `Build ${isCaregiver ? "their" : "my"} plan`}
              </Button>
            ) : (
              <Button onClick={() => router.push("/dashboard")}>
                Go to Dashboard
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
