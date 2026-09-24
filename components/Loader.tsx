"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

type LoaderProps = {
  children?: ReactNode;
  durationMs?: number;
  visible?: boolean;
};

export default function Loader({ children, durationMs = 2600, visible = true }: LoaderProps) {
  const reduceMotion = usePrefersReducedMotion();
  const [withinDuration, setWithinDuration] = useState(true);

  useEffect(() => {
    setWithinDuration(true);
    const timeout = window.setTimeout(() => setWithinDuration(false), durationMs);
    return () => window.clearTimeout(timeout);
  }, [durationMs]);

  return (
    <AnimatePresence initial>
      {visible && withinDuration && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-[5] grid place-items-center px-6"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion
            ? { opacity: 0, transition: { duration: 0.01 } }
            : { opacity: 0, scale: 0.94, y: -22, transition: { duration: 0.3, ease: "easeOut" } }}
          transition={{
            duration: reduceMotion ? 0.01 : 0.7,
            ease: "easeInOut"
          }}
          aria-hidden="true"
        >
          <motion.div
            className="relative grid place-items-center will-change-transform"
            initial={reduceMotion ? false : { scale: 0.96 }}
            animate={{ scale: 1 }}
            transition={{ duration: reduceMotion ? 0.01 : 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.svg
              className="irp-loader-spinner absolute h-96 w-96 overflow-visible sm:h-[32rem] sm:w-[32rem]"
              viewBox="0 0 100 100"
              fill="none"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="irp-loader-gradient" x1="12" y1="12" x2="88" y2="88" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#1677FF" />
                  <stop offset="0.55" stopColor="#2D8CFF" />
                  <stop offset="1" stopColor="#6BB6FF" />
                </linearGradient>
              </defs>
              <circle className="irp-loader-spinner__track" cx="50" cy="50" r="47" />
              <motion.circle
                className="irp-loader-spinner__progress"
                cx="50"
                cy="50"
                r="47"
                pathLength={1}
                initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: reduceMotion ? 0.01 : 1.1, delay: reduceMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
                transform="rotate(-90 50 50)"
              />
            </motion.svg>
            <div className="relative z-[1]">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
