import Image from "next/image";
import styles from "./MadeToMeasureOpeningsShowcase.module.css";

const openings = [
  {
    title: "Batiente",
    description: "Gira sobre bisagras situadas en el lateral.",
    image: "/NUEVO/WAZAA/Puerta de madera con apertura interior-1.png",
    alt: "Puerta principal batiente abierta con bisagras visibles en el lateral"
  },
  {
    title: "Pivotante",
    description: "Gira sobre un eje desplazado del borde.",
    image: "/images/configurator/principal-pivotante-gris-grafito.webp",
    alt: "Puerta principal pivotante grafito abierta sobre un eje desplazado"
  }
];

export function MadeToMeasureOpeningsShowcase() {
  return (
    <section
      id="acabados"
      className={styles.section}
      aria-labelledby="made-to-measure-openings-title"
      data-service-applications="puertas-a-medida"
      data-motion-section
    >
      <header className={styles.heading} data-motion-item data-motion-direction="up">
        <h2 id="made-to-measure-openings-title">
          <span>Dos formas de abrir.</span>
          <strong>Un diseño a tu medida.</strong>
        </h2>
      </header>

      <div className={styles.grid}>
        {openings.map((opening, index) => (
          <article
            className={styles.opening}
            key={opening.title}
            data-motion-item
            data-motion-direction={index === 0 ? "left" : "right"}
          >
            <figure className={styles.media}>
              <Image
                src={opening.image}
                alt={opening.alt}
                fill
                sizes="(min-width: 900px) 50vw, 100vw"
              />
            </figure>
            <div className={styles.copy}>
              <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3>{opening.title}</h3>
                <p>{opening.description}</p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <p className={styles.closing} data-motion-item data-motion-direction="up">
        Adaptamos el diseño y las medidas a tu ingreso.
      </p>
    </section>
  );
}
