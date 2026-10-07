import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({ className, compact = false, inverse = false, priority = false }: { className?: string; compact?: boolean; inverse?: boolean; priority?: boolean }) {
  return (
    <span className={cn("brand-logo", compact && "brand-logo--compact", inverse && "brand-logo--inverse", className)}>
      <Image
        className="brand-logo__asset"
        src="/NUEVO/LOGO.png"
        alt="Industrial Remotos Perú — Garantía y confianza"
        width={1254}
        height={1254}
        sizes={compact ? "(max-width: 767px) 116px, 106px" : "174px"}
        unoptimized
        priority={compact || priority}
      />
    </span>
  );
}
