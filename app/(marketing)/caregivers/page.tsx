import Link from "next/link";
import Image from "next/image";

export default function CaregiversPage() {
  return (
    <div className="relative overflow-x-hidden font-serif min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md bg-background/60 border-b border-border/40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xl tracking-tight font-light">
            <img src="/logo.png" alt="" className="w-8 h-8 rounded-lg object-cover" />
            WayFlame
          </Link>
          <div className="flex items-center gap-2 text-lg">
            <Link
              href="/"
              className="hidden sm:inline-flex px-4 py-2 text-muted-foreground hover:text-foreground transition"
            >
              For patients
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

      {/* COMING SOON */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 pt-32 pb-12">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm uppercase tracking-[0.32em] text-muted-foreground mb-6">
            For caregivers
          </p>
          <h1 className="text-5xl md:text-7xl tracking-tight leading-[0.95] font-light text-foreground">
            Coming soon.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mt-8">
            We&apos;re building a space for the people who love them.
            Check back shortly.
          </p>
        </div>

        <div className="relative w-full max-w-3xl aspect-[16/9] mt-12 md:mt-16 pointer-events-none select-none">
          <Image
            src="/caregivers-hero.png"
            alt=""
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="object-contain"
          />
        </div>
      </section>
    </div>
  );
}
