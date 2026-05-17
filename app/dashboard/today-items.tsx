"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle } from "lucide-react";

type TodayItem = {
  id: string;
  title: string;
  category: string | null;
  priority: string | null;
  due_date: string | null;
};

const categoryColor: Record<string, string> = {
  insurance: "bg-primary/15 text-primary",
  employment: "bg-purple-100 text-purple-700",
  financial: "bg-green-100 text-green-700",
  legal: "bg-yellow-100 text-yellow-700",
  medical: "bg-red-100 text-destructive",
};

export function TodayItems({ items: initialItems }: { items: TodayItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  async function toggleComplete(id: string) {
    const supabase = createClient();
    await supabase.from("action_items").update({ status: "completed" }).eq("id", id);
    setCompletedIds((prev) => new Set([...prev, id]));
  }

  const visibleItems = items.filter((i) => !completedIds.has(i.id));

  if (visibleItems.length === 0) {
    return (
      <Card className="mb-6">
        <CardContent className="py-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <p className="text-sm font-medium">You&apos;re all caught up for today!</p>
            <p className="text-xs text-muted-foreground">No urgent items need your attention right now.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mb-6 space-y-2">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        What to do today
      </h2>
      {visibleItems.map((item) => (
        <Card key={item.id} className="hover:shadow-sm transition-shadow">
          <CardContent className="py-3 flex items-center gap-3">
            <button
              onClick={() => toggleComplete(item.id)}
              className="flex-shrink-0 text-muted-foreground/40 hover:text-primary transition-colors"
            >
              <Circle className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium flex-1">{item.title}</span>
            <div className="flex items-center gap-2">
              {item.category && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColor[item.category] ?? "bg-muted text-muted-foreground"}`}>
                  {item.category}
                </span>
              )}
              {item.priority === "urgent" && (
                <Badge variant="destructive" className="text-xs">Urgent</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
