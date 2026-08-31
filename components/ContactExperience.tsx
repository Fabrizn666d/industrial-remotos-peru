"use client";

import { ArrowRight, CheckCircle2, MessageCircle } from "lucide-react";
import { FormEvent, useState } from "react";
import { products } from "@/data/products";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export function ContactExperience({ compact = false }: { compact?: boolean }) {
  const [sent, setSent] = useState(false);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const message = [
      "Hola, Industrial Remotos Perú. Quisiera conversar sobre un proyecto.",
      "",
      "Nombre: " + data.get("name"),
      "Teléfono: " + data.get("phone"),
      "Ubicación: " + data.get("location"),
      "Solución: " + data.get("product"),
      "Mensaje: " + data.get("message")
    ].join("\n");
    setSent(true);
    window.open(buildWhatsAppUrl(message), "_blank", "noopener,noreferrer");
  }
  return (
    <form className={"contact-form " + (compact ? "contact-form--compact" : "")} onSubmit={submit}>
      <div className="contact-form__head"><small>Solicitud inicial</small><h2>Cuéntanos sobre tu espacio</h2><p>Te responderemos por WhatsApp para solicitar fotos, medidas o coordinar una visita.</p></div>
      <div className="contact-form__fields">
        <label>Nombres y apellidos<input name="name" required autoComplete="name" placeholder="Tu nombre" /></label>
        <label>WhatsApp / Teléfono<input name="phone" required autoComplete="tel" inputMode="tel" placeholder="987 654 321" /></label>
        <label>Distrito o ubicación<input name="location" required autoComplete="address-level2" placeholder="San Miguel, Lima" /></label>
        <label>Tipo de proyecto<select name="product" required defaultValue=""><option value="" disabled>Selecciona una solución</option>{products.map((product) => <option value={product.name} key={product.id}>{product.name}</option>)}</select></label>
        <label className="field-wide">Cuéntanos qué necesitas<textarea name="message" rows={4} placeholder="Uso del espacio, medidas aproximadas o referencias..." /></label>
      </div>
      <button className="button button--primary" type="submit"><MessageCircle size={18} />Continuar por WhatsApp <ArrowRight size={17} /></button>
      <p className="form-note">{sent && <CheckCircle2 size={15} />} {sent ? "Abrimos WhatsApp con tu solicitud preparada." : "No enviamos nada hasta que tú confirmes el mensaje."}</p>
    </form>
  );
}

