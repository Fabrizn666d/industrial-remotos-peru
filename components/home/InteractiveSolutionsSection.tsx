"use client";

import { AnimatePresence, motion, useMotionValue, useSpring, type Variants } from "framer-motion";
import {
  ArrowRight,
  DoorOpen,
  Fence,
  Layers3,
  PanelsTopLeft,
  PencilRuler,
  SunMedium,
  Warehouse,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useId, useState, type PointerEvent } from "react";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import { createFadeUpVariants, createLineRevealVariants, createStaggerContainer, motionDuration, motionEase, scrollViewport } from "@/lib/motion";
import styles from "./InteractiveSolutionsSection.module.css";
import { usePublicPricingCatalog } from "@/lib/pricing/use-public-catalog";
import type { HomeContent } from "@/lib/cms/content-contracts";

const SCENE_ASSETS = {
  desktop: "/NUEVO/D/ChatGPT Image 22 sept 2026%2C 10_00_28.png",
  mobile: "/NUEVO/D/ChatGPT Image 22 sept 2026%2C 10_00_21.png"
} as const;

const services = [
  {
    id: "garage",
    shortTitle: "Garaje",
    title: "Puertas de garaje a medida",
    description: "Fabricadas según las dimensiones, el uso y el sistema de apertura de cada acceso.",
    href: "/soluciones/puertas-automatizacion",
    icon: Warehouse,
    desktop: { x: 38, y: 65 },
    mobile: { x: 22, y: 67 },
    cardPosition: "doors"
  },
  {
    id: "principales-medida",
    shortTitle: "A medida",
    title: "Puertas principales a medida",
    description: "Diseñadas y fabricadas para integrarse al ingreso, la fachada y el estilo del proyecto.",
    href: "/soluciones/puertas-a-medida",
    icon: DoorOpen,
    desktop: { x: 65, y: 60 },
    mobile: { x: 61, y: 68 },
    cardPosition: "doors"
  },
  {
    id: "puertas-medida",
    shortTitle: "Importadas",
    title: "Puertas principales importadas",
    description: "Modelos de catálogo disponibles por medida, acabado y color.",
    href: "/soluciones/puertas-principales",
    icon: PencilRuler,
    desktop: { x: 85, y: 25 },
    mobile: { x: 89, y: 39 },
    cardPosition: "fence"
  },
  {
    id: "baranda",
    shortTitle: "Barandas",
    title: "Acero inoxidable y barandas",
    description: "Barandas y pasamanos integrados al diseño y las necesidades del proyecto.",
    href: "/soluciones/acero-barandas",
    icon: Fence,
    desktop: { x: 49, y: 42 },
    mobile: { x: 34, y: 53 },
    cardPosition: "railing"
  },
  {
    id: "mamparas",
    shortTitle: "Mamparas",
    title: "Mamparas y ventanas",
    description: "Mamparas y ventanas que conectan ambientes y aprovechan la luz natural.",
    href: "/soluciones/ventanas-mamparas",
    icon: PanelsTopLeft,
    desktop: { x: 68, y: 43 },
    mobile: { x: 67, y: 55 },
    cardPosition: "windows"
  },
  {
    id: "solisombra",
    shortTitle: "Solisombra",
    title: "Techo solisombra",
    description: "Fabricado a medida para acondicionar terrazas, patios y cocheras.",
    href: "/soluciones/techos-coberturas",
    icon: SunMedium,
    desktop: { x: 58, y: 25 },
    mobile: { x: 58, y: 43 },
    cardPosition: "roof"
  },
  {
    id: "drywall",
    shortTitle: "Drywall",
    title: "Drywall y cielorrasos",
    description: "Acondicionamiento de interiores para distribuir y transformar espacios.",
    href: "/soluciones/drywall-cielorrasos",
    icon: Layers3,
    desktop: { x: 81, y: 59 },
    mobile: { x: 82, y: 69 },
    cardPosition: "drywall"
  }
] as const;

type ServiceId = (typeof services)[number]["id"];

export function InteractiveSolutionsSection({ content }: { content: HomeContent["integrated"] }) {
  const publicCatalog = usePublicPricingCatalog();
  const serviceItems = services.map((service) => { const edited = content.services.find((item) => item.id === service.id); const merged = edited ? { ...service, shortTitle: edited.shortTitle, title: edited.title, description: edited.body, href: edited.href, visible: edited.visible } : { ...service, visible: true }; return service.id === "puertas-medida" ? { ...merged, shortTitle: publicCatalog.homeCard.title, title: publicCatalog.homeCard.title, description: publicCatalog.homeCard.description, href: publicCatalog.homeCard.destination } : merged; }).filter((service) => service.visible && (service.id !== "puertas-medida" || publicCatalog.homeCard.visible));
  const [selectedId, setSelectedId] = useState<ServiceId>("garage");
  const [previewId, setPreviewId] = useState<ServiceId | null>(null);
  const reduceMotion = usePrefersReducedMotion();
  const panelId = useId();
  const scenePanelId = `${panelId}-scene`;
  const sceneX = useMotionValue(0);
  const sceneY = useMotionValue(0);
  const smoothX = useSpring(sceneX, { stiffness: 90, damping: 22, mass: 0.5 });
  const smoothY = useSpring(sceneY, { stiffness: 90, damping: 22, mass: 0.5 });
  const activeId = previewId ?? selectedId;
  const active = serviceItems.find((service) => service.id === activeId) ?? serviceItems[0] ?? services[0];
  const ActiveIcon = active.icon;
  const reveal = createFadeUpVariants(reduceMotion);
  const lineReveal = createLineRevealVariants(reduceMotion, .12);
  const list = createStaggerContainer(reduceMotion, .16);
  const row: Variants = {
    hidden: reduceMotion ? { opacity: 0 } : { opacity: 0, x: -28 },
    visible: { opacity: 1, x: 0, transition: { duration: reduceMotion ? motionDuration.reduced : .68, ease: motionEase.enter } }
  };

  function preview(serviceId: ServiceId, event: PointerEvent<HTMLElement>) {
    if (event.pointerType !== "touch") setPreviewId(serviceId);
  }

  function moveScene(event: PointerEvent<HTMLDivElement>) {
    if (reduceMotion || window.innerWidth <= 1100 || event.pointerType === "touch") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    sceneX.set(((event.clientX - bounds.left) / bounds.width - 0.5) * 10);
    sceneY.set(((event.clientY - bounds.top) / bounds.height - 0.5) * 8);
  }

  function resetScene() {
    sceneX.set(0);
    sceneY.set(0);
    setPreviewId(null);
  }

  return (
    <motion.section
      id="soluciones-integradas"
      className={styles.section}
      aria-labelledby="integrated-solutions-title"
      initial="hidden"
      whileInView="visible"
      viewport={scrollViewport}
    >
      <div className={styles.shell}>
        <motion.div className={styles.intro} variants={reveal}>
          <span className={styles.kicker}>{content.eyebrow}</span>
          <motion.i className={styles.kickerLine} variants={lineReveal} aria-hidden="true" />
          <h2 id="integrated-solutions-title">
            {content.title} <span>{content.titleAccent}</span>
          </h2>
          <p>{content.description}</p>
          <Link className={styles.primaryCta} href={content.cta.href} data-magnetic>
            {content.cta.label} <ArrowRight aria-hidden="true" />
          </Link>

          <motion.div className={styles.desktopSelector} variants={list} role="tablist" aria-label="Soluciones disponibles">
            {serviceItems.map(({ id, title, icon: Icon }) => {
              const isActive = id === activeId;
              return (
                <motion.button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={selectedId === id}
                  aria-controls={scenePanelId}
                  className={isActive ? styles.activeOption : undefined}
                  variants={row}
                  onClick={() => setSelectedId(id)}
                  onPointerEnter={(event) => preview(id, event)}
                  onPointerLeave={() => setPreviewId(null)}
                  onFocus={() => setPreviewId(id)}
                  onBlur={() => setPreviewId(null)}
                >
                  <Icon aria-hidden="true" />
                  <span>{title}</span>
                  <ArrowRight aria-hidden="true" />
                </motion.button>
              );
            })}
          </motion.div>
        </motion.div>

        <motion.div
          className={styles.scene}
          variants={{
            hidden: reduceMotion ? { opacity: 1 } : { opacity: 0, scale: 1.02 },
            visible: { opacity: 1, scale: 1, transition: { duration: reduceMotion ? motionDuration.reduced : 0.86, ease: motionEase.enter } }
          }}
          onPointerMove={moveScene}
          onPointerLeave={resetScene}
        >
          <motion.div className={styles.sceneArtwork} style={reduceMotion ? undefined : { x: smoothX, y: smoothY }}>
            <Image className={styles.desktopScene} src={content.desktopScene.src || SCENE_ASSETS.desktop} alt={content.desktopScene.alt} fill sizes="(min-width: 1101px) 62vw, 100vw" />
            <Image className={styles.mobileScene} src={content.mobileScene.src || SCENE_ASSETS.mobile} alt={content.mobileScene.alt} fill sizes="100vw" />

            {serviceItems.map((service, index) => {
              const isActive = service.id === activeId;
              return (
                <motion.button
                  key={service.id}
                  type="button"
                  className={`${styles.hotspot} ${isActive ? styles.activeHotspot : ""}`}
                  style={{
                    "--desktop-x": `${service.desktop.x}%`,
                    "--desktop-y": `${service.desktop.y}%`,
                    "--mobile-x": `${service.mobile.x}%`,
                    "--mobile-y": `${service.mobile.y}%`
                  } as React.CSSProperties}
                  aria-label={`Seleccionar ${service.title}`}
                  aria-pressed={selectedId === service.id}
                  initial={reduceMotion ? false : { opacity: 0, scale: 0.6 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: reduceMotion ? 0 : 0.38 + index * 0.08, duration: reduceMotion ? motionDuration.reduced : 0.5, ease: motionEase.enter }}
                  onClick={() => setSelectedId(service.id)}
                  onPointerEnter={(event) => preview(service.id, event)}
                  onPointerLeave={() => setPreviewId(null)}
                  onFocus={() => setPreviewId(service.id)}
                  onBlur={() => setPreviewId(null)}
                >
                  <span />
                </motion.button>
              );
            })}

            <Link
              href="/soluciones/puertas-principales"
              className={`${styles.hotspot} ${styles.secondaryDoor} ${activeId === "principales-medida" || activeId === "puertas-medida" ? styles.activeHotspot : ""}`}
              aria-label="Conocer puertas principales importadas"
              title="Puertas principales importadas"
              onPointerEnter={(event) => preview("puertas-medida", event)}
              onPointerLeave={() => setPreviewId(null)}
              onFocus={() => setPreviewId("puertas-medida")}
              onBlur={() => setPreviewId(null)}
            >
              <span aria-hidden="true" />
            </Link>

            <AnimatePresence mode="wait">
              <motion.article
                key={active.id}
                id={scenePanelId}
                role="tabpanel"
                aria-live="polite"
                className={styles.floatingCard}
                data-position={active.cardPosition}
                initial={reduceMotion ? false : { opacity: 0, scale: 0.96, y: 7 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={reduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.96, y: -5 }}
                transition={{ duration: reduceMotion ? motionDuration.reduced : 0.34, ease: motionEase.enter }}
              >
                <ActiveIcon aria-hidden="true" />
                <div>
                  <h3>{active.title}</h3>
                  <p>{active.description}</p>
                  {"note" in active && typeof active.note === "string" && <small>{active.note}</small>}
                  <Link href={active.href}>Explorar solución <ArrowRight aria-hidden="true" /></Link>
                </div>
              </motion.article>
            </AnimatePresence>
          </motion.div>
        </motion.div>

        <div className={styles.mobileControls}>
          <div className={styles.mobileSelector} role="tablist" aria-label="Soluciones disponibles">
            <div className={styles.mobileSelectorTrack}>
              {([0, 1] as const).map((copyIndex) => (
                <div
                  key={copyIndex}
                  className={styles.mobileSelectorGroup}
                  aria-hidden={copyIndex === 1 ? true : undefined}
                >
                  {serviceItems.map(({ id, shortTitle, icon: Icon }) => (
                    <button
                      key={`${copyIndex}-${id}`}
                      type="button"
                      role={copyIndex === 0 ? "tab" : undefined}
                      tabIndex={copyIndex === 1 ? -1 : undefined}
                      aria-selected={copyIndex === 0 ? selectedId === id : undefined}
                      aria-controls={copyIndex === 0 ? scenePanelId : undefined}
                      className={selectedId === id ? styles.activeMobileOption : undefined}
                      onClick={() => setSelectedId(id)}
                    >
                      <Icon aria-hidden="true" />
                      {shortTitle}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.article
              key={active.id}
              id={panelId}
              role="tabpanel"
              className={styles.mobileCard}
              initial={reduceMotion ? false : { opacity: 0, scale: 0.97, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.97, y: -6 }}
              transition={{ duration: reduceMotion ? motionDuration.reduced : 0.34, ease: motionEase.enter }}
            >
              <ActiveIcon aria-hidden="true" />
              <div>
                <h3>{active.title}</h3>
                <p>{active.description}</p>
                {"note" in active && typeof active.note === "string" && <small>{active.note}</small>}
                <Link href={active.href}>Explorar solución <ArrowRight aria-hidden="true" /></Link>
              </div>
            </motion.article>
          </AnimatePresence>
        </div>
      </div>
    </motion.section>
  );
}
