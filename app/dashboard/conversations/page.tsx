"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Loader2, Clock, Briefcase, Baby, Users, Heart, UserCheck, Building, MessagesSquare, Mail, Copy, Check } from "lucide-react";
import type { ConversationScript } from "@/types/database";

const RELATIONSHIPS = [
  { value: "boss", label: "Boss", icon: Briefcase },
  { value: "children", label: "Children", icon: Baby },
  { value: "parents", label: "Parents", icon: Users },
  { value: "partner", label: "Partner", icon: Heart },
  { value: "friends", label: "Friends", icon: UserCheck },
  { value: "coworkers", label: "Coworkers", icon: Building },
];

const FORMATS = [
  { value: "in_person", label: "In-person conversation", icon: MessagesSquare, description: "Get a guide for having this conversation face to face" },
  { value: "message", label: "Message / Email", icon: Mail, description: "Get draft messages you can copy, edit, and send" },
];

export default function ConversationsPage() {
  const [relationship, setRelationship] = useState("");
  const [format, setFormat] = useState("in_person");
  const [context, setContext] = useState("");
  const [generating, setGenerating] = useState(false);
  const [currentScript, setCurrentScript] = useState<string | null>(null);
  const [currentFormat, setCurrentFormat] = useState("in_person");
  const [history, setHistory] = useState<ConversationScript[]>([]);
  const [copiedDraft, setCopiedDraft] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    const supabase = createClient();
    const { data } = await supabase
      .from("conversation_scripts")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setHistory(data);
  }

  async function handleGenerate() {
    if (!relationship) return;
    setGenerating(true);
    setCurrentScript(null);
    try {
      const res = await fetch("/api/ai/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ relationship, context, format }),
      });
      if (!res.ok) {
        console.error("Conversation error:", await res.json().catch(() => ({})));
        return;
      }
      const data = await res.json();
      if (data.script) {
        setCurrentScript(data.script.script);
        setCurrentFormat(data.script.format || format);
        loadHistory();
      }
    } finally {
      setGenerating(false);
    }
  }

  function renderScript(text: string) {
    return text.split("\n").map((line, i) => {
      const trimmed = line.trim();

      // Empty line = spacing
      if (trimmed === "") return <div key={i} className="h-3" />;

      // Skip raw markdown artifacts
      if (trimmed === "---" || trimmed === "***" || trimmed === "___") {
        return <div key={i} className="h-3" />;
      }

      // Strip markdown headers and render as styled headings
      if (trimmed.startsWith("### ")) {
        return <h3 key={i} className="text-sm font-semibold text-foreground mt-4 mb-1">{trimmed.replace(/^###\s+/, "")}</h3>;
      }
      if (trimmed.startsWith("## ")) {
        return <h2 key={i} className="text-base font-semibold text-foreground mt-5 mb-1">{trimmed.replace(/^##\s+/, "")}</h2>;
      }
      if (trimmed.startsWith("# ")) {
        return <h2 key={i} className="text-lg font-bold text-foreground mt-5 mb-2">{trimmed.replace(/^#\s+/, "")}</h2>;
      }

      // Draft labels (for message format)
      if (/^Draft \d/i.test(trimmed)) {
        const draftLabel = trimmed;
        async function copyDraft() {
          // Split the full script by draft headings and copy the relevant section
          const draftSections = text.split(/^(Draft \d.*)/im);
          let draftContent = "";
          for (let s = 0; s < draftSections.length; s++) {
            if (draftSections[s].trim() === draftLabel.trim()) {
              draftContent = (draftSections[s + 1] || "").trim();
              break;
            }
          }
          await navigator.clipboard.writeText(draftContent);
          setCopiedDraft(draftLabel);
          setTimeout(() => setCopiedDraft(null), 2000);
        }
        return (
          <div key={i} className="flex items-center gap-2 mt-6 mb-2">
            <h2 className="text-base font-semibold text-primary">{trimmed}</h2>
            <button onClick={copyDraft} className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded border border-border hover:bg-muted transition-colors">
              {copiedDraft === draftLabel ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
              {copiedDraft === draftLabel ? "Copied!" : "Copy"}
            </button>
          </div>
        );
      }

      // Bullet points
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        return <p key={i} className="ml-4 mb-1">• {renderInlineFormatting(trimmed.slice(2))}</p>;
      }

      // Regular paragraph
      return <p key={i} className="mb-2">{renderInlineFormatting(trimmed)}</p>;
    });
  }

  function renderInlineFormatting(text: string) {
    // Handle **bold** and "quoted speech"
    const parts = text.split(/(\*\*[^*]+\*\*|"[^"]*")/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="text-foreground font-medium">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('"') && part.endsWith('"') && part.length > 10) {
        return <span key={i} className="italic text-primary/80">{part}</span>;
      }
      return part;
    });
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-primary" />
          Conversation Scripts
        </h1>
        <p className="text-muted-foreground mt-1">
          Get help telling people about your diagnosis — in person or by message.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Who do you need to tell?</CardTitle>
          <CardDescription>
            Select a relationship, choose how you want to communicate, and we&apos;ll create something personalized for you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label>Relationship</Label>
            <div className="grid grid-cols-3 gap-2">
              {RELATIONSHIPS.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setRelationship(r.value)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm transition-colors ${
                    relationship === r.value
                      ? "border-primary bg-primary/5 text-primary font-medium"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  <r.icon className="w-4 h-4" />
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>How do you want to tell them?</Label>
            <div className="grid grid-cols-2 gap-3">
              {FORMATS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFormat(f.value)}
                  className={`flex items-start gap-3 px-4 py-3 rounded-lg border text-left transition-colors ${
                    format === f.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  <f.icon className={`w-5 h-5 mt-0.5 shrink-0 ${format === f.value ? "text-primary" : "text-muted-foreground"}`} />
                  <div>
                    <p className={`text-sm font-medium ${format === f.value ? "text-primary" : ""}`}>{f.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{f.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Additional context (optional)</Label>
            <Textarea
              placeholder="e.g., We have young kids, My boss is very private, My parents are elderly and worry a lot..."
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={3}
            />
          </div>
          <Button onClick={handleGenerate} disabled={generating || !relationship}>
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {format === "message" ? "Writing drafts..." : "Writing guide..."}
              </>
            ) : format === "message" ? (
              "Write Draft Messages"
            ) : (
              "Generate Conversation Guide"
            )}
          </Button>
        </CardContent>
      </Card>

      {currentScript && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>
                {currentFormat === "message" ? "Your Draft Messages" : "Your Conversation Guide"}
              </CardTitle>
              <Badge variant="secondary" className="capitalize">
                {currentFormat === "message" ? "Message / Email" : "In Person"}
              </Badge>
            </div>
            <CardDescription>
              {currentFormat === "message"
                ? "Pick the draft that feels most like you, edit it, and send when you're ready."
                : "Read through this at your own pace. There's no rush."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground leading-relaxed">
              {renderScript(currentScript)}
            </div>
          </CardContent>
        </Card>
      )}

      {history.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Saved Scripts</h2>
          {history.map((item) => (
            <Card
              key={item.id}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => {
                setCurrentScript(item.script);
                setCurrentFormat(item.format || "in_person");
              }}
            >
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="capitalize">{item.relationship}</Badge>
                    <Badge variant="outline" className="text-xs">
                      {(item as ConversationScript & { format?: string }).format === "message" ? "Message" : "In Person"}
                    </Badge>
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
