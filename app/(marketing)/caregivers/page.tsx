import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FlameSection } from "@/components/marketing/flame-section";

export default function CaregiversPage() {
  return (
    <div className="relative overflow-x-hidden font-serif">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md bg-background/40 border-b border-border/40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl tracking-tight font-medium">
            WayFlame
          </Link>
          <div className="flex items-center gap-1 text-sm">
            <Link
              href="/"
              className="hidden sm:inline-flex px-3 py-1.5 text-muted-foreground hover:text-foreground transition"
            >
              For patients
            </Link>
            <Link
              href="/login"
              className="px-3 py-1.5 text-muted-foreground hover:text-foreground transition"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="ml-2 px-4 py-1.5 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition font-medium"
            >
              Start trial
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <p className="text-xs uppercase tracking-[0.32em] text-muted-foreground mb-12">
            For the people who love them
          </p>
          <h1 className="tracking-tight leading-[0.95] font-medium">
            <span className="block text-5xl md:text-7xl text-foreground">
              Caring for someone with cancer
            </span>
            <span className="block text-5xl md:text-7xl text-primary mt-3">
              is its own journey.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mt-12">
            WayFlame gives you a place to keep track — for them, and for you.
          </p>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 text-muted-foreground">
          <span className="text-[10px] uppercase tracking-[0.4em]">scroll</span>
          <div className="w-px h-14 bg-gradient-to-b from-muted-foreground/60 to-transparent" />
        </div>
      </section>

      {/* WHAT IT HOLDS FOR CAREGIVERS */}
      <FlameSection className="min-h-screen flex flex-col items-center justify-center px-6 relative">
        <div className="max-w-3xl mx-auto relative z-10">
          <p className="text-xs uppercase tracking-[0.32em] text-muted-foreground mb-14 text-center">
            For the caregiver
          </p>
          <ul className="text-3xl md:text-5xl leading-[1.3] tracking-tight space-y-5 font-medium text-foreground">
            <li>Track on their <span className="text-primary">behalf</span>.</li>
            <li>Draft the updates to family with <span className="text-primary">one link</span>.</li>
            <li>A journal of <span className="text-primary">your own</span>.</li>
            <li>Find <span className="text-primary">caregiver community</span>.</li>
            <li>Carry less of it alone.</li>
          </ul>
        </div>
      </FlameSection>

      {/* TWO PATHS */}
      <FlameSection className="min-h-screen flex flex-col items-center justify-center px-6 relative">
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <p className="text-3xl md:text-5xl leading-tight tracking-tight font-medium text-foreground">
            Caregiving has its own weight.
          </p>
          <p className="text-3xl md:text-5xl leading-tight tracking-tight font-medium text-primary mt-4">
            WayFlame holds it with you.
          </p>
          <p className="text-muted-foreground max-w-xl mx-auto mt-10 leading-relaxed">
            When you sign up, choose &ldquo;I&apos;m a caregiver&rdquo; — the entire experience adapts to support the patient and you.
          </p>
        </div>
      </FlameSection>

      {/* PRICING */}
      <FlameSection className="min-h-screen flex flex-col items-center justify-center px-6 relative">
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <p className="text-xs uppercase tracking-[0.32em] text-muted-foreground mb-12">
            Pricing
          </p>
          <p className="text-6xl md:text-8xl tracking-tight leading-none text-primary font-medium">
            $3 a month.
          </p>
          <p className="text-2xl md:text-3xl text-muted-foreground mt-6">
            One account covers both of you. Cancel any time.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 mt-14 px-8 py-4 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition font-medium text-base group"
          >
            Start your 14-day trial
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </FlameSection>

      {/* FOOTER */}
      <footer className="relative z-30 py-12 px-6 border-t border-border/40 bg-background/85 backdrop-blur">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm">
          <Link href="/" className="text-base font-medium">
            WayFlame
          </Link>
          <div className="flex items-center gap-6 text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition">For patients</Link>
            <Link href="/terms" className="hover:text-foreground transition">Terms</Link>
            <Link href="/privacy" className="hover:text-foreground transition">Privacy</Link>
            <Link href="/disclaimer" className="hover:text-foreground transition">Disclaimer</Link>
          </div>
          <p className="text-muted-foreground text-xs">© {new Date().getFullYear()} WayFlame</p>
        </div>
      </footer>
    </div>
  );
}
