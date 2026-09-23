"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import styles from "./PrivacyRuntime.module.css";

const CONSENT_KEY = "irp_cookie_consent_v1";
const UTM_KEY = "irp_utm_v1";
type Preferences = { necessary: true; analytics: boolean; optional: boolean; savedAt: string };

function readPreferences(): Preferences | null {
  try { return JSON.parse(localStorage.getItem(CONSENT_KEY) || "null") as Preferences | null; } catch { return null; }
}

function loadAnalytics() {
  const id = process.env.NEXT_PUBLIC_ANALYTICS_ID?.trim();
  if (!id || document.querySelector(`[data-irp-analytics="${id}"]`)) return;
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  script.dataset.irpAnalytics = id;
  document.head.appendChild(script);
  const win = window as Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };
  win.dataLayer = win.dataLayer || [];
  win.gtag = (...args: unknown[]) => { win.dataLayer!.push(args); };
  win.gtag("js", new Date());
  win.gtag("config", id, { anonymize_ip: true });
}

export function PrivacyRuntime() {
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [configuring, setConfiguring] = useState(false);
  const [draft, setDraft] = useState({ analytics: false, optional: false });
  const dialogRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const stored = readPreferences();
    setPreferences(stored);
    if (stored) setDraft({ analytics: stored.analytics, optional: stored.optional });
    if (stored?.analytics) loadAnalytics();
    setHydrated(true);

    const params = new URLSearchParams(location.search);
    const utm = Object.fromEntries(["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].flatMap((key) => {
      const value = params.get(key)?.slice(0, 180);
      return value ? [[key, value]] : [];
    }));
    if (Object.keys(utm).length) sessionStorage.setItem(UTM_KEY, JSON.stringify(utm));

    const open = () => { openerRef.current = document.activeElement as HTMLElement; setConfiguring(true); };
    window.addEventListener("irp:open-cookie-settings", open);
    return () => window.removeEventListener("irp:open-cookie-settings", open);
  }, []);

  useEffect(() => {
    const track = (event: Event) => {
      if (!readPreferences()?.analytics) return;
      const detail = (event as CustomEvent<{ name?: string; parameters?: Record<string, string | number> }>).detail;
      if (!detail?.name) return;
      const win = window as Window & { gtag?: (...args: unknown[]) => void };
      win.gtag?.("event", detail.name, detail.parameters || {});
    };
    window.addEventListener("irp:analytics", track);
    return () => window.removeEventListener("irp:analytics", track);
  }, []);

  useEffect(() => {
    const click = (event: MouseEvent) => {
      const target = (event.target as HTMLElement).closest<HTMLElement>("[data-analytics]");
      if (!target) return;
      window.dispatchEvent(new CustomEvent("irp:analytics", { detail: { name: target.dataset.analytics } }));
    };
    document.addEventListener("click", click);
    return () => document.removeEventListener("click", click);
  }, []);

  useEffect(() => {
    if (!configuring) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const dialog = dialogRef.current;
    dialog?.querySelector<HTMLElement>("button")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setConfiguring(false);
      if (event.key !== "Tab" || !dialog) return;
      const focusable = [...dialog.querySelectorAll<HTMLElement>("button, input, a[href]")];
      if (!focusable.length) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", onKey); openerRef.current?.focus(); };
  }, [configuring]);

  function save(analytics: boolean, optional: boolean) {
    const next: Preferences = { necessary: true, analytics, optional, savedAt: new Date().toISOString() };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(next));
    setPreferences(next); setDraft({ analytics, optional }); setConfiguring(false);
    if (analytics) loadAnalytics();
    window.dispatchEvent(new CustomEvent("irp:analytics", { detail: { name: "cookie_consent", parameters: { analytics: Number(analytics), optional: Number(optional) } } }));
  }

  if (!hydrated) return null;
  return (
    <>
      {!preferences && !configuring && <section className={styles.banner} aria-labelledby="cookie-title"><div><h2 id="cookie-title">Tu privacidad, bajo control</h2><p>Usamos almacenamiento necesario para que el sitio funcione. Las cookies analíticas son opcionales y solo se activan con tu permiso.</p></div><div className={styles.actions}><button type="button" onClick={() => save(false, false)}>Rechazar no esenciales</button><button type="button" onClick={() => { openerRef.current = document.activeElement as HTMLElement; setConfiguring(true); }}>Configurar</button><button className={styles.primary} type="button" onClick={() => save(true, true)}>Aceptar todas</button></div></section>}
      {configuring && <div className={styles.backdrop} onMouseDown={(event) => event.target === event.currentTarget && setConfiguring(false)}><div ref={dialogRef} className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="cookie-settings-title"><button className={styles.close} type="button" aria-label="Cerrar preferencias" onClick={() => setConfiguring(false)}><X size={19} /></button><h2 id="cookie-settings-title">Preferencias de privacidad</h2><p>Elige qué categorías deseas permitir. Puedes volver a esta pantalla desde el footer.</p><div className={styles.preference}><div><strong>Necesarias</strong><p>Permiten recordar tu proyecto, seguridad y preferencias esenciales. Siempre activas.</p></div><input type="checkbox" checked disabled aria-label="Cookies necesarias activas" /></div><label className={styles.preference}><div><strong>Analíticas</strong><p>Ayudan a entender el uso del sitio con datos agregados. No incluyen documentos, reclamos ni datos del formulario.</p></div><input type="checkbox" checked={draft.analytics} onChange={(e) => setDraft((value) => ({ ...value, analytics: e.target.checked }))} /></label><label className={styles.preference}><div><strong>Opcionales</strong><p>Reservadas para futuras integraciones no esenciales. Actualmente no se carga ninguna.</p></div><input type="checkbox" checked={draft.optional} onChange={(e) => setDraft((value) => ({ ...value, optional: e.target.checked }))} /></label><button className={styles.save} type="button" onClick={() => save(draft.analytics, draft.optional)}>Guardar preferencia</button></div></div>}
    </>
  );
}
