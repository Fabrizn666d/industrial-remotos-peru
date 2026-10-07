"use client";

import { motion, useInView } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { AnimatedCounter } from "./AnimatedCounter";

import styles from "./ExperienceImpactSection.module.css";

type Metric = {
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

const metrics: Metric[] = [
  { value: 12, prefix: "+", suffix: "", label: "Años de experiencia", progress: 100 },
  { value: 958, prefix: "+", suffix: "", label: "Proyectos finalizados", progress: 100 },
  { value: 100, prefix: "", suffix: "%", label: "Soluciones a medida", progress: 100 },
];

const impactImages = [
  "/NUEVO/G/Imagen%20de%20ChatGPT%2027%20sept%202026%2C%2020_40_10-1.png",
  "/NUEVO/G/Imagen%20de%20ChatGPT%2027%20sept%202026%2C%2020_40_13-2.png",
  "/NUEVO/G/Imagen%20de%20ChatGPT%2027%20sept%202026%2C%2020_40_16-3.png",
  "/NUEVO/G/Imagen%20de%20ChatGPT%2027%20sept%202026%2C%2020_40_19-4.png",
  "/NUEVO/G/Imagen%20de%20ChatGPT%2027%20sept%202026%2C%2020_40_24-5.png",
  "/NUEVO/G/Imagen%20de%20ChatGPT%2027%20sept%202026%2C%2020_40_29-6.png",
] as const;
const tileSizes = ["medium", "large", "small"] as const;
const mosaic: ImpactTile[] = impactImages.map((src, index) => ({
  src,
  size: tileSizes[index % tileSizes.length],
}));

const sourceColumns = Array.from({ length: 6 }, (_, column) =>
  Array.from({ length: 4 }, (_, tile) => mosaic[(column + tile) % mosaic.length]),
);

const visualColumns = Array.from({ length: 10 }, (_, column) => {
  const source = sourceColumns[column % sourceColumns.length];
  return Array.from({ length: 4 }, (_, tile) => source[tile % source.length]);
});

function GaugeCard({
  metric,
  index
}: {
  metric: Metric;
  index: number;
}) {
  const gradientId = `irp-impact-gauge-${index}`;
  const cardRef = useRef<HTMLElement>(null);
  const start = useInView(cardRef, { once: true, amount: 0.55 });
  const gaugeTransition = {
    duration: 2.15,
    ease: [0.16, 1, 0.3, 1] as const,
    delay: index * 0.12
  };

  return (
    <article ref={cardRef} className={styles.gaugeCard} data-impact-card>
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
              <animate attributeName="x1" values="-160;160" dur="2.8s" repeatCount="indefinite" />
              <animate attributeName="x2" values="0;320" dur="2.8s" repeatCount="indefinite" />
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
    </article>
  );
}

export function ExperienceImpactSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let disposed = false;
    let context: { revert: () => void } | undefined;
    let media:
      | {
          add: (query: string, callback: () => void) => unknown;
          revert: () => void;
        }
      | undefined;
    let refreshFrame = 0;
    let pendingImages: HTMLImageElement[] = [];
    let refreshAfterImages: (() => void) | undefined;

    void Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([gsapModule, scrollTriggerModule]) => {
        if (disposed) return;

        const gsap = gsapModule.gsap;
        const ScrollTrigger = scrollTriggerModule.ScrollTrigger;
        gsap.registerPlugin(ScrollTrigger);

        context = gsap.context(() => {
          const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          const intro = section.querySelector<HTMLElement>("[data-impact-intro]");
          const ambient = section.querySelector<HTMLElement>("[data-impact-ambient]");
          const lines = gsap.utils.toArray<HTMLElement>("[data-impact-line]", section);
          const sweeps = gsap.utils.toArray<HTMLElement>("[data-impact-sweep]", section);
          const copy = section.querySelector<HTMLElement>("[data-impact-copy]");
          const cards = gsap.utils.toArray<HTMLElement>("[data-impact-card]", section);
          const gauges = section.querySelector<HTMLElement>("[data-impact-gauges]");

          if (intro && ambient) {
            if (reduced) {
              gsap.set(ambient, { autoAlpha: 1, scale: 1, yPercent: 0 });
              gsap.set(lines, { autoAlpha: 1, yPercent: 0, filter: "blur(0px)" });
              gsap.set(sweeps, { autoAlpha: 0 });
              if (copy) gsap.set(copy, { autoAlpha: 1, y: 0, filter: "blur(0px)" });
            } else {
              gsap.fromTo(
                ambient,
                { autoAlpha: 0, scale: 1.05, yPercent: 10 },
                {
                  autoAlpha: 1,
                  scale: 1,
                  yPercent: 0,
                  ease: "none",
                  scrollTrigger: { trigger: intro, start: "top 90%", end: "center 55%", scrub: 1.2 },
                },
              );

              const introTimeline = gsap.timeline({
                scrollTrigger: { trigger: intro, start: "top 78%", once: true },
              });
              introTimeline
                .fromTo(
                  lines,
                  { autoAlpha: 0, yPercent: 110, filter: "blur(8px)" },
                  {
                    autoAlpha: 1,
                    yPercent: 0,
                    filter: "blur(0px)",
                    duration: 1.12,
                    stagger: 0.13,
                    ease: "power3.out",
                  },
                )
                .fromTo(
                  sweeps,
                  { autoAlpha: 0, xPercent: -110 },
                  {
                    keyframes: [
                      { autoAlpha: 0.52, duration: 0.18 },
                      { xPercent: 115, autoAlpha: 0, duration: 0.7 },
                    ],
                    stagger: 0.1,
                    ease: "power2.inOut",
                  },
                  0.16,
                );

              if (copy) {
                introTimeline.fromTo(
                  copy,
                  { autoAlpha: 0, y: 18, filter: "blur(4px)" },
                  {
                    autoAlpha: 1,
                    y: 0,
                    filter: "blur(0px)",
                    duration: 0.78,
                    ease: "power3.out",
                  },
                  "-=0.32",
                );
              }
            }
          }

          if (gauges) {
            if (reduced) {
              gsap.set(cards, { autoAlpha: 1, y: 0, scale: 1, filter: "blur(0px)" });
            } else {
              gsap.set(cards, { autoAlpha: 0, y: 45, scale: 0.965, filter: "blur(5px)" });

              const gaugeTimeline = gsap.timeline({
                scrollTrigger: { trigger: gauges, start: "top 92%", once: true },
              });
              gaugeTimeline.to(
                cards,
                {
                  autoAlpha: 1,
                  y: 0,
                  scale: 1,
                  filter: "blur(0px)",
                  duration: 0.68,
                  stagger: 0.09,
                  ease: "power3.out",
                },
                0,
              );

            }
          }

          media = gsap.matchMedia();
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

          const images = gsap.utils.toArray<HTMLImageElement>("[data-impact-tile] img", section);
          pendingImages = images.filter((image) => !image.complete);
          refreshAfterImages = () => {
            if (pendingImages.every((image) => image.complete)) ScrollTrigger.refresh();
          };
          pendingImages.forEach((image) => {
            image.addEventListener("load", refreshAfterImages!, { once: true });
            image.addEventListener("error", refreshAfterImages!, { once: true });
          });
          refreshFrame = window.requestAnimationFrame(() => ScrollTrigger.refresh());
        }, section);
      },
    );

    return () => {
      disposed = true;
      if (refreshFrame) window.cancelAnimationFrame(refreshFrame);
      if (refreshAfterImages) {
        pendingImages.forEach((image) => {
          image.removeEventListener("load", refreshAfterImages!);
          image.removeEventListener("error", refreshAfterImages!);
        });
      }
      media?.revert();
      context?.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="experiencia"
      className={styles.section}
      aria-labelledby="experience-impact-title"
    >
      <div className={styles.ambient} data-impact-ambient aria-hidden="true" />

      <div className={styles.tileViewport} aria-hidden="true">
        <div className={styles.tileScene}>
          {visualColumns.map((tiles, columnIndex) => (
            <div className={styles.tileColumn} data-impact-column key={`impact-column-${columnIndex + 1}`}>
              <div className={styles.tileMover} data-impact-mover>
                {tiles.map((tile, tileIndex) => (
                  <div
                    className={`${styles.tile} ${styles[tile.size]}`}
                    data-impact-tile
                    key={`${tile.src}-${columnIndex}-${tileIndex}`}
                  >
                    <Image
                      src={tile.src}
                      alt=""
                      fill
                      loading="lazy"
                      sizes="(max-width: 768px) 58vw, (max-width: 1024px) 30vw, 20vw"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.intro} data-impact-intro>
          <h2 id="experience-impact-title">
            <span className={styles.titleMask}>
              <span data-impact-line>EXPERIENCIA QUE</span>
              <span className={styles.titleSweep} data-impact-sweep aria-hidden="true">
                EXPERIENCIA QUE
              </span>
            </span>
            <span className={styles.titleMask}>
              <span data-impact-line>RESPALDA CADA <span className={styles.titleAccent}>PROYECTO</span></span>
              <span className={styles.titleSweep} data-impact-sweep aria-hidden="true">
                RESPALDA CADA PROYECTO
              </span>
            </span>
          </h2>
          <p data-impact-copy>
            Trayectoria, ejecución y compromiso respaldan cada proyecto que asumimos.
          </p>
        </div>

        <div className={styles.gauges} data-impact-gauges>
          {metrics.map((metric, index) => (
            <GaugeCard
              metric={metric}
              index={index}
              key={metric.label}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
