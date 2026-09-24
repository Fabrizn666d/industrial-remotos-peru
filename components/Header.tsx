"use client";

import { AnimatePresence, motion, type Variants } from "framer-motion";
import { BriefcaseBusiness, ChevronDown, Facebook, Instagram, Menu, MessageCircle, Music2, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Logo } from "@/components/Logo";
import { useProject } from "@/components/ProjectContext";
import { navItems, serviceNavItems, siteConfig } from "@/data/site";
import { cn } from "@/lib/utils";
import { SiteSearch } from "@/components/SiteSearch";
import { createFadeUpVariants, createStaggerContainer, motionDuration, motionEase } from "@/lib/motion";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

const MotionLink = motion.create(Link);

export function Header() {
  const pathname = usePathname();
  const home = pathname === "/";
  const darkRoute = home || ["/cotizar", "/asistente", "/confirmacion", "/proyectos"].some((route) => pathname.startsWith(route));
  const [scrolled, setScrolled] = useState(!home);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLElement>(null);
  const { count, setDrawerOpen } = useProject();
  const reduceMotion = usePrefersReducedMotion();
  const mobileList = useMemo(() => createStaggerContainer(reduceMotion, .08), [reduceMotion]);
  const mobileItem = useMemo(() => createFadeUpVariants(reduceMotion, { distance: 22, duration: .62 }), [reduceMotion]);
  const mobileExtras = useMemo<Variants>(() => ({
    hidden: reduceMotion ? { opacity: 0 } : { opacity: 0, y: 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reduceMotion ? motionDuration.reduced : .62, delay: reduceMotion ? 0 : .32, ease: motionEase.enter }
    }
  }), [reduceMotion]);

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
    if (menuOpen) requestAnimationFrame(() => mobileMenuRef.current?.querySelector<HTMLElement>("a, button")?.focus());
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
      <header className={cn("site-header", scrolled && "site-header--scrolled", light && "site-header--hero", darkRoute && "site-header--dark-route")}>
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
            <SiteSearch />
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

      <AnimatePresence>
        {menuOpen && (
          <motion.nav ref={mobileMenuRef} className="mobile-nav" id="mobile-menu" aria-label="Navegación móvil" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduceMotion ? motionDuration.reduced : .32, ease: motionEase.enter }}>
            <motion.div className="mobile-nav__sheet" initial={reduceMotion ? { opacity: 0 } : { y: -28, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={reduceMotion ? { opacity: 0 } : { y: -20, opacity: 0 }} transition={{ duration: reduceMotion ? motionDuration.reduced : .48, ease: motionEase.enter }}>
              <span className="eyebrow">Explora Industrial Remotos</span>
              <motion.div className="mobile-nav__links" variants={mobileList} initial="hidden" animate="visible">
                {navItems.map((item, index) => (
                  <MotionLink variants={mobileItem} href={item.href} key={item.href} onClick={() => setMenuOpen(false)}>
                    <small>0{index + 1}</small><span>{item.label}</span><i>↗</i>
                  </MotionLink>
                ))}
              </motion.div>
              <motion.div className="mobile-nav__actions" variants={mobileExtras} initial="hidden" animate="visible">
                <a href={siteConfig.social.whatsapp} target="_blank" rel="noreferrer" onClick={() => setMenuOpen(false)}><MessageCircle size={17} /> Hablar por WhatsApp</a>
                <Link href="/cotizar" onClick={() => setMenuOpen(false)}>Cotizar mi proyecto</Link>
                <button type="button" onClick={() => { setMenuOpen(false); setDrawerOpen(true); }}>
                  <BriefcaseBusiness size={17} /> Mi proyecto <b>{count}</b>
                </button>
              </motion.div>
              <motion.div className="mobile-nav__footer" variants={mobileExtras} initial="hidden" animate="visible">
                {siteConfig.hours && <p>{siteConfig.hours}</p>}
                <div className="mobile-nav__socials"><a href={siteConfig.social.facebook} aria-label="Facebook" target="_blank" rel="noreferrer"><Facebook size={17} /></a><a href={siteConfig.social.instagram} aria-label="Instagram" target="_blank" rel="noreferrer"><Instagram size={17} /></a><a href={siteConfig.social.tiktok} aria-label="TikTok" target="_blank" rel="noreferrer"><Music2 size={17} /></a><a href={siteConfig.social.whatsapp} aria-label="WhatsApp" target="_blank" rel="noreferrer"><MessageCircle size={17} /></a></div>
              </motion.div>
            </motion.div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
