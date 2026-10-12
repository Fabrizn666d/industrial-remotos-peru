"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { ServiceCharacterAsset } from "@/data/solution-editorial";
import styles from "./EditorialSolutionPage.module.css";

type CharacterPlacement = "hero" | "middle" | "quote";

export function ServiceCharacter({ asset, placement }: { asset: ServiceCharacterAsset; placement: CharacterPlacement }) {
  const reduceMotion = useReducedMotion();
  const [heroReady, setHeroReady] = useState(placement !== "hero");
  const placementClass = placement === "hero"
    ? styles.characterHero
    : placement === "middle"
      ? styles.characterMiddle
      : styles.characterQuote;

  useEffect(() => {
    if (placement !== "hero") return;
    const reveal = () => setHeroReady(true);
    if (document.documentElement.hasAttribute("data-irp-route-transition")) {
      window.addEventListener("irp:route-transition-complete", reveal, { once: true });
      return () => window.removeEventListener("irp:route-transition-complete", reveal);
    }
    const frame = requestAnimationFrame(reveal);
    return () => cancelAnimationFrame(frame);
  }, [placement]);

  return (
    <motion.figure
      className={`${styles.character} ${placementClass} ${asset.side === "left" ? styles.characterLeft : styles.characterRight}`}
      initial={{ opacity: 0, y: placement === "hero" ? 58 : 28 }}
      animate={placement === "hero" ? heroReady ? { opacity: 1, y: 0 } : { opacity: 0, y: reduceMotion ? 0 : 58 } : undefined}
      whileInView={placement === "hero" ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: placement === "hero" ? 0.08 : 0.25 }}
      transition={{ duration: reduceMotion ? 0 : placement === "hero" ? 0.82 : 0.62, ease: [0.16, 1, 0.3, 1] }}
    >
      <Image
        src={asset.src}
        alt={`Personaje de Industrial Remotos Perú: ${asset.message}`}
        width={1536}
        height={1024}
        priority={placement === "hero"}
        sizes={placement === "hero"
          ? "(max-width: 620px) 94vw, (max-width: 1100px) 52vw, 590px"
          : "(max-width: 620px) 94vw, (max-width: 1050px) 48vw, 390px"}
      />
    </motion.figure>
  );
}
