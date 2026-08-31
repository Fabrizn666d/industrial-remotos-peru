"use client";

import { motion } from "framer-motion";
import { useId } from "react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

export type DoorVariant =
  | "seccional"
  | "levadiza"
  | "corrediza"
  | "batiente"
  | "peatonal"
  | "motor"
  | "estructura";

export type DoorFinish = "cedro" | "roble" | "nogal" | "blanco" | "negro";

type DoorIllustrationProps = {
  variant: DoorVariant;
  finish?: DoorFinish;
  animateOpening?: boolean;
  className?: string;
  label?: boolean;
};

const finishColors: Record<
  DoorFinish,
  { from: string; middle: string; to: string; line: string; highlight: string }
> = {
  cedro: {
    from: "#8B5A2B",
    middle: "#A0522D",
    to: "#B8763A",
    line: "#63391F",
    highlight: "#D9A05B"
  },
  roble: {
    from: "#9A6B3F",
    middle: "#A87949",
    to: "#B08050",
    line: "#70472B",
    highlight: "#D3A36B"
  },
  nogal: {
    from: "#5C4033",
    middle: "#624536",
    to: "#6F4E37",
    line: "#3D2A24",
    highlight: "#9B765D"
  },
  blanco: {
    from: "#F5F5F2",
    middle: "#EEEEEA",
    to: "#E8E8E4",
    line: "#B9BCBE",
    highlight: "#FFFFFF"
  },
  negro: {
    from: "#1C1C1E",
    middle: "#242426",
    to: "#2A2A2C",
    line: "#09090A",
    highlight: "#525258"
  }
};

export function DoorIllustration({
  variant,
  finish = "cedro",
  animateOpening = false,
  className,
  label = true
}: DoorIllustrationProps) {
  const reduceMotion = usePrefersReducedMotion();
  const rawId = useId().replace(/:/g, "");
  const doorGradient = "door-" + rawId;
  const wallGradient = "wall-" + rawId;
  const floorGradient = "floor-" + rawId;
  const lightGradient = "light-" + rawId;
  const noiseFilter = "noise-" + rawId;
  const colors = finishColors[finish];

  const panelAnimation = (index: number) =>
    animateOpening && !reduceMotion
      ? {
          y: [0, -(index + 1) * 14, -(index + 1) * 14, 0],
          scaleY: [1, 0.22, 0.22, 1],
          opacity: [1, 0.76, 0.76, 1]
        }
      : undefined;

  return (
    <div
      className={cn(
        "group/door relative h-full w-full overflow-hidden rounded-lg bg-[#d8d2c8]",
        className
      )}
    >
      <svg
        viewBox="0 0 720 460"
        role="img"
        aria-label={"Referencia ilustrativa de puerta " + variant + " en acabado " + finish}
        className="h-full w-full"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id={wallGradient} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ece8e1" />
            <stop offset="58%" stopColor="#d8d2c9" />
            <stop offset="100%" stopColor="#b8b2aa" />
          </linearGradient>
          <linearGradient id={floorGradient} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#87898A" />
            <stop offset="100%" stopColor="#4B5054" />
          </linearGradient>
          <linearGradient id={doorGradient} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={colors.from} />
            <stop offset="48%" stopColor={colors.middle} />
            <stop offset="100%" stopColor={colors.to} />
          </linearGradient>
          <radialGradient id={lightGradient} cx="50%" cy="0%" r="72%">
            <stop offset="0%" stopColor="#FFDCA3" stopOpacity="0.84" />
            <stop offset="45%" stopColor="#D9A05B" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#071527" stopOpacity="0" />
          </radialGradient>
          <filter id={noiseFilter}>
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.72"
              numOctaves="2"
              seed="4"
              result="noise"
            />
            <feColorMatrix in="noise" type="saturate" values="0" />
            <feComponentTransfer>
              <feFuncA type="table" tableValues="0 0.08" />
            </feComponentTransfer>
          </filter>
          <filter id={"shadow-" + rawId} x="-30%" y="-30%" width="160%" height="180%">
            <feDropShadow dx="0" dy="12" stdDeviation="12" floodColor="#071527" floodOpacity="0.42" />
          </filter>
        </defs>

        <rect width="720" height="460" fill="#071527" />
        <rect y="42" width="720" height="334" fill={"url(#" + wallGradient + ")"} />
        <path d="M0 62 L720 18 L720 90 L0 124 Z" fill="#26313A" opacity="0.92" />
        <rect y="376" width="720" height="84" fill={"url(#" + floorGradient + ")"} />
        <path d="M0 410 L720 388" stroke="#BBC0C2" strokeOpacity="0.2" />
        <ellipse cx="360" cy="383" rx="252" ry="25" fill="#071527" opacity="0.42" />

        {variant !== "motor" && variant !== "estructura" ? (
          <>
            <rect
              x={variant === "peatonal" ? 264 : 112}
              y="102"
              width={variant === "peatonal" ? 192 : 496}
              height="280"
              rx="3"
              fill="#101820"
              filter={"url(#shadow-" + rawId + ")"}
            />
            <rect
              x={variant === "peatonal" ? 249 : 96}
              y="84"
              width={variant === "peatonal" ? 222 : 528}
              height="20"
              fill="#343B3E"
            />
          </>
        ) : null}

        {variant === "seccional" ? (
          <g>
            {Array.from({ length: 8 }).map((_, index) => (
              <motion.g
                key={index}
                initial={false}
                whileInView={panelAnimation(index)}
                viewport={{ once: true, amount: 0.65 }}
                transition={{
                  duration: 2.2,
                  delay: 0.2 + index * 0.06,
                  times: [0, 0.32, 0.65, 1],
                  ease: [0.22, 0.72, 0, 1]
                }}
                style={{ transformOrigin: "360px " + (120 + index * 32) + "px" }}
              >
                <rect
                  x="126"
                  y={112 + index * 33}
                  width="468"
                  height="32"
                  fill={"url(#" + doorGradient + ")"}
                  stroke={colors.line}
                  strokeWidth="1"
                />
                <path
                  d={"M128 " + (114 + index * 33) + " H592"}
                  stroke={colors.highlight}
                  strokeOpacity="0.38"
                />
                <path
                  d={"M150 " + (122 + index * 33) + " C235 " + (112 + index * 33) + ", 310 " + (134 + index * 33) + ", 410 " + (119 + index * 33)}
                  fill="none"
                  stroke={colors.highlight}
                  strokeOpacity="0.09"
                  strokeWidth="2"
                />
              </motion.g>
            ))}
          </g>
        ) : null}

        {variant === "levadiza" ? (
          <g>
            <rect x="126" y="112" width="468" height="264" fill={"url(#" + doorGradient + ")"} />
            {Array.from({ length: 12 }).map((_, index) => (
              <path
                key={index}
                d={"M" + (146 + index * 38) + " 116 V372"}
                stroke={index % 2 ? colors.highlight : colors.line}
                strokeOpacity={index % 2 ? "0.12" : "0.17"}
              />
            ))}
            <rect x="126" y="112" width="468" height="264" fill="none" stroke={colors.line} strokeWidth="3" />
          </g>
        ) : null}

        {variant === "corrediza" ? (
          <g>
            <rect x="126" y="112" width="231" height="264" fill={"url(#" + doorGradient + ")"} />
            <rect x="363" y="112" width="231" height="264" fill={"url(#" + doorGradient + ")"} />
            <path d="M360 112 V376" stroke={colors.line} strokeWidth="5" />
            {Array.from({ length: 7 }).map((_, index) => (
              <path
                key={index}
                d={"M128 " + (132 + index * 36) + " H592"}
                stroke={index % 2 ? colors.highlight : colors.line}
                strokeOpacity={index % 2 ? "0.24" : "0.6"}
              />
            ))}
            <rect x="106" y="91" width="508" height="8" rx="4" fill="#4D565B" />
            <circle cx="164" cy="95" r="7" fill="#20262A" />
            <circle cx="556" cy="95" r="7" fill="#20262A" />
          </g>
        ) : null}

        {variant === "batiente" ? (
          <g>
            <rect x="126" y="112" width="230" height="264" fill={"url(#" + doorGradient + ")"} />
            <rect x="364" y="112" width="230" height="264" fill={"url(#" + doorGradient + ")"} />
            {Array.from({ length: 7 }).map((_, index) => (
              <path
                key={index}
                d={"M128 " + (132 + index * 36) + " H592"}
                stroke={colors.highlight}
                strokeOpacity="0.25"
              />
            ))}
            <path d="M356 112 V376 M364 112 V376" stroke={colors.line} strokeWidth="2" />
            <rect x="341" y="225" width="5" height="72" rx="2" fill="#D5D9D8" />
            <rect x="374" y="225" width="5" height="72" rx="2" fill="#D5D9D8" />
          </g>
        ) : null}

        {variant === "peatonal" ? (
          <g>
            <rect x="278" y="112" width="164" height="264" fill={"url(#" + doorGradient + ")"} />
            {Array.from({ length: 7 }).map((_, index) => (
              <path
                key={index}
                d={"M280 " + (132 + index * 36) + " H440"}
                stroke={colors.highlight}
                strokeOpacity="0.25"
              />
            ))}
            <rect x="402" y="188" width="6" height="112" rx="3" fill="#E5E7E7" />
            <rect x="278" y="112" width="164" height="264" fill="none" stroke={colors.line} strokeWidth="3" />
          </g>
        ) : null}

        {variant === "motor" ? (
          <g>
            <path d="M74 74 L646 74 L570 378 L150 378 Z" fill="#252D33" />
            <path d="M148 378 H572" stroke="#83909A" strokeWidth="5" />
            <path d="M360 88 V295" stroke="#C3C9CA" strokeWidth="7" />
            <path d="M360 294 H542" stroke="#77818A" strokeWidth="5" />
            <rect x="287" y="118" width="146" height="94" rx="12" fill={"url(#" + doorGradient + ")"} filter={"url(#shadow-" + rawId + ")"} />
            <rect x="305" y="137" width="110" height="50" rx="6" fill="#161B20" />
            <circle cx="330" cy="162" r="8" fill="#25D366" />
            <path d="M150 310 H570 V378 H150 Z" fill={"url(#" + doorGradient + ")"} />
            {Array.from({ length: 3 }).map((_, index) => (
              <path key={index} d={"M154 " + (326 + index * 17) + " H566"} stroke={colors.highlight} strokeOpacity="0.25" />
            ))}
          </g>
        ) : null}

        {variant === "estructura" ? (
          <g>
            <rect x="104" y="110" width="18" height="270" fill="#222B31" />
            <rect x="598" y="110" width="18" height="270" fill="#222B31" />
            <path d="M86 122 L622 82 L648 142 L112 180 Z" fill="#A46D3D" opacity="0.52" />
            {Array.from({ length: 8 }).map((_, index) => (
              <path
                key={index}
                d={"M" + (100 + index * 70) + " 116 L" + (124 + index * 70) + " 165"}
                stroke="#20282E"
                strokeWidth="9"
              />
            ))}
            <path d="M98 105 L626 66" stroke="#2A3339" strokeWidth="12" />
            <path d="M112 180 L648 142" stroke="#2A3339" strokeWidth="10" />
            <rect x="122" y="220" width="470" height="158" fill="#31414A" opacity="0.45" />
          </g>
        ) : null}

        <rect width="720" height="390" fill={"url(#" + lightGradient + ")"} />
        <rect width="720" height="390" filter={"url(#" + noiseFilter + ")"} opacity="0.26" />
        <g>
          <rect x="46" y="142" width="25" height="56" rx="4" fill="#1B242A" />
          <circle cx="58" cy="151" r="22" fill="#FFD28A" opacity="0.16" />
          <rect x="649" y="142" width="25" height="56" rx="4" fill="#1B242A" />
          <circle cx="661" cy="151" r="22" fill="#FFD28A" opacity="0.16" />
        </g>
      </svg>
      {label ? (
        <span className="absolute bottom-2 right-2 rounded bg-navy-950/72 px-2 py-1 text-[10px] font-semibold text-white/65 backdrop-blur-sm">
          Referencia ilustrativa
        </span>
      ) : null}
    </div>
  );
}
