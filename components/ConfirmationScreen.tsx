"use client";

import { Check, Copy, MessageCircle, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { siteConfig } from "@/data/site";
import { LAST_REQUEST_KEY, type SubmittedRequest } from "@/types/quote";

function isSubmittedRequest(value: unknown): value is SubmittedRequest {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<SubmittedRequest>;
  return typeof candidate.requestId === "string"
    && typeof candidate.code === "string"
    && typeof candidate.createdAt === "string"
    && Array.isArray(candidate.items)
    && Boolean(candidate.contact)
    && Boolean(candidate.details)
    && candidate.pricing?.status === "pending";
}

export function ConfirmationScreen({ code }: { code?: string }) {
  const params = useSearchParams();
  const expectedCode = code || params.get("codigo") || "";
  const [request, setRequest] = useState<SubmittedRequest | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(LAST_REQUEST_KEY);
      if (!raw) return;
      const parsed: unknown = JSON.parse(raw);
      if (!isSubmittedRequest(parsed)) return;
      if (expectedCode && parsed.code !== expectedCode) return;
      setRequest(parsed);
    } catch {
      sessionStorage.removeItem(LAST_REQUEST_KEY);
    } finally {
      setLoaded(true);
    }
  }, [expectedCode]);

  if (!loaded) return <div className="confirmation-loading">Verificando solicitud…</div>;

  if (!request) {
    return (
      <div className="confirmation-screen">
        <section className="confirmation-main">
          <span className="confirmation-check"><Search size={38} /></span>
          <span className="eyebrow eyebrow--light">Seguimiento seguro</span>
          <h1>No podemos abrir este expediente en este navegador.</h1>
          <p>Por seguridad no fabricamos una solicitud de ejemplo. Si acabas de enviarla, vuelve al enlace de confirmación original o comparte tu código con un asesor.</p>
          {expectedCode && <div className="confirmation-code"><small>Código consultado</small><strong>{expectedCode}</strong></div>}
          <div className="confirmation-actions"><Link className="button button--primary" href="/cotizar">Crear una solicitud</Link><a className="button button--secondary" href={siteConfig.social.whatsapp} target="_blank" rel="noreferrer"><MessageCircle size={17} /> Consultar por WhatsApp</a></div>
        </section>
      </div>
    );
  }

  const copyCode = async () => {
    await navigator.clipboard?.writeText(request.code);
    setCopied(true);
  };

  return (
    <div className="confirmation-screen">
      <section className="confirmation-main">
        <span className="confirmation-check"><Check size={44} /></span>
        <span className="eyebrow eyebrow--light">Solicitud registrada</span>
        <h1>¡Recibimos tu proyecto!</h1>
        <p>El equipo revisará la configuración y se comunicará contigo para validar medidas, materiales, instalación y precio.</p>
        <div className="confirmation-code"><small>Código de solicitud</small><strong>{request.code}</strong><button type="button" onClick={copyCode} aria-label="Copiar código"><Copy size={17} /></button><span>{copied ? "Código copiado" : "Guárdalo para el seguimiento"}</span></div>
        <div className="confirmation-actions"><a className="button button--primary" href={siteConfig.social.whatsapp} target="_blank" rel="noreferrer"><MessageCircle size={17} /> Hablar con un asesor</a><Link className="button button--secondary" href="/proyectos">Ver proyectos</Link></div>
        <small>La cotización y la proforma estarán disponibles únicamente después de la revisión comercial.</small>
      </section>
      <aside className="confirmation-order">
        <small>Resumen de tu proyecto</small><h2>{request.items.reduce((sum, item) => sum + item.quantity, 0)} elementos</h2>
        <div>{request.items.map((item) => <article key={item.id}><span><Image src={item.image} alt="" fill sizes="64px" className="object-cover" /></span><div><b>{item.name}</b><small>Cantidad: {item.quantity}</small></div><strong>Por confirmar</strong></article>)}</div>
        <footer><span>Importe</span><b>Por confirmar</b></footer>
      </aside>
      <section className="confirmation-next"><h2>¿Qué sucede ahora?</h2><div><article><b>01</b><h3>Revisamos tu proyecto</h3><p>El equipo analiza los detalles enviados.</p></article><article><b>02</b><h3>Validamos contigo</h3><p>Coordinamos medidas, materiales y alcance.</p></article><article><b>03</b><h3>Emitimos la propuesta</h3><p>Recibirás una cotización identificada y versionada.</p></article></div></section>
    </div>
  );
}
