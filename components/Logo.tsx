import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({ className, compact = false, inverse = false, priority = false }: { className?: string; compact?: boolean; inverse?: boolean; priority?: boolean }) {
  return (
    <span className={cn("brand-logo", compact && "brand-logo--compact", inverse && "brand-logo--inverse", className)}>
      <Image
        className="brand-logo__asset"
        src={inverse ? "/logo-white-blue.png" : "/logo-original-transparent.png"}
        alt="Industrial Perú Remotos — Garantía y confianza"
        width={504}
        height={342}
        priority={compact || priority}
      />
    </span>
  );
}
