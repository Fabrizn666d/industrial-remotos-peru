"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef } from "react";

import type { HomeContent } from "@/lib/cms/content-contracts";
import { AnimatedCounter } from "./AnimatedCounter";
import styles from "./ExperienceImpactSection.module.css";

type Metric = {
  id?: string;
  value: number;
  prefix: string;
  suffix: string;
  label: string;
  progress: number;
};

type ImpactTile = {
  src: string;
  size: "small" | "medium" | "large";
};

const tileSizes = ["medium", "large", "small"] as const;

function GaugeCard({
  metric,
  index,
  animateCard = false,
}: {
  metric: Metric;
  index: number;
  animateCard?: boolean;
}) {
  const gradientId = `irp-impact-gauge-${index}`;
  const cardRef = useRef<HTMLElement>(null);
  const start = useInView(cardRef, { once: true, amount: 0.55 });
  const reduceMotion = useReducedMotion();
  const gaugeTransition = {
    duration: 2.15,
    ease: [0.16, 1, 0.3, 1] as const,
    delay: index * 0.12,
  };

  return (
    <motion.article
      ref={cardRef}
      className={styles.gaugeCard}
      data-impact-card
      initial={animateCard && !reduceMotion ? { opacity: 0, y: 32, scale: 0.97 } : false}
      animate={
        animateCard
          ? reduceMotion || start
            ? { opacity: 1, y: 0, scale: 1 }
            : { opacity: 0, y: 32, scale: 0.97 }
          : undefined
      }
      transition={animateCard ? { duration: 0.68, delay: index * 0.09, ease: [0.16, 1, 0.3, 1] } : undefined}
    >
      <div className={styles.gauge}>
        <svg viewBox="0 0 160 92" aria-hidden="true">
          <defs>
            <linearGradient
              id={gradientId}
              gradientUnits="userSpaceOnUse"
              x1="-160"
              y1="0"
              x2="0"
              y2="0"
              spreadMethod="reflect"
            >
              <stop offset="0" stopColor="#075cff" />
              <stop offset="0.38" stopColor="#21a5ff" />
              <stop offset="0.52" stopColor="#c5efff" />
              <stop offset="0.66" stopColor="#39b8ff" />
              <stop offset="1" stopColor="#086cf2" />
              {!reduceMotion ? (
                <>
                  <animate attributeName="x1" values="-160;160" dur="2.8s" repeatCount="indefinite" />
                  <animate attributeName="x2" values="0;320" dur="2.8s" repeatCount="indefinite" />
                </>
              ) : null}
            </linearGradient>
          </defs>
          <path className={styles.gaugeTrack} pathLength="100" d="M15 79A65 65 0 0 1 145 79" />
          <motion.path
            className={styles.gaugeActive}
            pathLength="100"
            d="M15 79A65 65 0 0 1 145 79"
            style={{ stroke: `url(#${gradientId})` }}
            initial={{ strokeDashoffset: 100 }}
            animate={{ strokeDashoffset: start ? 100 - metric.progress : 100 }}
            transition={gaugeTransition}
          />
        </svg>
        <div className={styles.gaugeValue}>
          {metric.prefix ? (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: start ? 1 : 0 }} transition={gaugeTransition}>
              {metric.prefix}
            </motion.span>
          ) : null}
          <strong><AnimatedCounter value={metric.value} start={start} /></strong>
          {metric.suffix ? (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: start ? 1 : 0 }} transition={gaugeTransition}>
              {metric.suffix}
            </motion.span>
          ) : null}
        </div>
      </div>
      <p>{metric.label}</p>
    </motion.article>
  );
}

export function ExperienceImpactMetrics({
  metrics,
  className,
  animateCards = false,
}: {
  metrics: Metric[];
  className?: string;
  animateCards?: boolean;
}) {
  return (
    <div className={`${styles.gauges} ${className || ""}`} data-impact-gauges>
      {metrics.map((metric, index) => (
        <GaugeCard metric={metric} index={index} animateCard={animateCards} key={metric.id || metric.label} />
      ))}
    </div>
  );
}

export function ExperienceImpactSection({ content }: { content: HomeContent["impact"] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const contentMosaic: ImpactTile[] = content.gallery.map((image, index) => ({
    src: image.src,
    size: tileSizes[index % tileSizes.length],
  }));
  const contentColumns = contentMosaic.length
    ? Array.from({ length: 10 }, (_, column) =>
        Array.from({ length: 4 }, (_, tile) => contentMosaic[(column + tile) % contentMosaic.length]),
      )
    : [];

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let disposed = false;
    let context: { revert: () => void } | undefined;
    let media: { add: (query: string, callback: () => void) => unknown; revert: () => void } | undefined;

    void Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([gsapModule, scrollTriggerModule]) => {
      if (disposed) return;

      const gsap = gsapModule.gsap;
      const ScrollTrigger = scrollTriggerModule.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);

      context = gsap.context(() => {
        const viewport = section.querySelector<HTMLElement>("[data-impact-mosaic]");
        if (!viewport) return;

        media = gsap.matchMedia();
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const setupColumnParallax = (moveAmount: number) => {
          const movers = gsap.utils
            .toArray<HTMLElement>("[data-impact-column]", section)
            .filter((column) => window.getComputedStyle(column).display !== "none")
            .map((column) => column.querySelector<HTMLElement>("[data-impact-mover]"))
            .filter((mover): mover is HTMLElement => Boolean(mover));
          const state = { progress: 0 };
          let travel = moveAmount;

          const measureTravel = () => {
            travel = ((section.offsetHeight + window.innerHeight) / window.innerHeight) * moveAmount;
            section.dataset.parallaxDistance = Math.round(travel).toString();
          };
          const renderColumns = () => {
            movers.forEach((mover, index) => {
              const direction = index % 2 === 0 ? 1 : -1;
              gsap.set(mover, { y: direction * travel * (state.progress - 0.5) });
            });
            section.dataset.parallaxProgress = state.progress.toFixed(3);
          };

          measureTravel();
          renderColumns();
          gsap.to(state, {
            progress: 1,
            ease: "none",
            onUpdate: renderColumns,
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
              invalidateOnRefresh: true,
              onRefresh: () => {
                measureTravel();
                renderColumns();
              },
            },
          });
        };

        media.add("(min-width: 769px)", () => {
          setupColumnParallax(100);
          if (!reduced) {
            gsap.utils
              .toArray<HTMLElement>("[data-impact-tile]", section)
              .filter((_, index) => index % 4 === 1)
              .forEach((tile, index) => {
                gsap.fromTo(
                  tile,
                  { scale: index % 2 === 0 ? 0.985 : 0.99, autoAlpha: 0.9 },
                  {
                    scale: index % 2 === 0 ? 1.01 : 1,
                    autoAlpha: 1,
                    ease: "none",
                    scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: 1.2 },
                  },
                );
              });
          }
        });
        media.add("(max-width: 768px)", () => setupColumnParallax(46));
        requestAnimationFrame(() => ScrollTrigger.refresh());
      }, section);
    });

    return () => {
      disposed = true;
      media?.revert();
      context?.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} id="experiencia" className={styles.section} aria-labelledby="experience-impact-title">
      <Image
        className={styles.background}
        src="/NUEVO/EN ARCO/Patio moderno luminoso en tonos marfil-3.png"
        alt=""
        fill
        sizes="100vw"
        aria-hidden="true"
      />

      <div className={`${styles.sideArtwork} ${styles.sideArtworkLeft}`} aria-hidden="true">
        <Image
          src="/NUEVO/EN ARCO/Técnico sonriente con arco azul-1.png"
          alt=""
          fill
          sizes="(max-width: 768px) 48vw, 30vw"
        />
      </div>

      <div className={`${styles.sideArtwork} ${styles.sideArtworkRight}`} aria-hidden="true">
        <Image
          src="/NUEVO/EN ARCO/Robot sonriente tras arco azul-2.png"
          alt=""
          fill
          sizes="(max-width: 768px) 48vw, 30vw"
        />
      </div>

      <div className={styles.content}>
        <div className={styles.intro}>
          <h2 id="experience-impact-title">
            <span>{content.titleLine1}</span>
            <span>{content.titleLine2}</span>
            <span className={styles.titleAccent}>{content.titleAccent}</span>
          </h2>
          <p>{content.description}</p>
        </div>

        <ExperienceImpactMetrics metrics={content.metrics} animateCards />
      </div>

      {contentColumns.length ? (
        <div className={styles.mosaicViewport} data-impact-mosaic aria-hidden="true">
          <div className={styles.mosaicScene}>
            {contentColumns.map((tiles, columnIndex) => (
              <div className={styles.mosaicColumn} data-impact-column key={`impact-column-${columnIndex + 1}`}>
                <div className={styles.mosaicMover} data-impact-mover>
                  {tiles.map((tile, tileIndex) => (
                    <div className={`${styles.mosaicTile} ${styles[tile.size]}`} data-impact-tile key={`${tile.src}-${columnIndex}-${tileIndex}`}>
                      <Image
                        src={tile.src}
                        alt=""
                        fill
                        loading="lazy"
                        sizes="(max-width: 680px) 48vw, (max-width: 1024px) 28vw, 19vw"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
