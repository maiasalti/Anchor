import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b px-6 py-4 flex items-center justify-between max-w-4xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="WayFlame" className="w-8 h-8 rounded-lg object-cover" />
          <span className="font-semibold text-lg">WayFlame</span>
        </Link>
        <Link href="/login">
          <Button variant="ghost">Log in</Button>
        </Link>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-16 prose prose-gray">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground no-underline mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
        <h1>Terms of Service</h1>
        <p className="text-sm text-muted-foreground">Last updated: 5 March 2025</p>

        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing or using WayFlame (&quot;the Service&quot;), you agree to be bound by these
          Terms of Service. If you do not agree, you may not use the Service.
        </p>

        <h2>2. Description of Service</h2>
        <p>
          WayFlame is an informational support platform for cancer patients and caregivers. It
          provides tools for action planning, medical report translation, side effect tracking,
          and related features. WayFlame is <strong>not</strong> a medical provider and does not
          provide medical advice, diagnosis, or treatment.
        </p>

        <h2>3. Subscription & Billing</h2>
        <ul>
          <li>Full access to WayFlame costs <strong>$3 per month</strong>.</li>
          <li>Subscriptions are billed monthly via Stripe.</li>
          <li>You may cancel your subscription at any time from your Settings page. Cancellation takes effect at the end of your current billing period.</li>
          <li>No refunds are provided for partial billing periods.</li>
        </ul>

        <h2>4. User Responsibilities</h2>
        <ul>
          <li>You must provide accurate information when creating your account.</li>
          <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
          <li>You may not use the Service for any unlawful purpose.</li>
          <li>You acknowledge that AI-generated content is informational only and may contain errors.</li>
        </ul>

        <h2>5. Intellectual Property</h2>
        <p>
          All content, features, and functionality of the Service are owned by WayFlame and are
          protected by applicable intellectual property laws. Content generated for your personal
          use (e.g., checklists, translations) is yours to use freely.
        </p>

        <h2>6. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, WayFlame shall not be liable for any indirect,
          incidental, special, consequential, or punitive damages arising from your use of the
          Service. WayFlame&apos;s total liability shall not exceed the amount you paid for the Service
          in the 12 months preceding the claim.
        </p>

        <h2>7. Disclaimer</h2>
        <p>
          The Service is provided &quot;as is&quot; without warranties of any kind. WayFlame does
          not warrant that the Service will be uninterrupted, error-free, or that AI-generated
          content will be accurate or complete. See our{" "}
          <Link href="/disclaimer" className="text-primary">Medical Disclaimer</Link> for
          important health-related limitations.
        </p>

        <h2>8. Termination</h2>
        <p>
          We reserve the right to suspend or terminate your account if you violate these Terms.
          You may delete your account at any time by contacting support.
        </p>

        <h2>9. Changes to Terms</h2>
        <p>
          We may update these Terms from time to time. We will notify you of material changes
          via email or in-app notification. Continued use of the Service after changes constitutes
          acceptance of the updated Terms.
        </p>

        <h2>10. Governing Law</h2>
        <p>
          These Terms are governed by and construed in accordance with the laws of the Republic
          of Singapore. Any disputes shall be subject to the exclusive jurisdiction of the courts
          of Singapore.
        </p>

        <h2>11. Contact</h2>
        <p>
          For questions about these Terms, please contact us at{" "}
          <a href="mailto:hello@wayflame.health" className="text-primary">hello@wayflame.health</a>.
        </p>
      </main>
    </div>
  );
}
