"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";

interface FlameSectionProps {
  children: ReactNode;
  className?: string;
}

/**
 * A scroll-driven section that brightens as it crosses viewport center
 * (where the flame is) and dims as it leaves. Default opacity ~8% keeps
 * text legibly hinted in the dark when off-center.
 */
export function FlameSection({ children, className }: FlameSectionProps) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(
    scrollYProgress,
    [0, 0.35, 0.65, 1],
    [0.08, 1, 1, 0.08]
  );
  const y = useTransform(scrollYProgress, [0, 0.5], [30, 0]);

  return (
    <motion.section ref={ref} style={{ opacity, y }} className={className}>
      {children}
    </motion.section>
  );
}
