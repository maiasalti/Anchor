"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Activity, Plus, FileText, Loader2, X, Copy, Printer, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { SideEffectEntry, Symptom } from "@/types/database";
import type { Medication } from "@/types/database";
import { useUser } from "@/components/user-provider";
import { getCancerInfo } from "@/lib/cancer-types";

const DEFAULT_SYMPTOMS = [
  "Nausea", "Fatigue", "Pain", "Neuropathy", "Mouth Sores",
  "Brain Fog", "Appetite Loss", "Insomnia",
];

export default function SideEffectsPage() {
  const { userId } = useUser();
  const [entries, setEntries] = useState<SideEffectEntry[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [customSymptom, setCustomSymptom] = useState("");
  const [energyLevel, setEnergyLevel] = useState(5);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [commonSymptoms, setCommonSymptoms] = useState<string[]>(DEFAULT_SYMPTOMS);
  const [copied, setCopied] = useState(false);
  const [medications, setMedications] = useState<Medication[]>([]);

  useEffect(() => {
    loadEntries();
    loadCancerSymptoms();
    loadMedications();
  }, []);

  async function loadCancerSymptoms() {
    const supabase = createClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("cancer_type, cancer_subtype")
      .eq("id", userId)
      .single();
    if (profile?.cancer_type) {
      const info = getCancerInfo(profile.cancer_type, profile.cancer_subtype);
      if (info) setCommonSymptoms(info.commonSideEffects);
    }
  }

  async function loadEntries() {
    const supabase = createClient();
    const { data } = await supabase
      .from("side_effect_entries")
      .select("*")
      .order("date", { ascending: false });
    if (data) setEntries(data);
  }

  async function loadMedications() {
    const supabase = createClient();
    const { data } = await supabase
      .from("medications")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true);
    if (data) setMedications(data);
  }

  function toggleSymptom(name: string) {
    setSymptoms((prev) => {
      const existing = prev.find((s) => s.name === name);
      if (existing) return prev.filter((s) => s.name !== name);
      return [...prev, { name, severity: 5 }];
    });
  }

  function updateSeverity(name: string, severity: number) {
    setSymptoms((prev) =>
      prev.map((s) => (s.name === name ? { ...s, severity } : s))
    );
  }

  function addCustomSymptom() {
    if (!customSymptom.trim()) return;
    if (!symptoms.find((s) => s.name === customSymptom)) {
      setSymptoms((prev) => [...prev, { name: customSymptom.trim(), severity: 5 }]);
    }
    setCustomSymptom("");
  }

  async function handleSave() {
    if (symptoms.length === 0) return;
    setSaving(true);
    const supabase = createClient();

    await supabase.from("side_effect_entries").insert({
      user_id: userId,
      date,
      symptoms,
      energy_level: energyLevel,
      notes: notes || null,
    });

    setSymptoms([]);
    setNotes("");
    setEnergyLevel(5);
    setSaving(false);
    loadEntries();
  }

  async function handleGenerateReport() {
    setGeneratingReport(true);
    setReport(null);
    try {
      const res = await fetch("/api/ai/side-effects-report", { method: "POST" });
      const data = await res.json();
      if (data.report) setReport(data.report);
    } finally {
      setGeneratingReport(false);
    }
  }

  function handleCopyReport() {
    if (!report) return;
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Compute symptom trends: symptoms appearing in 3+ entries
  const symptomTrends = useMemo(() => {
    const symptomMap = new Map<string, { date: string; severity: number }[]>();

    for (const entry of entries) {
      for (const s of entry.symptoms as Symptom[]) {
        if (!symptomMap.has(s.name)) symptomMap.set(s.name, []);
        symptomMap.get(s.name)!.push({ date: entry.date, severity: s.severity });
      }
    }

    const trends: { name: string; data: { date: string; severity: number }[] }[] = [];
    for (const [name, data] of symptomMap) {
      if (data.length >= 3) {
        // Sort by date ascending and take last 14
        const sorted = data.sort((a, b) => a.date.localeCompare(b.date)).slice(-14);
        trends.push({ name, data: sorted });
      }
    }
    return trends;
  }, [entries]);

  function barColor(severity: number): string {
    if (severity < 4) return "bg-green-500";
    if (severity <= 6) return "bg-yellow-500";
    return "bg-red-500";
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" />
            Side Effect Journal
          </h1>
          <p className="text-muted-foreground mt-1">Track symptoms and generate reports for your doctor.</p>
        </div>
        <Button variant="outline" onClick={handleGenerateReport} disabled={generatingReport || entries.length === 0}>
          {generatingReport ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <FileText className="w-4 h-4 mr-1" />}
          Generate Report
        </Button>
      </div>

      {report && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Doctor Report</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopyReport}>
                  {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
                <Button variant="outline" size="sm" onClick={() => window.print()}>
                  <Printer className="w-4 h-4 mr-1" />
                  Print
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none text-muted-foreground [&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground [&_strong]:text-foreground">
              <ReactMarkdown>{report}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Log Today&apos;s Symptoms</CardTitle>
          <CardDescription>Select symptoms and rate their severity.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-48" />
          </div>

          <div className="space-y-2">
            <Label>Symptoms</Label>
            <div className="flex flex-wrap gap-2">
              {commonSymptoms.map((s) => (
                <button
                  key={s}
                  onClick={() => toggleSymptom(s)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    symptoms.find((sym) => sym.name === s)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Add custom symptom..."
                value={customSymptom}
                onChange={(e) => setCustomSymptom(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCustomSymptom()}
                className="flex-1"
              />
              <Button variant="outline" size="sm" onClick={addCustomSymptom}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {symptoms.length > 0 && (
            <div className="space-y-4">
              <Label>Severity (1-10)</Label>
              {symptoms.map((s) => (
                <div key={s.name} className="flex items-center gap-4">
                  <div className="flex items-center gap-2 w-32">
                    <button onClick={() => toggleSymptom(s.name)} className="text-muted-foreground hover:text-foreground">
                      <X className="w-3 h-3" />
                    </button>
                    <span className="text-sm">{s.name}</span>
                  </div>
                  <Slider
                    value={[s.severity]}
                    onValueChange={([v]) => updateSeverity(s.name, v)}
                    min={1}
                    max={10}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-6 text-right">{s.severity}</span>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <Label>Energy Level: {energyLevel}/10</Label>
            <Slider
              value={[energyLevel]}
              onValueChange={([v]) => setEnergyLevel(v)}
              min={1}
              max={10}
              step={1}
            />
          </div>

          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="How are you feeling today?" rows={3} />
          </div>

          <Button onClick={handleSave} disabled={saving || symptoms.length === 0}>
            {saving ? "Saving..." : "Save Entry"}
          </Button>
        </CardContent>
      </Card>

      {entries.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">History</h2>
          {entries.map((entry) => (
            <Card key={entry.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium">{new Date(entry.date).toLocaleDateString()}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {entry.symptoms.map((s: Symptom) => (
                        <Badge key={s.name} variant={s.severity >= 7 ? "destructive" : "secondary"}>
                          {s.name}: {s.severity}/10
                        </Badge>
                      ))}
                    </div>
                    {entry.notes && <p className="text-sm text-muted-foreground mt-2">{entry.notes}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Energy</p>
                    <div className="flex items-center gap-1">
                      <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${(entry.energy_level ?? 5) * 10}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium">{entry.energy_level}/10</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {symptomTrends.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold">Symptom Trends</h2>

          {medications.length > 0 && (
            <Card>
              <CardContent className="py-4">
                <p className="text-sm font-medium mb-2">Active medications during this period:</p>
                <div className="flex flex-wrap gap-2">
                  {medications.map((med) => (
                    <Badge key={med.id} variant="secondary">
                      {med.name}{med.dosage ? ` - ${med.dosage}` : ""}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {symptomTrends.map((trend) => (
            <Card key={trend.name}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{trend.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-1 h-24">
                  {trend.data.map((point, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex items-end justify-center h-20">
                        <div
                          className={`w-full max-w-[24px] rounded-t ${barColor(point.severity)}`}
                          style={{ height: `${(point.severity / 10) * 100}%` }}
                          title={`${point.date}: ${point.severity}/10`}
                        />
                      </div>
                      <span className="text-[9px] text-muted-foreground leading-none">
                        {new Date(point.date).toLocaleDateString(undefined, { month: "numeric", day: "numeric" })}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-green-500" />
                    <span>Mild (&lt;4)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-yellow-500" />
                    <span>Moderate (4-6)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-red-500" />
                    <span>Severe (7+)</span>
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
