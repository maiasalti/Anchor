"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Play immediately on mount (for the above-the-fold hero). */
  onMount?: boolean;
  /** Override the default 40px upward translation. */
  yOffset?: number;
  /** Override the default 1.1s duration. */
  duration?: number;
  /** Override the default 0.12s stagger between marked elements. */
  stagger?: number;
}

/**
 * <Reveal> wraps a <section>. As it scrolls into view (or on mount, if
 * `onMount` is set), its content fades up.
 *
 * Mark child elements with `data-reveal` to have THAT element animate
 * specifically. Multiple marked elements get a stagger. If nothing is
 * marked, the entire section animates as one unit.
 */
export function Reveal({
  children,
  className,
  onMount = false,
  yOffset = 40,
  duration = 1.1,
  stagger = 0.12,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(() => {
    if (!ref.current) return;

    const marked = ref.current.querySelectorAll<HTMLElement>("[data-reveal]");
    const items = marked.length > 0 ? Array.from(marked) : [ref.current];

    gsap.from(items, {
      opacity: 0,
      y: yOffset,
      duration,
      ease: "power3.out",
      stagger: items.length > 1 ? stagger : 0,
      scrollTrigger: onMount
        ? undefined
        : {
            trigger: ref.current,
            start: "top 75%",
          },
    });
  }, []);

  return (
    <section ref={ref} className={className}>
      {children}
    </section>
  );
}
