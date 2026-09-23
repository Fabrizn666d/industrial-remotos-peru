"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Facebook,
  Instagram,
  MessageCircle,
  Music2,
  Phone,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { companyLegalData, siteConfig } from "@/data/site";
import styles from "./Footer.module.css";

const revealContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: .085 } },
};

const revealColumn = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: .62, ease: [0.16, 1, 0.3, 1] as const } },
};

const footerNavigation = [
  { label: "Nosotros", href: "/nosotros" },
  { label: "Soluciones", href: "/soluciones" },
  { label: "Catálogo", href: "/productos" },
  { label: "Proyectos", href: "/proyectos" },
  { label: "Contacto", href: "/contacto" },
] as const;

function WhatsAppIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.15 1.59 5.95L.06 24l6.34-1.66a11.87 11.87 0 0 0 5.65 1.44h.01c6.55 0 11.89-5.34 11.89-11.89A11.86 11.86 0 0 0 12.05 0Zm0 21.78h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.87 9.87 0 0 1-1.51-5.26c0-5.45 4.43-9.88 9.88-9.88 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.89 6.99c0 5.45-4.43 9.88-9.87 9.88Zm5.42-7.4c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.08-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35Z" /></svg>;
}

export function Footer() {
  return (
    <footer className={`site-footer ${styles.footer}`}>
      <div className={styles.background} aria-hidden="true" />

      <motion.div
        className={styles.main}
        variants={revealContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: .15 }}
      >
        <motion.section className={styles.brand} aria-label="Industrial Remotos Perú" variants={revealColumn}>
          <Link href="/" aria-label="Ir al inicio">
            <span className={styles.logo}>
              <Image
                className={styles.logoAsset}
                src="/NUEVO/ChatGPT Image 19 sept 2026, 19_13_22.png"
                alt="Industrial Remotos Perú — Garantía y confianza"
                width={1254}
                height={1254}
                sizes="(max-width: 640px) 190px, 180px"
              />
            </span>
          </Link>
          <span className={styles.accentLine} />
          <p>Diseñamos, fabricamos e instalamos soluciones de acceso a medida para hogares, negocios e industrias.</p>
          <div className={styles.contactLines}>
            <Link href="/contacto"><MessageCircle aria-hidden="true" />Formulario de contacto</Link>
            <a href={`tel:+${siteConfig.whatsappNumber}`}><Phone aria-hidden="true" />{siteConfig.phoneDisplay}</a>
          </div>
        </motion.section>

        <motion.nav className={styles.column} aria-label="Navegación del pie de página" variants={revealColumn}>
          <FooterHeading>Navega</FooterHeading>
          <div className={styles.links}>
            {footerNavigation.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
          </div>
        </motion.nav>

        <motion.section className={`${styles.column} ${styles.legal}`} variants={revealColumn}>
          <FooterHeading>Legal</FooterHeading>
          <div className={styles.links}>
            <Link href="/politica-privacidad">Política de privacidad</Link>
            <Link href="/terminos">Términos y condiciones</Link>
          </div>
          <Link className={styles.claims} href="/contacto" aria-label="Ir al canal de atención para el Libro de Reclamaciones">
            <span className={styles.claimsArt} aria-hidden="true">
              <Image src="/images/libro-reclamaciones.png" alt="" width={652} height={436} sizes="120px" />
            </span>
            <span className={styles.claimsCopy}>
              <small>Atención al consumidor</small>
              <strong>Libro de<br />Reclamaciones <ArrowRight aria-hidden="true" /></strong>
            </span>
          </Link>
        </motion.section>

        <motion.section className={`${styles.column} ${styles.details}`} variants={revealColumn}>
          <FooterHeading>Datos legales</FooterHeading>
          <div><small>Razón social</small><p>{companyLegalData.legalName || "—"}</p></div>
          <div><small>RUC</small><p>{companyLegalData.ruc || "—"}</p></div>
          <div><small>Dirección</small><p>{companyLegalData.address || "—"}</p></div>
        </motion.section>

        <motion.section className={`${styles.column} ${styles.follow}`} variants={revealColumn}>
          <FooterHeading>Síguenos</FooterHeading>
          <div className={styles.socials}>
            <a className={styles.facebook} href={siteConfig.social.facebook} aria-label="Facebook" target="_blank" rel="noreferrer"><Facebook /></a>
            <a className={styles.instagram} href={siteConfig.social.instagram} aria-label="Instagram" target="_blank" rel="noreferrer"><Instagram /></a>
            <a className={styles.tiktok} href={siteConfig.social.tiktok} aria-label="TikTok" target="_blank" rel="noreferrer"><Music2 /></a>
          </div>
          <p>Conoce nuestros proyectos, procesos y nuevas instalaciones.</p>
          <a className={styles.whatsapp} href={siteConfig.social.whatsapp} target="_blank" rel="noreferrer">
            <WhatsAppIcon />
            <span>Habla con nosotros</span>
            <ArrowRight aria-hidden="true" />
          </a>
        </motion.section>
      </motion.div>

      <div className={styles.bottom}>
        <div>
          <p>© 2026 Industrial Remotos Perú. Todos los derechos reservados.</p>
          <a href={siteConfig.developer.url} target="_blank" rel="noreferrer">Diseñado por {siteConfig.developer.name} <ArrowUpRight aria-hidden="true" /></a>
        </div>
      </div>
    </footer>
  );
}

function FooterHeading({ children }: { children: React.ReactNode }) {
  return <h2>{children}<span aria-hidden="true" /></h2>;
}
