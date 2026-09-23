"use client";

import { AnimatePresence, motion, useMotionValue, useSpring, type Variants } from "framer-motion";
import {
  ArrowRight,
  DoorOpen,
  Fence,
  Layers3,
  PanelsTopLeft,
  SunMedium,
  Warehouse,
  Zap
} from "lucide-react";
import Link from "next/link";
import { useId, useState, type PointerEvent } from "react";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import styles from "./InteractiveSolutionsSection.module.css";

const SCENE_ASSETS = {
  desktop: "/NUEVO/D/ChatGPT Image 22 sept 2026%2C 10_00_28.png",
  mobile: "/NUEVO/D/ChatGPT Image 22 sept 2026%2C 10_00_21.png"
} as const;

const services = [
  {
    id: "puertas",
    shortTitle: "Puertas",
    title: "Puertas automáticas / garaje",
    description: "Puertas de garaje y accesos vehiculares con automatización y control adaptados al proyecto.",
    href: "/soluciones/puertas-automatizacion",
    icon: Warehouse,
    desktop: { x: 38, y: 65 },
    mobile: { x: 22, y: 67 },
    cardPosition: "doors"
  },
  {
    id: "baranda",
    shortTitle: "Baranda",
    title: "Baranda / acero inoxidable",
    description: "Barandas y elementos en acero inoxidable integrados al diseño y las necesidades del proyecto.",
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
    description: "Coberturas diseñadas para acondicionar terrazas y otros espacios exteriores.",
    href: "/soluciones/techos-coberturas",
    icon: SunMedium,
    desktop: { x: 58, y: 25 },
    mobile: { x: 58, y: 43 },
    cardPosition: "roof"
  },
  {
    id: "cerco",
    shortTitle: "Cerco",
    title: "Cerco Eléctrico",
    description: "Protección perimetral adaptada a la configuración de cada proyecto.",
    href: "/soluciones/cerco-electrico",
    icon: Zap,
    desktop: { x: 85, y: 25 },
    mobile: { x: 89, y: 39 },
    cardPosition: "fence"
  },
  {
    id: "drywall",
    shortTitle: "Drywall",
    title: "Drywall",
    description: "Acondicionamiento de interiores para distribuir y transformar espacios.",
    href: "/soluciones/drywall-cielorrasos",
    icon: Layers3,
    desktop: { x: 81, y: 59 },
    mobile: { x: 82, y: 69 },
    cardPosition: "drywall"
  }
] as const;

type ServiceId = (typeof services)[number]["id"];

export function InteractiveSolutionsSection() {
  const [selectedId, setSelectedId] = useState<ServiceId>("puertas");
  const [previewId, setPreviewId] = useState<ServiceId | null>(null);
  const reduceMotion = usePrefersReducedMotion();
  const panelId = useId();
  const sceneX = useMotionValue(0);
  const sceneY = useMotionValue(0);
  const smoothX = useSpring(sceneX, { stiffness: 90, damping: 22, mass: 0.5 });
  const smoothY = useSpring(sceneY, { stiffness: 90, damping: 22, mass: 0.5 });
  const activeId = previewId ?? selectedId;
  const active = services.find((service) => service.id === activeId) ?? services[0];
  const ActiveIcon = active.icon;
  const ease = [0.16, 1, 0.3, 1] as const;

  const reveal: Variants = {
    hidden: reduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: reduceMotion ? 0 : 0.76, ease } }
  };
  const list: Variants = {
    hidden: {},
    visible: { transition: { delayChildren: reduceMotion ? 0 : 0.16, staggerChildren: reduceMotion ? 0 : 0.055 } }
  };
  const row: Variants = {
    hidden: reduceMotion ? { opacity: 1 } : { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: reduceMotion ? 0 : 0.58, ease } }
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
      viewport={{ once: true, amount: 0.1 }}
    >
      <div className={styles.shell}>
        <motion.div className={styles.intro} variants={reveal}>
          <span className={styles.kicker}>Soluciones para cada espacio</span>
          <i className={styles.kickerLine} aria-hidden="true" />
          <h2 id="integrated-solutions-title">
            Soluciones que<br />se integran a tu <span>espacio</span>
          </h2>
          <p>Integramos soluciones de acceso, protección y acondicionamiento adaptadas a la arquitectura y necesidades de cada proyecto.</p>
          <Link className={styles.primaryCta} href="/soluciones">
            Explorar soluciones <ArrowRight aria-hidden="true" />
          </Link>

          <motion.div className={styles.desktopSelector} variants={list} role="tablist" aria-label="Soluciones disponibles">
            {services.map(({ id, title, icon: Icon }) => {
              const isActive = id === activeId;
              return (
                <motion.button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={selectedId === id}
                  aria-controls={panelId}
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
            visible: { opacity: 1, scale: 1, transition: { duration: reduceMotion ? 0 : 0.86, ease } }
          }}
          onPointerMove={moveScene}
          onPointerLeave={resetScene}
        >
          <motion.div className={styles.sceneArtwork} style={reduceMotion ? undefined : { x: smoothX, y: smoothY }}>
            <img className={styles.desktopScene} src={SCENE_ASSETS.desktop} alt="Casa moderna con soluciones de acceso, protección y acondicionamiento" />
            <img className={styles.mobileScene} src={SCENE_ASSETS.mobile} alt="Casa moderna con soluciones integradas" />

            {services.map((service, index) => {
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
                  transition={{ delay: reduceMotion ? 0 : 0.38 + index * 0.08, duration: reduceMotion ? 0 : 0.5, ease }}
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
              className={`${styles.hotspot} ${styles.secondaryDoor} ${activeId === "puertas" ? styles.activeHotspot : ""}`}
              aria-label="Conocer puertas principales"
              title="Puertas principales"
            >
              <DoorOpen aria-hidden="true" />
            </Link>

            <AnimatePresence mode="wait">
              <motion.article
                key={active.id}
                className={styles.floatingCard}
                data-position={active.cardPosition}
                initial={reduceMotion ? false : { opacity: 0, scale: 0.96, y: 7 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={reduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.96, y: -5 }}
                transition={{ duration: reduceMotion ? 0 : 0.34, ease }}
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
            {services.map(({ id, shortTitle, icon: Icon }) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={selectedId === id}
                aria-controls={panelId}
                className={selectedId === id ? styles.activeMobileOption : undefined}
                onClick={() => setSelectedId(id)}
              >
                <Icon aria-hidden="true" />
                {shortTitle}
              </button>
            ))}
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
              transition={{ duration: reduceMotion ? 0 : 0.34, ease }}
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
