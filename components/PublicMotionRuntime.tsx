"use client";

import { animate, inView } from "framer-motion";
import { usePathname } from "next/navigation";
import { useLayoutEffect } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;
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

function offsetFor(direction: Direction, reduced: boolean) {
  if (reduced || direction === "fade") return { x: 0, y: 0 };
  const distance = isMobile() ? 18 : 38;
  if (direction === "left") return { x: -distance, y: 0 };
  if (direction === "right") return { x: distance, y: 0 };
  return { x: 0, y: distance };
}

function prime(element: HTMLElement, direction: Direction, reduced: boolean, mask = false) {
  delete element.dataset.motionSettled;
  const { x, y } = offsetFor(direction, reduced);
  element.style.opacity = "0";
  element.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  if (mask && !reduced) element.style.clipPath = "inset(0 100% 0 0 round 18px)";
}

function settle(element: HTMLElement, mask = false) {
  element.style.removeProperty("opacity");
  element.style.removeProperty("transform");
  element.style.removeProperty("will-change");
  if (mask) element.style.removeProperty("clip-path");
  element.dataset.motionSettled = "true";
}

function reveal(element: HTMLElement, direction: Direction, reduced: boolean, delay = 0, mask = false) {
  const duration = reduced ? 0.16 : mask ? 0.72 : 0.58;
  element.style.willChange = mask ? "opacity, transform, clip-path" : "opacity, transform";
  const controls = animate(
    element,
    mask && !reduced
      ? { opacity: 1, transform: "translate3d(0, 0, 0)", clipPath: "inset(0 0% 0 0 round 18px)" }
      : { opacity: 1, transform: "translate3d(0, 0, 0)" },
    { duration, delay: reduced ? 0 : delay, ease: EASE }
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
      prime(item, direction, reduced, item.hasAttribute("data-motion-mask"));
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
          item.hasAttribute("data-motion-mask")
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
        item.hasAttribute("data-motion-mask")
      ));

      const revealItems = (targets: HTMLElement[]) => {
        targets.forEach((item, index) => {
          if (item.dataset.motionSettled === "true") return;
          const explicitDelay = Number(item.dataset.motionDelay || 0);
          const staggerDelay = Math.min(index, 5) * (reduced ? 0 : 0.085);
          cleanups.push(reveal(
            item,
            directionFor(item, index),
            reduced,
            explicitDelay + staggerDelay,
            item.hasAttribute("data-motion-mask")
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

    return () => {
      disposed = true;
      cleanups.splice(0).forEach((cleanup) => cleanup());
      root.querySelectorAll<HTMLElement>("[data-motion-item], [data-motion-hero-item]").forEach((item) => settle(item, item.hasAttribute("data-motion-mask")));
    };
  }, [pathname]);

  return null;
}
