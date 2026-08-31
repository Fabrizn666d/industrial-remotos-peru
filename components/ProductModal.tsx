"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  MessageCircle,
  Music2,
  X
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  DoorIllustration,
  type DoorFinish,
  type DoorVariant
} from "@/components/DoorIllustration";
import type { Product } from "@/types/catalog";
import { buildQuickQuoteUrl } from "@/lib/whatsapp";

type ProductModalProps = {
  product: Product | null;
  onClose: () => void;
};

const illustrationById: Record<string, DoorVariant> = {
  levadizas: "levadiza",
  seccionales: "seccional",
  corredizas: "corrediza",
  batientes: "batiente",
  peatonales: "peatonal",
  automatizacion: "motor",
  estructuras: "estructura"
};

function finishVariant(name: string): DoorFinish {
  const normalized = name.toLowerCase();
  if (normalized.includes("blanco")) return "blanco";
  if (normalized.includes("negro")) return "negro";
  if (normalized.includes("nogal")) return "nogal";
  if (normalized.includes("roble")) return "roble";
  return "cedro";
}

export function ProductModal({ product, onClose }: ProductModalProps) {
  const [activeImage, setActiveImage] = useState("");
  const [selectedFinish, setSelectedFinish] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!product) return;
    setActiveImage(product.gallery[0]);
    setSelectedFinish(product.finishes[0]?.name ?? "");
  }, [product]);

  useEffect(() => {
    if (!product) return;
    const previous = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), select, textarea, input'
        )
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      previous?.focus();
    };
  }, [product, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {product ? (
        <motion.div
          className="motion-overlay fixed inset-0 z-[80] grid place-items-center bg-navy-950/84 p-2 backdrop-blur-sm sm:p-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-dialog-title"
            className="relative max-h-[96svh] w-full max-w-6xl overflow-y-auto rounded-lg bg-white shadow-2xl"
            initial={{ opacity: 0, y: 24, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.985 }}
            transition={{ duration: 0.25, ease: [0.2, 0.7, 0, 1] }}
          >
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Cerrar ficha de producto"
              className="absolute right-3 top-3 z-20 grid h-11 w-11 place-items-center bg-navy-950 text-white shadow-lg transition-colors hover:bg-brand-600"
            >
              <X aria-hidden="true" />
            </button>

            <div className="grid lg:grid-cols-[1.12fr_.88fr]">
              <div className="bg-warm-50 p-3 sm:p-6">
                <div className="relative aspect-[16/11] overflow-hidden rounded-lg bg-navy-900 p-2 shadow-soft">
                  <DoorIllustration
                    variant={illustrationById[product.id]}
                    finish={finishVariant(selectedFinish)}
                    animateOpening={product.id === "seccionales"}
                  />
                  <div className="absolute bottom-5 left-5 aspect-square w-24 overflow-hidden rounded-md border-2 border-white bg-white shadow-lifted sm:w-36">
                    <Image
                      src={activeImage || product.gallery[0]}
                      alt={product.name + ", proyecto real"}
                      fill
                      sizes="144px"
                      className="object-cover"
                    />
                    <span className="absolute inset-x-0 bottom-0 bg-navy-950/82 px-1 py-1 text-center text-[9px] font-extrabold uppercase text-white">
                      Proyecto real
                    </span>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {product.gallery.map((image, index) => (
                    <button
                      key={image}
                      type="button"
                      onClick={() => setActiveImage(image)}
                      aria-label={"Ver imagen " + (index + 1) + " de " + product.name}
                      aria-pressed={activeImage === image}
                      className="relative aspect-square overflow-hidden rounded-md border-2 border-white bg-navy-900 shadow-soft ring-1 ring-surface-200 aria-pressed:border-brand-600 aria-pressed:ring-brand-600"
                    >
                      <Image
                        src={image}
                        alt=""
                        fill
                        sizes="140px"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-5 sm:p-8 lg:p-10">
                <p className="eyebrow">Nuestras soluciones</p>
                <h2
                  id="product-dialog-title"
                  className="mt-4 pr-10 font-display text-2xl font-extrabold uppercase leading-tight text-navy-950 sm:text-3xl"
                >
                  {product.name}
                </h2>
                <p className="mt-4 text-sm leading-7 text-surface-500">
                  {product.longDescription}
                </p>

                <div className="mt-6 grid gap-2">
                  {product.benefits.map((benefit) => (
                    <div
                      key={benefit}
                      className="flex items-start gap-2 text-sm font-semibold text-navy-950"
                    >
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-600/10 text-brand-600">
                        <Check aria-hidden="true" size={13} strokeWidth={2.5} />
                      </span>
                      {benefit}
                    </div>
                  ))}
                </div>

                <div className="mt-7 border-t border-surface-200 pt-6">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <h3 className="font-display text-sm font-extrabold uppercase text-navy-950">
                        Acabados disponibles
                      </h3>
                      <p className="mt-1 text-xs text-surface-500">
                        {selectedFinish || "A definir según el proyecto"}
                      </p>
                    </div>
                  </div>
                  {product.finishes.length ? (
                    <div className="mt-4 flex flex-wrap gap-3">
                      {product.finishes.map((finish) => (
                        <span key={finish.name} className="group/swatch relative">
                          <button
                            type="button"
                            title={finish.name}
                            aria-label={"Seleccionar acabado " + finish.name}
                            aria-pressed={selectedFinish === finish.name}
                            onClick={() => setSelectedFinish(finish.name)}
                            className="h-10 w-10 rounded-full border-2 border-white shadow-[0_3px_10px_rgba(7,21,39,.24),0_0_0_1px_rgba(7,21,39,.18)] transition-transform hover:scale-[1.15] aria-pressed:shadow-[0_3px_10px_rgba(7,21,39,.24),0_0_0_3px_#1B72D0]"
                            style={{
                              backgroundColor: finish.color,
                              backgroundImage:
                                finish.pattern === "wood"
                                  ? "linear-gradient(100deg, transparent 0 36%, rgba(255,255,255,.14) 38%, transparent 42% 70%, rgba(0,0,0,.10) 73%, transparent 76%)"
                                  : finish.pattern === "texture"
                                    ? "radial-gradient(rgba(255,255,255,.22) .7px, transparent .7px)"
                                    : undefined,
                              backgroundSize:
                                finish.pattern === "texture" ? "4px 4px" : undefined
                            }}
                          />
                          <span className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-20 w-max max-w-40 -translate-x-1/2 rounded bg-navy-950 px-2 py-1 text-[10px] font-semibold text-white opacity-0 shadow-lg transition-opacity group-hover/swatch:opacity-100 group-focus-within/swatch:opacity-100">
                            {finish.name}
                          </span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm leading-6 text-surface-500">
                      La terminación se define durante la asesoría según el tipo
                      de estructura y el espacio.
                    </p>
                  )}
                </div>

                <div className="mt-8 grid gap-3">
                  <a
                    href={buildQuickQuoteUrl(
                      product.name +
                        (selectedFinish ? " en acabado " + selectedFinish : "")
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-whatsapp w-full"
                  >
                    <MessageCircle aria-hidden="true" size={18} />
                    Cotizar por WhatsApp
                  </a>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <a
                      href={product.tiktokUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-secondary-light"
                    >
                      <Music2 aria-hidden="true" size={17} />
                      Ver en TikTok
                    </a>
                    <a
                      href="#cotizador"
                      onClick={onClose}
                      className="btn btn-primary"
                    >
                      Solicitar cotización
                      <ArrowRight aria-hidden="true" size={17} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
