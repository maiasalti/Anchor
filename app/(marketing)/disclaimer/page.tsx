import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b px-6 py-4 flex items-center justify-between max-w-4xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="Anchor" className="w-8 h-8 rounded-lg object-cover" />
          <span className="font-semibold text-lg">Anchor</span>
        </Link>
        <Link href="/login">
          <Button variant="ghost">Log in</Button>
        </Link>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-16 prose prose-gray">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 no-underline mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
        <h1>Medical Disclaimer</h1>
        <p className="text-sm text-gray-500">Last updated: 5 March 2025</p>

        <h2>Not Medical Advice</h2>
        <p>
          Anchor is an <strong>informational support tool</strong> designed to help cancer patients
          and caregivers manage the administrative and emotional aspects of a cancer diagnosis. It
          is <strong>not</strong> a medical device, medical provider, or substitute for professional
          medical advice, diagnosis, or treatment.
        </p>

        <h2>AI-Generated Content</h2>
        <p>
          Anchor uses artificial intelligence (powered by Anthropic&apos;s Claude) to generate
          personalised content such as report translations, action checklists, and recommendations.
          While we strive for accuracy, AI-generated content:
        </p>
        <ul>
          <li>May contain errors, omissions, or inaccuracies.</li>
          <li>Should not be used as the sole basis for any medical decision.</li>
          <li>Does not account for your complete medical history or circumstances.</li>
          <li>Is not reviewed by a medical professional before being presented to you.</li>
        </ul>

        <h2>Always Consult Your Healthcare Team</h2>
        <p>
          <strong>Always</strong> consult your oncologist, primary care physician, or other
          qualified healthcare professionals before making any decisions about your health,
          treatment, medications, or care plan. If you are experiencing a medical emergency,
          call your local emergency number immediately.
        </p>

        <h2>No Doctor-Patient Relationship</h2>
        <p>
          Use of Anchor does not create a doctor-patient relationship, therapist-client
          relationship, or any other professional healthcare relationship. The information
          provided is general in nature and may not apply to your specific situation.
        </p>

        <h2>Report Translations</h2>
        <p>
          The Report Translator feature provides simplified explanations of medical reports and
          lab results for educational purposes only. These translations:
        </p>
        <ul>
          <li>Are not a substitute for your doctor&apos;s interpretation of your results.</li>
          <li>May oversimplify complex medical information.</li>
          <li>Should be discussed with your healthcare team for proper context and guidance.</li>
        </ul>

        <h2>Limitation of Liability</h2>
        <p>
          Anchor shall not be held liable for any harm, injury, or damages resulting from
          reliance on information provided through the Service. You use Anchor at your own risk
          and are solely responsible for any decisions made based on its content.
        </p>

        <h2>Contact</h2>
        <p>
          If you have questions about this disclaimer, contact us at{" "}
          <a href="mailto:maia.salti@gmail.com" className="text-blue-600">maia.salti@gmail.com</a>.
        </p>
      </main>
    </div>
  );
}
