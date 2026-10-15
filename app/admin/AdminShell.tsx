"use client";

import {
  Activity,
  BookOpenCheck,
  Building2,
  ClipboardList,
  ExternalLink,
  FileImage,
  FileText,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Package,
  Palette,
  PanelBottom,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings2,
  UsersRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Logo } from "@/components/Logo";
import type { AdminSession } from "@/lib/backend/contracts";
import styles from "./admin.module.css";

const sections = [
  { label: "Resumen", items: [{ href: "/admin", label: "Dashboard", description: "Actividad y pendientes", icon: LayoutDashboard, exact: true }] },
  { label: "Contenido web", items: [
    { href: "/admin/contenido/inicio", label: "Inicio", description: "Hero y secciones del Home", icon: LayoutDashboard, exact: false },
    { href: "/admin/contenido/nosotros", label: "Nosotros", description: "Presentación y videos", icon: UsersRound, exact: false },
    { href: "/admin/contenido/servicios", label: "Servicios", description: "Páginas comerciales", icon: Package, exact: false },
    { href: "/admin/contenido/proyectos", label: "Proyectos", description: "Galería de trabajos", icon: FolderKanban, exact: false },
    { href: "/admin/contenido/contacto", label: "Contacto", description: "Canales y ubicación", icon: Mail, exact: false },
    { href: "/admin/contenido/footer", label: "Footer y legal", description: "Enlaces y textos legales", icon: PanelBottom, exact: false },
    { href: "/admin/contenido/biblioteca", label: "Biblioteca", description: "Imágenes y videos", icon: FileImage, exact: false }
  ] },
  { label: "Cotizador", items: [
    { href: "/admin/configuracion/cotizador", label: "Cotizador inteligente", description: "Servicios, tipos y precios", icon: Settings2, exact: false },
    { href: "/admin/configuracion/productos-cotizacion", label: "Productos de proforma", description: "Plantillas comerciales", icon: Package, exact: false }
  ] },
  { label: "Gestión comercial", items: [
    { href: "/admin/solicitudes", label: "Solicitudes", description: "Consultas del cotizador", icon: ClipboardList, exact: false },
    { href: "/admin/clientes", label: "Clientes", description: "Directorio consolidado", icon: UsersRound, exact: false },
    { href: "/admin/cotizaciones", label: "Cotizaciones", description: "Proformas y documentos", icon: FileText, exact: false },
    { href: "/admin/reclamos", label: "Reclamos", description: "Atención al consumidor", icon: BookOpenCheck, exact: false }
  ] },
  { label: "Configuración", items: [
    { href: "/admin/configuracion/apariencia", label: "Apariencia", description: "Marca y transición", icon: Palette, exact: false },
    { href: "/admin/configuracion/empresa", label: "Empresa y contacto", description: "Datos generales", icon: Building2, exact: false },
    { href: "/admin/actividad", label: "Actividad", description: "Historial de cambios", icon: Activity, exact: false }
  ] }
] as const;

type NavigationItem = (typeof sections)[number]["items"][number];

function isAllowed(item: NavigationItem, role: AdminSession["role"]) {
  return role !== "COMMERCIAL" || (!item.href.startsWith("/admin/configuracion") && !item.href.startsWith("/admin/contenido"));
}

function isActive(pathname: string, item: NavigationItem) {
  return item.exact ? pathname === item.href : pathname.startsWith(item.href);
}

export function AdminShell({ session, children }: { session: AdminSession; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchInput = useRef<HTMLInputElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [signingOut, setSigningOut] = useState(false);

  const allowedSections = useMemo(() => sections.map((section) => ({ ...section, items: section.items.filter((item) => isAllowed(item, session.role)) })).filter((section) => section.items.length), [session.role]);
  const allItems = useMemo(() => allowedSections.flatMap((section) => section.items.map((item) => ({ ...item, section: section.label }))), [allowedSections]);
  const currentItem = [...allItems].sort((a, b) => b.href.length - a.href.length).find((item) => isActive(pathname, item));
  const filteredItems = allItems.filter((item) => `${item.label} ${item.description} ${item.section}`.toLocaleLowerCase("es-PE").includes(query.trim().toLocaleLowerCase("es-PE")));

  useEffect(() => {
    setDrawerOpen(false);
    setCommandOpen(false);
    setQuery("");
  }, [pathname]);

  useEffect(() => {
    setSidebarCollapsed(window.localStorage.getItem("irp-admin-sidebar-collapsed") === "true");
  }, []);

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
    if (!drawerOpen && !commandOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [drawerOpen, commandOpen]);

  const toggleSidebar = () => {
    setSidebarCollapsed((value) => {
      const next = !value;
      window.localStorage.setItem("irp-admin-sidebar-collapsed", String(next));
      return next;
    });
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
    <div className={`${styles.shell} ${sidebarCollapsed ? styles.shellCollapsed : ""}`}>
      {drawerOpen && <button className={styles.backdrop} type="button" onClick={() => setDrawerOpen(false)} aria-label="Cerrar menú" />}
      <aside className={`${styles.sidebar} ${drawerOpen ? styles.sidebarOpen : ""}`}>
        <div className={styles.brand}>
          <Link href="/admin" aria-label="Ir al dashboard"><Logo compact priority /></Link>
          <div><b>Industrial Remotos</b><small>Panel administrativo</small></div>
          <button type="button" onClick={() => setDrawerOpen(false)} aria-label="Cerrar menú"><X size={18} /></button>
        </div>

        <button className={styles.sidebarSearch} type="button" onClick={() => setCommandOpen(true)} aria-label="Buscar una sección del panel">
          <Search size={17} /><span>Buscar en el panel</span><kbd>Ctrl K</kbd>
        </button>

        <nav id="admin-navigation" className={styles.navigation} aria-label="Navegación administrativa">
          {allowedSections.map((section) => <div key={section.label}>
            <small>{section.label}</small>
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(pathname, item);
              return <Link className={active ? styles.activeLink : ""} href={item.href} key={item.href} title={sidebarCollapsed ? item.label : undefined} aria-current={active ? "page" : undefined}>
                <span className={styles.navIcon}><Icon size={18} /></span>
                <span className={styles.navCopy}><b>{item.label}</b><small>{item.description}</small></span>
              </Link>;
            })}
          </div>)}
        </nav>

        <div className={styles.account}>
          <div><span>{session.email.slice(0, 1).toUpperCase()}</span><p><b>{session.email}</b><small>{session.role.replace("_", " ")}</small></p></div>
          <button type="button" onClick={logout} disabled={signingOut} aria-label="Cerrar sesión" title="Cerrar sesión"><LogOut size={17} /></button>
        </div>
      </aside>

      <div className={styles.workspace}>
        <header className={styles.topbar}>
          <div className={styles.topbarStart}>
            <button className={styles.mobileMenu} type="button" onClick={() => setDrawerOpen(true)} aria-label="Abrir menú de administración" aria-expanded={drawerOpen} aria-controls="admin-navigation"><Menu size={20} /></button>
            <button className={styles.collapseButton} type="button" onClick={toggleSidebar} aria-label={sidebarCollapsed ? "Expandir menú lateral" : "Contraer menú lateral"}>{sidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}</button>
            <div className={styles.breadcrumb}><small>{currentItem?.section ?? "Panel"}</small><b>{currentItem?.label ?? "Dashboard"}</b></div>
          </div>
          <div className={styles.topbarActions}>
            <button className={styles.commandButton} type="button" onClick={() => setCommandOpen(true)}><Search size={16} /><span>Buscar</span><kbd>Ctrl K</kbd></button>
            <Link className={styles.publicLink} href="/" target="_blank"><span>Ver página</span><ExternalLink size={16} /></Link>
            <span className={styles.systemStatus}><i /> Operativo</span>
          </div>
        </header>
        <main className={styles.content}>{children}</main>
      </div>

      {commandOpen && <div className={styles.commandBackdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setCommandOpen(false); }}>
        <section className={styles.commandPalette} role="dialog" aria-modal="true" aria-labelledby="admin-command-title">
          <header><div><small>Navegación rápida</small><h2 id="admin-command-title">¿A dónde quieres ir?</h2></div><button type="button" onClick={() => setCommandOpen(false)} aria-label="Cerrar buscador"><X size={18} /></button></header>
          <label className={styles.commandInput}><Search size={19} /><input ref={searchInput} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar contenido, cotizador, clientes..." /><kbd>ESC</kbd></label>
          <div className={styles.commandResults}>
            {filteredItems.length ? filteredItems.map((item) => { const Icon = item.icon; return <Link href={item.href} key={item.href}><span><Icon size={19} /></span><div><b>{item.label}</b><small>{item.section} · {item.description}</small></div><span>Ir</span></Link>; }) : <div className={styles.commandEmpty}><Search size={24} /><b>Sin resultados</b><small>Prueba con otra palabra.</small></div>}
          </div>
        </section>
      </div>}
    </div>
  );
}
