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
import { Users, Loader2, ExternalLink, Globe, MapPin, Plus } from "lucide-react";
import type { SupportGroup } from "@/types/database";

const STATUS_OPTIONS = [
  { value: "saved", label: "Saved" },
  { value: "joined", label: "Joined" },
  { value: "not_interested", label: "Not Interested" },
];

const TYPE_OPTIONS = [
  { value: "online", label: "Online" },
  { value: "in_person", label: "In Person" },
  { value: "both", label: "Online & In Person" },
];

const EMPTY_FORM = {
  name: "",
  type: "online",
  description: "",
  url: "",
  location: "",
};

export default function SupportGroupsPage() {
  const [groups, setGroups] = useState<SupportGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadGroups();
  }, []);

  async function loadGroups() {
    const supabase = createClient();
    const { data } = await supabase
      .from("support_groups")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setGroups(data);
  }

  async function findGroups() {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/support-groups", { method: "POST" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("Support groups error:", err);
        return;
      }
      const data = await res.json();
      if (data.groups) loadGroups();
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: string) {
    const supabase = createClient();
    await supabase.from("support_groups").update({ status }).eq("id", id);
    loadGroups();
  }

  async function handleAddGroup() {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const supabase = createClient();
      await supabase.from("support_groups").insert({
        name: form.name.trim(),
        type: form.type,
        description: form.description.trim() || null,
        url: form.url.trim() || null,
        location: form.location.trim() || null,
        status: "saved",
      });
      setForm(EMPTY_FORM);
      setDialogOpen(false);
      loadGroups();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Support Groups
          </h1>
          <p className="text-muted-foreground mt-1">Find cancer support groups and communities.</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-1" />
                Add Group
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Support Group</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="add-group-name">Name *</Label>
                  <Input id="add-group-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Group name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-group-type">Type</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                    <SelectTrigger id="add-group-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TYPE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-group-desc">Description</Label>
                  <Textarea id="add-group-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What is this group about?" rows={3} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-group-url">URL</Label>
                  <Input id="add-group-url" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-group-location">Location</Label>
                  <Input id="add-group-location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="City, State or Online" />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleAddGroup} disabled={saving || !form.name.trim()}>
                  {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : null}
                  Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button onClick={findGroups} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                Searching...
              </>
            ) : (
              "Find Groups"
            )}
          </Button>
        </div>
      </div>

      {groups.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">You&apos;re not alone in this. We can help you find your community.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groups.map((group) => (
            <Card key={group.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{group.name}</CardTitle>
                <CardDescription>{group.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  {group.type === "online" ? (
                    <Badge variant="secondary"><Globe className="w-3 h-3 mr-1" />Online</Badge>
                  ) : group.type === "in_person" ? (
                    <Badge variant="secondary"><MapPin className="w-3 h-3 mr-1" />In Person</Badge>
                  ) : (
                    <Badge variant="secondary">Online & In Person</Badge>
                  )}
                  {group.location && <span>{group.location}</span>}
                </div>
                <div className="flex items-center justify-between">
                  <Select value={group.status} onValueChange={(v) => updateStatus(group.id, v)}>
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {group.url && (
                    <a href={group.url} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Visit
                      </Button>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
