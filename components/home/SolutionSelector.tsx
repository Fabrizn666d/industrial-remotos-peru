"use client";

import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useId, useState } from "react";
import { solutions } from "@/data/solutions";
import styles from "./SolutionSelector.module.css";

type SolutionSelectorProps = {
  tone?: "light" | "dark";
  labelledBy?: string;
};

export function SolutionSelector({ tone = "light", labelledBy }: SolutionSelectorProps) {
  const generatedId = useId();
  const [activeId, setActiveId] = useState(solutions[0]?.id ?? "");
  const active = solutions.find((solution) => solution.id === activeId) ?? solutions[0];

  if (!active) return null;

  return (
    <div className={`${styles.selector} ${styles[tone]}`} aria-labelledby={labelledBy}>
      <div className={styles.stage}>
        <Image
          key={active.image}
          src={active.image}
          alt={active.title}
          fill
          priority={active.id === solutions[0]?.id}
          sizes="(min-width: 1100px) 980px, (min-width: 700px) 92vw, 100vw"
          className={styles.stageImage}
        />
        <div className={styles.stageShade} aria-hidden="true" />
        <div className={styles.stageCopy}>
          <span>{active.kicker}</span>
          <h3>{active.title}</h3>
          <p>{active.description}</p>
          <Link href={active.href}>
            Explorar solución <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </div>
        <span className={styles.counter} aria-hidden="true">
          {String(solutions.findIndex((solution) => solution.id === active.id) + 1).padStart(2, "0")}
          <i />
          {String(solutions.length).padStart(2, "0")}
        </span>
      </div>

      <div className={styles.tabs} role="tablist" aria-label="Categorías de soluciones">
        {solutions.map((solution, index) => {
          const selected = solution.id === active.id;
          const tabId = `${generatedId}-${solution.id}`;
          return (
            <button
              key={solution.id}
              id={tabId}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`${generatedId}-panel`}
              className={selected ? styles.activeTab : undefined}
              onClick={() => setActiveId(solution.id)}
              onPointerEnter={(event) => {
                if (event.pointerType !== "touch") setActiveId(solution.id);
              }}
            >
              <small>{String(index + 1).padStart(2, "0")}</small>
              <span>{solution.title}</span>
            </button>
          );
        })}
      </div>
      <div id={`${generatedId}-panel`} role="tabpanel" aria-live="polite" className={styles.srPanel}>
        {active.title}: {active.description}
      </div>
    </div>
  );
}
