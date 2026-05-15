"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Stethoscope, Loader2, CheckCircle, Circle, Clock } from "lucide-react";
import { useUser } from "@/components/user-provider";
import type { SecondOpinionTask } from "@/types/database";

const STATUS_ICONS = {
  pending: Circle,
  in_progress: Clock,
  completed: CheckCircle,
};

const STATUS_CYCLE = ["pending", "in_progress", "completed"] as const;

export default function SecondOpinionPage() {
  const { userId } = useUser();
  const [tasks, setTasks] = useState<SecondOpinionTask[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    const supabase = createClient();
    const { data } = await supabase
      .from("second_opinion_tasks")
      .select("*")
      .order("step_number", { ascending: true });
    if (data) setTasks(data);
  }

  async function generateSteps() {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/second-opinion", { method: "POST" });
      const data = await res.json();
      if (data.tasks) loadTasks();
    } finally {
      setLoading(false);
    }
  }

  async function cycleStatus(task: SecondOpinionTask) {
    const currentIdx = STATUS_CYCLE.indexOf(task.status as typeof STATUS_CYCLE[number]);
    const nextStatus = STATUS_CYCLE[(currentIdx + 1) % STATUS_CYCLE.length];
    const supabase = createClient();
    await supabase.from("second_opinion_tasks").update({ status: nextStatus }).eq("id", task.id);
    loadTasks();
  }

  const completed = tasks.filter((t) => t.status === "completed").length;
  const progress = tasks.length > 0 ? (completed / tasks.length) * 100 : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-primary" />
            Second Opinion
          </h1>
          <p className="text-muted-foreground mt-1">Step-by-step guide to getting a second opinion.</p>
        </div>
        <Button
          onClick={async () => {
            if (tasks.length > 0) {
              if (!window.confirm("This will replace your current steps. Continue?")) return;
              const supabase = createClient();
              await supabase.from("second_opinion_tasks").delete().eq("user_id", userId);
            }
            generateSteps();
          }}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              Generating...
            </>
          ) : tasks.length > 0 ? (
            "Regenerate Steps"
          ) : (
            "Generate Steps"
          )}
        </Button>
      </div>

      {tasks.length > 0 && (
        <>
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm text-muted-foreground">
                  {completed} of {tasks.length} steps completed
                </span>
              </div>
              <Progress value={progress} />
            </CardContent>
          </Card>

          <div className="space-y-3">
            {tasks.map((task) => {
              const Icon = STATUS_ICONS[task.status as keyof typeof STATUS_ICONS] ?? Circle;
              return (
                <Card key={task.id} className={task.status === "completed" ? "opacity-60" : ""}>
                  <CardContent className="py-4">
                    <div className="flex items-start gap-4">
                      <button onClick={() => cycleStatus(task)} className="mt-0.5 flex-shrink-0">
                        <Icon
                          className={`w-5 h-5 ${
                            task.status === "completed"
                              ? "text-green-500"
                              : task.status === "in_progress"
                              ? "text-yellow-500"
                              : "text-muted-foreground"
                          }`}
                        />
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">Step {task.step_number}</Badge>
                          <h3 className={`font-medium text-sm ${task.status === "completed" ? "line-through" : ""}`}>
                            {task.title}
                          </h3>
                        </div>
                        {task.description && (
                          <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {tasks.length === 0 && !loading && (
        <Card>
          <CardContent className="py-12 text-center">
            <Stethoscope className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Click &quot;Generate Steps&quot; to get a personalized second opinion checklist.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
