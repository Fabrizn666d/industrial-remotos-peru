"use client";

import { ArrowUpRight, MapPin, Phone, X } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type CSSProperties } from "react";
import { ContactExperience } from "@/components/ContactExperience";
import type { CompanyContent, ContactContent } from "@/lib/cms/content-contracts";
import { googleMapsEmbedUrl, safeGoogleMapsHref } from "@/lib/maps";
import styles from "./ContactDialog.module.css";

type ContactDialogContextValue = { openContact: (trigger?: HTMLElement | null, origin?: string) => void; closeContact: () => void; open: boolean };
const ContactDialogContext = createContext<ContactDialogContextValue | null>(null);

export function useContactDialog() {
  const value = useContext(ContactDialogContext);
  if (!value) throw new Error("useContactDialog debe usarse dentro de ContactDialogProvider");
  return value;
}

function WhatsappIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M16.02 3.2A12.7 12.7 0 0 0 5.18 22.5L3.5 28.63l6.28-1.65a12.69 12.69 0 1 0 6.24-23.78Zm0 22.97c-1.9 0-3.75-.52-5.36-1.5l-.38-.23-3.73.98 1-3.63-.25-.38a10.28 10.28 0 1 1 8.72 4.76Zm5.64-7.7c-.31-.15-1.83-.9-2.11-1-.28-.1-.49-.15-.7.16-.2.3-.8 1-.98 1.2-.18.2-.36.23-.67.08-.31-.16-1.3-.48-2.48-1.53a9.3 9.3 0 0 1-1.72-2.14c-.18-.31-.02-.48.14-.63.14-.14.31-.36.46-.54.16-.18.21-.31.31-.52.1-.2.05-.38-.02-.54-.08-.15-.7-1.67-.95-2.29-.25-.6-.51-.52-.7-.53h-.6c-.21 0-.55.08-.83.39-.28.3-1.08 1.05-1.08 2.57 0 1.51 1.1 2.98 1.26 3.18.15.2 2.17 3.31 5.25 4.64.73.32 1.3.5 1.75.65.74.23 1.4.2 1.93.12.59-.09 1.83-.75 2.09-1.47.26-.72.26-1.34.18-1.47-.07-.13-.28-.2-.59-.36Z" /></svg>;
}

function cssImage(value: string) {
  return value ? `url(${JSON.stringify(value)})` : "none";
}

export function ContactDialogProvider({ content, company, services, children }: { content: ContactContent; company: CompanyContent; services: Array<{ value: string; label: string }>; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const [originPage, setOriginPage] = useState("/");
  const panelRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const scrollRef = useRef(0);
  const routeHandled = useRef(false);

  const openContact = useCallback((trigger?: HTMLElement | null, origin?: string) => {
    triggerRef.current = trigger ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    setOriginPage(origin || `${location.pathname}${location.search}${location.hash}`);
    setOpen(true);
  }, []);

  const closeContact = useCallback(() => {
    setOpen(false);
    requestAnimationFrame(() => {
      const trigger = triggerRef.current;
      if (trigger?.closest("#mobile-menu")) document.querySelector<HTMLElement>(".menu-toggle")?.focus();
      else if (trigger?.isConnected) trigger.focus();
    });
    if (pathname === "/contacto") router.replace("/");
  }, [pathname, router]);

  useEffect(() => {
    const onContactLink = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
      if (!target || target.target === "_blank" || target.hasAttribute("download")) return;
      const url = new URL(target.href, location.href);
      if (url.origin !== location.origin || url.pathname !== "/contacto") return;
      event.preventDefault();
      requestAnimationFrame(() => openContact(target, `${location.pathname}${location.search}${location.hash}`));
    };
    const onCustomOpen = (event: Event) => {
      const detail = (event as CustomEvent<{ trigger?: HTMLElement; origin?: string }>).detail;
      openContact(detail?.trigger, detail?.origin);
    };
    document.addEventListener("click", onContactLink, true);
    window.addEventListener("irp:open-contact", onCustomOpen);
    return () => { document.removeEventListener("click", onContactLink, true); window.removeEventListener("irp:open-contact", onCustomOpen); };
  }, [openContact]);

  useEffect(() => {
    if (pathname === "/contacto" && !routeHandled.current) {
      routeHandled.current = true;
      requestAnimationFrame(() => openContact(null, "/contacto"));
    } else if (pathname !== "/contacto") routeHandled.current = false;
  }, [openContact, pathname]);

  useEffect(() => {
    if (!open) return;
    scrollRef.current = window.scrollY;
    const body = document.body;
    const previous = { position: body.style.position, top: body.style.top, width: body.style.width, overflow: body.style.overflow };
    body.style.position = "fixed";
    body.style.top = `-${scrollRef.current}px`;
    body.style.width = "100%";
    body.style.overflow = "hidden";
    panelRef.current?.focus({ preventScroll: true });
    requestAnimationFrame(() => {
      if (!panelRef.current?.contains(document.activeElement)) panelRef.current?.focus({ preventScroll: true });
    });
    return () => {
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.width = previous.width;
      body.style.overflow = previous.overflow;
      window.scrollTo(0, scrollRef.current);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); closeContact(); return; }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = [...panelRef.current.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter((item) => !item.hasAttribute("hidden"));
      const first = focusable[0], last = focusable.at(-1);
      if (!first || !last) { event.preventDefault(); panelRef.current.focus(); return; }
      if (event.shiftKey && (document.activeElement === first || document.activeElement === panelRef.current)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeContact, open]);

  const mapHref = safeGoogleMapsHref(company.mapUrl);
  const mapEmbed = googleMapsEmbedUrl(company.mapUrl, company.location || company.address);
  const showMap = content.showMap && Boolean(mapHref && mapEmbed);
  const locationName = company.location.split(/[–-]/).at(-1)?.trim() || company.location || "Villa El Salvador";
  const locationSubtitle = company.location.toLowerCase().includes("lima") ? "Lima, Perú" : company.address;
  const directWhatsapp = `https://wa.me/${company.whatsappNumber}?text=${encodeURIComponent(content.whatsappMessage)}`;
  const dialogStyle = {
    "--contact-desktop-image": cssImage(content.desktopBackground.src),
    "--contact-mobile-image": cssImage(content.mobileBackground.src),
    "--contact-desktop-position": content.desktopBackground.position,
    "--contact-mobile-position": content.mobileBackground.position
  } as CSSProperties;

  return <ContactDialogContext.Provider value={{ openContact, closeContact, open }}>
    {children}
    <motion.div className={styles.overlay} data-open={open ? "true" : "false"} aria-hidden={!open} initial={false} animate={{ opacity: open ? 1 : 0 }} transition={{ duration: reduceMotion ? 0.12 : 0.24, ease: [0.16, 1, 0.3, 1] }} onMouseDown={(event) => { if (event.target === event.currentTarget) closeContact(); }}>
      <motion.section ref={panelRef} className={styles.dialog} style={dialogStyle} role="dialog" aria-modal="true" aria-labelledby="contact-dialog-title" aria-describedby="contact-dialog-description" tabIndex={-1} inert={open ? undefined : true} initial={false} animate={{ opacity: open ? 1 : 0, y: open || reduceMotion ? 0 : 22, scale: open || reduceMotion ? 1 : 0.985 }} transition={{ duration: reduceMotion ? 0.12 : 0.42, ease: [0.16, 1, 0.3, 1] }}>
        <button className={styles.close} type="button" onClick={closeContact} aria-label="Cerrar ventana de contacto"><X /></button>
        <div className={styles.brandSignature} aria-label="Industrial Remotos Perú">
          <Image className={styles.brandLogo} src="/NUEVO/LOGO.png" alt="Industrial Remotos Perú" width={1254} height={1254} priority unoptimized />
        </div>
        <header className={styles.intro}>
          <span>{content.eyebrow}</span>
          <h1 id="contact-dialog-title"><span>{content.title}</span> <strong>{content.titleAccent}</strong></h1>
          <p id="contact-dialog-description">{content.description}</p>
        </header>
        {content.showWhatsapp && <article className={styles.whatsappCard}>
          <span className={styles.whatsappIcon}><WhatsappIcon /></span>
          <div><h2>{content.whatsappTitle}</h2><p>{content.whatsappDescription}</p></div>
          <a href={directWhatsapp} target="_blank" rel="noreferrer"><WhatsappIcon />{content.whatsappLabel}</a>
          <a className={styles.whatsappPhone} href={`tel:+${company.whatsappNumber}`}><Phone size={20} />{company.phoneDisplay}</a>
        </article>}
        <div className={styles.formColumn}>
          <ContactExperience content={content} company={company} originPage={originPage} services={services} />
        </div>
        <aside className={styles.side} aria-label="Canales directos y ubicación">
          {showMap && <article className={styles.locationCard}>
            <div className={styles.locationHeader}>
              <span><MapPin size={22} /></span>
              <p><strong>Visítanos en {locationName}</strong><small>{locationSubtitle}</small></p>
              <a href={mapHref} target="_blank" rel="noreferrer">Cómo llegar<ArrowUpRight size={17} /></a>
            </div>
            {open && <iframe title="Mapa de ubicación de Industrial Remotos Perú" src={mapEmbed} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />}
          </article>}
        </aside>
      </motion.section>
    </motion.div>
  </ContactDialogContext.Provider>;
}
