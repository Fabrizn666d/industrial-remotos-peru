import { ArrowRight, ChevronDown, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Suspense, type CSSProperties } from "react";
import { Configurator } from "@/components/Configurator";
import type { SolutionPage } from "@/data/solution-pages";
import type { SolutionEditorialProfile } from "@/data/solution-editorial";
import { siteConfig } from "@/data/site";
import { EditorialGallery } from "./EditorialGallery";
import { ContraplacadaConstructionShowcase } from "./ContraplacadaConstructionShowcase";
import { MadeToMeasureDoorCarousel, type MadeToMeasureDoorModel } from "./MadeToMeasureDoorCarousel";
import { ImportedDoorColorExplorer } from "./ImportedDoorColorExplorer";
import { ServiceInteractiveShowcase, type SupportedSlug } from "./ServiceInteractiveShowcase";
import { ServiceApplicationsShowcase } from "./ServiceApplicationsShowcase";
import { ServiceScrollStability } from "./ServiceScrollStability";
import styles from "./EditorialSolutionPage.module.css";

type Props = { solution: SolutionPage; profile: SolutionEditorialProfile; madeToMeasureDoorModels?: MadeToMeasureDoorModel[] };

export function EditorialSolutionPage({ solution, profile, madeToMeasureDoorModels = [] }: Props) {
  const isImported = solution.slug === "puertas-principales";
  const isContraplacada = solution.slug === "puertas-contraplacadas";
  const isMadeToMeasureDoor = solution.slug === "puertas-a-medida";
  const contactHref = `${siteConfig.social.whatsapp}${siteConfig.social.whatsapp.includes("?") ? "&" : "?"}text=${encodeURIComponent(`Hola IRP, quisiera asesoría sobre ${solution.title}.`)}`;
  return (
    <main id="contenido" className={`${styles.page} ${styles[profile.variant] ?? ""}`} data-solution={solution.slug}>
      <ServiceScrollStability />
      <section
        className={styles.hero}
        data-motion-hero
        style={{
          "--hero-position": profile.visuals.hero.objectPosition,
          "--hero-mobile-position": profile.visuals.hero.mobileObjectPosition,
          "--hero-copy-x": profile.visuals.characters.hero.side === "right" ? "24%" : "76%"
        } as CSSProperties}
      >
        <Image className={styles.heroImage} src={profile.visuals.hero.src} alt={`Imagen ilustrativa de ${solution.title}`} fill priority data-transition-essential sizes="100vw" />
        <div className={styles.heroOverlay} />
        <div className={styles.heroTitleGlow} aria-hidden="true" />
        <nav className={`${styles.shell} ${styles.breadcrumbs}`} aria-label="Migas de pan" data-motion-hero-item data-motion-direction="up">
          <Link href="/">Inicio</Link><ChevronRight aria-hidden="true" /><Link href="/soluciones">Soluciones</Link><ChevronRight aria-hidden="true" /><span>{solution.shortTitle}</span>
        </nav>
        <div className={`${styles.shell} ${styles.heroContent} ${styles.heroCopyLeft}`} data-motion-hero-item data-motion-direction="up">
          {isContraplacada && <span className={styles.contraplacadaHeroLabel}>Puertas contraplacadas</span>}
          <h1>{profile.heroHeading}{profile.heroAccent && <><span aria-hidden="true"> </span><br /><strong>{profile.heroAccent}</strong></>}</h1>
          <p>{profile.heroDescription}</p>
          {isContraplacada && (
            <a className={styles.contraplacadaHeroLink} href="#modelos">
              Descubre los diseños <ArrowRight aria-hidden="true" />
            </a>
          )}
        </div>
        <div className={styles.heroWave} aria-hidden="true">
          <svg viewBox="0 0 1440 118" preserveAspectRatio="none">
            <path className={styles.heroWaveFill} d="M0 51C165 86 342 104 525 91C732 76 841 21 1038 22C1196 23 1329 58 1440 84V118H0Z" />
            <path className={styles.heroWaveLine} d="M0 51C165 86 342 104 525 91C732 76 841 21 1038 22C1196 23 1329 58 1440 84" />
          </svg>
        </div>
      </section>

      {isMadeToMeasureDoor ? (
        <MadeToMeasureDoorCarousel models={madeToMeasureDoorModels} />
      ) : isContraplacada ? (
        <ContraplacadaConstructionShowcase />
      ) : isImported ? (
        <ImportedDoorColorExplorer />
      ) : (
        <ServiceInteractiveShowcase slug={solution.slug as SupportedSlug} />
      )}

      {!isContraplacada && <ServiceApplicationsShowcase slug={solution.slug} applications={profile.applications} />}

      <section id="galeria" className={`${styles.section} ${styles.inspiration}`} aria-labelledby="gallery-title" data-motion-section>
        <header className={styles.galleryHeader} data-motion-item data-motion-direction="up">
          <span className={styles.kicker}>INSPÍRATE</span>
          <h2 id="gallery-title"><span>Tu próximo proyecto</span>{" "}<strong>empieza aquí.</strong></h2>
          <p>Explora diseños y encuentra el estilo que imaginas para tu espacio.</p>
        </header>
        <div data-motion-item data-motion-direction="up"><EditorialGallery images={profile.gallery} title={solution.title} /></div>
      </section>

      <section id="cotizar" className={styles.quoteSection} aria-labelledby="quote-title" data-motion-section>
        <div className={styles.shell}>
          <div className={`${styles.quoteLead}`} data-motion-item data-motion-direction="up">
            <header className={styles.quoteHeader}>
              <div><span className={styles.kicker}>Cotiza en línea</span><h2 id="quote-title">Hagamos espacio para tu proyecto.</h2></div>
              <p>Configura esta solución y recibe una propuesta preliminar. El importe final se confirma después de evaluar el proyecto.</p>
            </header>
          </div>
          <div data-motion-item data-motion-direction="up"><Suspense fallback={<div className={styles.quoteLoading}>Preparando el configurador…</div>}>
            <Configurator embedded initialProductId={solution.quoteProduct} />
          </Suspense></div>
          <aside className={styles.specialRequest} aria-label="Solicitud de personalización" data-motion-item data-motion-direction="up">
            <div><strong>¿Necesitas una solución especial?</strong><span>Comparte tu referencia y las medidas que tengas. Nuestro equipo revisará contigo el alcance antes de preparar la cotización.</span></div>
            <a href={contactHref} target="_blank" rel="noreferrer">Solicitar personalización <ArrowRight aria-hidden="true" /></a>
          </aside>
        </div>
      </section>

      <section className={`${styles.section} ${styles.faq}`} aria-labelledby="faq-title" data-motion-section>
        <div className={`${styles.shell} ${styles.faqLayout}`}>
          <header data-motion-item data-motion-direction="left"><span className={styles.kicker}>Preguntas frecuentes</span><h2 id="faq-title">Resolvemos tus dudas.</h2></header>
          <div className={styles.faqList} data-motion-item data-motion-direction="right">
            {solution.faqs.map((faq) => <details key={faq.question}><summary>{faq.question}<ChevronDown aria-hidden="true" /></summary><p>{faq.answer}</p></details>)}
          </div>
        </div>
      </section>

    </main>
  );
}
