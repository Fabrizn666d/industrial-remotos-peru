"use client";

import { Check, Copy, Download, MessageCircle, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { siteConfig } from "@/data/site";
import { LAST_REQUEST_KEY, type SubmittedRequest } from "@/types/quote";
import { products } from "@/data/products";
import { formatPublicPrice, PROPOSAL_DISCLAIMER } from "@/lib/pricing/engine";

function isSubmittedRequest(value: unknown): value is SubmittedRequest {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<SubmittedRequest>;
  return typeof candidate.requestId === "string"
    && typeof candidate.code === "string"
    && typeof candidate.createdAt === "string"
    && Array.isArray(candidate.items)
    && Boolean(candidate.contact)
    && Boolean(candidate.details)
    && typeof candidate.pricing?.status === "string";
}

export function ConfirmationScreen({ code }: { code?: string }) {
  const params = useSearchParams();
  const expectedCode = code || params.get("codigo") || "";
  const urlToken = params.get("token") || "";
  const [request, setRequest] = useState<SubmittedRequest | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      let stored: SubmittedRequest | null = null;
      try {
        const raw = sessionStorage.getItem(LAST_REQUEST_KEY);
        const parsed: unknown = raw ? JSON.parse(raw) : null;
        if (isSubmittedRequest(parsed) && (!expectedCode || parsed.code === expectedCode)) stored = parsed;
      } catch { sessionStorage.removeItem(LAST_REQUEST_KEY); }
      const token = urlToken || stored?.accessToken || "";
      if (expectedCode && token) {
        try {
          const response = await fetch(`/api/proposals/${encodeURIComponent(expectedCode)}?token=${encodeURIComponent(token)}`, { cache: "no-store" });
          const body = await response.json() as { proposal?: any };
          if (response.ok && body.proposal && !cancelled) {
            const proposal = body.proposal;
            const restored: SubmittedRequest = {
              requestId: proposal.id, code: proposal.code, createdAt: proposal.createdAt, accessToken: token,
              contact: proposal.contact, details: { region: "", province: "", district: "", address: "", ...proposal.details }, files: [], pricing: proposal.pricingSnapshot,
              items: proposal.items.map((item: any) => { const product = products.find((entry) => entry.id === item.productId); return { id: item.id, productId: item.productId || "", name: item.name, image: product?.image || "/images/reales/puerta-22.jpg", quantity: item.quantity, configuration: { accessories: [], ...item.configuration, dimensions: item.configuration.width || item.configuration.height ? { width: item.configuration.width, height: item.configuration.height, unit: "m" } : undefined }, price: { status: "pending" }, createdAt: proposal.createdAt, updatedAt: proposal.updatedAt }; })
            };
            setRequest(restored);
            sessionStorage.setItem(LAST_REQUEST_KEY, JSON.stringify(restored));
            return;
          }
        } catch { /* Local snapshot remains a safe fallback in this browser. */ }
      }
      if (!cancelled) setRequest(stored);
    }
    load().finally(() => { if (!cancelled) setLoaded(true); });
    return () => { cancelled = true; };
  }, [expectedCode, urlToken]);

  if (!loaded) return <div className="confirmation-loading">Verificando solicitud…</div>;

  if (!request) {
    return (
      <div className="confirmation-screen">
        <section className="confirmation-main">
          <span className="confirmation-check"><Search size={38} /></span>
          <span className="eyebrow eyebrow--light">Seguimiento seguro</span>
          <h1>No pudimos abrir esta propuesta privada.</h1>
          <p>El código por sí solo no da acceso a datos personales. Abre el enlace privado recibido al enviar la propuesta o consulta con un asesor.</p>
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
  const total = request.pricing.estimatedTotalMinor;
  const privateQuery = request.accessToken ? `?token=${encodeURIComponent(request.accessToken)}` : "";
  const summary = request.items.slice(0, 3).map((item) => `${item.quantity}× ${item.name}`).join(", ");
  const whatsappBase = request.pricing?.proposalTerms?.whatsappNumber ? `https://wa.me/${request.pricing.proposalTerms.whatsappNumber}` : siteConfig.social.whatsapp;
  const whatsapp = `${whatsappBase}?text=${encodeURIComponent(`Hola, Industrial Remotos Perú. Quisiera revisar la propuesta ${request.code}. Resumen: ${summary}.`)}`;

  return (
    <div className="confirmation-screen">
      <section className="confirmation-main">
        <span className="confirmation-check"><Check size={44} /></span>
        <span className="eyebrow eyebrow--light">Guardado confirmado</span>
        <h1>Propuesta enviada</h1>
        <p>Industrial Remotos Perú se pondrá en contacto contigo lo antes posible para revisar los detalles de tu proyecto.</p>
        <div className="confirmation-code"><small>Código de propuesta</small><strong>{request.code}</strong><button type="button" onClick={copyCode} aria-label="Copiar código"><Copy size={17} /></button><span>{copied ? "Código copiado" : "Guarda también este enlace privado"}</span></div>
        <div className="confirmation-actions"><a className="button button--primary" href={`/api/proposals/${encodeURIComponent(request.code)}/pdf${privateQuery}`}><Download size={17} /> Descargar propuesta PDF</a><a className="button button--secondary" href={whatsapp} target="_blank" rel="noreferrer"><MessageCircle size={17} /> Hablar con IRP</a><Link className="button button--secondary" href="/">Volver al sitio</Link></div>
        <small>{PROPOSAL_DISCLAIMER}</small>
      </section>
      <aside className="confirmation-order">
        <small>Resumen de tu proyecto</small><h2>{request.items.reduce((sum, item) => sum + item.quantity, 0)} elementos</h2>
        <div>{request.items.map((item, index) => { const result = request.pricing.items[index]?.result; return <article key={item.id}><span><Image src={item.image} alt="" fill sizes="64px" className="object-cover" /></span><div><b>{item.name}</b><small>Cantidad: {item.quantity}</small></div><strong>{result?.status === "ESTIMATED" ? formatPublicPrice(result.totalMinor) : "Evaluación"}</strong></article>; })}</div>
        <footer><span>Total estimado</span><b>{total !== null ? formatPublicPrice(total) : "Requiere evaluación"}</b></footer>
      </aside>
      <section className="confirmation-next"><h2>¿Qué sucede ahora?</h2><div><article><b>01</b><h3>Revisamos tu propuesta</h3><p>El equipo analiza configuración y condiciones.</p></article><article><b>02</b><h3>Validamos contigo</h3><p>Coordinamos medidas, materiales y alcance final.</p></article><article><b>03</b><h3>Versión comercial</h3><p>Si hay cambios, IRP emitirá una nueva versión sin alterar esta propuesta.</p></article></div></section>
    </div>
  );
}
