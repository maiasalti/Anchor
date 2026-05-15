import { NextResponse } from "next/server";
import { getUserFromCookie } from "@/lib/supabase/session";
import { createClient } from "@/lib/supabase/server";
import { anthropic } from "@/lib/claude";
import { getCancerContext, profileContextOptions } from "@/lib/cancer-types";

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

  const prompt = `You are helping a cancer patient create an actionable administrative checklist based on their situation.

Patient profile:
- Cancer type: ${profile.cancer_type ?? "unknown"}
- Stage: ${profile.stage ?? "unknown"}
- Treatment status: ${profile.treatment_status ?? "unknown"}
- Employer size: ${profile.employer_size ?? "unknown"}
- Insurance type: ${profile.insurance_type ?? "unknown"}
${cancerContext ? `\nCancer-specific context:\n${cancerContext}\n` : ""}
Only suggest treatment-related items that match this patient's treatment modalities.

Generate a JSON array of 8-12 personalized action items. Each item should have:
- title: string (clear, actionable task name)
- description: string (1-2 sentences explaining what to do)
- category: "insurance" | "employment" | "financial" | "legal" | "medical"
- priority: "urgent" | "high" | "medium" | "low"
- why_it_matters: string (1-2 sentences explaining why this is important for the patient)
- estimated_minutes: number (rough estimate of time to complete)
- timeline_bucket: "this_week" | "this_month" | "ongoing"
- resource_url: string | null (a real, helpful URL if you know one, otherwise null)

Focus on practical administrative tasks like:
1. Insurance: appeals, pre-authorizations, coverage reviews
2. Employment: FMLA, disability, workplace accommodations
3. Financial: assistance programs, medical debt negotiation, tax deductions
4. Legal: advance directives, power of attorney, disability claims
5. Medical: second opinions, clinical trials, care coordination

Prioritize based on urgency and the patient's treatment status. Return only the JSON array, no other text.`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 3000,
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    return NextResponse.json({ error: "Unexpected response" }, { status: 500 });
  }

  let items: Record<string, unknown>[];
  try {
    const text = content.text.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
    items = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
  }

  const inserts = items.map((item) => ({
    user_id: user.id,
    title: item.title,
    description: item.description,
    category: item.category,
    priority: item.priority,
    why_it_matters: item.why_it_matters,
    estimated_minutes: item.estimated_minutes,
    timeline_bucket: item.timeline_bucket,
    resource_url: item.resource_url,
    status: "pending",
  }));

  const { data: inserted, error } = await supabase
    .from("action_items")
    .insert(inserts)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ items: inserted });
}
