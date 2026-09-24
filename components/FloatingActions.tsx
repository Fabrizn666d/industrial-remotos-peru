"use client";

import { ArrowUp } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { motionDuration, motionEase } from "@/lib/motion";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

export function FloatingActions() {
  const [showTop, setShowTop] = useState(false);
  const reduceMotion = usePrefersReducedMotion();

  useEffect(() => {
    const update = () => setShowTop(window.scrollY > window.innerHeight * 1.7);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <div className="floating-actions fixed bottom-24 left-4 z-40 sm:bottom-7 sm:left-6">
      <AnimatePresence>
      {showTop && <motion.button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Volver arriba"
        title="Volver arriba"
        className="grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-navy-950 text-white shadow-lg"
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: .94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: .96 }}
        whileHover={reduceMotion ? undefined : { y: -2 }}
        whileTap={reduceMotion ? undefined : { scale: .96 }}
        transition={{ duration: reduceMotion ? motionDuration.reduced : .42, ease: motionEase.enter }}
      >
        <ArrowUp aria-hidden="true" size={19} />
      </motion.button>}
      </AnimatePresence>
    </div>
  );
}
