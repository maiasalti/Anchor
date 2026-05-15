#!/usr/bin/env python3
"""Generate the Anchor Mission PDF."""

from fpdf import FPDF


class AnchorPDF(FPDF):
    def __init__(self):
        super().__init__()
        self.set_auto_page_break(auto=True, margin=20)

    def _section_title(self, title):
        self.set_font("Helvetica", "B", 15)
        self.set_text_color(29, 78, 216)
        self.cell(0, 10, title, new_x="LMARGIN", new_y="NEXT")
        self.set_draw_color(29, 78, 216)
        self.set_line_width(0.6)
        self.line(self.l_margin, self.get_y(), self.w - self.r_margin, self.get_y())
        self.ln(4)

    def _body(self, text):
        self.set_font("Helvetica", "", 10.5)
        self.set_text_color(55, 65, 81)
        self.multi_cell(0, 5.5, text)
        self.ln(2)

    def _bold_body(self, text):
        self.set_font("Helvetica", "B", 10.5)
        self.set_text_color(55, 65, 81)
        self.multi_cell(0, 5.5, text)
        self.ln(2)

    def _quote(self, text):
        self.set_font("Helvetica", "I", 11.5)
        self.set_text_color(29, 78, 216)
        x = self.get_x()
        self.set_x(x + 10)
        self.multi_cell(self.w - self.l_margin - self.r_margin - 20, 6.5, f'"{text}"')
        self.ln(2)

    def _bullet(self, text):
        self.set_font("Helvetica", "", 10.5)
        self.set_text_color(55, 65, 81)
        x = self.get_x()
        self.set_x(x + 8)
        self.cell(5, 5.5, "-")
        self.multi_cell(self.w - self.l_margin - self.r_margin - 13, 5.5, text)
        self.ln(0.5)

    def _feature_heading(self, text):
        self.set_font("Helvetica", "B", 11)
        self.set_text_color(29, 78, 216)
        self.cell(0, 7, text, new_x="LMARGIN", new_y="NEXT")


def build_pdf():
    pdf = AnchorPDF()
    pdf.set_margins(25, 25, 25)
    pdf.add_page()

    # --- Cover / Header ---
    pdf.set_fill_color(29, 78, 216)
    pdf.rect(0, 0, 210, 65, "F")

    pdf.set_y(16)
    pdf.set_font("Helvetica", "B", 30)
    pdf.set_text_color(255, 255, 255)
    pdf.cell(0, 12, "Anchor", align="C", new_x="LMARGIN", new_y="NEXT")

    pdf.set_font("Helvetica", "", 12)
    pdf.set_text_color(220, 230, 255)
    pdf.cell(0, 7, "Your anchor through the storm of a cancer diagnosis.", align="C", new_x="LMARGIN", new_y="NEXT")

    pdf.ln(4)
    pdf.set_font("Helvetica", "I", 10)
    pdf.set_text_color(200, 215, 255)
    pdf.cell(0, 6, "Mission & Vision  |  Founded 2026", align="C", new_x="LMARGIN", new_y="NEXT")

    pdf.set_y(74)

    # --- Mission Statement ---
    pdf._section_title("Our Mission")
    pdf._body(
        "Anchor exists so that no cancer patient has to navigate the chaos of a "
        "diagnosis without the right tools. We believe that when someone hears the "
        "words \"you have cancer,\" they deserve to focus on what matters most: their "
        "health, their mental wellbeing, and the decisions that shape their treatment. "
        "They should not have to spend that energy figuring out insurance deadlines, "
        "hunting for financial aid, or drafting legal paperwork from scratch."
    )
    pdf._body(
        "Anchor does not replace the patient in their own journey. It equips them. "
        "We build tools that reduce the mental burden of everything surrounding a "
        "cancer diagnosis, so that patients stay informed, stay in control, and never "
        "have to face the overwhelming administrative side of cancer alone."
    )

    # --- Why This Matters ---
    pdf._section_title("Why This Matters")
    pdf._body(
        "A cancer diagnosis is terrifying. But what many people don't talk about is "
        "the second wave that follows: an overwhelming flood of administrative tasks, "
        "emotional weight, and impossible decisions that arrive at the worst possible moment."
    )
    pdf._bullet("How do I keep my health insurance? What is COBRA and when does the window close?")
    pdf._bullet("Am I eligible for FMLA? How do I tell my employer I need medical leave?")
    pdf._bullet("Are there financial assistance programs, grants, or government aid I qualify for?")
    pdf._bullet("How do I find a therapist who understands what I'm going through?")
    pdf._bullet("How do I even tell my friends and family that I've been diagnosed?")
    pdf.ln(1)
    pdf._body(
        "These are not edge cases. They are the daily reality for millions of newly "
        "diagnosed patients. And they come at a time when people are already dealing "
        "with depression, fear, and exhaustion. Every unanswered question adds weight "
        "to a burden that is already unbearable."
    )
    pdf._bold_body(
        "Most patients figure this out alone. Many miss benefits they're entitled to. "
        "Some miss deadlines that cost them their insurance. Others suffer in silence "
        "because they don't know where to turn for emotional support. Anchor gives "
        "them the tools to take it one step at a time."
    )

    # --- Founder's Story ---
    pdf._section_title("The Story Behind Anchor")
    pdf._body(
        "Anchor was born from lived experience, not a business plan."
    )
    pdf._body(
        "My father was diagnosed with Stage 4 Non-Hodgkin's Lymphoma. Through his "
        "journey, he became deeply connected to the cancer care world, building "
        "relationships with oncologists and navigating the medical system with hard-won "
        "knowledge. He fought, and he learned."
    )
    pdf._body(
        "In January 2026, it was my turn. I was diagnosed with a Gastrointestinal "
        "Stromal Tumor (GIST), a rare cancer that most people have never heard of. "
        "Overnight, I was thrown into the same storm my father had faced: finding "
        "specialists for a rare disease, battling insurance, tracking documents, "
        "managing deadlines, all while dealing with massive waves of depression "
        "and fear."
    )
    pdf._body(
        "If not for my father, who took on the full burden of the administrative "
        "chaos, I would have been completely lost. He became my anchor. He made calls, "
        "tracked paperwork, found specialists, and fought insurance battles so that I "
        "could focus on one thing: getting through it."
    )
    pdf._quote(
        "Not everyone has someone to carry that weight for them. "
        "I want to be that for other people."
    )
    pdf.set_font("Helvetica", "", 9.5)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(0, 5, "-- Maia Salti, Founder", align="R", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(2)
    pdf._body(
        "That is why I built Anchor. Not to take over the process for patients, but to "
        "give them what my father gave me: the tools, the information, and the support "
        "to face it without being overwhelmed. With Anchor, every patient has someone "
        "in their corner."
    )

    # --- Mental Health First ---
    pdf._section_title("Mental Health First")
    pdf._body(
        "Everything we build at Anchor starts with one question: does this reduce "
        "the patient's mental burden?"
    )
    pdf._body(
        "Cancer patients don't need another app that adds to their plate. They need "
        "tools that take things off of it. Every feature in Anchor is designed to give "
        "patients clarity, reduce overwhelm, and make the next step obvious. We don't "
        "make decisions for patients. We make it easier for them to make their own."
    )
    pdf._body(
        "Depression, anxiety, and emotional exhaustion are not side effects of cancer. "
        "They are central to the experience. And every missed deadline, every confusing "
        "insurance form, every hour spent on hold, every conversation they don't know "
        "how to start makes it worse. Anchor is built with the conviction that reducing "
        "administrative and emotional stress is a form of mental health care."
    )

    # --- What Anchor Does ---
    pdf._section_title("What Anchor Gives Patients")
    pdf._body(
        "After a short onboarding, patients get access to a personalized toolkit "
        "built around their diagnosis, insurance, and employment situation. Anchor "
        "puts patients in control with tools across four areas:"
    )

    # Admin & Documents
    pdf._feature_heading("Administrative Tools")
    pdf._bullet("Action Checklist: a prioritized list of what to do, organized by urgency and category (insurance, employment, financial, legal, medical)")
    pdf._bullet("Deadline Tracker: critical dates with urgency flags so nothing slips through the cracks (COBRA windows, appeal deadlines, enrollment periods)")
    pdf._bullet("Document Generator: auto-generated documents pre-filled with patient info (FMLA requests, insurance appeals, COBRA notices, disability applications, hardship letters)")
    pdf._bullet("Benefits Finder: AI-powered discovery of government programs, employer benefits, pharmaceutical assistance, and nonprofit grants the patient may qualify for")
    pdf.ln(1)

    # Support & Mental Health
    pdf._feature_heading("Support & Mental Health")
    pdf._bullet("Find support groups and communities tailored to their diagnosis")
    pdf._bullet("Search for therapists and mental health professionals who specialize in cancer care")
    pdf._bullet("Journal to process emotions, track how they're feeling, and reflect on their journey")
    pdf._bullet("Log side effects and symptoms to share with their care team")
    pdf.ln(1)

    # Communication
    pdf._feature_heading("Communication Tools")
    pdf._bullet("Conversation scripts: AI-generated messages to help patients tell friends, family, and coworkers about their diagnosis")
    pdf._bullet("Family update sharing so loved ones stay informed without the patient having to repeat themselves")
    pdf.ln(1)

    # Research & Discovery
    pdf._feature_heading("Research & Discovery")
    pdf._bullet("Find clinical trials relevant to their cancer type and stage")
    pdf._bullet("Discover specialists and treatment centers for rare diagnoses")
    pdf.ln(1)

    pdf._bold_body(
        "Every tool is designed with the same principle: the patient is always in "
        "control. Anchor informs, organizes, and simplifies. The patient decides."
    )

    # --- Vision ---
    pdf._section_title("The Vision")
    pdf._body(
        "Today, Anchor helps cancer patients manage the administrative and emotional "
        "weight of their diagnosis. But our vision is much bigger."
    )
    pdf._body(
        "We are building the go-to platform that cancer patients turn to from the "
        "moment of diagnosis through their entire journey. A single place where they "
        "can manage paperwork, find support, track their health, communicate with "
        "loved ones, and make informed decisions about their care, all without feeling "
        "overwhelmed."
    )
    pdf._body(
        "Our north star is simple: Anchor should be the first thing a newly diagnosed "
        "patient is told about. The tool that hospitals recommend, that oncologists "
        "share, that patients tell each other about because it genuinely made their "
        "lives easier during the hardest time they've ever faced."
    )

    # --- Closing ---
    pdf.ln(4)
    pdf.set_draw_color(29, 78, 216)
    pdf.set_line_width(0.4)
    pdf.line(pdf.l_margin, pdf.get_y(), pdf.w - pdf.r_margin, pdf.get_y())
    pdf.ln(6)

    pdf.set_font("Helvetica", "I", 12)
    pdf.set_text_color(29, 78, 216)
    pdf.cell(0, 8, "Anchor. Because no one should face this alone.", align="C", new_x="LMARGIN", new_y="NEXT")

    pdf.ln(8)
    pdf.set_font("Helvetica", "", 9)
    pdf.set_text_color(156, 163, 175)
    pdf.cell(0, 5, "Anchor  |  Founded 2026  |  anchor-app.com", align="C", new_x="LMARGIN", new_y="NEXT")

    # Save
    output_path = "/Users/maiasalti/anchor/Anchor_Mission.pdf"
    pdf.output(output_path)
    print(f"PDF saved to: {output_path}")


if __name__ == "__main__":
    build_pdf()
