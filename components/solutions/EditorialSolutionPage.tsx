import { ArrowRight, Check, ChevronDown, ChevronRight, ClipboardCheck, DraftingCompass, Factory, MessageCircle, Wrench } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { Configurator } from "@/components/Configurator";
import type { SolutionPage } from "@/data/solution-pages";
import type { SolutionEditorialProfile } from "@/data/solution-editorial";
import { siteConfig } from "@/data/site";
import { EditorialGallery } from "./EditorialGallery";
import styles from "./EditorialSolutionPage.module.css";

type EditorialSolutionPageProps = {
  solution: SolutionPage;
  profile: SolutionEditorialProfile;
};

const processIcons = [ClipboardCheck, DraftingCompass, Factory, Wrench];

export function EditorialSolutionPage({ solution, profile }: EditorialSolutionPageProps) {
  const variantClass = styles[profile.variant] ?? "";
  const contactHref = `${siteConfig.social.whatsapp}${siteConfig.social.whatsapp.includes("?") ? "&" : "?"}text=${encodeURIComponent(`Hola IRP, quisiera asesoría sobre ${solution.title}.`)}`;

  return (
    <main id="contenido" className={`${styles.page} ${variantClass}`} data-solution={solution.slug}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <nav className={styles.breadcrumbs} aria-label="Migas de pan">
            <Link href="/">Inicio</Link><ChevronRight aria-hidden="true" /><Link href="/soluciones">Soluciones</Link><ChevronRight aria-hidden="true" /><span>{solution.shortTitle}</span>
          </nav>
          <span className={styles.eyebrow}>{solution.eyebrow}</span>
          <h1>{profile.heroHeading}{profile.heroAccent && <><span aria-hidden="true"> </span><br /><strong>{profile.heroAccent}</strong></>}</h1>
          <p>{profile.heroDescription}</p>
          <div className={styles.heroActions}>
            <a className={styles.primaryButton} href="#cotizar" data-analytics="configurator_start">Configurar esta solución <ArrowRight aria-hidden="true" /></a>
            <a className={styles.secondaryButton} href="#modelos">Explorar alternativas <ArrowRight aria-hidden="true" /></a>
          </div>
        </div>
        <div className={styles.heroMedia}>
          <Image src={profile.heroImage} alt={`Referencia visual de ${solution.title}`} fill priority sizes="(min-width: 900px) 58vw, 100vw" />
          <span>Imagen referencial</span>
        </div>
      </section>

      <nav className={styles.sectionNav} aria-label={`Secciones de ${solution.title}`}>
        <a href="#modelos">Alternativas</a>
        <a href="#materiales">Materiales y acabados</a>
        <a href="#galeria">Galería</a>
        <a href="#cotizar">Cotizar</a>
      </nav>

      <section id="aplicaciones" className={`${styles.section} ${styles.applications}`} aria-labelledby="applications-title">
        <div className={styles.shell}>
          <header className={styles.sectionHeader}>
            <div><SectionNumber value="01" /><h2 id="applications-title">{profile.applicationsTitle}</h2></div>
            <p>{profile.applicationsIntro}</p>
          </header>
          <div className={styles.applicationGrid} data-count={profile.applications.length}>
            {profile.applications.map((item, index) => (
              <article className={styles.applicationItem} key={item.title}>
                <div className={styles.applicationMedia}>
                  <Image src={item.image} alt={`Referencia visual: ${item.title}`} fill sizes="(min-width: 1100px) 33vw, (min-width: 700px) 50vw, 100vw" />
                  <span>0{index + 1}</span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="modelos" className={`${styles.section} ${styles.alternatives}`} aria-labelledby="alternatives-title">
        <div className={styles.shell}>
          <header className={styles.sectionHeader}>
            <div><SectionNumber value="02" /><h2 id="alternatives-title">{profile.alternativesTitle}</h2></div>
            <p>{profile.alternativesIntro}</p>
          </header>
          <div className={styles.alternativeGrid}>
            {profile.alternatives.map((item, index) => {
              const targetProduct = solution.options[index]?.quoteProduct ?? solution.quoteProduct;
              const configuratorHref = `/soluciones/${solution.slug}?producto=${encodeURIComponent(targetProduct)}&subtype=${encodeURIComponent(item.title)}#cotizar`;
              return (
              <article className={styles.alternativeItem} key={item.title}>
                <div className={styles.alternativeMedia}><Image src={item.image} alt={`Referencia visual: ${item.title}`} fill sizes="(min-width: 1000px) 31vw, (min-width: 640px) 48vw, 100vw" /></div>
                <div className={styles.alternativeCopy}>
                  <span>0{index + 1}</span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <Link href={configuratorHref}>Configurar alternativa <ArrowRight aria-hidden="true" /></Link>
                </div>
              </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="materiales" className={styles.detailBand} aria-labelledby="detail-title">
        <div className={styles.detailMedia}><Image src={profile.detailImage} alt={`Detalle referencial de ${solution.title}`} fill sizes="(min-width: 800px) 55vw, 100vw" /></div>
        <div className={styles.detailCopy}>
          <SectionNumber value="03" />
          <h2 id="detail-title">{profile.detailTitle}</h2>
          <p>{profile.detailDescription}</p>
          <ul>{profile.details.map((detail) => <li key={detail}><Check aria-hidden="true" />{detail}</li>)}</ul>
        </div>
      </section>

      <section id="galeria" className={`${styles.section} ${styles.inspiration}`} aria-labelledby="inspiration-title">
        <div className={styles.shell}>
          <header className={styles.sectionHeader}>
            <div><SectionNumber value="04" /><h2 id="inspiration-title">{profile.inspirationTitle}</h2></div>
            <p>Las imágenes orientan la conversación de diseño y no se presentan como obras ejecutadas por Industrial Remotos Perú.</p>
          </header>
          <EditorialGallery images={profile.gallery} title={solution.title} />
        </div>
      </section>

      <section id="cotizar" className={styles.quoteSection} aria-labelledby="quote-title">
        <div className={styles.shell}>
          <header className={styles.quoteHeader}>
            <div><SectionNumber value="05" /><h2 id="quote-title">Cotiza esta solución.</h2></div>
            <p>Configura tu proyecto con las opciones publicadas. El servidor volverá a validar compatibilidades y precios antes de registrar la propuesta.</p>
          </header>
          <Suspense fallback={<div className={styles.quoteLoading}>Preparando el configurador…</div>}>
            <Configurator embedded initialProductId={solution.quoteProduct} />
          </Suspense>
          <aside className={styles.specialRequest} aria-label="Solicitud especial">
            <div>
              <strong>¿Necesitas una solución especial?</strong>
              <span>Describe la referencia y las condiciones del proyecto en el campo Notas del configurador. Si requiere planos o fotografías, el equipo te indicará el canal privado para recibirlos.</span>
            </div>
            <a href={contactHref} target="_blank" rel="noreferrer" data-analytics="whatsapp_click">Hablar con un asesor <ArrowRight aria-hidden="true" /></a>
          </aside>
        </div>
      </section>

      <section className={`${styles.section} ${styles.process}`} aria-labelledby="process-title">
        <div className={styles.shell}>
          <header className={styles.sectionHeader}>
            <div><SectionNumber value="06" /><h2 id="process-title">{profile.processTitle}</h2></div>
            <p>Un acompañamiento claro, desde la primera revisión hasta la entrega del trabajo acordado.</p>
          </header>
          <ol className={styles.processGrid}>
            {profile.process.map((step, index) => {
              const Icon = processIcons[index] ?? Wrench;
              return <li key={step.title}><span>{index + 1}</span><Icon aria-hidden="true" /><h3>{step.title}</h3><p>{step.description}</p></li>;
            })}
          </ol>
        </div>
      </section>

      <section className={`${styles.section} ${styles.faq}`} aria-labelledby="faq-title">
        <div className={styles.shell}>
          <header className={styles.sectionHeader}>
            <div><SectionNumber value="07" /><h2 id="faq-title">Preguntas frecuentes.</h2></div>
            <p>Resolvemos dudas iniciales sin convertir una referencia visual en una especificación técnica definitiva.</p>
          </header>
          <div className={styles.faqList}>
            {solution.faqs.map((faq) => (
              <details key={faq.question}>
                <summary>{faq.question}<ChevronDown aria-hidden="true" /></summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.contact} aria-labelledby="contact-title">
        <div className={styles.contactCopy}>
          <span>¿Tienes un proyecto?</span>
          <h2 id="contact-title">{profile.ctaTitle}</h2>
          <p>{profile.ctaDescription}</p>
          <a className={styles.primaryButton} href={contactHref} target="_blank" rel="noreferrer" data-analytics="whatsapp_click"><MessageCircle aria-hidden="true" /> Solicitar asesoría <ArrowRight aria-hidden="true" /></a>
        </div>
        <div className={styles.contactMedia}><Image src={profile.ctaImage} alt={`Referencia visual para ${solution.title}`} fill sizes="(min-width: 800px) 52vw, 100vw" /></div>
      </section>
    </main>
  );
}

function SectionNumber({ value }: { value: string }) {
  return <span className={styles.sectionNumber}><b>{value}</b><i /></span>;
}
