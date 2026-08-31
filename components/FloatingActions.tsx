"use client";

import { ArrowUp, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { siteConfig } from "@/data/site";
import { cn } from "@/lib/utils";

export function FloatingActions() {
  const [showTop, setShowTop] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const update = () => setShowTop(window.scrollY > window.innerHeight * 1.7);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  useEffect(() => {
    if (sessionStorage.getItem("industrial-remotos-whatsapp-tooltip")) return;
    let hideTimer = 0;
    const showTimer = window.setTimeout(() => {
      setShowTooltip(true);
      sessionStorage.setItem("industrial-remotos-whatsapp-tooltip", "shown");
      hideTimer = window.setTimeout(() => setShowTooltip(false), 6500);
    }, 4000);

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  return (
    <div className="floating-actions fixed bottom-4 right-4 z-40 flex flex-col items-center gap-2 transition-opacity sm:bottom-6 sm:right-6">
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Volver arriba"
        title="Volver arriba"
        className={cn(
          "grid h-11 w-11 place-items-center border border-white/18 bg-navy-950 text-white shadow-lg transition-all",
          showTop
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-2 opacity-0"
        )}
      >
        <ArrowUp aria-hidden="true" size={19} />
      </button>
      <a
        href={siteConfig.social.whatsapp}
        target="_blank"
        rel="noreferrer"
        aria-label="Escribir por WhatsApp"
        title="Escribir por WhatsApp"
        onClick={() => setShowTooltip(false)}
        className="relative grid h-14 w-14 place-items-center rounded-full bg-whatsapp text-[#052a14] shadow-[0_14px_34px_rgba(10,30,60,.28)] transition-transform hover:scale-105"
      >
        <span
          role="status"
          className={cn(
            "pointer-events-none absolute bottom-1 right-[calc(100%+12px)] w-max max-w-[190px] rounded-md bg-white px-3 py-2 text-xs font-extrabold text-navy-950 shadow-lifted transition-all after:absolute after:right-[-6px] after:top-1/2 after:h-3 after:w-3 after:-translate-y-1/2 after:rotate-45 after:bg-white",
            showTooltip
              ? "translate-x-0 opacity-100"
              : "translate-x-2 opacity-0"
          )}
        >
          ¿Cotizamos tu proyecto?
        </span>
        <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-whatsapp/35 [animation-duration:2.2s]" />
        <MessageCircle aria-hidden="true" size={27} strokeWidth={2} />
      </a>
    </div>
  );
}
