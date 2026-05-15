import { NextResponse } from "next/server";
import { getUserFromCookie } from "@/lib/supabase/session";
import { createClient } from "@/lib/supabase/server";
import { anthropic } from "@/lib/claude";
import { getCancerContext, profileContextOptions } from "@/lib/cancer-types";

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

    const prompt = `You are helping a cancer patient find therapists and counselors who specialize in oncology support.

Patient:
- Cancer type: ${profile?.cancer_type ?? "unknown"}
- Insurance: ${profile?.insurance_type ?? "unknown"} ${profile?.insurance_provider ? `(${profile.insurance_provider})` : ""}
${cancerContext ? `\nCancer-specific context:\n${cancerContext}\n` : ""}
Consider psychological impacts specific to this cancer type.

Suggest 5-7 types of therapists/counselors they should consider. For each, provide:
- name: string (type/title of therapist, e.g., "Oncology Social Worker", "Psycho-Oncologist")
- specialty: string (what they specialize in)
- phone: string | null
- email: string | null
- website: string (a real resource URL for finding this type of professional)
- location: string (suggest "Search locally" or specific search advice)
- accepts_insurance: boolean | null
- notes: string (1-2 sentences about why this type of professional is helpful)

Include a mix: licensed clinical social workers, psychologists specializing in cancer, oncology counselors, support hotlines, and online therapy options.

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

    let therapists: Record<string, unknown>[];
    try {
      const text = content.text.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
      therapists = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }

    const inserts = therapists.map((t) => ({
      user_id: user.id,
      name: t.name,
      specialty: t.specialty,
      phone: t.phone || null,
      email: t.email || null,
      website: t.website || null,
      location: t.location || null,
      accepts_insurance: t.accepts_insurance ?? null,
      notes: t.notes || null,
      status: "saved",
    }));

    const { data: inserted, error } = await supabase
      .from("therapists")
      .insert(inserts)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ therapists: inserted });
  } catch (err) {
    console.error("Therapists API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
