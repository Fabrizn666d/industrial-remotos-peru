"use client";

import { Search, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { searchIndex } from "@/data/search-index";
import styles from "./SiteSearch.module.css";

function normalize(value: string) { return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }

export function SiteSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const results = useMemo(() => {
    const term = normalize(query.trim());
    if (!term) return searchIndex.slice(0, 6);
    return searchIndex.filter((item) => normalize(`${item.title} ${item.summary} ${item.keywords}`).includes(term)).slice(0, 10);
  }, [query]);

  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if ((event.key === "/" || ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k")) && !/INPUT|TEXTAREA|SELECT/.test(target.tagName)) { event.preventDefault(); setOpen(true); }
    };
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => inputRef.current?.focus());
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
      if (event.key !== "Tab" || !dialogRef.current) return;
      const items = [...dialogRef.current.querySelectorAll<HTMLElement>("input, button, a[href]")];
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    window.addEventListener("keydown", keydown);
    return () => { document.body.style.overflow = previous; window.removeEventListener("keydown", keydown); triggerRef.current?.focus(); };
  }, [open]);

  function choose() { setOpen(false); window.dispatchEvent(new CustomEvent("irp:analytics", { detail: { name: "search", parameters: { has_query: Number(Boolean(query)) } } })); }

  return <>
    <button ref={triggerRef} className={styles.trigger} type="button" aria-label="Buscar en el sitio" title="Buscar (Ctrl+K)" onClick={() => setOpen(true)}><Search size={18} /></button>
    {open && <div className={styles.backdrop} onMouseDown={(event) => event.target === event.currentTarget && setOpen(false)}><div ref={dialogRef} className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="site-search-title"><button className={styles.close} type="button" aria-label="Cerrar búsqueda" onClick={() => setOpen(false)}><X size={18} /></button><h2 id="site-search-title">Buscar en Industrial Remotos</h2><label className={styles.field}><Search size={19} /><input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Soluciones, productos o proyectos…" aria-label="Término de búsqueda" /></label><div className={styles.results} aria-live="polite">{results.length ? results.map((item, index) => <Link key={`${item.type}-${item.title}-${index}`} href={item.href} onClick={choose}><small>{item.type}</small><strong>{item.title}</strong><p>{item.summary}</p></Link>) : <p className={styles.empty}>No encontramos resultados. Prueba con “puerta”, “techo”, “mampara” o “reclamo”.</p>}</div></div></div>}
  </>;
}
