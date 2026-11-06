import Image from "next/image";
import styles from "./ContraplacadaConstructionShowcase.module.css";

export function ContraplacadaConstructionShowcase() {
  return (
    <section
      id="modelos"
      className={styles.section}
      aria-labelledby="contraplacada-construction-title"
      data-motion-section
    >
      <figure className={styles.visual} aria-hidden="true">
        <Image
          className={styles.image}
          src="/images/service-details/contraplacada-hoja-acero.webp"
          alt=""
          fill
          sizes="100vw"
        />
      </figure>

      <div className={styles.desktopVeil} aria-hidden="true" />

      <div className={styles.content} data-motion-item data-motion-direction="left">
        <span className={styles.eyebrow}>Puertas contraplacadas</span>
        <h2 id="contraplacada-construction-title">
          El diseño que imaginas.
          <strong>Con hojas de acero.</strong>
        </h2>
        <p>Personalizamos el diseño y las medidas de tu puerta para integrarla a tu espacio.</p>

        <div className={styles.features} aria-label="Características de personalización">
          <span>Diseño a elección</span>
          <span>Medidas a tu ingreso</span>
        </div>
      </div>
    </section>
  );
}
