"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { FlaskConical, Loader2, ExternalLink, AlertTriangle, Trash2 } from "lucide-react";
import type { ClinicalTrial } from "@/types/database";

const STATUS_OPTIONS = [
  { value: "saved", label: "Saved" },
  { value: "interested", label: "Interested" },
  { value: "applied", label: "Applied" },
  { value: "enrolled", label: "Enrolled" },
  { value: "not_eligible", label: "Not Eligible" },
];

const PHASE_COLORS: Record<string, string> = {
  "Phase I": "bg-primary/15 text-primary",
  "Phase II": "bg-purple-100 text-purple-800",
  "Phase III": "bg-green-100 text-green-800",
  "Phase IV": "bg-orange-100 text-orange-800",
};

export default function ClinicalTrialsPage() {
  const [trials, setTrials] = useState<ClinicalTrial[]>([]);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState("");

  useEffect(() => {
    loadTrials();
  }, []);

  async function loadTrials() {
    const supabase = createClient();
    const { data } = await supabase
      .from("clinical_trials")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setTrials(data);
  }

  async function findTrials() {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/clinical-trials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location }),
      });
      const data = await res.json();
      if (data.trials) loadTrials();
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: string) {
    const supabase = createClient();
    await supabase.from("clinical_trials").update({ status }).eq("id", id);
    loadTrials();
  }

  async function deleteTrial(id: string) {
    const supabase = createClient();
    await supabase.from("clinical_trials").delete().eq("id", id);
    setTrials((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FlaskConical className="w-6 h-6 text-primary" />
          Clinical Trials
        </h1>
        <p className="text-muted-foreground mt-1">Find clinical trials that may be relevant to your diagnosis.</p>
      </div>

      <div className="flex items-end gap-3">
        <div className="flex-1">
          <label htmlFor="location" className="text-sm font-medium mb-1 block">
            Location (optional)
          </label>
          <Input
            id="location"
            placeholder="City, state, or zip code"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <Button onClick={findTrials} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              Searching...
            </>
          ) : trials.length > 0 ? (
            "Search Again"
          ) : (
            "Find Trials"
          )}
        </Button>
      </div>

      <Card className="border-orange-300 bg-orange-50 shadow-sm">
        <CardContent className="py-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-orange-900">Important Disclaimer</p>
            <p className="text-sm text-orange-800">
              These suggestions are <span className="font-medium">AI-generated</span> and may not reflect real-time availability or eligibility.
              Always verify on{" "}
              <a href="https://clinicaltrials.gov" target="_blank" rel="noopener noreferrer" className="underline font-medium">
                clinicaltrials.gov
              </a>{" "}
              and <span className="font-medium">consult your oncologist</span> before pursuing any trial.
            </p>
          </div>
        </CardContent>
      </Card>

      {trials.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FlaskConical className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">When you&apos;re ready, we can help you explore clinical trial options.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {trials.map((trial) => (
            <Card key={trial.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-base">{trial.trial_name}</CardTitle>
                    <CardDescription className="mt-1">{trial.description}</CardDescription>
                  </div>
                  {trial.phase && (
                    <span className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ${PHASE_COLORS[trial.phase] ?? "bg-muted"}`}>
                      {trial.phase}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                  {trial.location && <span>Location: {trial.location}</span>}
                  {trial.eligibility && <span>Eligibility: {trial.eligibility}</span>}
                </div>
                <div className="flex items-center justify-between">
                  <Select value={trial.status} onValueChange={(v) => updateStatus(trial.id, v)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-1">
                    {trial.url && (
                      <a href={trial.url} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                      </a>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTrial(trial.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
