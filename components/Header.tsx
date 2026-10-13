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

function WhatsAppIcon({ className, size = 17 }: { className?: string; size?: number }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.15 1.59 5.95L.06 24l6.34-1.66a11.87 11.87 0 0 0 5.65 1.44h.01c6.55 0 11.89-5.34 11.89-11.89A11.86 11.86 0 0 0 12.05 0Zm0 21.78h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.87 9.87 0 0 1-1.51-5.26c0-5.45 4.43-9.88 9.88-9.88 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.89 6.99c0 5.45-4.43 9.88-9.87 9.88Zm5.42-7.4c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.08-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35Z"
      />
    </svg>
  );
}

export function Header() {
  const pathname = usePathname();
  const home = pathname === "/";
  const darkRoute = home || ["/cotizar", "/asistente", "/confirmacion", "/proyectos"].some((route) => pathname.startsWith(route));
  const [scrolled, setScrolled] = useState(!home);
  const [menuOpen, setMenuOpen] = useState(false);
  const [desktopMenusSuppressed, setDesktopMenusSuppressed] = useState(false);
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
    const closeNavigationUi = () => {
      setMenuOpen(false);
      setDesktopMenusSuppressed(true);
      setDrawerOpen(false);
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    };
    window.addEventListener("irp:route-transition-start", closeNavigationUi);
    return () => window.removeEventListener("irp:route-transition-start", closeNavigationUi);
  }, [setDrawerOpen]);

  useEffect(() => {
    if (!desktopMenusSuppressed) return;
    const releaseAfterPointerLeaves = (event: PointerEvent) => {
      if (document.documentElement.hasAttribute("data-irp-route-transition")) return;
      const target = event.target;
      if (!(target instanceof Element) || !target.closest(".nav-products")) setDesktopMenusSuppressed(false);
    };
    document.addEventListener("pointermove", releaseAfterPointerLeaves, { passive: true });
    return () => document.removeEventListener("pointermove", releaseAfterPointerLeaves);
  }, [desktopMenusSuppressed]);

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
          <Link className="site-header__logo" href="/" aria-label="Ir al inicio" data-route-transition><Logo compact inverse={light && (!home || !scrolled)} /></Link>
          <div className="site-header__links">
            {navItems.map((item) =>
              item.label === "Soluciones" ? (
                <div className={cn("nav-products", desktopMenusSuppressed && "nav-products--suppressed")} key={item.href}>
                  <Link className={cn("nav-link", pathname.startsWith(item.href) && "is-active")} href={item.href} data-route-transition>
                    {item.label} <ChevronDown size={13} />
                  </Link>
                  <div className="nav-products__menu">
                    {serviceNavItems.map((entry) => (
                      <Link key={entry.href + entry.label} href={entry.href} data-route-transition>{entry.label}</Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link className={cn("nav-link", pathname === item.href && "is-active")} key={item.href} href={item.href} data-route-transition>
                  {item.label}
                </Link>
              )
            )}
          </div>
          <div className="site-header__actions">
            <span className="header-site-search"><SiteSearch /></span>
            <a className="header-whatsapp-cta" href={siteConfig.social.whatsapp} target="_blank" rel="noreferrer" aria-label="Hablar por WhatsApp" data-analytics="whatsapp_click">
              <WhatsAppIcon /><span>WhatsApp</span>
            </a>
            <Link className="header-quote-cta" href="/cotizar" data-analytics="configurator_start" data-route-transition>Cotizar mi proyecto</Link>
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
          <Link className="irp-mobile-menu__brand" href="/" aria-label="Industrial Remotos Perú, inicio" data-route-transition onClick={() => setMenuOpen(false)}>
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
                  data-route-transition
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
            <Link className="irp-mobile-menu__quote" href="/cotizar" data-route-transition onClick={() => setMenuOpen(false)}>
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
              <span aria-hidden="true"><WhatsAppIcon size={21} /></span>
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
