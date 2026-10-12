import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Contacto", description: "Conversa con Industrial Remotos Perú y cuéntanos sobre tu proyecto." };

export default function ContactPage() {
  return <main id="contenido" className="contact-route-fallback"><section><span>Contacto IRP</span><h1>Abriendo la ventana de contacto…</h1><p>Si la ventana no aparece, vuelve al inicio e inténtalo nuevamente.</p><Link href="/">Volver al inicio</Link></section></main>;
}
