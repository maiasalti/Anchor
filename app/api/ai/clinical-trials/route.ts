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

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  let location: string | undefined;
  try {
    const body = await request.json();
    location = body.location;
  } catch {
    // no body or invalid JSON — location remains undefined
  }

  const cancerContext = getCancerContext(profile.cancer_type, profileContextOptions(profile));

  const prompt = `You are helping a cancer patient find potentially relevant clinical trials.

Patient profile:
- Cancer type: ${profile.cancer_type ?? "unknown"}
- Stage: ${profile.stage ?? "unknown"}
- Treatment status: ${profile.treatment_status ?? "unknown"}
${location ? `- Preferred location: ${location}\n` : ""}${cancerContext ? `\nCancer-specific context:\n${cancerContext}\n` : ""}
Only suggest trials relevant to this cancer type, stage, and treatment modalities.${location ? ` Prioritize trials near or in ${location}.` : ""}

Suggest 5-8 clinical trials that might be relevant. For each trial, provide:
- trial_name: string (realistic trial name)
- phase: string (Phase I, Phase II, Phase III, Phase IV)
- location: string (city/region)
- eligibility: string (brief eligibility criteria)
- url: string (provide a clinicaltrials.gov search URL relevant to this cancer type)
- description: string (1-2 sentences about what the trial studies)

Generate realistic, relevant suggestions based on current oncology research areas for this cancer type. Include a mix of phases and trial types (immunotherapy, targeted therapy, combination therapy, supportive care).

Return only the JSON array, no other text.`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2500,
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    return NextResponse.json({ error: "Unexpected response" }, { status: 500 });
  }

  let trials: Record<string, unknown>[];
  try {
    const text = content.text.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
    trials = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
  }

  const inserts = trials.map((t) => ({
    user_id: user.id,
    trial_name: t.trial_name,
    phase: t.phase,
    location: t.location,
    eligibility: t.eligibility,
    url: t.url,
    description: t.description,
    status: "saved",
  }));

  const { data: inserted, error } = await supabase
    .from("clinical_trials")
    .insert(inserts)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ trials: inserted });
}
