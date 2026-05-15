"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Settings, Loader2, Check, CreditCard, ExternalLink } from "lucide-react";
import { useUser } from "@/components/user-provider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  CANCER_TYPE_OPTIONS,
  getSubtypeOptions,
  getMolecularMarkers,
  TREATMENT_GOAL_OPTIONS,
  HEREDITARY_SYNDROME_OPTIONS,
  METASTATIC_SITE_OPTIONS,
} from "@/lib/cancer-types";

export default function SettingsPage() {
  const { userId } = useUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [cancerType, setCancerType] = useState("");
  const [cancerTypeOther, setCancerTypeOther] = useState("");
  const [cancerSubtype, setCancerSubtype] = useState("");
  const [treatmentGoal, setTreatmentGoal] = useState("");
  const [molecularMarkers, setMolecularMarkers] = useState<string[]>([]);
  const [currentMedications, setCurrentMedications] = useState("");
  const [metastaticSites, setMetastaticSites] = useState<string[]>([]);
  const [hereditarySyndrome, setHereditarySyndrome] = useState("");
  const [stage, setStage] = useState("");
  const [treatmentStatus, setTreatmentStatus] = useState("");
  const [employerName, setEmployerName] = useState("");
  const [employerSize, setEmployerSize] = useState("");
  const [insuranceType, setInsuranceType] = useState("");
  const [insuranceProvider, setInsuranceProvider] = useState("");
  const [name, setName] = useState("");
  const [subscriptionStatus, setSubscriptionStatus] = useState("");
  const [portalLoading, setPortalLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const supabase = createClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (profile) {
      const isKnown = CANCER_TYPE_OPTIONS.includes(profile.cancer_type);
      if (isKnown) {
        setCancerType(profile.cancer_type);
      } else if (profile.cancer_type) {
        setCancerType("other");
        setCancerTypeOther(profile.cancer_type);
      }
      setCancerSubtype(profile.cancer_subtype ?? "");
      setTreatmentGoal(profile.treatment_goal ?? "");
      setMolecularMarkers(profile.molecular_markers ?? []);
      setCurrentMedications(profile.current_medications ?? "");
      setMetastaticSites(profile.metastatic_sites ?? []);
      setHereditarySyndrome(profile.hereditary_syndrome ?? "");
      setStage(profile.stage ?? "");
      setTreatmentStatus(profile.treatment_status ?? "");
      setEmployerName(profile.employer_name ?? "");
      setEmployerSize(profile.employer_size ?? "");
      setInsuranceType(profile.insurance_type ?? "");
      setInsuranceProvider(profile.insurance_provider ?? "");
      setName(profile.name ?? "");
      setSubscriptionStatus(profile.subscription_status ?? "");
    }
    setLoading(false);
  }

  async function handleManageSubscription() {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } finally {
      setPortalLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    const supabase = createClient();

    const resolvedCancerType = cancerType === "other" ? (cancerTypeOther || "other") : cancerType;

    await supabase.from("profiles").update({
      name,
      cancer_type: resolvedCancerType,
      cancer_subtype: cancerSubtype && cancerSubtype !== "unknown" ? cancerSubtype : null,
      treatment_goal: treatmentGoal || null,
      molecular_markers: molecularMarkers.length > 0 ? molecularMarkers : null,
      current_medications: currentMedications || null,
      metastatic_sites: metastaticSites.length > 0 ? metastaticSites : null,
      hereditary_syndrome: hereditarySyndrome || null,
      stage: stage || null,
      treatment_status: treatmentStatus || null,
      employer_name: employerName || null,
      employer_size: employerSize || null,
      insurance_type: insuranceType || null,
      insurance_provider: insuranceProvider || null,
    }).eq("id", userId);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function handleCancerTypeChange(value: string) {
    setCancerType(value);
    setCancerSubtype("");
    setMolecularMarkers([]);
  }

  function toggleMarker(marker: string) {
    setMolecularMarkers((prev) =>
      prev.includes(marker) ? prev.filter((m) => m !== marker) : [...prev, marker]
    );
  }

  function toggleMetastaticSite(site: string) {
    setMetastaticSites((prev) =>
      prev.includes(site) ? prev.filter((s) => s !== site) : [...prev, site]
    );
  }

  const subtypeOptions = cancerType && cancerType !== "other" ? getSubtypeOptions(cancerType) : [];
  const markerOptions = cancerType && cancerType !== "other" ? getMolecularMarkers(cancerType) : [];
  const showMetastaticSites = stage === "stage_4";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary" />
          Settings
        </h1>
        <p className="text-muted-foreground mt-1">Update your profile and preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>This is used across your dashboard and documents.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Full name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Subscription
          </CardTitle>
          <CardDescription>Manage your Anchor subscription.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Status</p>
              <p className="text-sm text-muted-foreground capitalize">
                {subscriptionStatus === "active"
                  ? "Active"
                  : subscriptionStatus === "trialing"
                  ? "Trial"
                  : "No active subscription"}
              </p>
            </div>
            {subscriptionStatus === "active" || subscriptionStatus === "trialing" ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleManageSubscription}
                disabled={portalLoading}
                className="gap-2"
              >
                {portalLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ExternalLink className="w-4 h-4" />
                )}
                Manage Subscription
              </Button>
            ) : (
              <Link href="/dashboard/upgrade">
                <Button size="sm">Subscribe</Button>
              </Link>
            )}
          </div>
          {(subscriptionStatus === "active" || subscriptionStatus === "trialing") && (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={handleManageSubscription}
              disabled={portalLoading}
            >
              Cancel Subscription
            </Button>
          )}
          <p className="text-xs text-muted-foreground">
            By subscribing you agree to our{" "}
            <Link href="/terms" className="underline hover:text-foreground">Terms of Service</Link>.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Diagnosis</CardTitle>
          <CardDescription>Updating this personalizes your AI recommendations, symptom tracking, and document templates.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Cancer type</Label>
            <Select value={cancerType} onValueChange={handleCancerTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select cancer type" />
              </SelectTrigger>
              <SelectContent>
                {CANCER_TYPE_OPTIONS.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {cancerType === "other" && (
              <Input
                placeholder="Please specify your cancer type"
                value={cancerTypeOther}
                onChange={(e) => setCancerTypeOther(e.target.value)}
                className="mt-2"
              />
            )}
          </div>
          {subtypeOptions.length > 0 && (
            <div className="space-y-2">
              <Label>Subtype</Label>
              <Select value={cancerSubtype} onValueChange={setCancerSubtype}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subtype (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {subtypeOptions.map((sub) => (
                    <SelectItem key={sub.value} value={sub.value}>{sub.label}</SelectItem>
                  ))}
                  <SelectItem value="unknown">Not sure / Don&apos;t know yet</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Label>Treatment goal</Label>
            <Select value={treatmentGoal} onValueChange={setTreatmentGoal}>
              <SelectTrigger>
                <SelectValue placeholder="Select treatment goal (optional)" />
              </SelectTrigger>
              <SelectContent>
                {TREATMENT_GOAL_OPTIONS.map((goal) => (
                  <SelectItem key={goal.value} value={goal.value}>{goal.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Stage</Label>
            <Select value={stage} onValueChange={setStage}>
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
            <Label>Treatment status</Label>
            <Select value={treatmentStatus} onValueChange={setTreatmentStatus}>
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
      </Card>

      {markerOptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Molecular Markers / Mutations</CardTitle>
            <CardDescription>Select any known test results. This helps personalize treatment-related recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {markerOptions.map((marker) => (
              <div key={marker} className="flex items-center space-x-3">
                <Checkbox
                  id={`marker-${marker}`}
                  checked={molecularMarkers.includes(marker)}
                  onCheckedChange={() => toggleMarker(marker)}
                />
                <label htmlFor={`marker-${marker}`} className="text-sm text-gray-700 cursor-pointer">
                  {marker}
                </label>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Current Medications</CardTitle>
          <CardDescription>List your current cancer-related medications and dosages. This helps us personalize side effect tracking.</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="e.g. Imatinib 400mg daily, Keytruda every 3 weeks"
            value={currentMedications}
            onChange={(e) => setCurrentMedications(e.target.value)}
            rows={3}
          />
        </CardContent>
      </Card>

      {showMetastaticSites && (
        <Card>
          <CardHeader>
            <CardTitle>Metastatic Sites</CardTitle>
            <CardDescription>Where has the cancer spread? This helps with specialist and clinical trial recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {METASTATIC_SITE_OPTIONS.map((site) => (
              <div key={site} className="flex items-center space-x-3">
                <Checkbox
                  id={`site-${site}`}
                  checked={metastaticSites.includes(site)}
                  onCheckedChange={() => toggleMetastaticSite(site)}
                />
                <label htmlFor={`site-${site}`} className="text-sm text-gray-700 cursor-pointer">
                  {site}
                </label>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Hereditary / Genetic Syndrome</CardTitle>
          <CardDescription>If applicable, this triggers genetic counseling recommendations and family screening reminders.</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={hereditarySyndrome} onValueChange={setHereditarySyndrome}>
            <SelectTrigger>
              <SelectValue placeholder="Select if applicable" />
            </SelectTrigger>
            <SelectContent>
              {HEREDITARY_SYNDROME_OPTIONS.map((syn) => (
                <SelectItem key={syn.value} value={syn.value}>{syn.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Employment & Insurance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Employer name</Label>
            <Input value={employerName} onChange={(e) => setEmployerName(e.target.value)} placeholder="Company name" />
          </div>
          <div className="space-y-2">
            <Label>Employer size</Label>
            <Select value={employerSize} onValueChange={setEmployerSize}>
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
          <div className="space-y-2">
            <Label>Insurance type</Label>
            <Select value={insuranceType} onValueChange={setInsuranceType}>
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
            <Label>Insurance provider</Label>
            <Input value={insuranceProvider} onChange={(e) => setInsuranceProvider(e.target.value)} placeholder="e.g. Aetna, Blue Cross" />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
          ) : saved ? (
            <><Check className="w-4 h-4 mr-2" /> Saved!</>
          ) : (
            "Save Changes"
          )}
        </Button>
        {saved && <span className="text-sm text-muted-foreground">Your changes have been saved.</span>}
      </div>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Permanently delete your account and all data.</CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog onOpenChange={() => setDeleteConfirm("")}>
            <DialogTrigger asChild>
              <Button variant="destructive">Delete Account</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you absolutely sure?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete your account and all associated data.
                  Type <span className="font-bold">DELETE</span> below to confirm.
                </DialogDescription>
              </DialogHeader>
              <Input
                placeholder='Type "DELETE" to confirm'
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
              />
              <DialogFooter>
                <Button
                  variant="destructive"
                  disabled={deleteConfirm !== "DELETE" || deleting}
                  onClick={async () => {
                    setDeleting(true);
                    try {
                      await fetch("/api/auth/delete-account", { method: "POST" });
                      window.location.href = "/login";
                    } finally {
                      setDeleting(false);
                    }
                  }}
                >
                  {deleting ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Deleting...</>
                  ) : (
                    "Confirm Delete"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
