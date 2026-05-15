import { NextResponse } from "next/server";
import { getUserFromCookie } from "@/lib/supabase/session";
import { createClient } from "@/lib/supabase/server";
import { anthropic } from "@/lib/claude";
import { getCancerContext, profileContextOptions } from "@/lib/cancer-types";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const TEXT_TYPES = ["text/plain", "text/csv", "text/html", "text/xml", "application/pdf"];

export async function POST(request: Request) {
  const user = await getUserFromCookie();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const cancerContext = getCancerContext(
    profile?.cancer_type,
    profileContextOptions(profile ?? {})
  );

  let reportText = "";
  let fileName = "Pasted text";
  let messageContent: Parameters<typeof anthropic.messages.create>[0]["messages"][0]["content"];

  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    fileName = file.name;
    const fileType = file.type;

    if (IMAGE_TYPES.includes(fileType)) {
      const arrayBuffer = await file.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      const mediaType = fileType as "image/jpeg" | "image/png" | "image/gif" | "image/webp";

      reportText = `[Image file: ${fileName}]`;

      const prompt = buildPrompt(cancerContext, "[See attached image of medical report]");

      messageContent = [
        {
          type: "image" as const,
          source: {
            type: "base64" as const,
            media_type: mediaType,
            data: base64,
          },
        },
        { type: "text" as const, text: prompt },
      ];
    } else if (
      fileType.startsWith("text/") ||
      fileType === "application/pdf" ||
      fileName.endsWith(".txt") ||
      fileName.endsWith(".csv") ||
      fileName.endsWith(".html") ||
      fileName.endsWith(".xml")
    ) {
      const text = await file.text();
      if (!text.trim()) {
        return NextResponse.json({ error: "File is empty" }, { status: 400 });
      }
      reportText = text;
      messageContent = buildPrompt(cancerContext, text);
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload an image (JPEG, PNG, GIF, WEBP) or a text file." },
        { status: 400 }
      );
    }
  } else {
    const body = await request.json();
    const { reportText: text } = body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json({ error: "Report text is required" }, { status: 400 });
    }

    reportText = text;
    messageContent = buildPrompt(cancerContext, text);
  }

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4000,
    messages: [{ role: "user", content: messageContent }],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    return NextResponse.json({ error: "Unexpected response" }, { status: 500 });
  }

  const translation = content.text;

  // Save to report_translations table
  await supabase.from("report_translations").insert({
    user_id: user.id,
    file_name: fileName,
    report_text: reportText.slice(0, 500),
    translation,
  });

  return NextResponse.json({ translation });
}

export async function GET() {
  const user = await getUserFromCookie();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("report_translations")
    .select("id, file_name, translation, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to load history" }, { status: 500 });
  }

  return NextResponse.json({ translations: data });
}

export async function DELETE(request: Request) {
  const user = await getUserFromCookie();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await request.json();
  if (!id) {
    return NextResponse.json({ error: "Translation ID is required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("report_translations")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

function buildPrompt(cancerContext: string | null, reportContent: string): string {
  return `You are a compassionate medical translator helping a cancer patient understand their medical report. Your tone should be warm, empathetic, and reassuring — while always being honest and thorough.

IMPORTANT RULES:
- Acknowledge that reading medical reports can be stressful and scary
- Explain EVERY medical term in parentheses on first use — e.g. "lymph nodes (small bean-shaped organs that help fight infection)"
- NEVER omit any findings, results, or data from the report
- If something looks concerning, acknowledge it gently but don't catastrophize
- If something looks normal or positive, celebrate it warmly
- Use the patient's cancer context below to explain how findings relate to THEIR specific situation

Structure your response with these exact section headers:

## What This Report Is
A brief 2-3 sentence explanation of what type of report this is and why it was ordered.

## Key Findings
Go through each significant finding in the report. Explain what was measured, what the result was, and what it means in plain language. Use bullet points.

## What This Means For You
A warm, honest summary connecting the findings to the patient's situation. What's encouraging? What might need attention? Keep it balanced and human.

## Questions To Ask Your Doctor
3-5 specific questions the patient could bring to their next appointment based on these results.

${cancerContext ? `\nPatient's cancer-specific context:\n${cancerContext}\n` : ""}

Here is the medical report to translate:

---
${reportContent}
---

Remember: Be thorough, be kind, and never leave a medical term unexplained.`;
}
