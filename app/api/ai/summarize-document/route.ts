import { NextResponse } from "next/server";
import { getUserFromCookie } from "@/lib/supabase/session";
import { createClient } from "@/lib/supabase/server";
import { anthropic } from "@/lib/claude";
import { getCancerContext, profileContextOptions } from "@/lib/cancer-types";

export async function POST(request: Request) {
  const user = await getUserFromCookie();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { record_id, document_text } = await request.json();
  if (!record_id || !document_text) {
    return NextResponse.json({ error: "record_id and document_text are required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const cancerContext = getCancerContext(profile?.cancer_type, profileContextOptions(profile ?? {}));

  const prompt = `You are helping a cancer patient understand their medical documents.
${cancerContext ? `\nCancer-specific context:\n${cancerContext}\n` : ""}
Explain findings in context of this patient's cancer type.

Summarize the following medical document in plain English that a non-medical person can understand. Include:
1. What type of document this is
2. Key findings or information
3. Any action items or follow-ups mentioned
4. Important numbers or dates

Keep it concise (3-5 paragraphs). Use simple language and explain any medical terms.

Document text:
${document_text.slice(0, 8000)}`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1500,
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    return NextResponse.json({ error: "Unexpected response" }, { status: 500 });
  }

  await supabase
    .from("medical_records")
    .update({ ai_summary: content.text })
    .eq("id", record_id)
    .eq("user_id", user.id);

  return NextResponse.json({ summary: content.text });
}
