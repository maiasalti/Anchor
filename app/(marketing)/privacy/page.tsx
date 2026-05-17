import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
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
        <h1>Privacy Policy</h1>
        <p className="text-sm text-muted-foreground">Last updated: 5 March 2025</p>

        <p>
          WayFlame (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is committed to protecting your
          personal data in accordance with the Personal Data Protection Act 2012 (PDPA) of
          Singapore and applicable data protection standards.
        </p>

        <h2>1. Data We Collect</h2>
        <ul>
          <li><strong>Account information:</strong> Name, email address.</li>
          <li><strong>Profile information:</strong> Cancer type, subtype, stage, treatment status, medications, molecular markers, and related health details you choose to provide.</li>
          <li><strong>Employment &amp; insurance:</strong> Employer name, employer size, insurance type and provider (optional).</li>
          <li><strong>Usage data:</strong> Features used, content generated (journal entries, checklists, report translations).</li>
          <li><strong>Payment information:</strong> Processed and stored by Stripe. We do not store your credit card details.</li>
        </ul>

        <h2>2. Purpose of Data Collection</h2>
        <p>We collect and use your data to:</p>
        <ul>
          <li>Provide personalized recommendations and AI-generated content tailored to your diagnosis.</li>
          <li>Manage your subscription and process payments.</li>
          <li>Improve the Service and develop new features.</li>
          <li>Communicate important account and service updates.</li>
        </ul>

        <h2>3. We Do Not Sell Your Data</h2>
        <p>
          We will <strong>never</strong> sell, rent, or trade your personal data to third parties
          for marketing or any other purpose.
        </p>

        <h2>4. Third-Party Services</h2>
        <p>We use the following third-party services to operate WayFlame:</p>
        <ul>
          <li><strong>Supabase</strong> — Database and authentication. Your data is stored securely with row-level security.</li>
          <li><strong>Stripe</strong> — Payment processing. Subject to{" "}
            <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary">Stripe&apos;s Privacy Policy</a>.
          </li>
          <li><strong>Anthropic (Claude)</strong> — AI processing. Your prompts are sent to generate personalized content. Anthropic does not use your data to train models.</li>
        </ul>

        <h2>5. Data Retention</h2>
        <p>
          We retain your data for as long as your account is active. If you cancel your
          subscription, your data is retained for 90 days in case you resubscribe, after which
          it is permanently deleted. You may request immediate deletion at any time.
        </p>

        <h2>6. Your Rights</h2>
        <p>Under the PDPA, you have the right to:</p>
        <ul>
          <li><strong>Access</strong> your personal data we hold.</li>
          <li><strong>Correct</strong> inaccurate or incomplete data.</li>
          <li><strong>Withdraw consent</strong> for data processing (which may affect your ability to use the Service).</li>
          <li><strong>Request deletion</strong> of your personal data.</li>
        </ul>
        <p>
          To exercise any of these rights, contact us at{" "}
          <a href="mailto:hello@wayflame.health" className="text-primary">hello@wayflame.health</a>.
        </p>

        <h2>7. Data Security</h2>
        <p>
          We implement appropriate technical and organisational measures to protect your data,
          including encryption in transit (TLS) and at rest, row-level security policies, and
          secure authentication practices.
        </p>

        <h2>8. Cookies</h2>
        <p>
          We use essential cookies for authentication and session management only. We do not use
          tracking or advertising cookies.
        </p>

        <h2>9. Children</h2>
        <p>
          The Service is not intended for individuals under 18 years of age. We do not knowingly
          collect data from children.
        </p>

        <h2>10. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify you of material
          changes via email or in-app notification.
        </p>

        <h2>11. Contact</h2>
        <p>
          For privacy-related inquiries, contact our Data Protection Officer at{" "}
          <a href="mailto:hello@wayflame.health" className="text-primary">hello@wayflame.health</a>.
        </p>
      </main>
    </div>
  );
}
