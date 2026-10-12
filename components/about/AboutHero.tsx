"use client";

import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import type { AboutContent } from "@/lib/cms/content-contracts";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import styles from "./AboutHero.module.css";

const objectPosition = { center: "center", top: "center top", bottom: "center bottom", left: "left center", right: "right center" } as const;

export function AboutHero({ content }: { content: AboutContent["hero"] }) {
  const rootRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const sticky = content.stickyEnabled && !reducedMotion;

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let frame = 0;
    const reveal = () => { root.dataset.entrance = "ready"; };
    if (!content.animationEnabled || reducedMotion) reveal();
    else if (document.documentElement.hasAttribute("data-irp-route-transition")) {
      window.addEventListener("irp:route-transition-complete", reveal, { once: true });
    } else {
      frame = window.requestAnimationFrame(reveal);
    }
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("irp:route-transition-complete", reveal);
    };
  }, [content.animationEnabled, reducedMotion]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const panel = panelRef.current;
    const line = lineRef.current;
    const copy = copyRef.current;
    if (!root || !panel || !line || !copy) return;

    let cancelled = false;
    let cleanup: () => void = () => {};

    void Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([gsapModule, scrollModule]) => {
      if (cancelled) return;
      const gsap = gsapModule.gsap;
      const ScrollTrigger = scrollModule.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);
      const context = gsap.context(() => {
        if (content.stickyEnabled && !reducedMotion) {
          const scrollTargets = [panel, line, copy];
          gsap.to(scrollTargets, {
            autoAlpha: 0,
            y: -12,
            ease: "none",
            scrollTrigger: {
              trigger: root,
              start: "top top",
              end: () => `+=${window.innerWidth <= 640 ? 105 : window.innerWidth <= 900 ? 150 : 220}`,
              scrub: true,
              invalidateOnRefresh: true
            }
          });
        }
      }, root);
      cleanup = () => context.revert();
      ScrollTrigger.refresh();
    });

    return () => { cancelled = true; cleanup(); };
  }, [content.animationEnabled, content.stickyEnabled, reducedMotion]);

  return <section ref={rootRef} className={styles.sequence} data-about-hero data-sticky={sticky ? "true" : "false"} data-animation={content.animationEnabled ? "true" : "false"} data-entrance={content.animationEnabled ? "waiting" : "ready"} aria-labelledby="about-title">
    <div className={styles.stage} data-about-stage>
      <div className={styles.media} data-about-media aria-hidden="true">
        <Image src={content.image.src} alt="" fill priority fetchPriority="high" sizes="100vw" className={styles.desktopImage} style={{ objectPosition: objectPosition[content.image.position] }} data-transition-essential />
        <Image src={content.mobileImage.src} alt="" fill priority fetchPriority="high" sizes="100vw" className={styles.mobileImage} style={{ objectPosition: objectPosition[content.mobileImage.position] }} data-transition-essential />
      </div>
      <div ref={lineRef} className={styles.diagonalLine} aria-hidden="true" />
      <div ref={panelRef} className={styles.panel} data-about-panel aria-hidden="true" />
      <div ref={copyRef} className={styles.copy} data-about-copy>
        <span data-about-reveal>{content.eyebrow}</span>
        <h1 id="about-title"><b data-about-reveal>{content.titleLine1}</b><strong data-about-reveal>{content.titleLine2}</strong></h1>
        <p data-about-reveal>{content.description}</p>
        <i data-about-reveal>{content.indicator}</i>
      </div>
      <span className="sr-only">{content.image.alt}. {content.mobileImage.alt}</span>
    </div>
  </section>;
}
