"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Music2 } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import {
  DoorIllustration,
  type DoorFinish,
  type DoorVariant
} from "@/components/DoorIllustration";
import { ProductModal } from "@/components/ProductModal";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { products } from "@/data/products";
import type { Product, ProductAudience } from "@/types/catalog";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

type ProductFilter = "todas" | ProductAudience;

const filters: Array<{ id: ProductFilter; label: string }> = [
  { id: "todas", label: "Todas" },
  { id: "residencial", label: "Residencial" },
  { id: "comercial", label: "Comercial" },
  { id: "industrial", label: "Industrial" }
];

const illustrationById: Record<string, { variant: DoorVariant; finish: DoorFinish }> = {
  levadizas: { variant: "levadiza", finish: "cedro" },
  seccionales: { variant: "seccional", finish: "roble" },
  corredizas: { variant: "corrediza", finish: "negro" },
  batientes: { variant: "batiente", finish: "nogal" },
  peatonales: { variant: "peatonal", finish: "cedro" },
  automatizacion: { variant: "motor", finish: "nogal" },
  estructuras: { variant: "estructura", finish: "negro" }
};

export function Products() {
  const [filter, setFilter] = useState<ProductFilter>("todas");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const reduceMotion = usePrefersReducedMotion();
  const visibleProducts = useMemo(
    () =>
      filter === "todas"
        ? products
        : products.filter((product) => product.audiences.includes(filter)),
    [filter]
  );

  return (
    <section id="productos" className="section-pad relative bg-white">
      <div className="container-shell">
        <Reveal>
          <SectionHeading
            eyebrow="Soluciones"
            title="Nuestras soluciones"
            accent="soluciones"
            description="Encuentra la puerta ideal para tu hogar o negocio."
            align="center"
          />
        </Reveal>

        <Reveal delay={0.06}>
          <div
            role="group"
            aria-label="Filtrar soluciones"
            className="mt-8 flex flex-wrap justify-center gap-2"
          >
            {filters.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={filter === item.id}
                onClick={() => setFilter(item.id)}
                className={cn(
                  "min-h-10 border px-4 py-2 text-xs font-extrabold uppercase transition-colors",
                  filter === item.id
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-surface-200 bg-white text-surface-500 hover:border-brand-600 hover:text-brand-600"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </Reveal>

        <motion.div layout className="mt-11 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {visibleProducts.map((product) => (
              <motion.article
                layout={!reduceMotion}
                key={product.id}
                id={"producto-" + product.id}
                initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: 12 }}
                transition={{ duration: 0.28 }}
                className="card-lift group relative flex min-h-full flex-col overflow-hidden rounded-lg border border-surface-200 bg-white before:absolute before:inset-x-0 before:top-0 before:z-10 before:h-1 before:origin-left before:scale-x-0 before:bg-wood-500 before:transition-transform hover:before:scale-x-100"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-[#d8d2c8] p-2">
                  <DoorIllustration
                    variant={illustrationById[product.id].variant}
                    finish={illustrationById[product.id].finish}
                    animateOpening={product.id === "seccionales"}
                  />
                  <div className="absolute bottom-3 left-3 h-[76px] w-[76px] overflow-hidden rounded-md border-2 border-white bg-white shadow-lifted">
                    <Image
                      src={product.image}
                      alt={"Proyecto real de " + product.name}
                      fill
                      sizes="76px"
                      className="object-cover"
                    />
                    <span className="absolute inset-x-0 bottom-0 bg-navy-950/82 px-1 py-0.5 text-center text-[8px] font-extrabold uppercase text-white">
                      Proyecto real
                    </span>
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-display text-lg font-extrabold uppercase text-navy-950">
                    {product.name}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-surface-500">
                    {product.description}
                  </p>
                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-surface-200 pt-4">
                    <a
                      href={product.tiktokUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-navy-950 transition-colors hover:text-brand-600"
                    >
                      <Music2 aria-hidden="true" size={15} />
                      Ver en TikTok
                    </a>
                    <button
                      type="button"
                      onClick={() => setSelectedProduct(product)}
                      className="group inline-flex min-h-10 items-center gap-1.5 text-xs font-extrabold uppercase text-brand-600"
                    >
                      Ver más
                      <ArrowRight
                        aria-hidden="true"
                        size={16}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </button>
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </section>
  );
}
