import type { Metadata } from "next";
import { Suspense } from "react";
import { CatalogExperience } from "@/components/CatalogExperience";
import { PageHero } from "@/components/PublicComponents";

export const metadata: Metadata = {
  title: "Catálogo de sistemas",
  description: "Explora sistemas de acceso, automatización, coberturas, mamparas, acero y estructuras desarrollados a medida.",
  alternates: { canonical: "/productos" }
};

export default function ProductsPage() {
  return (
    <main id="contenido">
      <PageHero
        eyebrow="Catálogo técnico"
        title={<>Sistemas para convertir una necesidad en un <em>proyecto a medida.</em></>}
        copy="Compara alternativas y prepara una configuración inicial. Las especificaciones y el precio se confirman después de revisar el espacio y el alcance."
      />
      <section className="catalog-section">
        <div className="page-shell">
          <Suspense fallback={<div className="catalog-loading">Preparando catálogo…</div>}>
            <CatalogExperience />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
