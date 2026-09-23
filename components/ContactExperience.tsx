"use client";

import { ArrowRight, CheckCircle2, LoaderCircle, MessageCircle, RotateCcw } from "lucide-react";
import { FormEvent, useRef, useState } from "react";
import { products } from "@/data/products";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

type State = { kind: "idle" | "submitting" } | { kind: "success"; code: string; whatsappUrl: string } | { kind: "error"; message: string };

export function ContactExperience({ compact = false }: { compact?: boolean }) {
  const [state, setState] = useState<State>({ kind: "idle" });
  const submissionId = useRef(crypto.randomUUID());

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state.kind === "submitting") return;
    setState({ kind: "submitting" });
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") || "");
    const phone = String(data.get("phone") || "");
    const location = String(data.get("location") || "");
    const product = String(data.get("product") || "");
    const notes = String(data.get("message") || "");
    const message = ["Hola, Industrial Remotos Perú. Quisiera conversar sobre un proyecto.", "", `Nombre: ${name}`, `Teléfono: ${phone}`, `Ubicación: ${location}`, `Solución: ${product}`, `Mensaje: ${notes || "Por completar"}`].join("\n");
    let attribution: Record<string, string> = {};
    try { attribution = JSON.parse(sessionStorage.getItem("irp_utm_v1") || "{}"); } catch { attribution = {}; }

    try {
      const response = await fetch("/api/requests", {
        method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          clientSubmissionId: submissionId.current,
          contact: { name, email: String(data.get("email") || ""), phone, whatsapp: phone },
          details: { projectType: product, location, notes: notes || undefined },
          items: [{ name: product, quantity: 1, configuration: { ...attribution, channel: "Formulario de contacto" } }],
          attachmentNames: [], source: "CONTACT"
        })
      });
      const result = await response.json() as { code?: string; error?: string };
      if (!response.ok || !result.code) throw new Error(result.error || "No pudimos registrar tu solicitud.");
      setState({ kind: "success", code: result.code, whatsappUrl: buildWhatsAppUrl(`${message}\n\nCódigo web: ${result.code}`) });
      window.dispatchEvent(new CustomEvent("irp:analytics", { detail: { name: "contact_submit" } }));
    } catch (error) {
      setState({ kind: "error", message: error instanceof Error ? error.message : "No pudimos registrar tu solicitud." });
      requestAnimationFrame(() => document.getElementById("contact-error")?.focus());
    }
  }

  if (state.kind === "success") return (
    <section className={"contact-form " + (compact ? "contact-form--compact" : "")} aria-labelledby="contact-success-title">
      <div className="contact-form__head"><CheckCircle2 size={38} className="text-emerald-600" /><small>Solicitud registrada</small><h2 id="contact-success-title">Ya tenemos los datos iniciales.</h2><p>Tu código es <strong>{state.code}</strong>. Puedes continuar por WhatsApp para compartir fotos y medidas.</p></div>
      <a className="button button--primary" href={state.whatsappUrl} target="_blank" rel="noreferrer"><MessageCircle size={18} />Continuar por WhatsApp <ArrowRight size={17} /></a>
    </section>
  );

  return (
    <form className={"contact-form " + (compact ? "contact-form--compact" : "")} onSubmit={submit}>
      <div className="contact-form__head"><small>Solicitud inicial</small><h2>Cuéntanos sobre tu espacio</h2><p>Registraremos tu consulta y podrás continuar por WhatsApp para compartir fotos o medidas.</p></div>
      <div className="contact-form__fields">
        <label>Nombres y apellidos<input name="name" required autoComplete="name" placeholder="Tu nombre" maxLength={120} /></label>
        <label>WhatsApp / Teléfono<input name="phone" required autoComplete="tel" inputMode="tel" placeholder="987 654 321" minLength={7} maxLength={24} /></label>
        <label>Correo electrónico<input name="email" type="email" required autoComplete="email" placeholder="tu@correo.com" maxLength={254} /></label>
        <label>Distrito o ubicación<input name="location" required autoComplete="address-level2" placeholder="Distrito, ciudad" maxLength={240} /></label>
        <label>Tipo de proyecto<select name="product" required defaultValue=""><option value="" disabled>Selecciona una solución</option>{products.map((product) => <option value={product.name} key={product.id}>{product.name}</option>)}</select></label>
        <label className="field-wide">Cuéntanos qué necesitas<textarea name="message" rows={4} maxLength={4000} placeholder="Uso del espacio, medidas aproximadas o referencias..." /></label>
      </div>
      {state.kind === "error" && <div id="contact-error" role="alert" tabIndex={-1} className="form-error"><strong>No se pudo enviar.</strong> {state.message} Tus datos permanecen aquí.</div>}
      <button className="button button--primary" type="submit" disabled={state.kind === "submitting"}>{state.kind === "submitting" ? <><LoaderCircle className="animate-spin" size={18} />Registrando…</> : <><MessageCircle size={18} />Registrar solicitud <ArrowRight size={17} /></>}</button>
      {state.kind === "error" && <button className="form-note" type="submit"><RotateCcw size={15} /> Reintentar</button>}
      <p className="form-note">No compartimos datos sensibles con herramientas analíticas.</p>
    </form>
  );
}
