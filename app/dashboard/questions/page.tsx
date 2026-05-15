"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { HelpCircle, Copy, Printer, Loader2, Clock, Pencil } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import type { VisitQuestion, QuestionSection } from "@/types/database";
import { useUser } from "@/components/user-provider";
import { getCancerInfo } from "@/lib/cancer-types";

const DEFAULT_APPOINTMENT_TYPES = [
  "Oncologist",
  "Surgeon",
  "Radiation Oncologist",
  "Medical Oncologist",
  "Primary Care",
  "Other",
];

export default function QuestionsPage() {
  const { userId } = useUser();
  const [appointmentType, setAppointmentType] = useState("");
  const [context, setContext] = useState("");
  const [concerns, setConcerns] = useState("");
  const [generating, setGenerating] = useState(false);
  const [currentQuestions, setCurrentQuestions] = useState<QuestionSection[] | null>(null);
  const [history, setHistory] = useState<VisitQuestion[]>([]);
  const [copied, setCopied] = useState(false);
  const [appointmentTypes, setAppointmentTypes] = useState<string[]>(DEFAULT_APPOINTMENT_TYPES);
  const [checkedQuestions, setCheckedQuestions] = useState<Set<string>>(new Set());
  const [questionNotes, setQuestionNotes] = useState<Record<string, string>>({});
  const [showNoteFor, setShowNoteFor] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
    loadCancerSpecialists();
  }, []);

  async function loadCancerSpecialists() {
    const supabase = createClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("cancer_type, cancer_subtype")
      .eq("id", userId)
      .single();
    if (profile?.cancer_type) {
      const info = getCancerInfo(profile.cancer_type, profile.cancer_subtype);
      if (info) {
        // Use cancer-specific specialists, ensure Primary Care and Other are always included
        const types = info.specialistTypes.filter((t) => t !== "Primary Care" && t !== "Other");
        setAppointmentTypes([...types, "Primary Care", "Other"]);
      }
    }
  }

  async function loadHistory() {
    const supabase = createClient();
    const { data } = await supabase
      .from("visit_questions")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setHistory(data);
  }

  async function handleGenerate() {
    if (!appointmentType) return;
    setGenerating(true);
    setCurrentQuestions(null);
    try {
      const res = await fetch("/api/ai/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointment_type: appointmentType, context, concerns }),
      });
      const data = await res.json();
      if (data.questionSet) {
        setCurrentQuestions(data.questionSet.questions);
        loadHistory();
      }
    } finally {
      setGenerating(false);
    }
  }

  function formatQuestions(sections: QuestionSection[]) {
    return sections
      .map((s) => `${s.category}\n${s.questions.map((q, i) => `  ${i + 1}. ${q}`).join("\n")}`)
      .join("\n\n");
  }

  async function copyAll() {
    if (!currentQuestions) return;
    await navigator.clipboard.writeText(formatQuestions(currentQuestions));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function printQuestions() {
    window.print();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-primary" />
          Question Builder
        </h1>
        <p className="text-muted-foreground mt-1">
          Generate personalized questions for your next doctor visit.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Prepare for Your Visit</CardTitle>
          <CardDescription>
            Tell us about your appointment and we&apos;ll generate thoughtful questions to ask.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Appointment type</Label>
            <Select value={appointmentType} onValueChange={setAppointmentType}>
              <SelectTrigger>
                <SelectValue placeholder="Select appointment type" />
              </SelectTrigger>
              <SelectContent>
                {appointmentTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>What do you want to discuss? (optional)</Label>
            <Textarea
              placeholder="e.g., treatment plan options, switching medications, preparing for surgery..."
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Any specific concerns? (optional)</Label>
            <Textarea
              placeholder="e.g., worried about side effects, unsure about prognosis, managing work during treatment..."
              value={concerns}
              onChange={(e) => setConcerns(e.target.value)}
              rows={3}
            />
          </div>
          <Button onClick={handleGenerate} disabled={generating || !appointmentType}>
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating questions...
              </>
            ) : (
              "Generate Questions"
            )}
          </Button>
        </CardContent>
      </Card>

      {currentQuestions && (
        <Card className="print:shadow-none" id="questions-output">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Your Questions</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyAll}>
                  <Copy className="w-4 h-4 mr-1" />
                  {copied ? "Copied!" : "Copy All"}
                </Button>
                <Button variant="outline" size="sm" onClick={printQuestions}>
                  <Printer className="w-4 h-4 mr-1" />
                  Print
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentQuestions.map((section, idx) => (
              <div key={idx}>
                <h3 className="font-semibold text-base mb-3">{section.category}</h3>
                <ol className="space-y-2">
                  {section.questions.map((q, qIdx) => {
                    const qKey = `${idx}-${qIdx}`;
                    const isChecked = checkedQuestions.has(qKey);
                    return (
                      <li key={qIdx} className="text-sm text-muted-foreground leading-relaxed">
                        <div className="flex items-start gap-2">
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={(checked) => {
                              setCheckedQuestions((prev) => {
                                const next = new Set(prev);
                                if (checked) next.add(qKey);
                                else next.delete(qKey);
                                return next;
                              });
                            }}
                            className="mt-0.5"
                          />
                          <span className={isChecked ? "line-through" : ""}>{q}</span>
                          <button
                            onClick={() => setShowNoteFor(showNoteFor === qKey ? null : qKey)}
                            className="ml-auto flex-shrink-0 p-1 hover:bg-muted rounded transition-colors"
                          >
                            <Pencil className="w-3 h-3 text-muted-foreground" />
                          </button>
                        </div>
                        {showNoteFor === qKey && (
                          <Input
                            className="mt-1 ml-6 text-xs"
                            placeholder="Add a note..."
                            value={questionNotes[qKey] || ""}
                            onChange={(e) =>
                              setQuestionNotes((prev) => ({ ...prev, [qKey]: e.target.value }))
                            }
                          />
                        )}
                      </li>
                    );
                  })}
                </ol>
                {idx < currentQuestions.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {history.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Past Question Sets</h2>
          {history.map((item) => (
            <Card
              key={item.id}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setCurrentQuestions(item.questions)}
            >
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">{item.appointment_type}</Badge>
                    {item.context && (
                      <span className="text-sm text-muted-foreground truncate max-w-md">
                        {item.context}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
