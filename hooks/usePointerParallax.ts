"use client";

import { useMotionValue, useSpring } from "framer-motion";
import type { RefObject } from "react";
import { useEffect } from "react";

export function usePointerParallax(
  targetRef: RefObject<HTMLElement | null>,
  enabled: boolean,
  distance = 6
) {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 70, damping: 20, mass: 0.8 });
  const y = useSpring(rawY, { stiffness: 70, damping: 20, mass: 0.8 });

  useEffect(() => {
    const target = targetRef.current;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    if (!target || !enabled || !finePointer) {
      rawX.set(0);
      rawY.set(0);
      return;
    }

    const update = (event: PointerEvent) => {
      const bounds = target.getBoundingClientRect();
      rawX.set((((event.clientX - bounds.left) / bounds.width) - 0.5) * distance * 2);
      rawY.set((((event.clientY - bounds.top) / bounds.height) - 0.5) * distance * 2);
    };
    const reset = () => {
      rawX.set(0);
      rawY.set(0);
    };

    target.addEventListener("pointermove", update, { passive: true });
    target.addEventListener("pointerleave", reset);
    return () => {
      target.removeEventListener("pointermove", update);
      target.removeEventListener("pointerleave", reset);
      reset();
    };
  }, [distance, enabled, rawX, rawY, targetRef]);

  return { x, y };
}
