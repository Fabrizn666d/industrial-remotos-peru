"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { FadeInUp } from "@/components/ui/motion-presets";

type LoaderProps = {
  children?: ReactNode;
  durationMs?: number;
  visible?: boolean;
};

export default function Loader({ children, durationMs = 2600, visible = true }: LoaderProps) {
  const [withinDuration, setWithinDuration] = useState(true);

  useEffect(() => {
    setWithinDuration(true);
    const timeout = window.setTimeout(() => setWithinDuration(false), durationMs);
    return () => window.clearTimeout(timeout);
  }, [durationMs]);

  if (!visible || !withinDuration) return null;

  return (
    <FadeInUp className="pointer-events-none absolute inset-0 z-[5] grid place-items-center px-6">
      <div className="relative z-[1]">{children}</div>
    </FadeInUp>
  );
}
