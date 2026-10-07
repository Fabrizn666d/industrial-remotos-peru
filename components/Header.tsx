"use client";

import { motion } from "framer-motion";
import {
  ArrowUpRight,
  BookOpenText,
  BriefcaseBusiness,
  ChevronDown,
  ChevronRight,
  Facebook,
  Instagram,
  Mail,
  Menu,
  MessageCircle,
  Music2,
  PanelsTopLeft,
  UsersRound,
  Wrench,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Logo } from "@/components/Logo";
import { useProject } from "@/components/ProjectContext";
import { navItems, serviceNavItems, siteConfig } from "@/data/site";
import { cn } from "@/lib/utils";
import { SiteSearch } from "@/components/SiteSearch";
import { motionDuration, motionEase } from "@/lib/motion";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

const mobileNavIcons: Record<string, LucideIcon> = {
  "/soluciones": Wrench,
  "/productos": BookOpenText,
  "/proyectos": PanelsTopLeft,
  "/nosotros": UsersRound,
  "/contacto": Mail,
};

export function Header() {
  const pathname = usePathname();
  const home = pathname === "/";
  const darkRoute = home || ["/cotizar", "/asistente", "/confirmacion", "/proyectos"].some((route) => pathname.startsWith(route));
  const [scrolled, setScrolled] = useState(!home);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLElement>(null);
  const { count, setDrawerOpen } = useProject();
  const reduceMotion = usePrefersReducedMotion();
  useEffect(() => {
    const update = () => setScrolled(!home || window.scrollY > 82);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [home]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.classList.toggle("overlay-open", menuOpen);
    if (menuOpen) requestAnimationFrame(() => closeButtonRef.current?.focus());
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setMenuOpen(false); menuButtonRef.current?.focus(); return; }
      if (event.key !== "Tab" || !menuOpen || !mobileMenuRef.current) return;
      const items = [...mobileMenuRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])")];
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("overlay-open");
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const light = darkRoute;

  return (
    <>
      <header className={cn("site-header", "site-header--unified", scrolled && "site-header--scrolled", light && "site-header--hero", darkRoute && "site-header--dark-route")}>
        <nav className="site-header__inner" aria-label="Navegación principal">
          <Link className="site-header__logo" href="/" aria-label="Ir al inicio"><Logo compact inverse={light && (!home || !scrolled)} /></Link>
          <div className="site-header__links">
            {navItems.map((item) =>
              item.label === "Soluciones" ? (
                <div className="nav-products" key={item.href}>
                  <Link className={cn("nav-link", pathname.startsWith(item.href) && "is-active")} href={item.href}>
                    {item.label} <ChevronDown size={13} />
                  </Link>
                  <div className="nav-products__menu">
                    {serviceNavItems.map((entry) => (
                      <Link key={entry.href + entry.label} href={entry.href}>{entry.label}</Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link className={cn("nav-link", pathname === item.href && "is-active")} key={item.href} href={item.href}>
                  {item.label}
                </Link>
              )
            )}
          </div>
          <div className="site-header__actions">
            <span className="header-site-search"><SiteSearch /></span>
            <a className="header-whatsapp-cta" href={siteConfig.social.whatsapp} target="_blank" rel="noreferrer" aria-label="Hablar por WhatsApp" data-analytics="whatsapp_click">
              <MessageCircle size={17} /><span>WhatsApp</span>
            </a>
            <Link className="header-quote-cta" href="/cotizar" data-analytics="configurator_start">Cotizar mi proyecto</Link>
            <button className="project-chip" type="button" onClick={() => setDrawerOpen(true)} aria-label={"Abrir Mi proyecto con " + count + " elementos"}>
              <BriefcaseBusiness size={17} />
              <span>Mi proyecto</span>
              <motion.b key={count} initial={reduceMotion ? false : { scale: .72 }} animate={{ scale: 1 }} transition={{ duration: motionDuration.micro, ease: motionEase.enter }}>{count}</motion.b>
            </button>
            <button
              ref={menuButtonRef}
              className="menu-toggle"
              type="button"
              aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-controls="mobile-menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((value) => !value)}
            >
              {menuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </nav>
      </header>

      <button
        className={cn("irp-mobile-menu__overlay", menuOpen && "is-open")}
        type="button"
        aria-label="Cerrar menú"
        tabIndex={-1}
        onClick={() => {
          setMenuOpen(false);
          requestAnimationFrame(() => menuButtonRef.current?.focus());
        }}
      />

      <aside
        ref={mobileMenuRef}
        id="mobile-menu"
        className={cn("irp-mobile-menu", menuOpen && "is-open")}
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
        aria-hidden={!menuOpen}
        inert={menuOpen ? undefined : true}
      >
        <header className="irp-mobile-menu__header">
          <Link className="irp-mobile-menu__brand" href="/" aria-label="Industrial Remotos Perú, inicio" onClick={() => setMenuOpen(false)}>
            <Logo compact priority />
          </Link>
          <button
            ref={closeButtonRef}
            type="button"
            aria-label="Cerrar menú"
            onClick={() => {
              setMenuOpen(false);
              requestAnimationFrame(() => menuButtonRef.current?.focus());
            }}
          >
            <X size={25} strokeWidth={1.55} />
          </button>
        </header>

        <div className="irp-mobile-menu__body">
          <nav className="irp-mobile-menu__links" aria-label="Navegación móvil">
            {navItems.filter((item) => item.href !== "/").map((item, index) => {
              const Icon = mobileNavIcons[item.href] ?? PanelsTopLeft;
              return (
                <Link
                  className={pathname.startsWith(item.href) ? "is-active" : ""}
                  style={{ "--mobile-menu-index": index } as CSSProperties}
                  href={item.href}
                  key={item.href}
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="irp-mobile-menu__link-icon"><Icon size={21} strokeWidth={1.55} /></span>
                  <strong>{item.label}</strong>
                  <ChevronRight className="irp-mobile-menu__chevron" size={20} strokeWidth={1.6} />
                </Link>
              );
            })}
          </nav>

          <div className="irp-mobile-menu__footer">
            <Link className="irp-mobile-menu__quote" href="/cotizar" onClick={() => setMenuOpen(false)}>
              <span><ArrowUpRight size={22} strokeWidth={1.6} /></span>
              <strong>Cotizar mi proyecto<small>Te respondemos a la brevedad</small></strong>
              <ChevronRight size={19} strokeWidth={1.6} />
            </Link>

            <a
              className="irp-mobile-menu__whatsapp"
              href={siteConfig.social.whatsapp}
              target="_blank"
              rel="noreferrer"
              onClick={() => setMenuOpen(false)}
            >
              <span aria-hidden="true"><MessageCircle size={21} strokeWidth={1.7} /></span>
              <strong>Escríbenos por WhatsApp</strong>
              <ChevronRight size={19} strokeWidth={1.6} />
            </a>

            <div className="irp-mobile-menu__socials" aria-label="Redes sociales">
              <a href={siteConfig.social.instagram} aria-label="Instagram" target="_blank" rel="noreferrer"><Instagram size={17} /></a>
              <a href={siteConfig.social.facebook} aria-label="Facebook" target="_blank" rel="noreferrer"><Facebook size={17} /></a>
              <a href={siteConfig.social.tiktok} aria-label="TikTok" target="_blank" rel="noreferrer"><Music2 size={17} /></a>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
