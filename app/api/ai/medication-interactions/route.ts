import { NextResponse } from "next/server";
import { getUserFromCookie } from "@/lib/supabase/session";
import { createClient } from "@/lib/supabase/server";
import { anthropic } from "@/lib/claude";

export async function POST() {
  const user = await getUserFromCookie();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();
  const { data: medications } = await supabase
    .from("medications")
    .select("name, dosage")
    .eq("user_id", user.id)
    .eq("is_active", true);

  if (!medications || medications.length < 2) {
    return NextResponse.json({ interactions: [] });
  }

  const medList = medications.map(m => `${m.name}${m.dosage ? ` (${m.dosage})` : ""}`).join(", ");

  const prompt = `You are a pharmaceutical information assistant. The patient is taking these medications: ${medList}

Check for potential drug interactions. Return a JSON array of interactions found. Each interaction should have:
- medications: string[] (the 2 medications that interact)
- severity: "mild" | "moderate" | "serious"
- description: string (1-2 sentences about the interaction)
- recommendation: string (what to discuss with their doctor)

If no significant interactions are found, return an empty array.
Return only the JSON array, no other text.`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1500,
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    return NextResponse.json({ interactions: [] });
  }

  let interactions;
  try {
    const text = content.text.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
    interactions = JSON.parse(text);
  } catch {
    return NextResponse.json({ interactions: [] });
  }

  return NextResponse.json({ interactions });
}
