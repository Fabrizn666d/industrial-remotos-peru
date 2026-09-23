"use client";

import Image from "next/image";
import { useRef, useState, type PointerEvent } from "react";
import styles from "./InfiniteMediaRail.module.css";

export type MediaRailItem = { src: string; title: string; label: string; verifiedReal?: boolean };

export function InfiniteMediaRail({ items, direction, speed = 44, compact = false, ariaLabel }: { items: MediaRailItem[]; direction: "left" | "right"; speed?: number; compact?: boolean; ariaLabel: string }) {
  const railRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; scroll: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const loop = [...items, ...items];
  const move = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag.current || !railRef.current) return;
    railRef.current.scrollLeft = drag.current.scroll - (event.clientX - drag.current.x);
  };
  return <div ref={railRef} className={styles.rail} aria-label={ariaLabel} onPointerDown={(event) => { drag.current = { x: event.clientX, scroll: railRef.current?.scrollLeft ?? 0 }; setDragging(true); event.currentTarget.setPointerCapture(event.pointerId); }} onPointerMove={move} onPointerUp={() => { drag.current = null; setDragging(false); }} onPointerCancel={() => { drag.current = null; setDragging(false); }}>
    <div className={`${styles.track} ${direction === "right" ? styles.right : ""} ${dragging ? styles.paused : ""}`} style={{ "--rail-speed": `${speed}s` } as React.CSSProperties}>
      {loop.map((item, index) => <article className={`${styles.card} ${compact ? styles.compact : ""}`} key={`${item.src}-${index}`} aria-hidden={index >= items.length}>
        <Image src={item.src} alt={index < items.length ? item.title : ""} fill sizes={compact ? "(max-width:640px) 66vw, 340px" : "(max-width:640px) 78vw, 470px"} />
        <span className={styles.caption}><strong>{item.title}</strong><small>{item.verifiedReal ? item.label : "Referencia visual"}</small></span>
      </article>)}
    </div>
  </div>;
}
