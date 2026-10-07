"use client";

import { useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
  start
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  start?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const startedRef = useRef(false);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [display, setDisplay] = useState(0);
  const shouldStart = start ?? inView;

  useEffect(() => {
    if (!shouldStart) return;
    if (startedRef.current) return;
    startedRef.current = true;

    const duration = 1700;
    const start = performance.now();
    let frame = 0;
    const update = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 4);
      setDisplay(Math.round(value * eased));
      if (progress < 1) frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, [shouldStart, value]);

  return <span ref={ref} aria-label={`${prefix}${value}${suffix}`}>{prefix}{display}{suffix}</span>;
}
