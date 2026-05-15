import { NextResponse } from "next/server";
import { getUserFromCookie } from "@/lib/supabase/session";
import { createClient } from "@/lib/supabase/server";
import { anthropic } from "@/lib/claude";
import { getCancerContext, getCancerInfo, profileContextOptions } from "@/lib/cancer-types";

export async function POST() {
  try {
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

  const cancerContext = getCancerContext(profile?.cancer_type, profileContextOptions(profile ?? {}));
  const cancerInfo = getCancerInfo(profile?.cancer_type, profile?.cancer_subtype);

  const prompt = `You are helping a cancer patient find support groups.

Patient:
- Cancer type: ${profile?.cancer_type ?? "unknown"}
- Stage: ${profile?.stage ?? "unknown"}
- Treatment status: ${profile?.treatment_status ?? "unknown"}
${cancerContext ? `\nCancer-specific context:\n${cancerContext}\n` : ""}
Prioritize organizations specific to this cancer type.${cancerInfo ? ` Include these if relevant: ${cancerInfo.supportOrganizations.join(", ")}.` : ""}

Suggest 6-8 support groups. Include a mix of online and in-person options. Each should have:
- name: string (realistic group name)
- type: "online" | "in_person" | "both"
- description: string (1-2 sentences about the group)
- url: string (real URL if possible, otherwise a relevant search URL)
- location: string | null (for in-person or both)

Include well-known organizations like Cancer Support Community, American Cancer Society, and cancer-type-specific groups.

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

  let groups: Record<string, unknown>[];
  try {
    const text = content.text.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
    groups = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
  }

  const inserts = groups.map((g) => ({
    user_id: user.id,
    name: g.name,
    type: g.type,
    description: g.description,
    url: g.url,
    location: g.location || null,
    status: "saved",
  }));

  const { data: inserted, error } = await supabase
    .from("support_groups")
    .insert(inserts)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ groups: inserted });
  } catch (err) {
    console.error("Support groups API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
