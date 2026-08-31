import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PublicComponents";
import { siteConfig } from "@/data/site";

const description = "Alcance informativo provisional del sitio y de las solicitudes de proyecto de Industrial Remotos Perú.";

export const metadata: Metadata = {
  title: "Términos y condiciones",
  description,
  alternates: { canonical: "/terminos" },
  openGraph: {
    title: "Términos y condiciones | Industrial Remotos Perú",
    description,
    url: "/terminos",
    locale: "es_PE",
    type: "website",
    siteName: siteConfig.name
  }
};

const cardClass = "rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft md:p-8";
const headingClass = "m-0 text-xl font-semibold tracking-[-0.03em] text-slate-950 md:text-2xl";
const copyClass = "mt-4 text-sm leading-7 text-slate-600 md:text-[15px]";

export default function TermsPage() {
  return (
    <main id="contenido">
      <PageHero
        eyebrow="Información legal en validación"
        title={<>Términos y <em>condiciones.</em></>}
        copy="Este documento explica el alcance actual del sitio sin reemplazar las condiciones comerciales que deben confirmarse para cada proyecto."
      />

      <section className="section-space">
        <div className="page-shell mx-auto max-w-[920px]">
          <aside className="rounded-[28px] border border-amber-200 bg-amber-50 p-6 md:p-8" aria-labelledby="terms-status-title">
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-amber-800">Versión informativa provisional</span>
            <h2 className={`${headingClass} mt-3`} id="terms-status-title">Condiciones generales pendientes de aprobación</h2>
            <p className={copyClass}>La razón social, el RUC, el domicilio fiscal y el texto contractual general todavía no han sido confirmados. Esta página no les asigna valores ni condiciones ficticias; comunica únicamente cómo funciona hoy la experiencia digital.</p>
          </aside>

          <div className="mt-8 grid gap-6">
            <section className={cardClass} aria-labelledby="terms-scope-title">
              <h2 className={headingClass} id="terms-scope-title">Alcance del sitio</h2>
              <p className={copyClass}>El sitio permite explorar soluciones, preparar una configuración, reunir elementos en “Mi proyecto” y enviar una solicitud para revisión. Las imágenes, diagramas, selecciones y vistas previas sirven como apoyo para esa conversación inicial y no sustituyen la validación técnica del espacio.</p>
            </section>

            <section className={cardClass} aria-labelledby="terms-request-title">
              <h2 className={headingClass} id="terms-request-title">Solicitudes y confirmaciones</h2>
              <p className={copyClass}>El código generado al registrar una solicitud confirma su recepción técnica en el sistema. No constituye por sí mismo una cotización final, una aceptación del proyecto ni una confirmación de fabricación o instalación.</p>
              <p className={copyClass}>El sitio no publica condiciones generales verificadas sobre alcance, medidas finales, materiales, componentes del precio, plazos, forma de pago, transporte, instalación o garantías. Esos puntos deben comunicarse y validarse para cada proyecto antes de considerarlos definitivos.</p>
            </section>

            <section className={cardClass} aria-labelledby="terms-links-title">
              <h2 className={headingClass} id="terms-links-title">Contacto y servicios externos</h2>
              <p className={copyClass}>WhatsApp y las redes sociales son servicios de terceros y aplican sus propias condiciones. Para consultar el estado o alcance de una solicitud usa el <Link className="font-semibold text-blue-600 underline underline-offset-4" href="/contacto">canal de contacto</Link>, llama al <a className="font-semibold text-blue-600 underline underline-offset-4" href={`tel:+${siteConfig.whatsappNumber}`}>{siteConfig.phoneDisplay}</a> o abre <a className="font-semibold text-blue-600 underline underline-offset-4" href={siteConfig.social.whatsapp} target="_blank" rel="noreferrer">WhatsApp</a>.</p>
            </section>
          </div>

          <p className="mt-8 text-xs leading-6 text-slate-500">Última actualización de esta versión informativa: 31 de agosto de 2026.</p>
        </div>
      </section>
    </main>
  );
}
