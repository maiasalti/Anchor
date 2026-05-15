import { NextResponse } from "next/server";
import { getUserFromCookie } from "@/lib/supabase/session";
import { createClient } from "@/lib/supabase/server";
import { anthropic } from "@/lib/claude";
import { getCancerContext, profileContextOptions } from "@/lib/cancer-types";

export async function POST(request: Request) {
  try {
    const user = await getUserFromCookie();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { relationship, context, format } = await request.json();
    if (!relationship) {
      return NextResponse.json({ error: "Relationship is required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    const cancerContext = getCancerContext(profile?.cancer_type, profileContextOptions(profile ?? {}));
    const patientName = profile?.name ?? "the patient";

    const isMessage = format === "message";

    const prompt = isMessage
      ? `You are helping a cancer patient write a message to tell their ${relationship} about their diagnosis.

Patient info:
- Name: ${patientName}
- Cancer type: ${profile?.cancer_type ?? "not specified"}
- Stage: ${profile?.stage ?? "not specified"}
- Treatment status: ${profile?.treatment_status ?? "not specified"}
${cancerContext ? `\nCancer-specific context:\n${cancerContext}\n` : ""}
${context ? `Additional context from the patient: ${context}` : ""}

Write 2-3 draft messages (short, medium, and longer) that the patient can copy, edit, and send to their ${relationship}. These should feel like real texts or emails a person would actually send — not formal, not clinical, not robotic.

Guidelines:
- Use the patient's first name naturally in the message (as the sender)
- Write like a real person would — casual, honest, warm
- Don't over-explain the medical details — keep it simple
- Include what they need from the person (space, support, normalcy, etc.)
- Each draft should have a different tone: one more direct/brief, one warmer/longer, one that's somewhere in between
- The patient can choose which feels most like them and edit it

Format the response as plain text. Label each draft clearly (e.g., "Draft 1 — Short & direct"). Separate drafts with a blank line. Do NOT use markdown headers (#), horizontal rules (---), or bullet points. Just write naturally.`
      : `You are helping a cancer patient prepare to have an in-person conversation with their ${relationship} about their diagnosis.

Patient info:
- Name: ${patientName}
- Cancer type: ${profile?.cancer_type ?? "not specified"}
- Stage: ${profile?.stage ?? "not specified"}
- Treatment status: ${profile?.treatment_status ?? "not specified"}
${cancerContext ? `\nCancer-specific context:\n${cancerContext}\n` : ""}
${context ? `Additional context from the patient: ${context}` : ""}

Write a conversation guide that feels like advice from a close friend who's been through this — not a clinical script. Be specific to their situation.

Cover these naturally (don't use these as rigid section headers):
- When and where to have this conversation
- How to start — give them actual opening lines they can use or adapt, not vague suggestions
- What reactions to expect from a ${relationship} specifically
- How to handle tough responses (crying, anger, denial, awkward silence)
- What they don't have to share — remind them boundaries are okay
- How to wrap up the conversation

Guidelines:
- Write in second person ("you")
- Sound like a supportive friend, not a therapist or a corporate guide
- Be specific to the ${relationship} relationship — a boss conversation is very different from telling your parents
- Give real example phrases they can say, wrapped in quotes
- Keep it practical and grounded
- Do NOT use markdown formatting (no #, ##, ---, or bullet points with -). Use plain text with clear paragraph breaks. Bold key phrases by wrapping them in ** if needed, but nothing else.`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      return NextResponse.json({ error: "Unexpected response" }, { status: 500 });
    }

    // Try with format column first, fall back without it
    let saved;
    const insertData: Record<string, unknown> = {
      user_id: user.id,
      relationship,
      context: context || null,
      script: content.text,
    };

    // Try including format column
    const { data: result, error } = await supabase
      .from("conversation_scripts")
      .insert({ ...insertData, format: format || "in_person" })
      .select()
      .single();

    if (error) {
      // If format column doesn't exist, retry without it
      if (error.message.includes("format")) {
        const { data: fallback, error: fallbackError } = await supabase
          .from("conversation_scripts")
          .insert(insertData)
          .select()
          .single();
        if (fallbackError) {
          console.error("Conversations insert error:", fallbackError.message);
          return NextResponse.json({ error: fallbackError.message }, { status: 500 });
        }
        saved = { ...fallback, format: format || "in_person" };
      } else {
        console.error("Conversations insert error:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else {
      saved = result;
    }

    return NextResponse.json({ script: saved });
  } catch (err) {
    console.error("Conversations API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
