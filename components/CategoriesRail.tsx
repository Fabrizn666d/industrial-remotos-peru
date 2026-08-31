"use client";

import { ArrowRight } from "lucide-react";
import { useEffect, useRef } from "react";
import { DoorIllustration, type DoorFinish, type DoorVariant } from "@/components/DoorIllustration";
import { products } from "@/data/products";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

export function CategoriesRail() {
  const sectionRef = useRef<HTMLElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const reduceMotion = usePrefersReducedMotion();
  const categories = products.slice(0, 6);
  const illustrationById: Record<string, { variant: DoorVariant; finish: DoorFinish }> = {
    levadizas: { variant: "levadiza", finish: "cedro" },
    seccionales: { variant: "seccional", finish: "roble" },
    corredizas: { variant: "corrediza", finish: "negro" },
    batientes: { variant: "batiente", finish: "nogal" },
    peatonales: { variant: "peatonal", finish: "cedro" },
    automatizacion: { variant: "motor", finish: "nogal" }
  };

  useEffect(() => {
    if (reduceMotion || !sectionRef.current || !railRef.current) return;
    let cleanup: () => void = () => {};
    let active = true;

    void Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([gsapModule, scrollModule]) => {
        if (!active || !sectionRef.current || !railRef.current) return;
        const gsap = gsapModule.gsap;
        gsap.registerPlugin(scrollModule.ScrollTrigger);
        const cards = railRef.current.querySelectorAll("[data-category-card]");
        const context = gsap.context(() => {
          gsap.fromTo(
            cards,
            { opacity: 0, y: 24 },
            {
              opacity: 1,
              y: 0,
              duration: 0.55,
              stagger: 0.07,
              ease: "power2.out",
              scrollTrigger: {
                trigger: sectionRef.current,
                start: "top 82%",
                once: true
              }
            }
          );
        }, sectionRef);
        cleanup = () => context.revert();
      }
    );

    return () => {
      active = false;
      cleanup();
    };
  }, [reduceMotion]);

  return (
    <section id="categorias" ref={sectionRef} className="relative bg-white py-6 sm:py-8">
      <h2 className="sr-only">Categorías de productos</h2>
      <div
        ref={railRef}
        className="container-shell flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [scrollbar-width:none] sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0 lg:grid-cols-6 [&::-webkit-scrollbar]:hidden"
      >
        {categories.map((product) => (
          <a
            key={product.id}
            data-category-card
            href={"#producto-" + product.id}
            className="card-lift group w-[72vw] max-w-[280px] shrink-0 snap-start overflow-hidden rounded-lg border border-surface-200 bg-white sm:w-auto"
          >
            <div className="relative aspect-[5/3] overflow-hidden bg-navy-900 p-1.5">
              <DoorIllustration
                variant={illustrationById[product.id].variant}
                finish={illustrationById[product.id].finish}
                animateOpening={product.id === "seccionales"}
              />
            </div>
            <div className="flex min-h-[76px] items-center justify-between gap-2 px-3 py-3">
              <div>
                <h3 className="font-display text-sm font-extrabold uppercase text-navy-950">
                  {product.shortName}
                </h3>
                <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-brand-600">
                  Ver más
                  <ArrowRight
                    aria-hidden="true"
                    size={13}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
