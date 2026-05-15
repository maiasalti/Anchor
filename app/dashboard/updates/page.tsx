"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Share2, Copy, Trash2, Globe, Lock, Bold, Italic, List } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useUser } from "@/components/user-provider";
import type { CareUpdate } from "@/types/database";

export default function UpdatesPage() {
  const { userId } = useUser();
  const [updates, setUpdates] = useState<CareUpdate[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadUpdates();
  }, []);

  async function loadUpdates() {
    const supabase = createClient();
    const { data } = await supabase
      .from("care_updates")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setUpdates(data);
  }

  async function handleSave() {
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    const supabase = createClient();

    if (editingId) {
      await supabase.from("care_updates").update({
        title,
        content,
        is_public: isPublic,
        updated_at: new Date().toISOString(),
      }).eq("id", editingId);
    } else {
      await supabase.from("care_updates").insert({
        user_id: userId,
        title,
        content,
        is_public: isPublic,
      });
    }

    setTitle("");
    setContent("");
    setIsPublic(false);
    setEditingId(null);
    setSaving(false);
    loadUpdates();
  }

  function startEdit(update: CareUpdate) {
    setEditingId(update.id);
    setTitle(update.title);
    setContent(update.content);
    setIsPublic(update.is_public);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id: string) {
    const supabase = createClient();
    await supabase.from("care_updates").delete().eq("id", id);
    loadUpdates();
  }

  function applyFormatting(type: "bold" | "italic" | "list") {
    const textarea = document.getElementById("update-content") as HTMLTextAreaElement | null;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);
    let replacement = "";
    if (type === "bold") {
      replacement = `**${selected}**`;
    } else if (type === "italic") {
      replacement = `*${selected}*`;
    } else if (type === "list") {
      replacement = selected
        .split("\n")
        .map((line) => `- ${line}`)
        .join("\n");
    }
    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);
  }

  async function copyShareLink(update: CareUpdate) {
    const url = `${window.location.origin}/updates/${update.share_token}`;
    await navigator.clipboard.writeText(url);
    setCopied(update.id);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Share2 className="w-6 h-6 text-primary" />
          Care Updates
        </h1>
        <p className="text-muted-foreground mt-1">
          Write updates to share with family and friends via a shareable link.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{editingId ? "Edit Update" : "Write an Update"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label>Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Treatment Update — Week 3"
            />
          </div>
          <div className="space-y-1">
            <Label>Content</Label>
            <div className="flex gap-1 mb-1">
              <Button type="button" variant="outline" size="sm" onClick={() => applyFormatting("bold")}>
                <Bold className="w-4 h-4" />
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => applyFormatting("italic")}>
                <Italic className="w-4 h-4" />
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => applyFormatting("list")}>
                <List className="w-4 h-4" />
              </Button>
            </div>
            <Textarea
              id="update-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share how things are going..."
              rows={6}
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPublic(!isPublic)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                isPublic
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border text-muted-foreground"
              }`}
            >
              {isPublic ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              {isPublic ? "Shareable" : "Private"}
            </button>
            <span className="text-xs text-muted-foreground">
              {isPublic ? "Anyone with the link can read this update." : "Only you can see this update."}
            </span>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving || !title.trim() || !content.trim()}>
              {saving ? "Saving..." : editingId ? "Update" : "Post Update"}
            </Button>
            {editingId && (
              <Button variant="outline" onClick={() => { setEditingId(null); setTitle(""); setContent(""); setIsPublic(false); }}>
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {updates.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Your Updates</h2>
          {updates.map((update) => (
            <Card key={update.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{update.title}</h3>
                      <Badge variant={update.is_public ? "secondary" : "outline"} className="text-xs">
                        {update.is_public ? <><Globe className="w-3 h-3 mr-1" />Public</> : <><Lock className="w-3 h-3 mr-1" />Private</>}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground prose prose-sm max-w-none">
                      <ReactMarkdown>{update.content}</ReactMarkdown>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <p className="text-xs text-muted-foreground">
                        {new Date(update.created_at).toLocaleDateString()}
                      </p>
                      {update.is_public && (
                        <span className="text-xs text-muted-foreground">
                          {(update as CareUpdate & { view_count?: number }).view_count ?? 0} views
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 ml-4">
                    {update.is_public && (
                      <Button variant="ghost" size="sm" onClick={() => copyShareLink(update)}>
                        <Copy className="w-4 h-4" />
                        {copied === update.id && <span className="ml-1 text-xs">Copied!</span>}
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => startEdit(update)}>
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(update.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
