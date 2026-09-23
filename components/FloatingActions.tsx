"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function FloatingActions() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const update = () => setShowTop(window.scrollY > window.innerHeight * 1.7);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <div className="floating-actions fixed bottom-24 left-4 z-40 transition-opacity sm:bottom-7 sm:left-6">
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Volver arriba"
        title="Volver arriba"
        className={cn(
          "grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-navy-950 text-white shadow-lg transition-all",
          showTop ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"
        )}
      >
        <ArrowUp aria-hidden="true" size={19} />
      </button>
    </div>
  );
}
