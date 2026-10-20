"use client";

import { animate, inView } from "framer-motion";
import { usePathname } from "next/navigation";
import { useLayoutEffect } from "react";
import { PUBLIC_MOTION } from "@/components/motion/public-motion-config";

const HERO_EVENT = "irp:route-transition-complete";

type Direction = "left" | "right" | "up" | "fade";

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function isMobile() {
  return window.matchMedia("(max-width: 700px)").matches;
}

function directionFor(element: HTMLElement, index: number): Direction {
  const requested = element.dataset.motionDirection as Direction | undefined;
  if (requested) return requested;
  return index % 2 === 0 ? "left" : "right";
}

function offsetFor(element: HTMLElement, direction: Direction, reduced: boolean) {
  if (reduced || direction === "fade") return { x: 0, y: 0 };
  const requested = Number(element.dataset.motionDistance);
  const distance = Number.isFinite(requested) && requested > 0
    ? requested
    : isMobile() ? PUBLIC_MOTION.mobileDistance : PUBLIC_MOTION.desktopDistance;
  if (direction === "left") return { x: -distance, y: 0 };
  if (direction === "right") return { x: distance, y: 0 };
  return { x: 0, y: distance };
}

function prime(element: HTMLElement, direction: Direction, reduced: boolean, mask = false, soften = true) {
  delete element.dataset.motionSettled;
  const { x, y } = offsetFor(element, direction, reduced);
  element.style.opacity = "0";
  element.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  if (soften && !reduced && !element.hasAttribute("data-motion-no-blur")) {
    element.style.filter = `blur(${PUBLIC_MOTION.blur}px)`;
  }
  if (mask && !reduced) element.style.clipPath = "inset(0 100% 0 0 round 18px)";
}

function settle(element: HTMLElement, mask = false) {
  element.style.removeProperty("opacity");
  element.style.removeProperty("transform");
  element.style.removeProperty("filter");
  element.style.removeProperty("will-change");
  if (mask) element.style.removeProperty("clip-path");
  element.dataset.motionSettled = "true";
}

function reveal(element: HTMLElement, direction: Direction, reduced: boolean, delay = 0, mask = false, soften = true) {
  const duration = reduced ? 0.16 : mask ? PUBLIC_MOTION.maskDuration : PUBLIC_MOTION.revealDuration;
  element.style.willChange = mask ? "opacity, transform, filter, clip-path" : "opacity, transform, filter";
  const target = mask && !reduced
    ? { opacity: 1, transform: "translate3d(0, 0, 0)", filter: "blur(0px)", clipPath: "inset(0 0% 0 0 round 18px)" }
    : { opacity: 1, transform: "translate3d(0, 0, 0)", ...(soften ? { filter: "blur(0px)" } : {}) };
  const controls = animate(
    element,
    target,
    { duration, delay: reduced ? 0 : delay, ease: PUBLIC_MOTION.ease }
  );
  void controls.then(() => settle(element, mask));
  return () => controls.stop();
}

function belongsToSection(element: HTMLElement, section: HTMLElement) {
  return element.closest<HTMLElement>("[data-motion-section]") === section;
}

export function PublicMotionRuntime() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    const root = document.querySelector<HTMLElement>("main#contenido");
    if (!root) return;

    const reduced = prefersReducedMotion();
    const cleanups: Array<() => void> = [];
    const pendingReveals = new Set<() => void>();
    let disposed = false;
    let pageReady = false;

    const hero = root.querySelector<HTMLElement>("[data-motion-hero]");
    const heroItems = hero
      ? [...hero.querySelectorAll<HTMLElement>("[data-motion-hero-item]")]
          .filter((item) => item.closest("[data-motion-hero]") === hero)
      : [];

    heroItems.forEach((item, index) => {
      const direction = directionFor(item, index);
      prime(item, direction, reduced, item.hasAttribute("data-motion-mask"), false);
    });

    const markPageReady = () => {
      if (disposed) return;
      pageReady = true;
      heroItems.forEach((item, index) => {
        cleanups.push(reveal(
          item,
          directionFor(item, index),
          reduced,
          index * (reduced ? 0 : 0.1),
          item.hasAttribute("data-motion-mask"),
          false
        ));
      });
      pendingReveals.forEach((run) => run());
      pendingReveals.clear();
    };

    if (heroItems.length) {
      if (document.documentElement.hasAttribute("data-irp-route-transition")) {
        window.addEventListener(HERO_EVENT, markPageReady, { once: true });
        cleanups.push(() => window.removeEventListener(HERO_EVENT, markPageReady));
      } else {
        const frame = window.requestAnimationFrame(markPageReady);
        cleanups.push(() => window.cancelAnimationFrame(frame));
      }
    } else if (document.documentElement.hasAttribute("data-irp-route-transition")) {
      window.addEventListener(HERO_EVENT, markPageReady, { once: true });
      cleanups.push(() => window.removeEventListener(HERO_EVENT, markPageReady));
    } else {
      const frame = window.requestAnimationFrame(markPageReady);
      cleanups.push(() => window.cancelAnimationFrame(frame));
    }

    const explicitSections = [...root.querySelectorAll<HTMLElement>("[data-motion-section]")];
    const sections = explicitSections.length || !root.hasAttribute("data-motion-auto")
      ? explicitSections
      : [...root.querySelectorAll<HTMLElement>(":scope > section:not([data-motion-hero])")];
    sections.forEach((section) => {
      const explicitItems = [...section.querySelectorAll<HTMLElement>("[data-motion-item]")]
        .filter((item) => belongsToSection(item, section) && !item.closest("[data-motion-exclude]"));
      const items = explicitItems.length
        ? explicitItems
        : [...section.querySelectorAll<HTMLElement>(":scope > header, :scope > div, :scope > aside, :scope > article, :scope > form")]
            .filter((item) => !item.closest("[data-motion-exclude]"));
      if (!items.length) return;

      const independentItems = items.filter((item) => item.hasAttribute("data-motion-observe-self"));
      const groupedItems = items.filter((item) => !item.hasAttribute("data-motion-observe-self"));

      items.forEach((item, index) => prime(
        item,
        directionFor(item, index),
        reduced,
        item.hasAttribute("data-motion-mask"),
        true
      ));

      const revealItems = (targets: HTMLElement[]) => {
        targets.forEach((item, index) => {
          if (item.dataset.motionSettled === "true") return;
          const explicitDelay = Number(item.dataset.motionDelay || 0);
          const staggerDelay = Math.min(index, 5) * (reduced ? 0 : PUBLIC_MOTION.stagger);
          cleanups.push(reveal(
            item,
            directionFor(item, index),
            reduced,
            explicitDelay + staggerDelay,
            item.hasAttribute("data-motion-mask"),
            true
          ));
        });
      };

      if (groupedItems.length) cleanups.push(inView(section, () => {
        const revealSection = () => {
          revealItems(groupedItems);
        };
        if (pageReady) revealSection();
        else pendingReveals.add(revealSection);
        return undefined;
      }, { amount: 0.08, margin: "0px 0px -7% 0px" }));

      independentItems.forEach((item, index) => {
        cleanups.push(inView(item, () => {
          const revealItem = () => revealItems([item]);
          if (pageReady) revealItem();
          else pendingReveals.add(revealItem);
          return undefined;
        }, { amount: 0.12, margin: "0px 0px -5% 0px" }));
        item.dataset.motionDelay = String((index % 3) * (reduced ? 0 : 0.06));
      });
    });

    if (!reduced) {
      const parallaxTargets = [...root.querySelectorAll<HTMLElement>("[data-motion-parallax]")]
        .filter((element) => !element.closest(".irp-hero, [data-motion-hero]"));
      if (parallaxTargets.length) {
        let frame = 0;
        const renderParallax = () => {
          frame = 0;
          const viewportHeight = window.innerHeight || 1;
          parallaxTargets.forEach((element) => {
            const bounds = element.getBoundingClientRect();
            if (bounds.bottom < -120 || bounds.top > viewportHeight + 120) return;
            const requested = Number(element.dataset.motionParallax);
            const strength = Number.isFinite(requested) && requested !== 0 ? requested : PUBLIC_MOTION.parallax;
            const progress = (bounds.top + bounds.height / 2 - viewportHeight / 2) / viewportHeight;
            const offset = Math.max(-strength, Math.min(strength, -progress * strength));
            element.style.translate = `0 ${offset.toFixed(2)}px`;
          });
        };
        const scheduleParallax = () => {
          if (!frame) frame = window.requestAnimationFrame(renderParallax);
        };
        parallaxTargets.forEach((element) => { element.style.willChange = "translate"; });
        window.addEventListener("scroll", scheduleParallax, { passive: true });
        window.addEventListener("resize", scheduleParallax, { passive: true });
        renderParallax();
        cleanups.push(() => {
          if (frame) window.cancelAnimationFrame(frame);
          window.removeEventListener("scroll", scheduleParallax);
          window.removeEventListener("resize", scheduleParallax);
          parallaxTargets.forEach((element) => {
            element.style.removeProperty("translate");
            element.style.removeProperty("will-change");
          });
        });
      }
    }

    return () => {
      disposed = true;
      cleanups.splice(0).forEach((cleanup) => cleanup());
      root.querySelectorAll<HTMLElement>("[data-motion-item], [data-motion-hero-item]").forEach((item) => settle(item, item.hasAttribute("data-motion-mask")));
    };
  }, [pathname]);

  return null;
}
