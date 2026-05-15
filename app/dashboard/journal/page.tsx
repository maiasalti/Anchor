"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { BookOpen, Pencil, Trash2 } from "lucide-react";
import { useUser } from "@/components/user-provider";
import type { JournalEntry } from "@/types/database";

const MOODS = [
  { value: 1, label: "Very Low", color: "bg-red-500" },
  { value: 2, label: "Low", color: "bg-orange-500" },
  { value: 3, label: "Okay", color: "bg-yellow-500" },
  { value: 4, label: "Good", color: "bg-lime-500" },
  { value: 5, label: "Great", color: "bg-green-500" },
];

const ENERGY = [
  { value: 1, label: "Exhausted", color: "bg-red-500" },
  { value: 2, label: "Low", color: "bg-orange-500" },
  { value: 3, label: "Moderate", color: "bg-yellow-500" },
  { value: 4, label: "Good", color: "bg-lime-500" },
  { value: 5, label: "High", color: "bg-green-500" },
];

const PROMPTS = [
  "What gave you strength today?",
  "What's weighing on your mind?",
  "Something I'm grateful for...",
  "A small win I want to remember...",
  "How I'm really feeling about treatment...",
  "What I need from the people around me...",
];

const TAGS = [
  { value: "General", bgClass: "bg-secondary text-secondary-foreground" },
  { value: "Gratitude", bgClass: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  { value: "Win", bgClass: "bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-200" },
  { value: "Tough Day", bgClass: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" },
];

function tagBadgeClass(tag: string | null): string {
  const found = TAGS.find((t) => t.value === tag);
  return found ? found.bgClass : "bg-secondary text-secondary-foreground";
}

export default function JournalPage() {
  const { userId } = useUser();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [mood, setMood] = useState(3);
  const [energy, setEnergy] = useState(3);
  const [content, setContent] = useState("");
  const [tag, setTag] = useState<string>("General");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadEntries();
  }, []);

  async function loadEntries() {
    const supabase = createClient();
    const { data } = await supabase
      .from("journal_entries")
      .select("*")
      .order("date", { ascending: false });
    if (data) setEntries(data);
  }

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();

    if (editingId) {
      await supabase
        .from("journal_entries")
        .update({
          mood,
          energy,
          content: content || null,
          tag: tag || null,
        })
        .eq("id", editingId);
    } else {
      await supabase.from("journal_entries").insert({
        user_id: userId,
        mood,
        energy,
        content: content || null,
        tag: tag || null,
        date: new Date().toISOString().split("T")[0],
      });
    }

    setContent("");
    setMood(3);
    setEnergy(3);
    setTag("General");
    setEditingId(null);
    setSaving(false);
    loadEntries();
  }

  async function handleDelete(entryId: string) {
    if (!window.confirm("Are you sure you want to delete this entry?")) return;
    const supabase = createClient();
    await supabase.from("journal_entries").delete().eq("id", entryId);
    loadEntries();
  }

  function handleEdit(entry: JournalEntry) {
    setEditingId(entry.id);
    setMood(entry.mood ?? 3);
    setEnergy(entry.energy ?? 3);
    setContent(entry.content ?? "");
    setTag(entry.tag ?? "General");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCancelEdit() {
    setEditingId(null);
    setContent("");
    setMood(3);
    setEnergy(3);
    setTag("General");
  }

  const recent = entries.slice(0, 7);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-primary" />
          Journal
        </h1>
        <p className="text-muted-foreground mt-1">A private space to check in with yourself.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Edit Entry" : "How are you today?"}</CardTitle>
          <CardDescription>Your entries are completely private.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Mood</Label>
            <div className="flex gap-2">
              {MOODS.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMood(m.value)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                    mood === m.value
                      ? `${m.color} text-white scale-105`
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Energy</Label>
            <div className="flex gap-2">
              {ENERGY.map((e) => (
                <button
                  key={e.value}
                  onClick={() => setEnergy(e.value)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                    energy === e.value
                      ? `${e.color} text-white scale-105`
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {e.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>What&apos;s on your mind? (optional)</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write freely — this is just for you..."
              rows={5}
            />
            <div className="space-y-1.5 pt-1">
              <p className="text-xs text-muted-foreground font-medium">Need a prompt?</p>
              <div className="flex flex-wrap gap-1.5">
                {PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => setContent(prompt)}
                    className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tag</Label>
            <div className="flex flex-wrap gap-2">
              {TAGS.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTag(t.value)}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                    tag === t.value
                      ? `${t.bgClass} ring-2 ring-primary ring-offset-2`
                      : `${t.bgClass} opacity-60 hover:opacity-80`
                  }`}
                >
                  {t.value}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : editingId ? "Update Entry" : "Save Entry"}
            </Button>
            {editingId && (
              <Button variant="outline" onClick={handleCancelEdit}>
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {recent.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Recent Entries</h2>

          {/* Mini trend */}
          <Card>
            <CardContent className="py-4">
              <div className="flex items-end gap-1 h-12">
                {recent.reverse().map((entry, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-sm bg-primary/80"
                      style={{ height: `${(entry.mood ?? 3) * 20}%` }}
                      title={`Mood: ${entry.mood}/5`}
                    />
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(entry.date).toLocaleDateString(undefined, { weekday: "short" })}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">Mood trend (last 7 entries)</p>
            </CardContent>
          </Card>

          {entries.map((entry) => (
            <Card key={entry.id}>
              <CardContent className="py-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-medium">{new Date(entry.date).toLocaleDateString()}</span>
                  <div className="flex gap-1.5">
                    <span className={`inline-block w-3 h-3 rounded-full ${MOODS[(entry.mood ?? 3) - 1]?.color ?? "bg-muted"}`}
                      title={`Mood: ${MOODS[(entry.mood ?? 3) - 1]?.label}`} />
                    <span className={`inline-block w-3 h-3 rounded-full ${ENERGY[(entry.energy ?? 3) - 1]?.color ?? "bg-muted"}`}
                      title={`Energy: ${ENERGY[(entry.energy ?? 3) - 1]?.label}`} />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Mood: {MOODS[(entry.mood ?? 3) - 1]?.label} · Energy: {ENERGY[(entry.energy ?? 3) - 1]?.label}
                  </span>
                  {entry.tag && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${tagBadgeClass(entry.tag)}`}>
                      {entry.tag}
                    </span>
                  )}
                  <div className="ml-auto flex gap-1">
                    <button
                      onClick={() => handleEdit(entry)}
                      className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      title="Edit entry"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-destructive transition-colors"
                      title="Delete entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                {entry.content && <p className="text-sm text-muted-foreground">{entry.content}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
