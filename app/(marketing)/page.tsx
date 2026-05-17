import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/marketing/reveal";

export default function LandingPage() {
  return (
    <div className="relative overflow-x-hidden font-serif">
      {/* Floating nav */}
      <nav className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md bg-background/60 border-b border-border/40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl tracking-tight font-light">
            WayFlame
          </Link>
          <div className="flex items-center gap-2 text-lg">
            <Link
              href="/caregivers"
              className="hidden sm:inline-flex px-4 py-2 text-muted-foreground hover:text-foreground transition"
            >
              For caregivers
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 text-muted-foreground hover:text-foreground transition"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="ml-2 px-5 py-2 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition font-light"
            >
              Start trial
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO — animates on mount */}
      <Reveal
        onMount
        className="relative min-h-screen flex flex-col items-center justify-start px-6 pt-20 md:pt-24 overflow-hidden"
        yOffset={30}
        duration={1.3}
        stagger={0.18}
      >
        <Image
          src="/hero-bg.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-bottom translate-y-[18%] select-none pointer-events-none"
        />
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <p
            data-reveal
            className="text-sm uppercase tracking-[0.32em] text-muted-foreground mb-4"
          >
            For cancer patients and the people who love them
          </p>
          <h1 className="tracking-tight leading-[0.95] font-light">
            <span
              data-reveal
              className="block text-5xl md:text-7xl text-foreground"
            >
              Focus on healing.
            </span>
            <span
              data-reveal
              className="block text-5xl md:text-7xl text-primary mt-3"
            >
              WayFlame handles the rest.
            </span>
          </h1>
          <p
            data-reveal
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mt-6"
          >
            A private hub for tracking symptoms, journaling, drafting messages,
            and managing the practical side of a cancer diagnosis.
          </p>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 text-muted-foreground">
          <span className="text-[10px] uppercase tracking-[0.4em]">scroll</span>
          <div className="w-px h-14 bg-gradient-to-b from-muted-foreground/60 to-transparent" />
        </div>
      </Reveal>

      {/* POSITIONING */}
      <Reveal className="flex flex-col items-center px-6 pt-12 md:pt-16 pb-0 relative">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <p
            data-reveal
            className="text-4xl md:text-7xl leading-[1.1] tracking-tight font-light text-foreground"
          >
            A cancer diagnosis is overwhelming.
          </p>
          <p
            data-reveal
            className="text-4xl md:text-7xl leading-[1.1] tracking-tight font-light text-primary mt-4"
          >
            WayFlame brings it into one place.
          </p>
        </div>
        <div
          data-reveal
          className="relative w-full max-w-5xl aspect-[16/9] mt-12 md:mt-16 pointer-events-none select-none"
        >
          <Image
            src="/positioning-illustration.png"
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="object-contain"
          />
        </div>
      </Reveal>

      {/* WHAT IT INCLUDES */}
      <Reveal className="min-h-screen flex flex-col items-center justify-center px-6 relative">
        <div className="max-w-3xl mx-auto relative z-10">
          <p
            data-reveal
            className="text-sm uppercase tracking-[0.32em] text-muted-foreground mb-14 text-center"
          >
            What WayFlame includes
          </p>
          <ul className="text-3xl md:text-5xl leading-[1.3] tracking-tight space-y-5 font-light text-foreground">
            <li data-reveal>
              <span className="text-primary">Symptom</span> and side-effect
              tracking.
            </li>
            <li data-reveal>
              Private <span className="text-primary">journaling</span>.
            </li>
            <li data-reveal>
              <span className="text-primary">Message drafting</span> for friends
              and family.
            </li>
            <li data-reveal>
              <span className="text-primary">Community</span> and support group
              discovery.
            </li>
            <li data-reveal>
              Appointment and <span className="text-primary">deadline</span>{" "}
              management.
            </li>
          </ul>
        </div>
      </Reveal>

      {/* HOW IT WORKS */}
      <Reveal className="min-h-screen flex flex-col items-center justify-center px-6 relative">
        <div className="max-w-5xl mx-auto relative z-10">
          <p
            data-reveal
            className="text-sm uppercase tracking-[0.32em] text-muted-foreground mb-16 text-center"
          >
            How it works
          </p>
          <div className="grid md:grid-cols-3 gap-12 md:gap-16">
            {[
              {
                num: "01",
                title: "Complete a brief intake",
                body: "Share your diagnosis, situation, and the support you need. Takes about 5 minutes.",
              },
              {
                num: "02",
                title: "Receive your priority plan",
                body: "WayFlame generates a personalized plan covering treatment milestones, paperwork, and support.",
              },
              {
                num: "03",
                title: "Manage everything in one place",
                body: "Track symptoms, journal privately, draft updates, find community — all from one private hub.",
              },
            ].map((step) => (
              <div key={step.num} data-reveal className="text-center">
                <p className="text-primary text-3xl mb-5 font-light tracking-tight">
                  {step.num}
                </p>
                <h3 className="text-2xl md:text-3xl mb-4 tracking-tight font-light text-foreground">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-xl">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* PRICING */}
      <Reveal className="min-h-screen flex flex-col items-center justify-center px-6 relative">
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <p
            data-reveal
            className="text-sm uppercase tracking-[0.32em] text-muted-foreground mb-12"
          >
            Pricing
          </p>
          <p
            data-reveal
            className="text-6xl md:text-8xl tracking-tight leading-none text-primary font-light"
          >
            $3 per month.
          </p>
          <p
            data-reveal
            className="text-2xl md:text-3xl text-muted-foreground mt-6"
          >
            14-day free trial. Cancel anytime.
          </p>
          <div data-reveal>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 mt-14 px-8 py-4 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition font-light text-base group"
            >
              Start your 14-day trial
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </Reveal>

      {/* FOOTER */}
      <footer className="relative z-30 py-12 px-6 border-t border-border/40 bg-background/85 backdrop-blur">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm">
          <Link href="/" className="text-base font-light">
            WayFlame
          </Link>
          <div className="flex items-center gap-6 text-muted-foreground">
            <Link
              href="/caregivers"
              className="hover:text-foreground transition"
            >
              For caregivers
            </Link>
            <Link href="/terms" className="hover:text-foreground transition">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-foreground transition">
              Privacy
            </Link>
            <Link
              href="/disclaimer"
              className="hover:text-foreground transition"
            >
              Disclaimer
            </Link>
          </div>
          <p className="text-muted-foreground text-xs">
            © {new Date().getFullYear()} WayFlame
          </p>
        </div>
      </footer>
    </div>
  );
}
