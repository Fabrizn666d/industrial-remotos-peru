"use client";

import { usePathname } from "next/navigation";
import { HOME_INTRO_ASSETS, useHomeIntro } from "@/components/HomeIntroController";

export function IntroLoader() {
  const { status, logoRef } = useHomeIntro();
  const pathname = usePathname();
  if (pathname !== "/" || ["completed", "failed", "skipped"].includes(status)) return null;

  return (
    <div className="irp-entry-loader" role="status" aria-label="Abriendo el acceso">
      <div ref={logoRef} className="irp-entry-loader__brand-stage">
        <img className="irp-entry-loader__logo" src={HOME_INTRO_ASSETS.logo} alt=""
          width={1254} height={1254} fetchPriority="high" decoding="sync" />
      </div>
    </div>
  );
}
