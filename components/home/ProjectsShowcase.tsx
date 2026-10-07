"use client";

import AutoScroll from "embla-carousel-auto-scroll";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FadeInUp } from "@/components/ui/motion-presets";
import styles from "./ProjectsShowcase.module.css";

type GalleryItem = {
  src: string;
  alt: string;
};

const galleryBasePath = "/NUEVO/0244%20_%20Industrial%20Remotos%20Per%C3%BA";

const horizontalFiles = [
  "568622540_18541682776023697_2898209659948674725_n.jpg",
  "570467717_18541682740023697_3898148090726688004_n.jpg",
  "469871080_613600431022329_5805352904668475090_n.jpg",
  "475080756_895937286064586_8414433836778002826_n.jpg",
  "59f8e16356690ad0ed0d23003f625b12.jpg",
  "469844081_613600541022318_5789063741911902499_n.jpg",
  "0406ce88906c37114a5f104067904ee8.jpg"
] as const;

const verticalFiles = [
  "517973187_18521122168023697_7983262875403270503_n.jpg",
  "518725630_18521122186023697_1856270268970858176_n.jpg",
  "519986629_18521122156023697_2711557901695165167_n.jpg",
  "475366100_896701509321497_8688991753742933952_n.jpg",
  "FB_IMG_1783919832498.jpg",
  "FB_IMG_1783919826529.jpg",
  "IMG-20250831-WA0055.jpg",
  "IMG_20250701_170029639_HDR.jpg",
  "IMG_20250813_141317978_HDR.jpg",
  "IMG_20250813_141333223_HDR.jpg",
  "IMG_20250813_141337861_HDR.jpg",
  "IMG_20250813_141354770_HDR.jpg",
  "IMG_20250825_113648909_HDR.jpg",
  "IMG_20250908_181509459_HDR.jpg",
  "IMG_20250908_181805648_HDR.jpg",
  "IMG_20250908_212754470_HDR.jpg",
  "IMG_20250919_173942964_HDR.jpg",
  "IMG_20251002_162125663_HDR.jpg",
  "IMG_20251017_165003646_HDR.jpg",
  "IMG_20251021_102928814_HDR.jpg",
  "IMG_20251117_181102120_HDR.jpg",
  "IMG_20251220_143405820_HDR.jpg",
  "IMG_20251225_180226803_HDR.jpg",
  "IMG_20251225_180309703_HDR.jpg",
  "IMG_20251231_113813700_HDR.jpg",
  "IMG_20251231_124458662_HDR.jpg",
  "IMG_20251231_125335039_HDR.jpg",
  "IMG_20260110_230545425_HDR.jpg",
  "IMG_20260129_130001716.jpg",
  "IMG_20260214_160440539_HDR.jpg",
  "IMG_20260214_215514033_HDR.jpg",
  "IMG_20260217_150856070_HDR.jpg",
  "IMG_20260217_150925722_HDR.jpg",
  "IMG_20260217_152410408.jpg",
  "IMG_20260303_153256034_HDR.jpg",
  "IMG_20260303_153305366_HDR.jpg",
  "IMG_20260304_085708709_HDR.jpg",
  "IMG_20260304_094330208_HDR.jpg",
  "IMG_20260304_094448912_HDR.jpg",
  "IMG_20260304_102827616_HDR.jpg",
  "IMG_20260304_103039439_HDR.jpg",
  "IMG_20260317_095542480_HDR.jpg",
  "IMG_20260424_121556340_HDR.jpg",
  "IMG_20260427_131659691_HDR.jpg",
  "IMG_20260427_131705830_HDR.jpg",
  "IMG_20260625_104612439_HDR.jpg",
  "IMG_20260625_165423046_HDR.jpg",
  "IMG_20260724_164749178_HDR.jpg",
  "IMG_20260726_175538735_HDR.jpg",
  "IMG_20260726_205610528_HDR.jpg",
  "IMG_20260726_205634111_HDR.jpg",
  "IMG_20260808_204222351_HDR.jpg"
] as const;

function createGalleryItems(files: readonly string[], rowLabel: string): GalleryItem[] {
  return files.map((fileName, index) => ({
    src: `${galleryBasePath}/${encodeURIComponent(fileName)}`,
    alt: `${rowLabel} de Industrial Remotos Perú ${String(index + 1).padStart(2, "0")}`
  }));
}

const topRow = createGalleryItems(horizontalFiles, "Proyecto horizontal");
const bottomRow = createGalleryItems(verticalFiles, "Proyecto vertical");

function GallerySlides({ items, row, variant }: { items: GalleryItem[]; row: string; variant: "landscape" | "portrait" }) {
  return Array.from({ length: 2 }, (_, cycle) => items.map((item, index) => (
    <figure
      className={`${styles.shot} ${variant === "portrait" ? styles.portraitShot : styles.landscapeShot}`}
      key={`${row}-${cycle}-${item.src}`}
      aria-hidden={cycle === 1 || undefined}
    >
      <Image
        src={item.src}
        alt={cycle === 1 ? "" : item.alt}
        fill
        sizes={variant === "portrait"
          ? "(max-width: 767px) 44vw, (max-width: 1024px) 34vw, 25vw"
          : "(max-width: 767px) 88vw, (max-width: 1024px) 72vw, 50vw"}
      />
      {cycle === 0 && index === 0 ? <span className="sr-only">Inicio de la fila de proyectos</span> : null}
    </figure>
  )));
}

export function ProjectsShowcase() {
  const galleryRef = useRef<HTMLDivElement>(null);
  const [topPlugins] = useState(() => [AutoScroll({
    playOnInit: false,
    speed: 0.9,
    startDelay: 0,
    direction: "forward",
    stopOnInteraction: false,
    stopOnMouseEnter: false,
    stopOnFocusIn: false
  })]);
  const [bottomPlugins] = useState(() => [AutoScroll({
    playOnInit: false,
    speed: 0.78,
    startDelay: 0,
    direction: "backward",
    stopOnInteraction: false,
    stopOnMouseEnter: false,
    stopOnFocusIn: false
  })]);
  const [topRef, topApi] = useEmblaCarousel({
    loop: true,
    dragFree: true,
    align: "start",
    containScroll: false,
    skipSnaps: true
  }, topPlugins);
  const [bottomRef, bottomApi] = useEmblaCarousel({
    loop: true,
    dragFree: true,
    align: "start",
    containScroll: false,
    skipSnaps: true,
    startIndex: bottomRow.length
  }, bottomPlugins);

  useEffect(() => {
    const gallery = galleryRef.current;
    if (!gallery || !topApi || !bottomApi) return;

    const apis = [topApi, bottomApi];
    let galleryIsVisible = false;

    const playVisibleCarousels = () => {
      if (!galleryIsVisible || document.hidden) return;
      apis.forEach((api) => {
        const autoScroll = api.plugins().autoScroll;
        if (!autoScroll?.isPlaying()) autoScroll?.play(0);
      });
    };

    const stopCarousels = () => {
      apis.forEach((api) => api.plugins().autoScroll?.stop());
    };

    const observer = new IntersectionObserver(([entry]) => {
      galleryIsVisible = entry.isIntersecting;
      if (galleryIsVisible) playVisibleCarousels();
      else stopCarousels();
    }, {
      threshold: 0.12,
      rootMargin: "0px 0px -8% 0px"
    });

    observer.observe(gallery);

    const cleanups = apis.map((api) => {

      const root = api.rootNode();
      const autoScroll = api.plugins().autoScroll;
      let resumeTimer = 0;

      const ensurePlaying = () => {
        window.clearTimeout(resumeTimer);
        if (galleryIsVisible && !document.hidden && !autoScroll?.isPlaying()) autoScroll?.play(0);
      };
      const beginDrag = () => {
        root.classList.add(styles.dragging);
        window.clearTimeout(resumeTimer);
        autoScroll?.stop();
      };
      const finishDrag = () => {
        root.classList.remove(styles.dragging);
        window.clearTimeout(resumeTimer);
        resumeTimer = window.setTimeout(ensurePlaying, 260);
      };

      const handleVisibility = () => {
        if (document.hidden) autoScroll?.stop();
        else ensurePlaying();
      };

      root.addEventListener("pointerdown", beginDrag);
      root.addEventListener("pointerup", finishDrag);
      root.addEventListener("pointercancel", finishDrag);
      root.addEventListener("pointerleave", finishDrag);
      document.addEventListener("visibilitychange", handleVisibility);
      window.addEventListener("focus", ensurePlaying);
      api.on("reInit", ensurePlaying);

      return () => {
        window.clearTimeout(resumeTimer);
        autoScroll?.stop();
        root.removeEventListener("pointerdown", beginDrag);
        root.removeEventListener("pointerup", finishDrag);
        root.removeEventListener("pointercancel", finishDrag);
        root.removeEventListener("pointerleave", finishDrag);
        document.removeEventListener("visibilitychange", handleVisibility);
        window.removeEventListener("focus", ensurePlaying);
        api.off("reInit", ensurePlaying);
      };
    });

    return () => {
      observer.disconnect();
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [topApi, bottomApi]);

  return (
    <section id="proyectos" className={styles.section} aria-labelledby="projects-showcase-title">
      <div className={styles.ambient} aria-hidden="true" />

      <header className={styles.intro}>
        <FadeInUp as="span" className={styles.kicker} duration={0.54} offset={14}>
          Nuestros proyectos
        </FadeInUp>
        <FadeInUp className={styles.titleReveal} duration={0.72} offset={34}>
          <h2 id="projects-showcase-title">
            <span>Proyectos reales que</span>
            <span className={styles.accent}>inspiran confianza</span>
          </h2>
        </FadeInUp>
        <FadeInUp as="p" className={styles.description} delay={0.1} duration={0.62} offset={18}>
          Conoce algunas de nuestras instalaciones y soluciones realizadas en hogares, empresas e industrias.<br />
          Cada proyecto refleja nuestro compromiso con la calidad, la seguridad y la excelencia en cada detalle.
        </FadeInUp>
        <FadeInUp className={styles.ctaReveal} delay={0.18} duration={0.58} offset={14}>
          <Link href="/proyectos" className={styles.cta}>
            Ver más proyectos <ArrowUpRight aria-hidden="true" />
          </Link>
        </FadeInUp>
      </header>

      {topRow.length > 0 && bottomRow.length > 0 ? (
        <div ref={galleryRef} className={styles.gallery} aria-label="Proyectos de Industrial Remotos Perú">
          <div ref={topRef} className={styles.row} aria-label="Carrusel superior de proyectos" aria-roledescription="carrusel">
            <div className={styles.track}>
              <GallerySlides items={topRow} row="top" variant="landscape" />
            </div>
          </div>
          <div ref={bottomRef} className={styles.row} aria-label="Carrusel inferior de proyectos" aria-roledescription="carrusel">
            <div className={styles.track}>
              <GallerySlides items={bottomRow} row="bottom" variant="portrait" />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
