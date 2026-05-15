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

  let dietary_restrictions: string[] = [];
  let other_restrictions = "";
  try {
    const body = await request.json();
    dietary_restrictions = body.dietary_restrictions ?? [];
    other_restrictions = body.other_restrictions ?? "";
  } catch {
    // body is optional; defaults are fine
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const cancerContext = getCancerContext(profile?.cancer_type, profileContextOptions(profile ?? {}));

  const dietaryInfo =
    dietary_restrictions.length > 0 || other_restrictions
      ? `\nDietary restrictions: ${dietary_restrictions.length > 0 ? dietary_restrictions.join(", ") : "None specified"}.${other_restrictions ? ` Other: ${other_restrictions}` : ""}\n`
      : "";

  const prompt = `You are a nutrition advisor helping a cancer patient during treatment.

Patient info:
- Cancer type: ${profile?.cancer_type ?? "unknown"}
- Treatment status: ${profile?.treatment_status ?? "unknown"}
${cancerContext ? `\nCancer-specific context:\n${cancerContext}\n` : ""}${dietaryInfo}
Tailor nutrition advice to the specific side effects of this cancer's treatments.

Generate a JSON object with these sections:
- foods_to_eat: { title: string, items: { name: string, benefit: string }[] } (8-10 foods)
- foods_to_avoid: { title: string, items: { name: string, reason: string }[] } (5-7 foods)
- hydration_tips: { title: string, tips: string[] } (4-5 tips)
- supplements_to_discuss: { title: string, items: { name: string, note: string }[] } (3-5 supplements to discuss with doctor)
- sample_meals: { title: string, meals: { meal: string, description: string }[] } (breakfast, lunch, dinner, 2 snacks)

Tailor advice to their cancer type and treatment status. If in treatment, focus on managing common side effects like nausea, appetite loss, and taste changes. Include a disclaimer field: string (brief note to consult with their healthcare team).

Return only the JSON object, no other text.`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2500,
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    return NextResponse.json({ error: "Unexpected response" }, { status: 500 });
  }

  let plan;
  try {
    const text = content.text.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
    plan = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
  }

  const { data: saved, error: saveError } = await supabase
    .from("meal_plans")
    .insert({
      user_id: user.id,
      plan,
      dietary_restrictions,
    })
    .select("id")
    .single();

  if (saveError) {
    return NextResponse.json({ error: "Failed to save meal plan" }, { status: 500 });
  }

  return NextResponse.json({ plan, id: saved.id });
}

export async function GET() {
  const user = await getUserFromCookie();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();
  const { data: plans, error } = await supabase
    .from("meal_plans")
    .select("id, created_at, plan, dietary_restrictions")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to load plans" }, { status: 500 });
  }

  return NextResponse.json({ plans });
}

export async function DELETE(request: Request) {
  const user = await getUserFromCookie();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await request.json();
  if (!id) {
    return NextResponse.json({ error: "Missing plan id" }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("meal_plans")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: "Failed to delete plan" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
