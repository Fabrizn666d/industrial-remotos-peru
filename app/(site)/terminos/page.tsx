import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PublicComponents";
import { companyLegalData, siteConfig } from "@/data/site";

const description = "Condiciones de uso del sitio, cotizaciones y contenidos de Industrial Remotos Perú.";
export const metadata: Metadata = { title: "Términos y condiciones", description, alternates: { canonical: "/terminos" }, openGraph: { title: "Términos y condiciones | Industrial Remotos Perú", description, url: "/terminos", locale: "es_PE", type: "website", siteName: siteConfig.name } };
const card = "rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft md:p-8";
const h2 = "m-0 text-xl font-semibold tracking-[-.03em] text-slate-950 md:text-2xl";
const copy = "mt-4 text-sm leading-7 text-slate-600 md:text-[15px]";

export default function TermsPage() {
  return <main id="contenido">
    <PageHero eyebrow="Condiciones del sitio" title={<>Términos y <em>condiciones.</em></>} copy="Estas condiciones explican el alcance del sitio y de las solicitudes realizadas desde sus herramientas." />
    <section className="section-space"><div className="page-shell mx-auto max-w-[920px]"><div className="grid gap-6">
      <section className={card}><h2 className={h2}>Titular y aceptación</h2><p className={copy}>Este sitio pertenece a <strong>{companyLegalData.legalName}</strong>, RUC {companyLegalData.ruc}. Al navegar o enviar información aceptas estas condiciones y la <Link className="font-semibold text-blue-700 underline" href="/politica-privacidad">Política de privacidad</Link>.</p></section>
      <section className={card}><h2 className={h2}>Uso del sitio</h2><p className={copy}>Las herramientas permiten explorar soluciones, preparar configuraciones y solicitar evaluación comercial. El usuario debe proporcionar información veraz y abstenerse de afectar la seguridad, disponibilidad o integridad del servicio.</p></section>
      <section className={card}><h2 className={h2}>Cotizaciones y proyectos</h2><p className={copy}>Las configuraciones, recomendaciones y montos mostrados son referenciales cuando así se indica. La propuesta final depende de medidas, condiciones del lugar, materiales, alcance de instalación y validación técnica. En ausencia de un precio real se muestra “Precio por confirmar”.</p></section>
      <section className={card}><h2 className={h2}>Información enviada</h2><p className={copy}>El envío de una solicitud no constituye por sí mismo la aceptación de un contrato ni garantiza disponibilidad inmediata. El equipo podrá contactar al usuario para completar información y confirmar el alcance.</p></section>
      <section className={card}><h2 className={h2}>Propiedad intelectual y disponibilidad</h2><p className={copy}>La identidad visual, textos, diseños y componentes del sitio están protegidos por las normas aplicables. Procuramos mantener la plataforma disponible y precisa, pero pueden existir mantenimientos, cambios o interrupciones técnicas razonables.</p></section>
      <section className={card}><h2 className={h2}>Contacto y actualizaciones</h2><p className={copy}>Para consultas usa el <Link className="font-semibold text-blue-700 underline" href="/contacto">formulario de contacto</Link>, el teléfono {siteConfig.phoneDisplay} o WhatsApp. Estas condiciones pueden actualizarse cuando cambien las funcionalidades o requerimientos aplicables.</p></section>
    </div><p className="mt-8 text-xs leading-6 text-slate-500">Última actualización: 22 de septiembre de 2026.</p></div></section>
  </main>;
}
