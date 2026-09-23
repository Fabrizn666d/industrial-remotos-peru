import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PublicComponents";
import { companyLegalData, siteConfig } from "@/data/site";

const description = "Conoce cómo Industrial Remotos Perú trata la información enviada mediante formularios, cotizaciones, reclamos y preferencias del sitio.";
export const metadata: Metadata = { title: "Política de privacidad", description, alternates: { canonical: "/politica-privacidad" }, openGraph: { title: "Política de privacidad | Industrial Remotos Perú", description, url: "/politica-privacidad", locale: "es_PE", type: "website", siteName: siteConfig.name } };
const card = "rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft md:p-8";
const h2 = "m-0 text-xl font-semibold tracking-[-.03em] text-slate-950 md:text-2xl";
const copy = "mt-4 text-sm leading-7 text-slate-600 md:text-[15px]";

export default function PrivacyPolicyPage() {
  return <main id="contenido">
    <PageHero eyebrow="Privacidad y transparencia" title={<>Política de <em>privacidad.</em></>} copy="Explicamos qué información utiliza este sitio, con qué finalidad y qué opciones tienes sobre ella." />
    <section className="section-space"><div className="page-shell mx-auto max-w-[920px]">
      <div className="grid gap-6">
        <section className={card}><h2 className={h2}>Responsable del tratamiento</h2><p className={copy}><strong>{companyLegalData.legalName}</strong>, RUC {companyLegalData.ruc}, con dirección declarada en {companyLegalData.address}. Puedes iniciar una consulta mediante nuestro <Link className="font-semibold text-blue-700 underline" href="/contacto">formulario de contacto</Link> o al {siteConfig.phoneDisplay}.</p></section>
        <section className={card}><h2 className={h2}>Datos que recopilamos</h2><ul className="mt-4 grid list-disc gap-3 pl-5 text-sm leading-7 text-slate-600 md:text-[15px]"><li>Datos de contacto y características del proyecto enviados en contacto, cotizador, asistente y cierre de cotización.</li><li>Datos necesarios para registrar reclamos o quejas, incluyendo identificación del consumidor y detalle del caso.</li><li>Configuraciones guardadas localmente en “Mi proyecto”, preferencias de cookies y datos UTM de campaña durante la sesión.</li><li>Datos técnicos agregados de navegación únicamente si aceptas cookies analíticas y existe un proveedor configurado.</li></ul></section>
        <section className={card}><h2 className={h2}>Finalidad y base de uso</h2><p className={copy}>Usamos la información para responder consultas, elaborar y dar seguimiento a cotizaciones, conservar el avance solicitado por el usuario, atender reclamos, proteger los endpoints y mejorar el sitio cuando existe consentimiento. No enviamos documentos, teléfonos, correos ni contenido de reclamos a herramientas analíticas.</p></section>
        <section className={card}><h2 className={h2}>Almacenamiento, terceros y conservación</h2><p className={copy}>Las solicitudes y reclamos se almacenan en la infraestructura configurada para el sitio. Enlaces como WhatsApp y redes sociales conducen a servicios de terceros sujetos a sus propias políticas. Los datos se conservan solo durante el tiempo necesario para la finalidad correspondiente y las obligaciones aplicables; el proveedor definitivo de infraestructura y el plazo interno específico deben confirmarse antes del despliegue productivo.</p></section>
        <section className={card}><h2 className={h2}>Cookies y preferencias</h2><p className={copy}>El almacenamiento necesario mantiene funciones esenciales. Las categorías analíticas y opcionales permanecen desactivadas hasta que las aceptes. Puedes cambiar tu elección en cualquier momento mediante “Configurar cookies” en el footer.</p></section>
        <section className={card}><h2 className={h2}>Derechos y contacto</h2><p className={copy}>Puedes solicitar información, actualización, corrección o eliminación de datos cuando corresponda. Para iniciar la atención usa el <Link className="font-semibold text-blue-700 underline" href="/contacto">canal de contacto</Link>, teléfono o WhatsApp. No se publica un correo de privacidad hasta contar con uno confirmado.</p></section>
      </div><p className="mt-8 text-xs leading-6 text-slate-500">Última actualización: 22 de septiembre de 2026.</p>
    </div></section>
  </main>;
}
