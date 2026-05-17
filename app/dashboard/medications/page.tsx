"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pill, Plus, AlertCircle, AlertTriangle, Bell, BellOff, Pencil } from "lucide-react";
import { useUser } from "@/components/user-provider";
import type { Medication } from "@/types/database";

type Interaction = {
  medications: string[];
  severity: "mild" | "moderate" | "serious";
  description: string;
  recommendation: string;
};

const EMPTY_MED = {
  name: "",
  dosage: "",
  frequency: "",
  prescriber: "",
  pharmacy: "",
  start_date: "",
  end_date: "",
  refill_date: "",
  notes: "",
};

export default function MedicationsPage() {
  const { userId } = useUser();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [form, setForm] = useState(EMPTY_MED);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loadingInteractions, setLoadingInteractions] = useState(false);

  useEffect(() => {
    loadMedications();
  }, []);

  async function loadMedications() {
    const supabase = createClient();
    const { data } = await supabase
      .from("medications")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) {
      setMedications(data);
      const activeCount = data.filter((m) => m.is_active).length;
      if (activeCount >= 2) {
        checkInteractions();
      } else {
        setInteractions([]);
      }
    }
  }

  async function checkInteractions() {
    setLoadingInteractions(true);
    try {
      const res = await fetch("/api/ai/medication-interactions", { method: "POST" });
      const json = await res.json();
      setInteractions(json.interactions || []);
    } catch {
      setInteractions([]);
    } finally {
      setLoadingInteractions(false);
    }
  }

  async function handleSave() {
    if (!form.name.trim()) return;
    setSaving(true);
    const supabase = createClient();

    if (editingId) {
      await supabase
        .from("medications")
        .update({
          name: form.name,
          dosage: form.dosage || null,
          frequency: form.frequency || null,
          prescriber: form.prescriber || null,
          pharmacy: form.pharmacy || null,
          start_date: form.start_date || null,
          end_date: form.end_date || null,
          refill_date: form.refill_date || null,
          notes: form.notes || null,
        })
        .eq("id", editingId);
    } else {
      await supabase.from("medications").insert({
        user_id: userId,
        name: form.name,
        dosage: form.dosage || null,
        frequency: form.frequency || null,
        prescriber: form.prescriber || null,
        pharmacy: form.pharmacy || null,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        refill_date: form.refill_date || null,
        notes: form.notes || null,
      });
    }

    setForm(EMPTY_MED);
    setEditingId(null);
    setDialogOpen(false);
    setSaving(false);
    loadMedications();
  }

  function startEdit(med: Medication) {
    setEditingId(med.id);
    setForm({
      name: med.name,
      dosage: med.dosage || "",
      frequency: med.frequency || "",
      prescriber: med.prescriber || "",
      pharmacy: med.pharmacy || "",
      start_date: med.start_date || "",
      end_date: med.end_date || "",
      refill_date: med.refill_date || "",
      notes: med.notes || "",
    });
    setDialogOpen(true);
  }

  async function toggleActive(med: Medication) {
    const supabase = createClient();
    await supabase
      .from("medications")
      .update({ is_active: !med.is_active })
      .eq("id", med.id);
    loadMedications();
  }

  async function toggleReminder(med: Medication) {
    const supabase = createClient();
    await supabase
      .from("medications")
      .update({ reminder_enabled: !med.reminder_enabled })
      .eq("id", med.id);
    loadMedications();
  }

  function isRefillSoon(refillDate: string | null) {
    if (!refillDate) return false;
    const diff = new Date(refillDate).getTime() - Date.now();
    return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000;
  }

  function severityVariant(severity: Interaction["severity"]) {
    switch (severity) {
      case "serious":
        return "destructive" as const;
      case "moderate":
        return "outline" as const;
      case "mild":
      default:
        return "secondary" as const;
    }
  }

  const active = medications.filter((m) => m.is_active);
  const past = medications.filter((m) => !m.is_active);
  const hasReminders = medications.some((m) => m.reminder_enabled);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Pill className="w-6 h-6 text-primary" />
            Medications
          </h1>
          <p className="text-muted-foreground mt-1">Track your medications, dosages, and refills.</p>
        </div>
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) {
              setEditingId(null);
              setForm(EMPTY_MED);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-1" />
              Add Medication
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Medication" : "Add Medication"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <Label>Medication name *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., Tamoxifen" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Dosage</Label>
                  <Input value={form.dosage} onChange={(e) => setForm({ ...form, dosage: e.target.value })} placeholder="e.g., 20mg" />
                </div>
                <div className="space-y-1">
                  <Label>Frequency</Label>
                  <Input value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} placeholder="e.g., Once daily" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Prescriber</Label>
                  <Input value={form.prescriber} onChange={(e) => setForm({ ...form, prescriber: e.target.value })} placeholder="Dr. name" />
                </div>
                <div className="space-y-1">
                  <Label>Pharmacy</Label>
                  <Input value={form.pharmacy} onChange={(e) => setForm({ ...form, pharmacy: e.target.value })} placeholder="Pharmacy name" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Start date</Label>
                  <Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label>End date</Label>
                  <Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Refill date</Label>
                <Input type="date" value={form.refill_date} onChange={(e) => setForm({ ...form, refill_date: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Notes</Label>
                <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Any additional notes..." rows={2} />
              </div>
              <Button onClick={handleSave} disabled={saving || !form.name.trim()} className="w-full">
                {saving ? "Saving..." : editingId ? "Save Changes" : "Add Medication"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {hasReminders && (
        <div className="flex items-center gap-2 rounded-lg border bg-primary/10 dark:bg-primary/10 p-3 text-sm text-primary dark:text-primary">
          <Bell className="w-4 h-4 shrink-0" />
          Refill reminders will be sent to your email.
        </div>
      )}

      {interactions.length > 0 && (
        <Card className="border-orange-300 dark:border-orange-700">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400 text-base">
              <AlertTriangle className="w-5 h-5" />
              Medication Interaction Warnings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {interactions.map((interaction, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{interaction.medications.join(" + ")}</span>
                  <Badge
                    variant={severityVariant(interaction.severity)}
                    className={
                      interaction.severity === "moderate"
                        ? "border-orange-400 bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400"
                        : ""
                    }
                  >
                    {interaction.severity}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{interaction.description}</p>
                <p className="text-sm text-muted-foreground italic">{interaction.recommendation}</p>
              </div>
            ))}
            <p className="text-xs text-muted-foreground pt-2 border-t">
              This is AI-generated information for educational purposes only. Always consult your pharmacist or doctor about medication interactions.
            </p>
          </CardContent>
        </Card>
      )}

      {loadingInteractions && (
        <p className="text-sm text-muted-foreground text-center">Checking for medication interactions...</p>
      )}

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active ({active.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="space-y-3 mt-4">
          {active.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No active medications. Add one to get started.</p>
          ) : (
            active.map((med) => (
              <MedCard
                key={med.id}
                med={med}
                onToggle={toggleActive}
                onEdit={startEdit}
                onToggleReminder={toggleReminder}
                isRefillSoon={isRefillSoon}
              />
            ))
          )}
        </TabsContent>
        <TabsContent value="past" className="space-y-3 mt-4">
          {past.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No past medications.</p>
          ) : (
            past.map((med) => (
              <MedCard
                key={med.id}
                med={med}
                onToggle={toggleActive}
                onEdit={startEdit}
                onToggleReminder={toggleReminder}
                isRefillSoon={isRefillSoon}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MedCard({
  med,
  onToggle,
  onEdit,
  onToggleReminder,
  isRefillSoon,
}: {
  med: Medication;
  onToggle: (med: Medication) => void;
  onEdit: (med: Medication) => void;
  onToggleReminder: (med: Medication) => void;
  isRefillSoon: (date: string | null) => boolean;
}) {
  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{med.name}</h3>
              {med.dosage && <Badge variant="secondary">{med.dosage}</Badge>}
              {isRefillSoon(med.refill_date) && (
                <Badge variant="destructive" className="text-xs">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Refill soon
                </Badge>
              )}
              {med.reminder_enabled && (
                <Badge variant="outline" className="text-xs text-primary border-primary">
                  <Bell className="w-3 h-3 mr-1" />
                  Reminder set
                </Badge>
              )}
            </div>
            <div className="flex gap-4 text-sm text-muted-foreground">
              {med.frequency && <span>{med.frequency}</span>}
              {med.prescriber && <span>Prescribed by {med.prescriber}</span>}
              {med.pharmacy && <span>at {med.pharmacy}</span>}
            </div>
            {med.notes && <p className="text-sm text-muted-foreground mt-1">{med.notes}</p>}
          </div>
          <div className="flex items-center gap-1">
            {med.refill_date && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onToggleReminder(med)}
                title={med.reminder_enabled ? "Disable reminder" : "Enable reminder"}
              >
                {med.reminder_enabled ? (
                  <Bell className="w-4 h-4 text-primary" />
                ) : (
                  <BellOff className="w-4 h-4 text-muted-foreground" />
                )}
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(med)}>
              <Pencil className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => onToggle(med)}>
              {med.is_active ? "Mark Inactive" : "Reactivate"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
