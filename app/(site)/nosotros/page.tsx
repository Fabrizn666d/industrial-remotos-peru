import type { Metadata } from "next";
import { BadgeCheck, Handshake, MapPin, MessageCircle, Navigation, Phone, ShieldCheck, Target, TrendingUp } from "lucide-react";
import Image from "next/image";
import { AboutHero } from "@/components/about/AboutHero";
import { AboutPresentationMedia } from "@/components/about/AboutPresentationMedia";
import { AboutWorkVideos } from "@/components/about/AboutWorkVideos";
import { ExperienceImpactMetrics } from "@/components/home/ExperienceImpactSection";
import { getAdminSession } from "@/lib/backend/auth";
import { getCmsDocument } from "@/lib/cms/content-repository";
import { googleMapsEmbedUrl, safeGoogleMapsHref } from "@/lib/maps";
import styles from "./AboutPage.module.css";

export const metadata: Metadata = {
  title: "Nosotros",
  description: "Conoce cómo Industrial Remotos Perú acompaña cada proyecto desde la idea hasta la entrega."
};

const objectPosition = { center: "center", top: "center top", bottom: "center bottom", left: "left center", right: "right center" } as const;
const valueIcons = [ShieldCheck, BadgeCheck, Target, Handshake] as const;

export default async function AboutPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const [{ content }, { content: company }, { content: home }] = await Promise.all([getCmsDocument("about"), getCmsDocument("company"), getCmsDocument("home")]);
  const query = await searchParams;
  const previewRequested = query?.preview === "videos";
  const previewEnabled = previewRequested && Boolean(await getAdminSession());
  const workVideos = content.workVideos.items.filter((item) => item.videoSrc && item.poster.src && (item.published || previewEnabled));
  const showWorkVideos = content.workVideos.visible && workVideos.length > 0;
  const mapHref = safeGoogleMapsHref(company.mapUrl);
  const mapEmbed = googleMapsEmbedUrl(company.mapUrl, company.location || company.address);
  const whatsappHref = `https://wa.me/${company.whatsappNumber}?text=${encodeURIComponent("Hola, Industrial Remotos Perú. Quisiera conversar sobre mi proyecto.")}`;

  return (
    <main id="contenido" className={styles.page} data-about-sticky={content.hero.visible && content.hero.stickyEnabled ? "true" : "false"}>
      {content.hero.visible && <AboutHero content={content.hero} />}

      {content.hero.visible && content.presentation.visible && <div className="irp-section-blend irp-section-blend--hero" aria-hidden="true" />}

      {content.presentation.visible && <section className={`${styles.presentation} ${styles.heroFollower}`} aria-labelledby="presentation-title" data-about-presentation data-motion-section>
        <div className={styles.presentationInner}>
          <div className={styles.presentationGrid}>
          <div className={styles.presentationCopy} data-motion-item data-motion-direction="left">
            <span>{content.presentation.eyebrow}</span>
            <h2 id="presentation-title">{content.presentation.title}</h2>
            <p>{content.presentation.body}</p>
            <p>{content.presentation.bodySecondary}</p>
            <strong>{content.presentation.statement}</strong>
          </div>
            <div data-motion-item data-motion-direction="right" data-motion-mask><AboutPresentationMedia presentation={content.presentation} /></div>
          </div>
          <div className={styles.presentationMetrics} aria-label="Experiencia que respalda cada proyecto" data-motion-item data-motion-direction="up">
            <ExperienceImpactMetrics metrics={home.impact.metrics} animateCards />
          </div>
        </div>
      </section>}

      {showWorkVideos && <AboutWorkVideos content={content.workVideos} items={workVideos} className={content.presentation.visible ? "" : styles.heroFollower} />}

      {content.purpose.visible && <section className={styles.purpose} aria-label="Misión y visión" data-about-purpose data-motion-section>
        <Image src={content.purpose.image.src} alt={content.purpose.image.alt} fill sizes="100vw" className={`${styles.cover} ${styles.desktopImage}`} style={{ objectPosition: objectPosition[content.purpose.image.position] }} />
        <Image src={content.purpose.mobileImage.src} alt={content.purpose.mobileImage.alt} fill sizes="100vw" className={`${styles.cover} ${styles.mobileImage}`} style={{ objectPosition: objectPosition[content.purpose.mobileImage.position] }} />
        <div className={styles.purposeShade} />
        <div className={styles.purposeGrid}>
          <article data-motion-item data-motion-direction="left"><Target aria-hidden="true" /><i /><h2>{content.purpose.missionTitle}</h2><p>{content.purpose.missionBody}</p></article>
          <article data-motion-item data-motion-direction="right"><TrendingUp aria-hidden="true" /><i /><h2>{content.purpose.visionTitle}</h2><p>{content.purpose.visionBody}</p></article>
        </div>
      </section>}

      {content.purpose.visible && content.values.visible && <div className="irp-section-blend" aria-hidden="true" />}

      {content.values.visible && <section className={styles.values} aria-labelledby="values-title" data-about-values data-motion-section>
        <div className={styles.valuesGrid}>
          <div className={styles.valuesCopy} data-motion-item data-motion-direction="left">
            <h2 id="values-title">{content.values.title}<br /><span>{content.values.titleAccent}</span></h2>
            <div className={styles.valueItems}>{content.values.items.map((item, index) => { const Icon = valueIcons[index % valueIcons.length]; return <article key={item.id}><Icon aria-hidden="true" /><div><h3>{item.title}</h3><p>{item.body}</p></div></article>; })}</div>
          </div>
          <div className={styles.valuesMedia} data-motion-item data-motion-direction="right" data-motion-mask><Image src={content.values.image.src} alt={content.values.image.alt} fill sizes="(min-width: 760px) 46vw, 100vw" className={styles.cover} style={{ objectPosition: objectPosition[content.values.image.position] }} /></div>
        </div>
      </section>}

      {content.values.visible && content.cta.visible && <div className="irp-section-blend" aria-hidden="true" />}

      {content.cta.visible && <section className={styles.visit} aria-labelledby="visit-title" data-about-contact data-motion-section>
        <div className={styles.visitGrid}>
          <div className={styles.mapColumn} data-motion-item data-motion-direction="left">
            <h2 id="visit-title">Visítanos y conversemos</h2>
            <div className={styles.mapFrame}>{mapEmbed ? <iframe title="Mapa de ubicación de Industrial Remotos Perú" src={mapEmbed} loading="lazy" referrerPolicy="no-referrer-when-downgrade" /> : <div className={styles.mapEmpty}><MapPin aria-hidden="true" /><span>Ubicación por configurar</span></div>}</div>
            <p><MapPin aria-hidden="true" />{company.location || company.address || "Ubicación por configurar"}</p>
            {mapHref && <a className={styles.directions} href={mapHref} target="_blank" rel="noreferrer"><Navigation aria-hidden="true" />Cómo llegar</a>}
          </div>
          <div className={styles.contactColumn} data-motion-item data-motion-direction="right">
            <div className={styles.speech}>{content.cta.title}</div>
            <Image src={content.cta.image.src} alt={content.cta.image.alt} width={1024} height={1536} sizes="(min-width: 760px) 330px, 230px" className={styles.character} />
            <div className={styles.contactActions}>
              <a className={styles.whatsapp} href={whatsappHref} target="_blank" rel="noreferrer"><MessageCircle aria-hidden="true" />{content.cta.label}</a>
              <a className={styles.phone} href={`tel:+${company.whatsappNumber}`}><Phone aria-hidden="true" />{company.phoneDisplay}</a>
            </div>
          </div>
        </div>
      </section>}
    </main>
  );
}
