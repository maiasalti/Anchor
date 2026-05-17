import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="theme-flame bg-background text-foreground min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Soft flame glow in the background */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: "70vmin",
          height: "70vmin",
          background:
            "radial-gradient(circle, oklch(0.78 0.18 55 / 0.18) 0%, transparent 60%)",
          filter: "blur(40px)",
        }}
        aria-hidden="true"
      />
      <div className="w-full max-w-md text-center relative z-10">
        <div className="mb-12">
          <span className="font-serif text-2xl tracking-tight">WayFlame</span>
        </div>
        <p
          className="font-serif text-[10rem] leading-none text-primary italic mb-4"
          style={{
            textShadow:
              "0 0 40px oklch(0.78 0.20 55 / 0.45), 0 0 12px oklch(0.78 0.20 55 / 0.6)",
          }}
        >
          404
        </p>
        <h2 className="font-serif text-3xl tracking-tight mb-4">
          This page wandered off.
        </h2>
        <p className="font-serif text-muted-foreground italic mb-10 text-lg">
          The link may be broken, or the page may have moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
      </div>
    </div>
  );
}
