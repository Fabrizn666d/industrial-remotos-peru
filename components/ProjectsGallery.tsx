"use client";

import { ArrowUpRight, ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { ProjectsContent } from "@/lib/cms/content-contracts";
import styles from "./ProjectsGallery.module.css";

type GalleryItem = ProjectsContent["items"][number];
const objectPosition = { center: "center", top: "center top", bottom: "center bottom", left: "left center", right: "right center" } as const;

export function ProjectsGallery({ title, items }: { title: string; items: GalleryItem[] }) {
  const [active, setActive] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const count = items.length;

  useEffect(() => {
    if (active === null) return;
    previousFocus.current = document.activeElement as HTMLElement | null;
    const scrollY = window.scrollY;
    const body = document.body;
    const prior = { position: body.style.position, top: body.style.top, width: body.style.width, overflow: body.style.overflow };
    body.style.position = "fixed"; body.style.top = `-${scrollY}px`; body.style.width = "100%"; body.style.overflow = "hidden";
    const dialog = dialogRef.current;
    requestAnimationFrame(() => dialog?.querySelector<HTMLElement>("button")?.focus());
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActive(null);
      if (event.key === "ArrowLeft") setActive((value) => value === null ? null : (value - 1 + count) % count);
      if (event.key === "ArrowRight") setActive((value) => value === null ? null : (value + 1) % count);
      if (event.key === "Tab" && dialog) {
        const controls = [...dialog.querySelectorAll<HTMLElement>("button:not([disabled])")];
        const first = controls[0]; const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    window.addEventListener("keydown", keydown);
    return () => { body.style.position = prior.position; body.style.top = prior.top; body.style.width = prior.width; body.style.overflow = prior.overflow; window.scrollTo(0,scrollY); window.removeEventListener("keydown", keydown); previousFocus.current?.focus(); };
  }, [active === null, count]);

  if (!items.length) return <section className={styles.empty}><p>La galería todavía no tiene imágenes publicadas.</p></section>;
  const selected = active === null ? null : items[active];
  const move = (direction: -1 | 1) => setActive((value) => value === null ? null : (value + direction + count) % count);

  return <section className={styles.gallery} aria-labelledby="projects-title" data-motion-hero data-motion-section><header data-motion-hero-item data-motion-direction="up"><h1 id="projects-title">{title}</h1><i aria-hidden="true" /></header><div className={styles.grid}>{items.map((item, index) => <button type="button" className={styles.tile} data-motion-item data-motion-direction="up" data-motion-observe-self onClick={() => setActive(index)} aria-label={`Ampliar imagen ${index + 1} de ${count}`} key={item.id}><Image src={item.image.src} alt={item.image.alt} fill priority={index < 3} data-transition-essential={index < 3 || undefined} sizes="(min-width: 1100px) 56vw, (min-width: 680px) 50vw, 100vw" style={{ objectPosition: objectPosition[item.image.position] }} /><span aria-hidden="true"><ArrowUpRight /></span></button>)}</div>{selected && <div className={styles.backdrop} role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) setActive(null); }}><div className={styles.dialog} ref={dialogRef} role="dialog" aria-modal="true" aria-label={`Imagen ampliada ${active! + 1} de ${count}`}><Image src={selected.image.src} alt={selected.image.alt} fill priority sizes="96vw" style={{ objectPosition: objectPosition[selected.image.position] }} /><button className={styles.close} type="button" onClick={() => setActive(null)} aria-label="Cerrar visor"><X /></button>{count > 1 && <><button className={styles.previous} type="button" onClick={() => move(-1)} aria-label="Imagen anterior"><ChevronLeft /></button><button className={styles.next} type="button" onClick={() => move(1)} aria-label="Imagen siguiente"><ChevronRight /></button></>}<span className={styles.counter} aria-hidden="true">{active! + 1} / {count}</span></div></div>}</section>;
}
