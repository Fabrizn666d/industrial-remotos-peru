"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const LOADER_HOLD_MS = 650;

export function IntroLoader() {
  const [visible, setVisible] = useState(true);
  const loaderRef = useRef<HTMLDivElement>(null);
  const curtainRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loader = loaderRef.current;
    const curtain = curtainRef.current;
    const brand = brandRef.current;
    const brandImage = brand?.querySelector<HTMLElement>("img");
    if (!loader || !curtain || !brand || !brandImage) return;

    let cancelled = false;
    let timeline: gsap.core.Timeline | null = null;
    let headerLogo: HTMLElement | null = null;

    document.body.classList.add("loader-open");
    document.body.classList.remove("intro-complete");
    gsap.set(curtain, { yPercent: 0 });
    gsap.set(brand, { x: 0, y: 0, scale: 1, autoAlpha: 1 });
    gsap.set(brandImage, { filter: "none" });

    const reveal = () => {
      if (cancelled) return;

      headerLogo = document.querySelector<HTMLElement>(".site-header__logo");
      const loaderRect = brand.getBoundingClientRect();
      const targetRect = headerLogo?.getBoundingClientRect();
      const destination = targetRect
        ? {
            x: targetRect.left + targetRect.width / 2 - (loaderRect.left + loaderRect.width / 2),
            y: targetRect.top + targetRect.height / 2 - (loaderRect.top + loaderRect.height / 2),
            scale: targetRect.width / loaderRect.width,
          }
        : { x: 0, y: 0, scale: 0.5 };
      const heroMedia = document.querySelector<HTMLElement>(".irp-hero__media-frame");

      if (headerLogo) gsap.set(headerLogo, { autoAlpha: 0 });

      timeline = gsap.timeline({
        delay: 0.18,
        onStart: () => {
          document.body.classList.remove("loader-open");
        },
        onComplete: () => {
          if (cancelled) return;
          document.body.classList.remove("loader-open");
          document.body.classList.add("intro-complete");
          if (headerLogo) gsap.set(headerLogo, { autoAlpha: 1, clearProps: "visibility,opacity" });
          setVisible(false);
          window.dispatchEvent(new Event("irp:intro-complete"));
        },
      })
        .to(brand, { ...destination, duration: 2.05, ease: "power4.inOut" }, 0)
        .to(curtain, { yPercent: -100, duration: 2.15, ease: "power3.inOut" }, 0.42)
        .to(brandImage, { filter: "brightness(0) invert(1)", duration: 0.78, ease: "power2.inOut" }, 1.3);

      if (heroMedia) {
        timeline.fromTo(heroMedia, { scale: 1.07 }, { scale: 1, duration: 2.3, ease: "power3.out" }, 0.5);
      }
    };

    const timer = window.setTimeout(reveal, LOADER_HOLD_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      timeline?.kill();
      document.body.classList.remove("loader-open");
      if (headerLogo) gsap.set(headerLogo, { autoAlpha: 1, clearProps: "visibility,opacity" });
    };
  }, []);

  if (!visible) return null;

  return (
    <div ref={loaderRef} className="irp-ibex-loader" aria-label="Cargando Industrial Remotos Perú" role="status">
      <div ref={curtainRef} className="irp-ibex-loader__curtain" />
      <div className="irp-ibex-loader__brand-stage">
        <div ref={brandRef} className="irp-ibex-loader__brand">
          <img
            className="irp-ibex-loader__brand-image"
            src="/images/loader/logo.png"
            alt="Industrial Perú Remotos — Garantía y confianza"
            width={1254}
            height={1254}
            fetchPriority="high"
            decoding="sync"
          />
        </div>
      </div>
      <span className="sr-only" aria-live="polite">Preparando la experiencia</span>
    </div>
  );
}
