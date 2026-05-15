import { NextResponse } from "next/server";
import { getUserFromCookie } from "@/lib/supabase/session";
import { createClient } from "@/lib/supabase/server";
import { anthropic } from "@/lib/claude";
import { getCancerContext, getCancerInfo, profileContextOptions } from "@/lib/cancer-types";

export async function POST() {
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

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const cancerContext = getCancerContext(profile.cancer_type, profileContextOptions(profile));
  const cancerInfo = getCancerInfo(profile.cancer_type, profile.cancer_subtype);

  const prompt = `You are helping a cancer patient coordinate getting a second opinion.

Patient profile:
- Cancer type: ${profile.cancer_type ?? "unknown"}
- Stage: ${profile.stage ?? "unknown"}
- Treatment status: ${profile.treatment_status ?? "unknown"}
- Insurance type: ${profile.insurance_type ?? "unknown"}
${cancerContext ? `\nCancer-specific context:\n${cancerContext}\n` : ""}
Recommend cancer centers known for this cancer type.${cancerInfo ? ` Consider these organizations: ${cancerInfo.supportOrganizations.join(", ")}.` : ""}

Generate a personalized ordered checklist of 8-12 steps for getting a second opinion. Each step should have:
- step_number: number (sequential, starting at 1)
- title: string (clear, actionable step name)
- description: string (1-3 sentences explaining what to do and why)

Include steps for:
1. Gathering medical records and pathology reports
2. Researching specialists/cancer centers
3. Insurance pre-authorization
4. Scheduling the appointment
5. Preparing questions
6. What to bring to the appointment
7. After the appointment (comparing opinions)
8. Making your decision

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

  let steps: Record<string, unknown>[];
  try {
    const text = content.text.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
    steps = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
  }

  const inserts = steps.map((s) => ({
    user_id: user.id,
    step_number: s.step_number,
    title: s.title,
    description: s.description,
    status: "pending",
  }));

  const { data: inserted, error } = await supabase
    .from("second_opinion_tasks")
    .insert(inserts)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ tasks: inserted });
}
