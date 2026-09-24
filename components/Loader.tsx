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
            animate={reduceMotion ? undefined : { scale: [0.8, 1, 0.8] }}
            transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
          >
            <motion.span
              className="irp-loader-spinner absolute h-96 w-96 rounded-full bg-gradient-primary opacity-75 shadow-[0_0_55px_rgba(37,139,255,0.22)] sm:h-[32rem] sm:w-[32rem]"
              animate={reduceMotion ? undefined : { rotate: 360 }}
              transition={{ duration: 2.2, ease: "linear", repeat: Infinity }}
            />
            <div className="relative z-[1]">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
