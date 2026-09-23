"use client";

import { useRef, useState } from "react";
import { CheckCircle2, Clipboard, LoaderCircle, MessageCircle, RotateCcw } from "lucide-react";
import Link from "next/link";
import { siteConfig } from "@/data/site";

type SubmissionState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "error"; message: string }
  | { kind: "success"; code: string };

const fieldClass = "mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-[15px] text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

export function ComplaintForm() {
  const [state, setState] = useState<SubmissionState>({ kind: "idle" });
  const [copied, setCopied] = useState(false);
  const submissionId = useRef(crypto.randomUUID());

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state.kind === "submitting") return;
    setState({ kind: "submitting" });
    const form = new FormData(event.currentTarget);
    const payload = {
      clientSubmissionId: submissionId.current,
      consumer: {
        name: String(form.get("name") || ""), documentType: String(form.get("documentType") || ""),
        documentNumber: String(form.get("documentNumber") || ""), phone: String(form.get("phone") || ""),
        email: String(form.get("email") || ""), address: String(form.get("address") || "")
      },
      contractedGood: String(form.get("contractedGood") || ""), amount: String(form.get("amount") || ""),
      incidentDate: String(form.get("incidentDate") || ""), type: String(form.get("type") || ""),
      detail: String(form.get("detail") || ""), requestedResolution: String(form.get("requestedResolution") || ""),
      consent: form.get("consent") === "on", website: String(form.get("website") || "")
    };

    try {
      const response = await fetch("/api/complaints", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json() as { ok: boolean; complaint?: { code: string }; error?: { message?: string } };
      if (!response.ok || !result.ok || !result.complaint) throw new Error(result.error?.message || "No pudimos registrar tu solicitud.");
      setState({ kind: "success", code: result.complaint.code });
      window.dispatchEvent(new CustomEvent("irp:analytics", { detail: { name: "complaint_submit" } }));
    } catch (error) {
      setState({ kind: "error", message: error instanceof Error ? error.message : "Ocurrió un error. Intenta nuevamente." });
      requestAnimationFrame(() => document.getElementById("complaint-error")?.focus());
    }
  }

  async function copyCode(code: string) {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  if (state.kind === "success") {
    return (
      <section className="rounded-[30px] border border-emerald-200 bg-white p-7 shadow-soft md:p-10" aria-labelledby="complaint-success-title">
        <CheckCircle2 className="h-12 w-12 text-emerald-600" aria-hidden="true" />
        <p className="mt-5 text-xs font-bold uppercase tracking-[.16em] text-emerald-700">Registro recibido</p>
        <h2 id="complaint-success-title" className="mt-2 text-3xl font-bold tracking-[-.04em] text-slate-950">Tu reclamo fue registrado correctamente.</h2>
        <p className="mt-4 leading-7 text-slate-600">Guarda este código para identificar tu registro:</p>
        <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl bg-slate-950 p-4 text-white">
          <strong className="mr-auto font-mono text-lg tracking-wide">{state.code}</strong>
          <button className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-white/10 px-4 font-semibold hover:bg-white/20" type="button" onClick={() => copyCode(state.code)}><Clipboard size={17} /> {copied ? "Copiado" : "Copiar código"}</button>
        </div>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link className="button button--primary" href="/">Volver al inicio</Link>
          <a className="button button--secondary" href={siteConfig.social.whatsapp} target="_blank" rel="noreferrer"><MessageCircle size={18} /> WhatsApp</a>
        </div>
      </section>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-soft md:p-10">
      <div className="grid gap-6 md:grid-cols-2">
        <Field label="Nombres y apellidos" name="name" autoComplete="name" required />
        <label className="text-sm font-semibold text-slate-800">Tipo de documento<select className={fieldClass} name="documentType" required defaultValue="DNI"><option value="DNI">DNI</option><option value="CE">Carné de extranjería</option><option value="PASAPORTE">Pasaporte</option><option value="RUC">RUC</option></select></label>
        <Field label="Número de documento" name="documentNumber" inputMode="numeric" required />
        <Field label="Teléfono" name="phone" type="tel" autoComplete="tel" required />
        <Field label="Correo electrónico" name="email" type="email" autoComplete="email" required />
        <Field label="Dirección del consumidor" name="address" autoComplete="street-address" required />
        <Field label="Bien o servicio contratado" name="contractedGood" required />
        <Field label="Monto reclamado (opcional)" name="amount" inputMode="decimal" />
        <Field label="Fecha del hecho" name="incidentDate" type="date" max={new Date().toISOString().slice(0, 10)} required />
        <label className="text-sm font-semibold text-slate-800">Tipo de registro<select className={fieldClass} name="type" required defaultValue="RECLAMO"><option value="RECLAMO">Reclamo — disconformidad con un producto o servicio</option><option value="QUEJA">Queja — disconformidad con la atención</option></select></label>
      </div>
      <div className="mt-6 grid gap-6"><TextArea label="Detalle del reclamo o queja" name="detail" /><TextArea label="Pedido concreto del consumidor" name="requestedResolution" /></div>
      <div className="absolute -left-[10000px] h-px w-px overflow-hidden" aria-hidden="true"><label>No completar<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      <label className="mt-6 flex items-start gap-3 text-sm leading-6 text-slate-600"><input className="mt-1 h-5 w-5 rounded border-slate-300 accent-blue-600" type="checkbox" name="consent" required /><span>Declaro que la información proporcionada es correcta y autorizo su tratamiento para atender este registro, conforme a la <Link className="font-semibold text-blue-700 underline" href="/politica-privacidad">Política de privacidad</Link>.</span></label>
      {state.kind === "error" && <div id="complaint-error" role="alert" tabIndex={-1} className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">{state.message} Tus datos permanecen en el formulario.</div>}
      <div className="mt-7 flex flex-wrap items-center gap-4">
        <button className="button button--primary" type="submit" disabled={state.kind === "submitting"}>{state.kind === "submitting" ? <><LoaderCircle className="animate-spin" size={18} /> Registrando…</> : "Registrar reclamo o queja"}</button>
        {state.kind === "error" && <button type="submit" className="inline-flex min-h-11 items-center gap-2 font-semibold text-blue-700"><RotateCcw size={17} /> Reintentar</button>}
      </div>
    </form>
  );
}

function Field({ label, name, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; name: string }) {
  return <label className="text-sm font-semibold text-slate-800">{label}<input className={fieldClass} name={name} {...props} /></label>;
}

function TextArea({ label, name }: { label: string; name: string }) {
  return <label className="text-sm font-semibold text-slate-800">{label}<textarea className={`${fieldClass} min-h-32 py-3`} name={name} required maxLength={5000} /></label>;
}
