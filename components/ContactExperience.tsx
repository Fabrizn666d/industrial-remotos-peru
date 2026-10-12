"use client";

import { ArrowRight, CheckCircle2, LayoutGrid, LoaderCircle, Mail, MessageCircle, Pencil, Phone, RotateCcw, UserRound } from "lucide-react";
import Link from "next/link";
import { FormEvent, useRef, useState } from "react";
import { readSessionAttribution } from "@/lib/attribution";
import type { CompanyContent, ContactContent } from "@/lib/cms/content-contracts";
import styles from "./ContactDialog.module.css";

type FormValues = { name: string; phone: string; email: string; solution: string; message: string; privacy: boolean };
type State = { kind: "idle" | "submitting" } | { kind: "success"; code: string } | { kind: "error"; message: string };

const emptyForm: FormValues = { name: "", phone: "", email: "", solution: "", message: "", privacy: false };

function whatsappUrl(number: string, message: string) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function ContactExperience({ content, company, originPage, services }: { content: ContactContent; company: CompanyContent; originPage: string; services: Array<{ value: string; label: string }> }) {
  const [form, setForm] = useState<FormValues>(emptyForm);
  const [state, setState] = useState<State>({ kind: "idle" });
  const submissionId = useRef(crypto.randomUUID());

  const update = (key: keyof FormValues, value: string | boolean) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (state.kind === "error") setState({ kind: "idle" });
  };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state.kind === "submitting" || state.kind === "success") return;
    setState({ kind: "submitting" });
    const attribution = readSessionAttribution();
    const selectedService = services.find((service) => service.value === form.solution);
    const serviceLabel = selectedService?.label || "Consulta general";

    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          clientSubmissionId: submissionId.current,
          contact: { name: form.name, email: form.email, phone: form.phone, whatsapp: form.phone },
          details: {
            projectType: serviceLabel,
            location: company.location || company.address || "Por confirmar",
            notes: form.message
          },
          items: [{
            name: serviceLabel,
            quantity: 1,
            configuration: { channel: "Ventana global de contacto", originPage, privacyConsent: form.privacy, serviceSlug: form.solution, serviceLabel }
          }],
          attachmentNames: [],
          attribution: { ...(attribution ?? {}), landingPage: originPage },
          source: "CONTACT"
        })
      });
      const result = await response.json() as { code?: string; error?: string };
      if (!response.ok || !result.code) throw new Error(result.error || "No pudimos registrar tu consulta.");
      setState({ kind: "success", code: result.code });
      window.dispatchEvent(new CustomEvent("irp:analytics", { detail: { name: "contact_submit", parameters: { origin: originPage } } }));
    } catch (error) {
      setState({ kind: "error", message: error instanceof Error ? error.message : "No pudimos registrar tu consulta." });
      requestAnimationFrame(() => document.getElementById("contact-dialog-error")?.focus());
    }
  }

  if (state.kind === "success") return (
    <section className={styles.successPanel} aria-labelledby="contact-success-title" aria-live="polite">
      <CheckCircle2 aria-hidden="true" />
      <small>Consulta registrada</small>
      <h2 id="contact-success-title">¡Gracias por escribirnos!</h2>
      <p>{content.successMessage}</p>
      <span>Código de seguimiento: <strong>{state.code}</strong></span>
      {content.showWhatsapp && <a href={whatsappUrl(company.whatsappNumber, `${content.whatsappMessage}\n\nCódigo web: ${state.code}`)} target="_blank" rel="noreferrer"><MessageCircle size={18} />{content.whatsappLabel}<ArrowRight size={17} /></a>}
      <button type="button" onClick={() => { setForm(emptyForm); submissionId.current = crypto.randomUUID(); setState({ kind: "idle" }); }}>Enviar otra consulta</button>
    </section>
  );

  return (
    <form className={styles.form} onSubmit={submit}>
      <div className={styles.fields}>
        <label>Nombre completo<span className={styles.inputControl}><UserRound aria-hidden="true" /><input name="name" required autoComplete="name" value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="Tu nombre completo" maxLength={120} /></span></label>
        <label>Teléfono<span className={styles.inputControl}><Phone aria-hidden="true" /><input name="phone" required autoComplete="tel" inputMode="tel" value={form.phone} onChange={(event) => update("phone", event.target.value)} placeholder="987 654 321" minLength={7} maxLength={24} pattern="[+()\- 0-9]{7,24}" /></span></label>
        <label className={styles.wide}>Correo<span className={styles.inputControl}><Mail aria-hidden="true" /><input name="email" type="email" required autoComplete="email" value={form.email} onChange={(event) => update("email", event.target.value)} placeholder="tu@correo.com" maxLength={254} /></span></label>
        <label className={styles.wide}>¿Qué solución buscas?<span className={styles.inputControl}><LayoutGrid aria-hidden="true" /><select name="solution" required value={form.solution} onChange={(event) => update("solution", event.target.value)}><option value="">Selecciona una opción</option>{services.map((service) => <option key={service.value} value={service.value}>{service.label}</option>)}</select></span></label>
        <label className={styles.wide}>Cuéntanos tu proyecto<span className={`${styles.inputControl} ${styles.textareaControl}`}><Pencil aria-hidden="true" /><textarea name="message" required rows={4} maxLength={4000} value={form.message} onChange={(event) => update("message", event.target.value)} placeholder="Cuéntanos brevemente sobre tu proyecto…" /></span></label>
      </div>
      <label className={styles.privacyConsent}><input type="checkbox" required checked={form.privacy} onChange={(event) => update("privacy", event.target.checked)} /><span>Acepto el tratamiento de mis datos para atender esta consulta. Consulta la <Link href="/politica-privacidad" target="_blank">Política de privacidad</Link>.</span></label>
      {state.kind === "error" && <div id="contact-dialog-error" role="alert" tabIndex={-1} className={styles.formError}><strong>No se pudo enviar.</strong> {state.message} Tus datos permanecen aquí.</div>}
      <div className={styles.formActions}>
        <button className={styles.submit} type="submit" disabled={state.kind === "submitting"}>{state.kind === "submitting" ? <><LoaderCircle className={styles.spinner} size={18} />Enviando…</> : <>{content.submitLabel}<ArrowRight size={17} /></>}</button>
        {state.kind === "error" && <button className={styles.retry} type="submit"><RotateCcw size={15} />Reintentar</button>}
      </div>
    </form>
  );
}
