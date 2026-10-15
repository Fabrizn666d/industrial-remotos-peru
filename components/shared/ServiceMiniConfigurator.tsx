"use client";

import { Configurator } from "@/components/Configurator";
import type { SolutionPage } from "@/data/solution-pages";
import styles from "./ServiceMiniConfigurator.module.css";

export function ServiceMiniConfigurator({ solution }: { solution: SolutionPage }) {
  if (solution.quoteProduct === "estructuras-especiales") return null;
  return (
    <section className={styles.section} aria-labelledby="mini-configurator-title">
      <div className={styles.panel}>
        <span className={styles.eyebrow}>Configuración inicial</span>
        <h2 id="mini-configurator-title">Cuéntanos lo esencial.</h2>
        <p>Usamos el mismo flujo, compatibilidades y precios del cotizador general. El servicio completo incluye ejecución e instalación.</p>
      </div>
      <div className={styles.configurator}>
        <Configurator embedded initialProductId={solution.quoteProduct} />
      </div>
    </section>
  );
}
