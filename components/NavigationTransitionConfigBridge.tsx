"use client";

import { useEffect } from "react";
import type { CompanyContent } from "@/lib/cms/content-contracts";

export function NavigationTransitionConfigBridge({ config }: { config: CompanyContent["routeTransition"] }) {
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("irp:route-transition-config", { detail: config }));
  }, [config]);
  return null;
}
