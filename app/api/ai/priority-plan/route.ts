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

  const concerns = (profile.practical_concerns ?? []) as string[];

  const prompt = `You are helping a cancer patient identify their most urgent priorities for THIS WEEK.

Patient profile:
- Cancer type: ${profile.cancer_type ?? "unknown"}
- Primary tumor site: ${profile.primary_tumor_site ?? "unknown"}
- Tumor size: ${profile.tumor_size_cm ?? "unknown"}
- Surgery status: ${profile.had_surgery ?? "unknown"}
- Treatment phase: ${profile.treatment_status ?? "unknown"}
- Employer size: ${profile.employer_size ?? "unknown"}
- Insurance type: ${profile.insurance_type ?? "unknown"}
${concerns.length > 0 ? `- Patient-flagged concerns: ${concerns.join(", ")}\n` : ""}${profile.onboarding_notes ? `- Patient's own notes: "${profile.onboarding_notes}"\n` : ""}${cancerContext ? `\nCancer-specific context:\n${cancerContext}\n` : ""}
Weight items by the patient's flagged concerns first. Prioritize based on the specific urgency of this cancer type and the patient's current treatment phase.

Generate a JSON array of 5-7 high-priority action items they should focus on this week. Each item should have:
- title: string (clear, actionable task)
- description: string (1-2 sentences explaining what to do)
- category: "insurance" | "employment" | "financial" | "legal" | "medical"
- priority: "urgent" | "high"
- why_it_matters: string (1 sentence on why this is urgent)
- estimated_minutes: number
- timeline_bucket: "this_week"
- resource_url: string | null

Focus on the most time-sensitive items: insurance deadlines, notifying employer, gathering medical records, understanding treatment timeline.

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
