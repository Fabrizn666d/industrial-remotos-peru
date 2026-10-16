"use client";

import {
  Activity,
  BookOpenCheck,
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  ExternalLink,
  FileImage,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Palette,
  Search,
  Settings2,
  UsersRound,
  X,
  type LucideIcon
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Logo } from "@/components/Logo";
import type { AdminSession } from "@/lib/backend/contracts";
import styles from "./AdminShell.module.css";

type NavigationItem = {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
  exact: boolean;
};

type NavigationSection = {
  id: "general" | "commercial" | "catalog" | "content" | "system";
  label: string;
  collapsible: boolean;
  items: NavigationItem[];
};

const sections: NavigationSection[] = [
  {
    id: "general",
    label: "",
    collapsible: false,
    items: [{ href: "/admin", label: "Resumen", description: "Pendientes y actividad", icon: LayoutDashboard, exact: true }]
  },
  {
    id: "commercial",
    label: "Gestión comercial",
    collapsible: true,
    items: [
      { href: "/admin/solicitudes", label: "Solicitudes", description: "Atención y seguimiento", icon: ClipboardList, exact: false },
      { href: "/admin/cotizaciones", label: "Cotizaciones", description: "Borradores y proformas", icon: FileText, exact: false },
      { href: "/admin/clientes", label: "Clientes", description: "Contactos e historial", icon: UsersRound, exact: false },
      { href: "/admin/reclamos", label: "Reclamos", description: "Atención al consumidor", icon: BookOpenCheck, exact: false }
    ]
  },
  {
    id: "catalog",
    label: "Catálogo",
    collapsible: true,
    items: [
      { href: "/admin/configuracion/cotizador", label: "Cotizador inteligente", description: "Servicios, tipos y precios", icon: Settings2, exact: false },
      { href: "/admin/configuracion/productos-cotizacion", label: "Productos de proforma", description: "Plantillas comerciales", icon: Package, exact: false }
    ]
  },
  {
    id: "content",
    label: "Contenido",
    collapsible: true,
    items: [
      { href: "/admin/contenido", label: "Páginas y secciones", description: "Borradores y publicaciones", icon: FileText, exact: true },
      { href: "/admin/contenido/biblioteca", label: "Biblioteca", description: "Imágenes y videos", icon: FileImage, exact: false }
    ]
  },
  {
    id: "system",
    label: "Sistema",
    collapsible: true,
    items: [
      { href: "/admin/configuracion/empresa", label: "Empresa y contacto", description: "Datos generales", icon: Building2, exact: false },
      { href: "/admin/configuracion/apariencia", label: "Apariencia", description: "Marca y transición", icon: Palette, exact: false },
      { href: "/admin/usuarios", label: "Usuarios y permisos", description: "Cuentas del equipo", icon: UsersRound, exact: false },
      { href: "/admin/actividad", label: "Actividad", description: "Historial de cambios", icon: Activity, exact: false }
    ]
  }
];

const defaultOpenGroups: Record<NavigationSection["id"], boolean> = {
  general: true,
  commercial: true,
  catalog: true,
  content: true,
  system: true
};

function isAllowed(item: NavigationItem, role: AdminSession["role"]) {
  if (item.href === "/admin/usuarios") return role === "SUPER_ADMIN";
  return role !== "COMMERCIAL" || (!item.href.startsWith("/admin/configuracion") && !item.href.startsWith("/admin/contenido"));
}

function isActive(pathname: string, item: NavigationItem) {
  return item.exact ? pathname === item.href : pathname.startsWith(item.href);
}

function roleLabel(role: AdminSession["role"]) {
  if (role === "SUPER_ADMIN") return "Superadministrador";
  if (role === "ADMIN") return "Administrador";
  return "Comercial";
}

export function AdminShell({ session, children }: { session: AdminSession; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const searchInput = useRef<HTMLInputElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const drawerCloseRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLButtonElement>(null);
  const drawerWasOpen = useRef(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [signingOut, setSigningOut] = useState(false);
  const [openGroups, setOpenGroups] = useState(defaultOpenGroups);
  const [tooltip, setTooltip] = useState<{ label: string; top: number } | null>(null);

  const allowedSections = useMemo(
    () => sections
      .map((section) => ({ ...section, items: section.items.filter((item) => isAllowed(item, session.role)) }))
      .filter((section) => section.items.length),
    [session.role]
  );
  const allItems = useMemo(
    () => allowedSections.flatMap((section) => section.items.map((item) => ({ ...item, section: section.label || "General", sectionId: section.id }))),
    [allowedSections]
  );
  const currentItem = [...allItems].sort((a, b) => b.href.length - a.href.length).find((item) => isActive(pathname, item));
  const activeSectionId = currentItem?.sectionId;
  const filteredItems = allItems.filter((item) => `${item.label} ${item.description} ${item.section}`.toLocaleLowerCase("es-PE").includes(query.trim().toLocaleLowerCase("es-PE")));
  const animationDuration = reduceMotion ? 0 : 0.27;

  useEffect(() => {
    setSidebarCollapsed(window.localStorage.getItem("irp-admin-sidebar-collapsed") === "true");
    try {
      const stored = JSON.parse(window.localStorage.getItem("irp-admin-sidebar-groups") || "{}") as Partial<typeof defaultOpenGroups>;
      setOpenGroups({ ...defaultOpenGroups, ...stored });
    } catch {
      setOpenGroups(defaultOpenGroups);
    }
  }, []);

  useEffect(() => {
    setDrawerOpen(false);
    setCommandOpen(false);
    setQuery("");
    setTooltip(null);
    if (activeSectionId) setOpenGroups((current) => ({ ...current, [activeSectionId]: true }));
  }, [pathname, activeSectionId]);

  useEffect(() => {
    const keyboard = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLocaleLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen((value) => !value);
      } else if (event.key === "Escape") {
        setCommandOpen(false);
        setDrawerOpen(false);
      }
    };
    window.addEventListener("keydown", keyboard);
    return () => window.removeEventListener("keydown", keyboard);
  }, []);

  useEffect(() => {
    if (!commandOpen) return;
    const frame = window.requestAnimationFrame(() => searchInput.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [commandOpen]);

  useEffect(() => {
    if (!drawerOpen) {
      if (drawerWasOpen.current) mobileMenuRef.current?.focus();
      drawerWasOpen.current = false;
      return;
    }
    drawerWasOpen.current = true;
    const frame = window.requestAnimationFrame(() => drawerCloseRef.current?.focus());
    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== "Tab" || !drawerRef.current) return;
      const controls = [...drawerRef.current.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled]),[tabindex]:not([tabindex="-1"])')]
        .filter((element) => element.offsetParent !== null);
      if (!controls.length) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", trapFocus);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", trapFocus);
    };
  }, [drawerOpen]);

  useEffect(() => {
    if (!drawerOpen && !commandOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [drawerOpen, commandOpen]);

  const toggleSidebar = () => {
    setTooltip(null);
    setSidebarCollapsed((value) => {
      const next = !value;
      window.localStorage.setItem("irp-admin-sidebar-collapsed", String(next));
      return next;
    });
  };

  const toggleGroup = (id: NavigationSection["id"]) => {
    if (id === activeSectionId) return;
    setOpenGroups((current) => {
      const next = { ...current, [id]: !current[id] };
      window.localStorage.setItem("irp-admin-sidebar-groups", JSON.stringify(next));
      return next;
    });
  };

  const showTooltip = (label: string, element: HTMLElement) => {
    if (!sidebarCollapsed || window.matchMedia("(max-width: 900px)").matches) return;
    const bounds = element.getBoundingClientRect();
    setTooltip({ label, top: bounds.top + bounds.height / 2 });
  };

  const logout = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await fetch("/api/admin/session", { method: "DELETE", headers: { Accept: "application/json" } });
    } finally {
      router.replace("/admin/login");
      router.refresh();
    }
  };

  return (
    <div className={`${styles.shell} ${sidebarCollapsed ? styles.shellCollapsed : ""}`} data-admin-shell data-sidebar-collapsed={sidebarCollapsed} data-drawer-open={drawerOpen}>
      <button className={`${styles.backdrop} ${drawerOpen ? styles.backdropVisible : ""}`} type="button" onClick={() => setDrawerOpen(false)} aria-label="Cerrar menú de administración" tabIndex={drawerOpen ? 0 : -1} />

      <aside ref={drawerRef} className={`${styles.sidebar} ${drawerOpen ? styles.sidebarOpen : ""}`} aria-label="Menú administrativo">
        <div className={styles.brand}>
          <Link className={styles.brandLogo} href="/admin" aria-label="Ir al resumen del panel"><Logo compact priority /></Link>
          <div className={styles.brandCopy}><b>Industrial Remotos</b><small>Panel administrativo</small></div>
          <button className={styles.desktopCollapse} type="button" onClick={toggleSidebar} aria-label={sidebarCollapsed ? "Expandir menú lateral" : "Contraer menú lateral"} title={sidebarCollapsed ? "Expandir menú" : "Contraer menú"}>{sidebarCollapsed ? <ChevronRight size={21} /> : <ChevronLeft size={21} />}</button>
          <button ref={drawerCloseRef} className={styles.drawerClose} type="button" onClick={() => setDrawerOpen(false)} aria-label="Cerrar menú"><X size={20} /></button>
        </div>

        <button className={styles.sidebarSearch} type="button" onClick={() => setCommandOpen(true)} aria-label="Buscar en el panel" title={sidebarCollapsed ? "Buscar en el panel" : undefined} onMouseEnter={(event) => showTooltip("Buscar en el panel", event.currentTarget)} onMouseLeave={() => setTooltip(null)} onFocus={(event) => showTooltip("Buscar en el panel", event.currentTarget)} onBlur={() => setTooltip(null)}>
          <Search size={21} /><span className={styles.sidebarText}>Buscar en el panel</span><kbd className={styles.sidebarText}>Ctrl K</kbd>
        </button>

        <nav id="admin-navigation" className={styles.navigation} aria-label="Navegación administrativa">
          {allowedSections.map((section) => {
            const expanded = sidebarCollapsed || !section.collapsible || openGroups[section.id] || section.id === activeSectionId;
            return <section className={styles.navGroup} key={section.id} data-section={section.id}>
              {section.collapsible && <button className={styles.groupHeader} type="button" onClick={() => toggleGroup(section.id)} aria-expanded={expanded} aria-controls={`admin-group-${section.id}`} aria-label={`${expanded ? "Plegar" : "Desplegar"} ${section.label}`}><span>{section.label}</span><ChevronDown size={15} aria-hidden="true" /></button>}
              <motion.div id={`admin-group-${section.id}`} className={styles.groupItems} initial={false} animate={{ height: expanded ? "auto" : 0, opacity: expanded ? 1 : 0 }} transition={{ duration: animationDuration, ease: [0.22, 1, 0.36, 1] }} aria-hidden={!expanded}>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(pathname, item);
                  return <Link className={`${styles.navLink} ${active ? styles.activeLink : ""}`} href={item.href} key={item.href} aria-current={active ? "page" : undefined} aria-label={item.label} title={sidebarCollapsed ? item.label : undefined} tabIndex={expanded ? 0 : -1} onMouseEnter={(event) => showTooltip(item.label, event.currentTarget)} onMouseLeave={() => setTooltip(null)} onFocus={(event) => showTooltip(item.label, event.currentTarget)} onBlur={() => setTooltip(null)}><Icon className={styles.navIcon} size={21} strokeWidth={1.9} aria-hidden="true" /><span className={`${styles.navLabel} ${styles.sidebarText}`}>{item.label}</span></Link>;
                })}
              </motion.div>
            </section>;
          })}
        </nav>

        <footer className={styles.sidebarFooter}>
          <Link className={styles.siteLink} href="/" target="_blank" rel="noreferrer" aria-label="Ver sitio público" title={sidebarCollapsed ? "Ver sitio" : undefined} onMouseEnter={(event) => showTooltip("Ver sitio", event.currentTarget)} onMouseLeave={() => setTooltip(null)} onFocus={(event) => showTooltip("Ver sitio", event.currentTarget)} onBlur={() => setTooltip(null)}><ExternalLink size={20} aria-hidden="true" /><span className={styles.sidebarText}>Ver sitio</span></Link>
          <div className={styles.account} title={sidebarCollapsed ? `${session.email} · ${roleLabel(session.role)}` : undefined}><span className={styles.avatar}>{session.email.slice(0, 1).toUpperCase()}</span><p className={styles.sidebarText}><b>{session.email}</b><small>{roleLabel(session.role)}</small></p></div>
          <button className={styles.logoutButton} type="button" onClick={logout} disabled={signingOut} aria-label="Cerrar sesión" title={sidebarCollapsed ? "Cerrar sesión" : undefined} onMouseEnter={(event) => showTooltip("Cerrar sesión", event.currentTarget)} onMouseLeave={() => setTooltip(null)} onFocus={(event) => showTooltip("Cerrar sesión", event.currentTarget)} onBlur={() => setTooltip(null)}><LogOut size={20} aria-hidden="true" /><span className={styles.sidebarText}>{signingOut ? "Cerrando…" : "Cerrar sesión"}</span></button>
        </footer>
      </aside>

      {tooltip && <div className={styles.tooltip} style={{ top: tooltip.top }} role="tooltip">{tooltip.label}</div>}

      <div className={styles.workspace}>
        <header className={styles.topbar}>
          <div className={styles.topbarStart}>
            <button ref={mobileMenuRef} className={styles.mobileMenu} type="button" onClick={() => setDrawerOpen(true)} aria-label="Abrir menú de administración" aria-expanded={drawerOpen} aria-controls="admin-navigation"><Menu size={21} /></button>
            <div className={styles.breadcrumb}><small>{currentItem?.section ?? "Panel"}</small><b>{currentItem?.label ?? "Resumen"}</b></div>
          </div>
          <div className={styles.topbarActions}>
            <button className={styles.topbarIcon} type="button" onClick={() => setCommandOpen(true)} aria-label="Buscar en el panel"><Search size={18} /></button>
            <Link className={styles.topbarIcon} href="/" target="_blank" aria-label="Ver sitio público"><ExternalLink size={18} /></Link>
            <span className={styles.systemStatus}><i /> Operativo</span>
          </div>
        </header>
        <main className={styles.content}>{children}</main>
      </div>

      {commandOpen && <div className={styles.commandBackdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setCommandOpen(false); }}>
        <section className={styles.commandPalette} role="dialog" aria-modal="true" aria-labelledby="admin-command-title">
          <header><div><small>Navegación rápida</small><h2 id="admin-command-title">¿A dónde quieres ir?</h2></div><button type="button" onClick={() => setCommandOpen(false)} aria-label="Cerrar buscador"><X size={19} /></button></header>
          <label className={styles.commandInput}><Search size={20} /><input ref={searchInput} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar contenido, cotizador, clientes…" aria-label="Buscar una sección" /><kbd>ESC</kbd></label>
          <div className={styles.commandResults}>
            {filteredItems.length ? filteredItems.map((item) => { const Icon = item.icon; return <Link href={item.href} key={item.href}><span><Icon size={20} /></span><div><b>{item.label}</b><small>{item.section} · {item.description}</small></div><span>Ir</span></Link>; }) : <div className={styles.commandEmpty}><Search size={25} /><b>Sin resultados</b><small>Prueba con otra palabra.</small></div>}
          </div>
        </section>
      </div>}
    </div>
  );
}
