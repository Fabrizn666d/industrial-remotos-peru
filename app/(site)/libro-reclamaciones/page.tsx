import type { Metadata } from "next";
import Image from "next/image";
import { ComplaintForm } from "@/components/ComplaintForm";
import { PageHero } from "@/components/PublicComponents";
import { companyLegalData, siteConfig } from "@/data/site";

const description = "Registra un reclamo o queja dirigido a Industrial Remotos Perú y recibe un código de constancia.";

export const metadata: Metadata = {
  title: "Libro de Reclamaciones", description, alternates: { canonical: "/libro-reclamaciones" },
  openGraph: { title: "Libro de Reclamaciones | Industrial Remotos Perú", description, url: "/libro-reclamaciones", locale: "es_PE", type: "website", siteName: siteConfig.name }
};

export default function ComplaintsPage() {
  return (
    <main id="contenido">
      <PageHero eyebrow="Atención al consumidor" title={<>Libro de <em>Reclamaciones.</em></>} copy="Registra aquí tu reclamo o queja. Al enviarlo recibirás un código para identificar la constancia." />
      <section className="section-space bg-slate-50">
        <div className="page-shell grid items-start gap-8 lg:grid-cols-[.72fr_1.28fr]">
          <aside className="rounded-[30px] bg-[#072e5c] p-7 text-white md:p-9">
            <Image src="/images/libro-reclamaciones.png" alt="Libro de Reclamaciones" width={652} height={436} className="mx-auto h-auto w-full max-w-[300px]" />
            <h2 className="mt-5 text-2xl font-bold">Datos del proveedor</h2>
            <dl className="mt-6 grid gap-5 text-sm">
              <div><dt className="text-xs font-bold uppercase tracking-wider text-blue-200">Razón social</dt><dd className="mt-1 font-semibold">{companyLegalData.legalName}</dd></div>
              <div><dt className="text-xs font-bold uppercase tracking-wider text-blue-200">RUC</dt><dd className="mt-1 font-semibold">{companyLegalData.ruc}</dd></div>
              <div><dt className="text-xs font-bold uppercase tracking-wider text-blue-200">Dirección</dt><dd className="mt-1 font-semibold">{companyLegalData.address}</dd></div>
            </dl>
            <p className="mt-7 text-sm leading-6 text-blue-100">La presentación de un reclamo no impide acudir a otras vías de solución de controversias ni constituye requisito previo para ello.</p>
          </aside>
          <ComplaintForm />
        </div>
      </section>
    </main>
  );
}
