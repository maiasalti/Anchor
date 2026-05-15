"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/components/user-provider";
import { Button } from "@/components/ui/button";

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

export function WellnessCheckIn() {
  const { userId } = useUser();
  const [mood, setMood] = useState(3);
  const [energy, setEnergy] = useState(3);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();

    await supabase.from("journal_entries").insert({
      user_id: userId,
      mood,
      energy,
      date: new Date().toISOString().split("T")[0],
    });

    setSaving(false);
    setSaved(true);
  }

  if (saved) {
    return (
      <p className="text-sm text-muted-foreground py-2">Logged! You can add more detail in your <a href="/dashboard/journal" className="text-primary underline">journal</a>.</p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground w-12">Mood</span>
        <div className="flex gap-1.5 flex-1">
          {MOODS.map((m) => (
            <button
              key={m.value}
              onClick={() => setMood(m.value)}
              className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${
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
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground w-12">Energy</span>
        <div className="flex gap-1.5 flex-1">
          {ENERGY.map((e) => (
            <button
              key={e.value}
              onClick={() => setEnergy(e.value)}
              className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${
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
      <div className="flex justify-end">
        <Button size="sm" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Log Check-in"}
        </Button>
      </div>
    </div>
  );
}
