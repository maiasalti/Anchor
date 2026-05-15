"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { CheckSquare, Plus, Sparkles, Loader2, ChevronDown, ChevronRight, Clock, ExternalLink, Pencil, Trash2, Search } from "lucide-react";
import { useUser } from "@/components/user-provider";

type ActionItem = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  priority: string | null;
  status: string;
  due_date: string | null;
  why_it_matters: string | null;
  estimated_minutes: number | null;
  timeline_bucket: string | null;
  resource_url: string | null;
};

const priorityColor: Record<string, "destructive" | "default" | "secondary" | "outline"> = {
  urgent: "destructive",
  high: "default",
  medium: "secondary",
  low: "outline",
};

const categoryColor: Record<string, string> = {
  insurance: "bg-blue-100 text-blue-700",
  employment: "bg-purple-100 text-purple-700",
  financial: "bg-green-100 text-green-700",
  legal: "bg-yellow-100 text-yellow-700",
  medical: "bg-red-100 text-red-700",
};

const bucketLabels: Record<string, string> = {
  this_week: "This Week",
  this_month: "This Month",
  ongoing: "Ongoing",
};

const bucketOrder = ["this_week", "this_month", "ongoing"];

export default function ChecklistPage() {
  const { userId } = useUser();
  const [items, setItems] = useState<ActionItem[]>([]);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Filter/search state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  // Regenerate confirmation dialog
  const [confirmGenerate, setConfirmGenerate] = useState(false);

  const supabase = createClient();

  async function load() {
    const { data } = await supabase
      .from("action_items")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    setItems(data ?? []);
  }

  useEffect(() => { load(); }, []);

  function handleGenerateClick() {
    if (items.length > 0) {
      setConfirmGenerate(true);
    } else {
      handleGenerate();
    }
  }

  async function handleGenerate() {
    setConfirmGenerate(false);
    setGenerating(true);
    setGenError(null);
    try {
      const res = await fetch("/api/ai/checklist", { method: "POST" });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "Something went wrong");
      }
      await load();
    } catch (e) {
      setGenError(e instanceof Error ? e.message : "Failed to generate checklist");
    } finally {
      setGenerating(false);
    }
  }

  function openAddDialog() {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setCategory("");
    setPriority("");
    setDueDate("");
    setOpen(true);
  }

  function openEditDialog(item: ActionItem) {
    setEditingId(item.id);
    setTitle(item.title);
    setDescription(item.description ?? "");
    setCategory(item.category ?? "");
    setPriority(item.priority ?? "");
    setDueDate(item.due_date ?? "");
    setOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    if (editingId) {
      await supabase.from("action_items").update({
        title,
        description: description || null,
        category: category || null,
        priority: priority || null,
        due_date: dueDate || null,
      }).eq("id", editingId);
    } else {
      await supabase.from("action_items").insert({
        user_id: userId,
        title,
        description: description || null,
        category: category || null,
        priority: priority || null,
        due_date: dueDate || null,
        status: "pending",
      });
    }

    setTitle(""); setDescription(""); setCategory(""); setPriority(""); setDueDate("");
    setEditingId(null);
    setOpen(false);
    setSaving(false);
    load();
  }

  async function handleDelete(item: ActionItem) {
    if (!window.confirm("Delete this item?")) return;
    await supabase.from("action_items").delete().eq("id", item.id);
    load();
  }

  async function toggleComplete(item: ActionItem) {
    const newStatus = item.status === "completed" ? "pending" : "completed";
    await supabase.from("action_items").update({ status: newStatus }).eq("id", item.id);
    load();
  }

  // Apply client-side filters
  const filteredItems = items.filter((item) => {
    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesTitle = item.title.toLowerCase().includes(q);
      const matchesDesc = item.description?.toLowerCase().includes(q) ?? false;
      if (!matchesTitle && !matchesDesc) return false;
    }
    // Category filter
    if (filterCategory !== "all" && item.category !== filterCategory) return false;
    // Priority filter
    if (filterPriority !== "all" && item.priority !== filterPriority) return false;
    return true;
  });

  const completed = filteredItems.filter((i) => i.status === "completed");
  const pending = filteredItems.filter((i) => i.status !== "completed");
  const totalCount = items.length;
  const completedCount = items.filter((i) => i.status === "completed").length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Group pending items by timeline_bucket
  const hasBuckets = pending.some((i) => i.timeline_bucket);
  const bucketGroups = hasBuckets
    ? bucketOrder.reduce<Record<string, ActionItem[]>>((acc, bucket) => {
        const grouped = pending.filter((i) => i.timeline_bucket === bucket);
        if (grouped.length > 0) acc[bucket] = grouped;
        return acc;
      }, {})
    : null;

  // Items without a bucket (manually added)
  const unbucketed = hasBuckets ? pending.filter((i) => !i.timeline_bucket) : pending;

  function renderItem(item: ActionItem) {
    const isExpanded = expandedId === item.id;
    const hasDetails = item.why_it_matters || item.estimated_minutes || item.resource_url;

    return (
      <Card key={item.id} className="hover:shadow-sm transition-shadow">
        <CardHeader className="pb-2 flex flex-row items-start justify-between">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <button
              onClick={() => toggleComplete(item)}
              className="mt-0.5 flex-shrink-0 text-muted-foreground/40 hover:text-primary transition-colors"
            >
              <CheckSquare className="w-4 h-4" />
            </button>
            <div
              className={`flex-1 min-w-0 ${hasDetails ? "cursor-pointer" : ""}`}
              onClick={() => hasDetails && setExpandedId(isExpanded ? null : item.id)}
            >
              <div className="flex items-center gap-1">
                {hasDetails && (
                  isExpanded
                    ? <ChevronDown className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    : <ChevronRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                )}
                <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
              </div>
              {item.description && (
                <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
              )}
              {item.due_date && (
                <p className="text-xs text-muted-foreground/70 mt-1">
                  Due: {new Date(item.due_date).toLocaleDateString("en-US", { timeZone: "UTC" })}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-4">
            {item.estimated_minutes && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {item.estimated_minutes}m
              </span>
            )}
            {item.category && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColor[item.category] ?? "bg-gray-100 text-gray-600"}`}>
                {item.category}
              </span>
            )}
            {item.priority && (
              <Badge variant={priorityColor[item.priority] ?? "outline"}>
                {item.priority}
              </Badge>
            )}
            <button
              onClick={() => openEditDialog(item)}
              className="text-muted-foreground/40 hover:text-foreground transition-colors"
              title="Edit item"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleDelete(item)}
              className="text-muted-foreground/40 hover:text-destructive transition-colors"
              title="Delete item"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </CardHeader>
        {isExpanded && hasDetails && (
          <CardContent className="pt-0 pb-3 ml-7 space-y-2 border-t mt-1 pt-3">
            {item.why_it_matters && (
              <div>
                <p className="text-xs font-medium text-foreground mb-0.5">Why it matters</p>
                <p className="text-xs text-muted-foreground">{item.why_it_matters}</p>
              </div>
            )}
            {item.resource_url && (
              <a
                href={item.resource_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <ExternalLink className="w-3 h-3" />
                Helpful resource
              </a>
            )}
          </CardContent>
        )}
      </Card>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Action Checklist</h1>
          <p className="text-muted-foreground mt-1">Your prioritized list of things to do.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={handleGenerateClick} disabled={generating}>
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {generating ? "Generating..." : "Generate my plan"}
          </Button>
          <Button className="gap-2" onClick={openAddDialog}>
            <Plus className="w-4 h-4" /> Add item
          </Button>
        </div>
      </div>

      {genError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-6">
          {genError}
        </div>
      )}

      {/* Progress bar */}
      {totalCount > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">
              {completedCount} of {totalCount} completed
            </span>
            <span className="text-sm text-muted-foreground">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
      )}

      {/* Filters/Search */}
      {items.length > 0 && (
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="insurance">Insurance</SelectItem>
              <SelectItem value="employment">Employment</SelectItem>
              <SelectItem value="financial">Financial</SelectItem>
              <SelectItem value="legal">Legal</SelectItem>
              <SelectItem value="medical">Medical</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {items.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 bg-accent rounded-full flex items-center justify-center mb-4">
              <CheckSquare className="w-7 h-7 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Your action plan starts here</h3>
            <p className="text-sm text-muted-foreground max-w-xs mb-4">
              Your personalized action plan will appear here. Let&apos;s build it together.
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="gap-2" onClick={handleGenerateClick} disabled={generating}>
                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {generating ? "Generating..." : "Generate my plan"}
              </Button>
              <Button className="gap-2" onClick={openAddDialog}>
                <Plus className="w-4 h-4" /> Add manually
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Timeline-bucketed groups */}
          {bucketGroups && Object.entries(bucketGroups).map(([bucket, bucketItems]) => (
            <div key={bucket}>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                {bucketLabels[bucket] ?? bucket} ({bucketItems.length})
              </h2>
              <div className="space-y-2">
                {bucketItems.map(renderItem)}
              </div>
            </div>
          ))}

          {/* Unbucketed pending items */}
          {unbucketed.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                {bucketGroups ? "Other" : "To do"} ({unbucketed.length})
              </h2>
              <div className="space-y-2">
                {unbucketed.map(renderItem)}
              </div>
            </div>
          )}

          {/* Completed items */}
          {completed.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground/60 uppercase tracking-wide mb-3">
                Completed ({completed.length})
              </h2>
              <div className="space-y-2 opacity-60">
                {completed.map((item) => (
                  <Card key={item.id}>
                    <CardHeader className="pb-2 flex flex-row items-center gap-3">
                      <button onClick={() => toggleComplete(item)}>
                        <CheckSquare className="w-4 h-4 text-primary" />
                      </button>
                      <CardTitle className="text-sm font-medium line-through text-muted-foreground flex-1">
                        {item.title}
                      </CardTitle>
                      <button
                        onClick={() => openEditDialog(item)}
                        className="text-muted-foreground/40 hover:text-foreground transition-colors"
                        title="Edit item"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="text-muted-foreground/40 hover:text-destructive transition-colors"
                        title="Delete item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) setEditingId(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit action item" : "Add an action item"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                placeholder="e.g. File FMLA paperwork with HR"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea
                placeholder="Any additional details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="insurance">Insurance</SelectItem>
                    <SelectItem value="employment">Employment</SelectItem>
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="legal">Legal</SelectItem>
                    <SelectItem value="medical">Medical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Due date (optional)</Label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : editingId ? "Save changes" : "Add item"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirm Generate Dialog */}
      <Dialog open={confirmGenerate} onOpenChange={setConfirmGenerate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate new plan?</DialogTitle>
            <DialogDescription>
              This will add new items alongside your existing ones. Continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmGenerate(false)}>Cancel</Button>
            <Button onClick={handleGenerate}>Continue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
