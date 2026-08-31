"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Clock3, MessageCircle, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { finishes, products } from "@/data/products";
import { siteConfig } from "@/data/site";
import { buildWhatsAppMessage, buildWhatsAppUrl } from "@/lib/whatsapp";

const optionalMeasurement = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || /^\d+([.,]\d+)?$/.test(value),
    "Ingresa una medida válida"
  )
  .optional();

const quoteSchema = z.object({
  name: z.string().trim().min(2, "Ingresa tu nombre"),
  phone: z
    .string()
    .trim()
    .min(7, "Ingresa un número válido")
    .regex(/^[+\d\s()-]+$/, "Usa solo números y símbolos telefónicos"),
  location: z.string().trim().min(2, "Indica tu distrito o ubicación"),
  product: z.string().min(1, "Selecciona un tipo de proyecto"),
  width: optionalMeasurement,
  height: optionalMeasurement,
  finish: z.string().optional(),
  details: z
    .string()
    .trim()
    .max(600, "La descripción debe tener menos de 600 caracteres")
    .optional()
});

type QuoteFormValues = z.infer<typeof quoteSchema>;

export function QuoteForm() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      name: "",
      phone: "",
      location: "",
      product: "",
      width: "",
      height: "",
      finish: "",
      details: ""
    }
  });

  const onSubmit = (data: QuoteFormValues) => {
    setSubmitted(true);
    const url = buildWhatsAppUrl(buildWhatsAppMessage(data));
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const errorFor = (name: keyof QuoteFormValues) =>
    errors[name]?.message ? (
      <span className="mt-1 block text-xs font-semibold text-red-700" role="alert">
        {errors[name]?.message}
      </span>
    ) : null;

  return (
    <section id="cotizador" className="section-pad bg-white">
      <div className="container-shell">
        <Reveal>
          <SectionHeading
            eyebrow="Cotización directa"
            title="Cotiza tu proyecto"
            accent="tu proyecto"
            description="Envíanos los datos de tu proyecto y te respondemos por WhatsApp."
            align="center"
          />
        </Reveal>

        <Reveal
          delay={0.07}
          className="mx-auto mt-12 grid max-w-5xl overflow-hidden rounded-lg border border-surface-200 bg-white shadow-lifted lg:grid-cols-[.7fr_1.3fr]"
        >
          <aside className="noise relative overflow-hidden bg-navy-950 p-6 text-white sm:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_18%,rgba(217,160,91,.18),transparent_30%),radial-gradient(circle_at_80%_72%,rgba(78,163,240,.16),transparent_38%)]" />
            <div className="relative z-10">
              <p className="eyebrow eyebrow-light">Asesoría personalizada</p>
              <h3 className="mt-4 font-display text-2xl font-extrabold uppercase leading-tight">
                Cuéntanos lo que necesitas
              </h3>
              <p className="mt-4 text-sm leading-7 text-white/68">
                No necesitas tener todos los detalles definidos. Nuestro equipo
                te orientará sobre el tipo de puerta, automatización y acabado
                apropiados para tu espacio.
              </p>

              <div className="mt-8 space-y-5">
                <div className="flex gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-brand-400/45 text-brand-400">
                    <Clock3 aria-hidden="true" size={19} strokeWidth={1.5} />
                  </span>
                  <div>
                    <p className="text-sm font-extrabold">Respuesta rápida</p>
                    <p className="mt-1 text-xs leading-5 text-white/58">
                      {siteConfig.hours}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-brand-400/45 text-brand-400">
                    <ShieldCheck aria-hidden="true" size={19} strokeWidth={1.5} />
                  </span>
                  <div>
                    <p className="text-sm font-extrabold">Garantía y respaldo</p>
                    <p className="mt-1 text-xs leading-5 text-white/58">
                      En todos nuestros trabajos.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="p-5 sm:p-8"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-sm font-bold text-navy-950">
                Nombre
                <input
                  {...register("name")}
                  type="text"
                  autoComplete="name"
                  placeholder="Tu nombre"
                  aria-invalid={Boolean(errors.name)}
                  className="field mt-2"
                />
                {errorFor("name")}
              </label>

              <label className="block text-sm font-bold text-navy-950">
                Teléfono / WhatsApp
                <input
                  {...register("phone")}
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="987 654 321"
                  aria-invalid={Boolean(errors.phone)}
                  className="field mt-2"
                />
                {errorFor("phone")}
              </label>

              <label className="block text-sm font-bold text-navy-950 sm:col-span-2">
                Distrito / ubicación
                <input
                  {...register("location")}
                  type="text"
                  autoComplete="address-level2"
                  placeholder="Ej. San Miguel, Lima"
                  aria-invalid={Boolean(errors.location)}
                  className="field mt-2"
                />
                {errorFor("location")}
              </label>

              <label className="block text-sm font-bold text-navy-950 sm:col-span-2">
                Tipo de puerta o proyecto
                <select
                  {...register("product")}
                  aria-invalid={Boolean(errors.product)}
                  className="field mt-2"
                >
                  <option value="">Selecciona una opción</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.name}>
                      {product.name}
                    </option>
                  ))}
                </select>
                {errorFor("product")}
              </label>

              <label className="block text-sm font-bold text-navy-950">
                Ancho aproximado (m)
                <input
                  {...register("width")}
                  type="text"
                  inputMode="decimal"
                  placeholder="Ej. 3.00"
                  aria-invalid={Boolean(errors.width)}
                  className="field mt-2"
                />
                {errorFor("width")}
              </label>

              <label className="block text-sm font-bold text-navy-950">
                Alto aproximado (m)
                <input
                  {...register("height")}
                  type="text"
                  inputMode="decimal"
                  placeholder="Ej. 2.20"
                  aria-invalid={Boolean(errors.height)}
                  className="field mt-2"
                />
                {errorFor("height")}
              </label>

              <label className="block text-sm font-bold text-navy-950 sm:col-span-2">
                Acabado preferido (opcional)
                <select {...register("finish")} className="field mt-2">
                  <option value="">Por definir</option>
                  {finishes.map((finish) => (
                    <option key={finish.name} value={finish.name}>
                      {finish.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-bold text-navy-950 sm:col-span-2">
                Descripción breve (opcional)
                <textarea
                  {...register("details")}
                  rows={4}
                  placeholder="Cuéntanos sobre el espacio, el uso o alguna referencia."
                  aria-invalid={Boolean(errors.details)}
                  className="field mt-2 resize-y"
                />
                {errorFor("details")}
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-whatsapp mt-6 w-full disabled:cursor-not-allowed disabled:opacity-65"
            >
              <MessageCircle aria-hidden="true" size={19} />
              Enviar cotización por WhatsApp
            </button>
            <p className="mt-3 text-center text-xs leading-5 text-surface-500">
              Respuesta rápida en horario de atención: {siteConfig.hours}.
            </p>
            <p className="sr-only" aria-live="polite">
              {submitted
                ? "Tu cotización está lista. Se abrió WhatsApp para enviarla."
                : ""}
            </p>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
