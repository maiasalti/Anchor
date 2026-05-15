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

  const { appointment_type, context, concerns } = await request.json();

  if (!appointment_type) {
    return NextResponse.json({ error: "Appointment type is required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const cancerContext = getCancerContext(profile?.cancer_type, profileContextOptions(profile ?? {}));

  const prompt = `You are helping a cancer patient prepare questions for a doctor visit.

Patient profile:
- Cancer type: ${profile?.cancer_type ?? "unknown"}
- Stage: ${profile?.stage ?? "unknown"}
- Treatment status: ${profile?.treatment_status ?? "unknown"}
${cancerContext ? `\nCancer-specific context:\n${cancerContext}\n` : ""}
Generate questions specific to this cancer type's treatment options and side effects.

Appointment type: ${appointment_type}
${context ? `What they want to discuss: ${context}` : ""}
${concerns ? `Their concerns: ${concerns}` : ""}

Generate a structured JSON array of question sections. Each section has a category name and an array of 3-5 specific, thoughtful questions. Include these categories:
- Treatment Options
- Side Effects & Management
- Prognosis & Outcomes
- Practical Concerns (scheduling, work, daily life)
- Follow-up & Monitoring

Tailor questions to the appointment type and patient's situation. Questions should be specific enough to get useful answers, not generic.

Return JSON in this format:
[
  { "category": "Treatment Options", "questions": ["question 1", "question 2", ...] },
  ...
]

Return only the JSON array, no other text.`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    return NextResponse.json({ error: "Unexpected response" }, { status: 500 });
  }

  let questions;
  try {
    const text = content.text.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
    questions = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
  }

  const { data: saved, error } = await supabase
    .from("visit_questions")
    .insert({
      user_id: user.id,
      appointment_type,
      context: context || null,
      concerns: concerns || null,
      questions,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ questionSet: saved });
}
