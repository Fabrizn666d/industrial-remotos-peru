"use client";

import { ArrowLeft, ClipboardCheck, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { siteConfig } from "@/data/site";
import { LAST_REQUEST_KEY } from "@/types/quote";

export function ProformaDocument() {
  const [code, setCode] = useState("");

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(LAST_REQUEST_KEY);
      if (!raw) return;
      const value: unknown = JSON.parse(raw);
      if (value && typeof value === "object" && "code" in value && typeof value.code === "string") setCode(value.code);
    } catch {
      sessionStorage.removeItem(LAST_REQUEST_KEY);
    }
  }, []);

  return (
    <div className="proforma-page">
      <section className="checkout-empty" aria-labelledby="proforma-pending-title">
        <span><ClipboardCheck size={36} /></span>
        <small className="eyebrow">Documento comercial</small>
        <h1 id="proforma-pending-title">La proforma aún no ha sido emitida.</h1>
        <p>Una solicitud no constituye una cotización. Después de validar alcance, medidas y condiciones, el equipo podrá emitir una versión identificada y descargable.</p>
        {code && <div className="confirmation-code"><small>Solicitud relacionada</small><strong>{code}</strong></div>}
        <div className="confirmation-actions">
          <Link className="button button--secondary" href={code ? `/cotizar/confirmacion/${encodeURIComponent(code)}` : "/mi-proyecto"}><ArrowLeft size={17} /> Volver</Link>
          <a className="button button--primary" href={siteConfig.social.whatsapp} target="_blank" rel="noreferrer"><MessageCircle size={17} /> Consultar estado</a>
        </div>
      </section>
    </div>
  );
}
