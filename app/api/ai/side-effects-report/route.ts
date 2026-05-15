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
  const { data: entries } = await supabase
    .from("side_effect_entries")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: true });

  if (!entries || entries.length === 0) {
    return NextResponse.json({ error: "No entries to report on" }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const entrySummary = entries.map((e) => ({
    date: e.date,
    symptoms: e.symptoms,
    energy_level: e.energy_level,
    notes: e.notes,
  }));

  const cancerContext = getCancerContext(profile?.cancer_type, profileContextOptions(profile ?? {}));

  const prompt = `You are helping a cancer patient create a report of their side effects for their doctor.

Patient: ${profile?.cancer_type ?? "cancer"} patient, ${profile?.treatment_status ?? "in treatment"}
${cancerContext ? `\nCancer-specific context:\n${cancerContext}\n` : ""}
Interpret side effects in the context of this cancer's typical treatments.

Side effect journal entries:
${JSON.stringify(entrySummary, null, 2)}

Write a clear, doctor-ready summary report that includes:
1. Overview of the tracking period (date range, number of entries)
2. Most frequent symptoms and their severity trends
3. Energy level trends
4. Notable patterns (symptoms that appear together, days that are worse)
5. Patient's notes highlights

Format as a clean, professional medical report the patient can print and bring to their appointment. Use markdown formatting.`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    return NextResponse.json({ error: "Unexpected response" }, { status: 500 });
  }

  return NextResponse.json({ report: content.text });
}
