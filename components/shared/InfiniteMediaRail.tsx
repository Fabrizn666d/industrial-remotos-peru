"use client";

import Image from "next/image";
import { useRef, useState, type PointerEvent } from "react";
import styles from "./InfiniteMediaRail.module.css";

export type MediaRailItem = { src: string; title: string; label: string; verifiedReal?: boolean };

export function InfiniteMediaRail({ items, direction, speed = 58, compact = false, ariaLabel }: { items: MediaRailItem[]; direction: "left" | "right"; speed?: number; compact?: boolean; ariaLabel: string }) {
  const railRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; scroll: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const uniqueItems = items.filter((item, index, collection) => collection.findIndex((candidate) => candidate.src === item.src) === index);
  const loop = [...uniqueItems, ...uniqueItems];
  const move = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag.current || !railRef.current) return;
    railRef.current.scrollLeft = drag.current.scroll - (event.clientX - drag.current.x);
  };
  if (uniqueItems.length === 1) {
    const item = uniqueItems[0];
    return <div className={`${styles.single} ${compact ? styles.singleCompact : ""}`} aria-label={ariaLabel}>
      <article className={styles.singleCard}>
        <Image src={item.src} alt={item.title} fill sizes={compact ? "(max-width:640px) 88vw, 620px" : "(max-width:640px) 92vw, 980px"} />
        <span className={styles.caption}><strong>{item.title}</strong><small>{item.verifiedReal ? item.label : "Referencia visual"}</small></span>
      </article>
    </div>;
  }
  return <div ref={railRef} className={styles.rail} aria-label={ariaLabel} onPointerDown={(event) => { drag.current = { x: event.clientX, scroll: railRef.current?.scrollLeft ?? 0 }; setDragging(true); event.currentTarget.setPointerCapture(event.pointerId); }} onPointerMove={move} onPointerUp={() => { drag.current = null; setDragging(false); }} onPointerCancel={() => { drag.current = null; setDragging(false); }}>
    <div className={`${styles.track} ${direction === "right" ? styles.right : ""} ${dragging ? styles.paused : ""}`} style={{ "--rail-speed": `${speed}s` } as React.CSSProperties}>
      {loop.map((item, index) => <article className={`${styles.card} ${compact ? styles.compact : ""}`} key={`${item.src}-${index}`} aria-hidden={index >= uniqueItems.length}>
        <Image src={item.src} alt={index < uniqueItems.length ? item.title : ""} fill sizes={compact ? "(max-width:640px) 66vw, 340px" : "(max-width:640px) 78vw, 500px"} />
        <span className={styles.caption}><strong>{item.title}</strong><small>{item.verifiedReal ? item.label : "Referencia visual"}</small></span>
      </article>)}
    </div>
  </div>;
}
