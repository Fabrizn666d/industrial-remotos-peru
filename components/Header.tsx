"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BriefcaseBusiness, ChevronDown, Facebook, Instagram, Menu, MessageCircle, Music2, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { useProject } from "@/components/ProjectContext";
import { navItems, serviceNavItems, siteConfig } from "@/data/site";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const home = pathname === "/";
  const darkRoute = home || ["/cotizar", "/asistente", "/confirmacion", "/proyectos"].some((route) => pathname.startsWith(route));
  const [scrolled, setScrolled] = useState(!home);
  const [menuOpen, setMenuOpen] = useState(false);
  const { count, setDrawerOpen } = useProject();

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
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setMenuOpen(false);
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
            <a className="header-whatsapp-cta" href={siteConfig.social.whatsapp} target="_blank" rel="noreferrer" aria-label="Hablar por WhatsApp">
              <MessageCircle size={17} /><span>WhatsApp</span>
            </a>
            <Link className="header-quote-cta" href="/cotizar">Cotizar mi proyecto</Link>
            <button className="project-chip" type="button" onClick={() => setDrawerOpen(true)} aria-label={"Abrir Mi proyecto con " + count + " elementos"}>
              <BriefcaseBusiness size={17} />
              <span>Mi proyecto</span>
              <b>{count}</b>
            </button>
            <button className="menu-toggle" type="button" aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"} onClick={() => setMenuOpen((value) => !value)}>
              {menuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div className="mobile-nav" id="mobile-menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="mobile-nav__sheet" initial={{ y: -28, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} transition={{ duration: .42, ease: [0.2, .75, 0, 1] }}>
              <span className="eyebrow">Explora Industrial Remotos</span>
              <div className="mobile-nav__links">
                {navItems.map((item, index) => (
                  <Link href={item.href} key={item.href} onClick={() => setMenuOpen(false)}>
                    <small>0{index + 1}</small><span>{item.label}</span><i>↗</i>
                  </Link>
                ))}
              </div>
              <div className="mobile-nav__actions">
                <a href={siteConfig.social.whatsapp} target="_blank" rel="noreferrer" onClick={() => setMenuOpen(false)}><MessageCircle size={17} /> Hablar por WhatsApp</a>
                <Link href="/cotizar" onClick={() => setMenuOpen(false)}>Cotizar mi proyecto</Link>
              </div>
              <div className="mobile-nav__footer">
                <p>{siteConfig.hours}</p>
                <div className="mobile-nav__socials"><a href={siteConfig.social.facebook} aria-label="Facebook" target="_blank" rel="noreferrer"><Facebook size={17} /></a><a href={siteConfig.social.instagram} aria-label="Instagram" target="_blank" rel="noreferrer"><Instagram size={17} /></a><a href={siteConfig.social.tiktok} aria-label="TikTok" target="_blank" rel="noreferrer"><Music2 size={17} /></a><a href={siteConfig.social.whatsapp} aria-label="WhatsApp" target="_blank" rel="noreferrer"><MessageCircle size={17} /></a></div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
