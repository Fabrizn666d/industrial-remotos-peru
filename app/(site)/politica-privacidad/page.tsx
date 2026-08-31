import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PublicComponents";
import { siteConfig } from "@/data/site";

const description = "Información provisional y transparente sobre los datos usados para preparar y registrar solicitudes de proyecto.";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description,
  alternates: { canonical: "/politica-privacidad" },
  openGraph: {
    title: "Política de privacidad | Industrial Remotos Perú",
    description,
    url: "/politica-privacidad",
    locale: "es_PE",
    type: "website",
    siteName: siteConfig.name
  }
};

const cardClass = "rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft md:p-8";
const headingClass = "m-0 text-xl font-semibold tracking-[-0.03em] text-slate-950 md:text-2xl";
const copyClass = "mt-4 text-sm leading-7 text-slate-600 md:text-[15px]";

export default function PrivacyPolicyPage() {
  return (
    <main id="contenido">
      <PageHero
        eyebrow="Información legal en validación"
        title={<>Política de <em>privacidad.</em></>}
        copy="Este resumen describe el funcionamiento actual del sitio mientras los datos empresariales y el texto legal definitivo son validados."
      />

      <section className="section-space">
        <div className="page-shell mx-auto max-w-[920px]">
          <aside className="rounded-[28px] border border-amber-200 bg-amber-50 p-6 md:p-8" aria-labelledby="privacy-status-title">
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-amber-800">Versión informativa provisional</span>
            <h2 className={`${headingClass} mt-3`} id="privacy-status-title">Datos legales pendientes de validación</h2>
            <p className={copyClass}>La razón social, el RUC, el domicilio fiscal, el correo específico de privacidad y la política legal definitiva todavía no han sido confirmados por el titular del negocio. No se publican datos sustitutos ni inventados.</p>
          </aside>

          <div className="mt-8 grid gap-6">
            <section className={cardClass} aria-labelledby="privacy-data-title">
              <h2 className={headingClass} id="privacy-data-title">Qué información interviene actualmente</h2>
              <ul className="mt-4 grid list-disc gap-3 pl-5 text-sm leading-7 text-slate-600 md:text-[15px]">
                <li>El formulario de contacto prepara un mensaje con nombre, teléfono, ubicación, tipo de proyecto y descripción. Al pulsar “Continuar por WhatsApp”, el sitio abre esa plataforma con el texto preparado y la persona decide allí si lo envía.</li>
                <li>Al registrar una solicitud desde el cotizador se envían al sistema el nombre, correo, teléfono, ubicación, detalles del proyecto y las soluciones seleccionadas.</li>
                <li>“Mi proyecto” conserva sus selecciones en el almacenamiento local del navegador. Algunos avisos de interfaz usan almacenamiento de sesión. Estos datos locales no equivalen por sí solos a una solicitud enviada.</li>
              </ul>
            </section>

            <section className={cardClass} aria-labelledby="privacy-use-title">
              <h2 className={headingClass} id="privacy-use-title">Uso y canales externos</h2>
              <p className={copyClass}>La información enviada se utiliza para identificar y revisar la solicitud de proyecto y permitir su seguimiento por el equipo autorizado. El proveedor de almacenamiento de producción, los plazos de conservación y el procedimiento legal completo de atención de derechos siguen pendientes de definición y deben incorporarse a la versión definitiva.</p>
              <p className={copyClass}>Al abrir WhatsApp o las redes sociales desde este sitio, el tratamiento realizado por esas plataformas se rige también por sus propias políticas y condiciones.</p>
            </section>

            <section className={cardClass} aria-labelledby="privacy-contact-title">
              <h2 className={headingClass} id="privacy-contact-title">Canales vigentes</h2>
              <p className={copyClass}>Mientras se valida un correo específico de privacidad, cualquier consulta sobre una solicitud o sobre los datos proporcionados puede iniciarse mediante el <Link className="font-semibold text-blue-600 underline underline-offset-4" href="/contacto">formulario de contacto</Link>, por teléfono al <a className="font-semibold text-blue-600 underline underline-offset-4" href={`tel:+${siteConfig.whatsappNumber}`}>{siteConfig.phoneDisplay}</a> o por <a className="font-semibold text-blue-600 underline underline-offset-4" href={siteConfig.social.whatsapp} target="_blank" rel="noreferrer">WhatsApp</a>.</p>
            </section>
          </div>

          <p className="mt-8 text-xs leading-6 text-slate-500">Última actualización de esta versión informativa: 31 de agosto de 2026.</p>
        </div>
      </section>
    </main>
  );
}
