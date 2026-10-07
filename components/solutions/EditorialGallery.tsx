"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "./EditorialSolutionPage.module.css";

type EditorialGalleryProps = {
  images: string[];
  title: string;
};

export function EditorialGallery({ images, title }: EditorialGalleryProps) {
  const [active, setActive] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (active === null) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActive(null);
      if (event.key === "ArrowLeft") setActive((value) => value === null ? null : (value - 1 + images.length) % images.length);
      if (event.key === "ArrowRight") setActive((value) => value === null ? null : (value + 1) % images.length);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      openerRef.current?.focus();
    };
  }, [active, images.length]);

  const open = (index: number, button: HTMLButtonElement) => {
    openerRef.current = button;
    setActive(index);
  };

  return (
    <>
      <div className={styles.galleryGrid}>
        {images.map((src, index) => (
          <button
            className={styles.galleryItem}
            key={`${src}-${index}`}
            type="button"
            onClick={(event) => open(index, event.currentTarget)}
            aria-label={`Ampliar imagen ${index + 1} de ${title}`}
          >
            <Image src={src} alt={`Referencia visual ${index + 1} de ${title}`} fill sizes="(min-width: 1000px) 42vw, (min-width: 640px) 50vw, 100vw" />
            <span>Referencia visual · ampliar</span>
          </button>
        ))}
      </div>

      {active !== null && (
        <div className={styles.lightbox} role="dialog" aria-modal="true" aria-label={`Galería ampliada de ${title}`} onMouseDown={(event) => { if (event.target === event.currentTarget) setActive(null); }}>
          <button ref={closeRef} className={styles.lightboxClose} type="button" onClick={() => setActive(null)} aria-label="Cerrar galería"><X /></button>
          <button className={`${styles.lightboxNav} ${styles.lightboxPrevious}`} type="button" onClick={() => setActive((active - 1 + images.length) % images.length)} aria-label="Imagen anterior"><ChevronLeft /></button>
          <div className={styles.lightboxMedia}>
            <Image src={images[active]} alt={`Referencia visual ampliada ${active + 1} de ${title}`} fill sizes="95vw" priority />
            <p>{title} · imagen referencial {active + 1} de {images.length}</p>
          </div>
          <button className={`${styles.lightboxNav} ${styles.lightboxNext}`} type="button" onClick={() => setActive((active + 1) % images.length)} aria-label="Imagen siguiente"><ChevronRight /></button>
        </div>
      )}
    </>
  );
}
