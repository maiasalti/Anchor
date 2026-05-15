import { NextResponse } from "next/server";
import { getUserFromCookie } from "@/lib/supabase/session";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const user = await getUserFromCookie();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();
  const tables = [
    "action_items", "deadlines", "journal_entries", "side_effect_entries",
    "medications", "medical_records", "medical_bills", "clinical_trials",
    "second_opinion_tasks", "visit_questions", "conversation_scripts",
    "therapists", "support_groups", "care_updates",
  ];

  for (const table of tables) {
    await supabase.from(table).delete().eq("user_id", user.id);
  }

  await supabase.from("profiles").delete().eq("id", user.id);
  return NextResponse.json({ success: true });
}
