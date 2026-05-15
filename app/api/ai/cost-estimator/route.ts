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

  const { procedure_name } = await request.json();
  if (!procedure_name) {
    return NextResponse.json({ error: "Procedure name is required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const cancerContext = getCancerContext(profile?.cancer_type, profileContextOptions(profile ?? {}));

  const prompt = `You are a medical cost estimation assistant helping a cancer patient understand potential costs.

Procedure/treatment: ${procedure_name}
Patient insurance: ${profile?.insurance_type ?? "unknown"} ${profile?.insurance_provider ? `(${profile.insurance_provider})` : ""}
${cancerContext ? `\nCancer-specific context:\n${cancerContext}\n` : ""}
Include typical costs for this cancer type's common treatments.

Provide a JSON object with:
- procedure_name: string (formatted name)
- with_insurance_low: number (low estimate with insurance, in USD)
- with_insurance_high: number (high estimate with insurance)
- without_insurance_low: number (low estimate without insurance)
- without_insurance_high: number (high estimate without insurance)
- in_network_note: string (brief note about in-network vs out-of-network differences)
- negotiation_tips: string[] (3-4 practical tips for reducing costs)
- additional_costs: string[] (2-3 commonly overlooked additional costs)
- disclaimer: string (brief disclaimer about estimates)

Base estimates on typical US healthcare costs. Be realistic but note that costs vary widely by location and provider.

Return only the JSON object, no other text.`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1500,
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    return NextResponse.json({ error: "Unexpected response" }, { status: 500 });
  }

  let estimate;
  try {
    const text = content.text.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
    estimate = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
  }

  const { data: saved, error: saveError } = await supabase
    .from("cost_estimates")
    .insert({
      user_id: user.id,
      procedure_name,
      estimate,
    })
    .select()
    .single();

  if (saveError) {
    return NextResponse.json({ error: "Failed to save estimate" }, { status: 500 });
  }

  return NextResponse.json({ estimate, saved });
}
