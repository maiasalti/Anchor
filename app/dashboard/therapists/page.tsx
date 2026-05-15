"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { UserSearch, Loader2, ExternalLink, Phone, Mail, Plus } from "lucide-react";
import type { Therapist } from "@/types/database";

const STATUS_OPTIONS = [
  { value: "saved", label: "Saved" },
  { value: "contacted", label: "Contacted" },
  { value: "active", label: "Active" },
];

const EMPTY_FORM = {
  name: "",
  specialty: "",
  phone: "",
  email: "",
  website: "",
  location: "",
  accepts_insurance: false,
  notes: "",
};

export default function TherapistsPage() {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTherapists();
  }, []);

  async function loadTherapists() {
    const supabase = createClient();
    const { data } = await supabase
      .from("therapists")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setTherapists(data);
  }

  async function findTherapists() {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/therapists", { method: "POST" });
      const data = await res.json();
      if (data.therapists) loadTherapists();
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: string) {
    const supabase = createClient();
    await supabase.from("therapists").update({ status }).eq("id", id);
    loadTherapists();
  }

  async function saveSessionNotes(id: string, session_notes: string) {
    const supabase = createClient();
    await supabase.from("therapists").update({ session_notes }).eq("id", id);
    loadTherapists();
  }

  async function handleAddTherapist() {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const supabase = createClient();
      await supabase.from("therapists").insert({
        name: form.name.trim(),
        specialty: form.specialty.trim() || null,
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        website: form.website.trim() || null,
        location: form.location.trim() || null,
        accepts_insurance: form.accepts_insurance,
        notes: form.notes.trim() || null,
        status: "saved",
      });
      setForm(EMPTY_FORM);
      setDialogOpen(false);
      loadTherapists();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <UserSearch className="w-6 h-6 text-primary" />
            Therapists & Counselors
          </h1>
          <p className="text-muted-foreground mt-1">Find mental health professionals who specialize in cancer support.</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-1" />
                Add Therapist
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Therapist</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="add-name">Name *</Label>
                  <Input id="add-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Therapist name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-specialty">Specialty</Label>
                  <Input id="add-specialty" value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} placeholder="e.g. Oncology counseling" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="add-phone">Phone</Label>
                    <Input id="add-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone number" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="add-email">Email</Label>
                    <Input id="add-email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email address" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-website">Website</Label>
                  <Input id="add-website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-location">Location</Label>
                  <Input id="add-location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="City, State" />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="add-insurance" checked={form.accepts_insurance} onCheckedChange={(checked) => setForm({ ...form, accepts_insurance: !!checked })} />
                  <Label htmlFor="add-insurance">Accepts Insurance</Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-notes">Notes</Label>
                  <Textarea id="add-notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Any additional notes..." rows={3} />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleAddTherapist} disabled={saving || !form.name.trim()}>
                  {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : null}
                  Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button onClick={findTherapists} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                Searching...
              </>
            ) : (
              "Find Therapists"
            )}
          </Button>
        </div>
      </div>

      {therapists.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <UserSearch className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground max-w-sm mx-auto">Taking care of your mental health is just as important as treatment. We can help you find the right fit.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {therapists.map((t) => (
            <Card key={t.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{t.name}</CardTitle>
                    {t.specialty && <CardDescription>{t.specialty}</CardDescription>}
                  </div>
                  {t.accepts_insurance !== null && (
                    <Badge variant={t.accepts_insurance ? "secondary" : "outline"}>
                      {t.accepts_insurance ? "Accepts Insurance" : "Self-Pay"}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {t.notes && <p className="text-sm text-muted-foreground mb-3">{t.notes}</p>}
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-3">
                  {t.location && <span>{t.location}</span>}
                  {t.phone && (
                    <a href={`tel:${t.phone}`} className="flex items-center gap-1 hover:text-foreground">
                      <Phone className="w-3 h-3" /> {t.phone}
                    </a>
                  )}
                  {t.email && (
                    <a href={`mailto:${t.email}`} className="flex items-center gap-1 hover:text-foreground">
                      <Mail className="w-3 h-3" /> {t.email}
                    </a>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <Select value={t.status} onValueChange={(v) => updateStatus(t.id, v)}>
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {t.website && (
                    <a href={t.website} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Website
                      </Button>
                    </a>
                  )}
                </div>
                {t.status === "active" && (
                  <div className="mt-4 space-y-2">
                    <Label htmlFor={`session-notes-${t.id}`} className="text-sm font-medium">Session Notes</Label>
                    <Textarea
                      id={`session-notes-${t.id}`}
                      defaultValue={t.session_notes ?? ""}
                      onBlur={(e) => saveSessionNotes(t.id, e.target.value)}
                      placeholder="Record notes from your sessions..."
                      rows={3}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
