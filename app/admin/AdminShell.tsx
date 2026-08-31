"use client";

import { ClipboardList, FileText, LayoutDashboard, LogOut, Menu, Package, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import type { AdminSession } from "@/lib/backend/contracts";
import styles from "./admin.module.css";

const navigation = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/solicitudes", label: "Solicitudes", icon: ClipboardList, exact: false },
  { href: "/admin/cotizaciones", label: "Cotizaciones", icon: FileText, exact: false },
  { href: "/admin/configuracion/productos-cotizacion", label: "Productos de cotización", icon: Package, exact: false }
] as const;

export function AdminShell({ session, children }: { session: AdminSession; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

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
    <div className={styles.shell}>
      <button className={styles.mobileMenu} type="button" onClick={() => setDrawerOpen(true)} aria-label="Abrir menú de Control">
        <Menu size={20} />
      </button>
      {drawerOpen && <button className={styles.backdrop} type="button" onClick={() => setDrawerOpen(false)} aria-label="Cerrar menú" />}
      <aside className={`${styles.sidebar} ${drawerOpen ? styles.sidebarOpen : ""}`}>
        <div className={styles.brand}>
          <span>IR</span>
          <div><b>Industrial Remotos</b><small>Control</small></div>
          <button type="button" onClick={() => setDrawerOpen(false)} aria-label="Cerrar menú"><X size={18} /></button>
        </div>
        <nav className={styles.navigation} aria-label="Navegación administrativa">
          <small>Operación</small>
          {navigation.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return <Link className={active ? styles.activeLink : ""} href={href} key={href} onClick={() => setDrawerOpen(false)}><Icon size={17} />{label}</Link>;
          })}
          <small>Configuración</small>
        </nav>
        <div className={styles.account}>
          <div><span>{session.email.slice(0, 1).toUpperCase()}</span><p><b>{session.email}</b><small>{session.role.replace("_", " ")}</small></p></div>
          <button type="button" onClick={logout} disabled={signingOut} aria-label="Cerrar sesión"><LogOut size={17} /></button>
        </div>
      </aside>
      <div className={styles.workspace}>
        <header className={styles.topbar}><div><small>Industrial Remotos Perú</small><b>Panel operativo</b></div><span><i /> Entorno administrativo</span></header>
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
