"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, Loader2, Copy, Check, Printer, Trash2, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import ReactMarkdown from "react-markdown";

interface TranslationRecord {
  id: string;
  file_name: string;
  translation: string;
  created_at: string;
}

export default function ReportTranslatorPage() {
  const [reportText, setReportText] = useState("");
  const [translation, setTranslation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [questionsCopied, setQuestionsCopied] = useState(false);
  const [fileName, setFileName] = useState("");
  const [textOpen, setTextOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [history, setHistory] = useState<TranslationRecord[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/ai/report-translator");
      if (res.ok) {
        const data = await res.json();
        setHistory(data.translations || []);
      }
    } catch {
      // Silently fail on history load
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  async function handleFileUpload(file: File) {
    setLoading(true);
    setError("");
    setTranslation("");
    setFileName(file.name);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/ai/report-translator", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to translate report");
      }

      const data = await res.json();
      setTranslation(data.translation);
      loadHistory();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleTextTranslate() {
    if (!reportText.trim()) return;
    setLoading(true);
    setError("");
    setTranslation("");
    setFileName("Pasted text");

    try {
      const res = await fetch("/api/ai/report-translator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportText }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to translate report");
      }

      const data = await res.json();
      setTranslation(data.translation);
      loadHistory();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch("/api/ai/report-translator", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        setHistory((prev) => prev.filter((t) => t.id !== id));
      }
    } catch {
      // Silently fail
    }
  }

  async function handleCopy(text: string, setter: (v: boolean) => void) {
    await navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  }

  function handlePrint() {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>Report Translation</title>
      <style>body { font-family: system-ui, sans-serif; max-width: 700px; margin: 40px auto; line-height: 1.6; }</style>
      </head><body>${document.getElementById("translation-content")?.innerHTML || ""}</body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
    e.target.value = "";
  }

  function extractQuestionsSection(text: string): string | null {
    const pattern = /## Questions To Ask Your Doctor\s*\n([\s\S]*?)(?=\n## |\n---|\Z|$)/i;
    const match = text.match(pattern);
    if (match) {
      return match[1].trim();
    }
    return null;
  }

  function getTranslationWithoutQuestions(text: string): string {
    return text.replace(/## Questions To Ask Your Doctor\s*\n[\s\S]*?(?=\n## |\n---|\Z|$)/i, "").trim();
  }

  const questionsSection = translation ? extractQuestionsSection(translation) : null;
  const mainTranslation = translation ? getTranslationWithoutQuestions(translation) : "";

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="w-6 h-6 text-primary" />
          Report Translator
        </h1>
        <p className="text-muted-foreground mt-1">
          Upload or paste your medical report, lab results, or pathology report and get a clear,
          plain-language explanation.
        </p>
      </div>

      {/* File Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Your Report</CardTitle>
          <CardDescription>
            Upload an image or text file of your medical report. We'll explain everything in
            plain language, tailored to your diagnosis.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragOver
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
            }`}
          >
            <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm font-medium">
              {loading ? "Processing..." : "Drag and drop your file here, or click to browse"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Supports images (JPEG, PNG, GIF, WEBP) and text files
            </p>
            {fileName && !loading && (
              <p className="text-xs text-primary mt-2 font-medium">Last uploaded: {fileName}</p>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp,.txt,.csv,.html,.xml"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {loading && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Translating your report...
            </div>
          )}

          {/* Text Paste Fallback */}
          <Collapsible open={textOpen} onOpenChange={setTextOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground w-full">
                <ChevronDown className={`w-4 h-4 transition-transform ${textOpen ? "rotate-180" : ""}`} />
                Or paste text directly
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-2">
              <Textarea
                placeholder="Paste your medical report, lab results, or pathology report here..."
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                rows={8}
                className="font-mono text-sm"
              />
              <Button
                onClick={handleTextTranslate}
                disabled={loading || !reportText.trim()}
                className="w-full sm:w-auto"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Translating...
                  </>
                ) : (
                  "Translate Report"
                )}
              </Button>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Translation Result */}
      {translation && (
        <>
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle>Your Report Explained</CardTitle>
                <CardDescription>
                  This is an AI-generated explanation -- always discuss results with your doctor.
                </CardDescription>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="ghost" size="sm" onClick={() => handleCopy(translation, setCopied)} className="gap-2">
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </Button>
                <Button variant="ghost" size="sm" onClick={handlePrint} className="gap-2">
                  <Printer className="w-4 h-4" />
                  Print
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div id="translation-content" className="prose prose-sm prose-gray max-w-none">
                <ReactMarkdown>{mainTranslation}</ReactMarkdown>
              </div>
            </CardContent>
          </Card>

          {/* Questions To Ask Your Doctor - Highlighted Card */}
          {questionsSection && (
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-primary">Questions To Ask Your Doctor</CardTitle>
                  <CardDescription>
                    Bring these questions to your next appointment.
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(questionsSection, setQuestionsCopied)}
                  className="gap-2 shrink-0"
                >
                  {questionsCopied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm prose-gray max-w-none">
                  <ReactMarkdown>{questionsSection}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Translation History */}
      {history.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Past Translations</h2>
          <div className="space-y-2">
            {history.map((record) => {
              const firstLine = record.translation.split("\n").find((l) => l.trim())?.replace(/^#+\s*/, "") || "";
              const date = new Date(record.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });

              return (
                <Card
                  key={record.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => {
                    setTranslation(record.translation);
                    setFileName(record.file_name);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  <CardContent className="flex items-center justify-between py-3 px-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="text-sm font-medium truncate">{record.file_name}</span>
                        <span className="text-xs text-muted-foreground shrink-0">{date}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 truncate pl-6">
                        {firstLine}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(record.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
