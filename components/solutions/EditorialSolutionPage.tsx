import { ArrowRight, ChevronDown, ChevronRight, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Suspense, type CSSProperties } from "react";
import { Configurator } from "@/components/Configurator";
import type { SolutionPage } from "@/data/solution-pages";
import { solutionFinishPresentations, type SolutionEditorialProfile } from "@/data/solution-editorial";
import { siteConfig } from "@/data/site";
import { EditorialGallery } from "./EditorialGallery";
import { ServiceCharacter } from "./ServiceCharacter";
import { SolutionChoiceShowcase } from "./SolutionChoiceShowcase";
import { SolutionFinishExplorer } from "./SolutionFinishExplorer";
import styles from "./EditorialSolutionPage.module.css";

type Props = { solution: SolutionPage; profile: SolutionEditorialProfile };

export function EditorialSolutionPage({ solution, profile }: Props) {
  const finishPresentation = solutionFinishPresentations[solution.slug];
  const contactHref = `${siteConfig.social.whatsapp}${siteConfig.social.whatsapp.includes("?") ? "&" : "?"}text=${encodeURIComponent(`Hola IRP, quisiera asesoría sobre ${solution.title}.`)}`;
  const quoteProducts = solution.options.map((option) => option.quoteProduct);

  return (
    <main id="contenido" className={`${styles.page} ${styles[profile.variant] ?? ""}`} data-solution={solution.slug}>
      <section
        className={styles.hero}
        style={{
          "--hero-position": profile.visuals.hero.objectPosition,
          "--hero-mobile-position": profile.visuals.hero.mobileObjectPosition
        } as CSSProperties}
      >
        <Image className={styles.heroImage} src={profile.visuals.hero.src} alt={`Imagen ilustrativa de ${solution.title}`} fill priority sizes="100vw" />
        <div className={styles.heroOverlay} />
        <div className={styles.heroTitleGlow} aria-hidden="true" />
        <nav className={`${styles.shell} ${styles.breadcrumbs}`} aria-label="Migas de pan">
          <Link href="/">Inicio</Link><ChevronRight aria-hidden="true" /><Link href="/soluciones">Soluciones</Link><ChevronRight aria-hidden="true" /><span>{solution.shortTitle}</span>
        </nav>
        <div className={`${styles.shell} ${styles.heroContent}`}>
          <h1>{profile.heroHeading}{profile.heroAccent && <><span aria-hidden="true"> </span><br /><strong>{profile.heroAccent}</strong></>}</h1>
          <p>{profile.heroDescription}</p>
        </div>
        <ServiceCharacter asset={profile.visuals.characters.hero} placement="hero" />
        <div className={styles.heroWave} aria-hidden="true">
          <svg viewBox="0 0 1440 118" preserveAspectRatio="none">
            <path className={styles.heroWaveFill} d="M0 51C165 86 342 104 525 91C732 76 841 21 1038 22C1196 23 1329 58 1440 84V118H0Z" />
            <path className={styles.heroWaveLine} d="M0 51C165 86 342 104 525 91C732 76 841 21 1038 22C1196 23 1329 58 1440 84" />
          </svg>
        </div>
      </section>

      <nav className={styles.sectionNav} aria-label={`Secciones de ${solution.title}`}>
        <a href="#modelos">Alternativas</a>
        <a href="#acabados">{solution.slug === "cerco-electrico" ? "Componentes" : "Acabados"}</a>
        <a href="#galeria">Inspiración</a>
        <a href="#cotizar">Cotizar</a>
      </nav>

      <section id="modelos" className={`${styles.section} ${styles.models}`} aria-labelledby="models-title">
        <div className={styles.shell}>
          <header className={styles.splitHeader}>
            <div><span className={styles.kicker}>Soluciones para tu espacio</span><h2 id="models-title">{profile.alternativesTitle}</h2></div>
            <p>{profile.alternativesIntro}</p>
          </header>
          <SolutionChoiceShowcase items={profile.alternatives} quoteProducts={quoteProducts} solutionSlug={solution.slug} />
          <div className={styles.useStrip} aria-label="Aplicaciones frecuentes">
            {solution.uses.map((use) => <span key={use}>{use}</span>)}
          </div>
        </div>
      </section>

      <section id="acabados" className={`${styles.section} ${styles.finishes}`} aria-labelledby="finishes-title">
        <div className={styles.shell}>
          <header className={styles.splitHeader}>
            <div><span className={styles.kicker}>{finishPresentation.eyebrow}</span><h2 id="finishes-title">{finishPresentation.title}</h2></div>
          </header>
          <div className={`${styles.finishCompanion} ${profile.visuals.characters.middle.side === "left" ? styles.companionLeft : styles.companionRight}`}>
            <SolutionFinishExplorer {...finishPresentation} previewImage={profile.detailImage} serviceTitle={solution.title} />
            <ServiceCharacter asset={profile.visuals.characters.middle} placement="middle" />
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.process}`} aria-labelledby="process-title">
        <div className={styles.shell}>
          <header className={styles.splitHeader}>
            <div><span className={styles.kicker}>Nuestro proceso</span><h2 id="process-title">{profile.processTitle}</h2></div>
            <p>El alcance de fabricación, suministro, traslado, instalación y complementos se detalla en cada propuesta.</p>
          </header>
          <ol className={styles.processGrid}>
            {profile.process.map((step, index) => <li key={step.title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{step.title}</h3><p>{step.description}</p></li>)}
          </ol>
        </div>
      </section>

      <section id="galeria" className={`${styles.section} ${styles.inspiration}`} aria-labelledby="gallery-title">
        <div className={styles.shell}>
          <header className={styles.splitHeader}>
            <div><span className={styles.kicker}>Inspiración</span><h2 id="gallery-title">{profile.inspirationTitle}</h2></div>
            <p>Estas imágenes sirven como referencia visual y no se presentan como obras ejecutadas por Industrial Remotos Perú.</p>
          </header>
        </div>
        <EditorialGallery images={profile.gallery} title={solution.title} />
      </section>

      <section id="cotizar" className={styles.quoteSection} aria-labelledby="quote-title">
        <div className={styles.shell}>
          <div className={`${styles.quoteLead} ${profile.visuals.characters.quote.side === "left" ? styles.companionLeft : styles.companionRight}`}>
            <header className={styles.quoteHeader}>
              <div><span className={styles.kicker}>Cotiza en línea</span><h2 id="quote-title">Hagamos espacio para tu proyecto.</h2></div>
              <p>Configura esta solución y recibe una propuesta preliminar. El importe final se confirma después de evaluar el proyecto.</p>
            </header>
            <ServiceCharacter asset={profile.visuals.characters.quote} placement="quote" />
          </div>
          <Suspense fallback={<div className={styles.quoteLoading}>Preparando el configurador…</div>}>
            <Configurator embedded initialProductId={solution.quoteProduct} />
          </Suspense>
          <aside className={styles.specialRequest} aria-label="Solicitud de personalización">
            <div><strong>¿Necesitas una solución especial?</strong><span>Describe el espacio y tu referencia en el campo Notas. Las configuraciones que no cuentan con reglas suficientes se envían como “Requiere evaluación”.</span></div>
            <a href={contactHref} target="_blank" rel="noreferrer">Solicitar personalización <ArrowRight aria-hidden="true" /></a>
          </aside>
        </div>
      </section>

      <section className={`${styles.section} ${styles.faq}`} aria-labelledby="faq-title">
        <div className={`${styles.shell} ${styles.faqLayout}`}>
          <header><span className={styles.kicker}>Preguntas frecuentes</span><h2 id="faq-title">Resolvemos tus dudas.</h2></header>
          <div className={styles.faqList}>
            {solution.faqs.map((faq) => <details key={faq.question}><summary>{faq.question}<ChevronDown aria-hidden="true" /></summary><p>{faq.answer}</p></details>)}
          </div>
        </div>
      </section>

      <section className={styles.contact} aria-labelledby="contact-title">
        <div className={styles.shell}>
          <span className={styles.kicker}>Estamos para ayudarte</span>
          <div><h2 id="contact-title">{profile.ctaTitle}</h2><p>{profile.ctaDescription}</p><a className={styles.primaryButton} href={contactHref} target="_blank" rel="noreferrer" data-analytics="whatsapp_click"><MessageCircle aria-hidden="true" /> Hablar con IRP <ArrowRight aria-hidden="true" /></a></div>
        </div>
      </section>
    </main>
  );
}
