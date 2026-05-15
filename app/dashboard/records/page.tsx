"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FolderOpen, Upload, Download, Trash2, Loader2, Sparkles } from "lucide-react";
import { useUser } from "@/components/user-provider";
import type { MedicalRecord } from "@/types/database";

const CATEGORIES = [
  { value: "pathology", label: "Pathology" },
  { value: "imaging", label: "Imaging" },
  { value: "lab", label: "Lab Results" },
  { value: "insurance", label: "Insurance" },
  { value: "other", label: "Other" },
];

export default function RecordsPage() {
  const { userId } = useUser();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [category, setCategory] = useState("other");
  const [uploading, setUploading] = useState(false);
  const [summarizing, setSummarizing] = useState<string | null>(null);
  const [pasteDialog, setPasteDialog] = useState<string | null>(null);
  const [pasteText, setPasteText] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadRecords();
  }, []);

  async function loadRecords() {
    const supabase = createClient();
    const { data } = await supabase
      .from("medical_records")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setRecords(data);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const supabase = createClient();
    const fileId = crypto.randomUUID();
    const filePath = `${userId}/${fileId}_${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("medical-records")
      .upload(filePath, file);

    if (uploadError) {
      setUploading(false);
      return;
    }

    await supabase.from("medical_records").insert({
      user_id: userId,
      file_name: file.name,
      file_path: filePath,
      file_size: file.size,
      mime_type: file.type,
      category,
    });

    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
    loadRecords();
  }

  async function handleDownload(record: MedicalRecord) {
    const supabase = createClient();
    const { data } = await supabase.storage
      .from("medical-records")
      .createSignedUrl(record.file_path, 60);
    if (data?.signedUrl) {
      window.open(data.signedUrl, "_blank");
    }
  }

  async function handleDelete(record: MedicalRecord) {
    const supabase = createClient();
    await supabase.storage.from("medical-records").remove([record.file_path]);
    await supabase.from("medical_records").delete().eq("id", record.id);
    loadRecords();
  }

  async function handleSummarize(record: MedicalRecord, text?: string) {
    if (!text) {
      // For text files, try to fetch content
      if (record.mime_type?.startsWith("text/")) {
        const supabase = createClient();
        const { data } = await supabase.storage
          .from("medical-records")
          .createSignedUrl(record.file_path, 60);
        if (data?.signedUrl) {
          const res = await fetch(data.signedUrl);
          text = await res.text();
        }
      }
      if (!text) {
        setPasteDialog(record.id);
        return;
      }
    }

    setSummarizing(record.id);
    try {
      const res = await fetch("/api/ai/summarize-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ record_id: record.id, document_text: text }),
      });
      const data = await res.json();
      if (data.summary) loadRecords();
    } finally {
      setSummarizing(null);
      setPasteDialog(null);
      setPasteText("");
    }
  }

  const grouped = CATEGORIES.map((cat) => ({
    ...cat,
    records: records.filter((r) => r.category === cat.value),
  })).filter((g) => g.records.length > 0);

  function formatSize(bytes: number | null) {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FolderOpen className="w-6 h-6 text-primary" />
          Medical Records
        </h1>
        <p className="text-muted-foreground mt-1">Upload, organize, and summarize your medical documents.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upload a Record</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4">
            <div className="space-y-1 flex-1">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <input
                ref={fileRef}
                type="file"
                onChange={handleUpload}
                className="hidden"
                id="file-upload"
              />
              <Button
                variant="outline"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="w-full"
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-1" />
                )}
                {uploading ? "Uploading..." : "Choose File"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {records.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No records uploaded yet. Upload your first document above.</p>
          </CardContent>
        </Card>
      ) : (
        grouped.map((group) => (
          <div key={group.value} className="space-y-3">
            <h2 className="text-lg font-semibold">{group.label}</h2>
            {group.records.map((record) => (
              <Card key={record.id}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-sm">{record.file_name}</h3>
                        <Badge variant="secondary" className="text-xs">{record.category}</Badge>
                        {record.file_size && (
                          <span className="text-xs text-muted-foreground">{formatSize(record.file_size)}</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Uploaded {new Date(record.created_at).toLocaleDateString()}
                      </p>
                      {record.ai_summary && (
                        <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                          <p className="text-xs font-medium text-primary mb-1 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> AI Summary
                          </p>
                          <p className="text-sm text-muted-foreground whitespace-pre-line">{record.ai_summary}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSummarize(record)}
                        disabled={summarizing === record.id}
                      >
                        {summarizing === record.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4" />
                        )}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDownload(record)}>
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(record)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ))
      )}

      {/* Paste text dialog for non-text files */}
      <Dialog open={!!pasteDialog} onOpenChange={() => { setPasteDialog(null); setPasteText(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Paste Document Text</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              This file type can&apos;t be read directly. Paste the text content below to generate a summary.
            </p>
            <Textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="Paste document text here..."
              rows={8}
            />
            <Button
              onClick={() => {
                const record = records.find((r) => r.id === pasteDialog);
                if (record && pasteText.trim()) handleSummarize(record, pasteText);
              }}
              disabled={!pasteText.trim() || summarizing !== null}
              className="w-full"
            >
              {summarizing ? "Summarizing..." : "Summarize"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
