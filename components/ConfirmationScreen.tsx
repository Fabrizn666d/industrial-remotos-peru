"use client";

import { Check, Copy, Download, Eye, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { formatPEN } from "@/lib/currency";
import { buildExampleRequest } from "@/lib/request";
import { siteConfig } from "@/data/site";
import { LAST_REQUEST_KEY, type SubmittedRequest } from "@/types/quote";

export function ConfirmationScreen({ code }: { code?: string }) {
  const params = useSearchParams();
  const [request, setRequest] = useState<SubmittedRequest | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem(LAST_REQUEST_KEY);
    setRequest(saved ? JSON.parse(saved) as SubmittedRequest : buildExampleRequest(code || params.get("codigo") || undefined));
  }, [code, params]);

  if (!request) return <div className="confirmation-loading">Preparando confirmación…</div>;
  const copyCode = async () => { await navigator.clipboard?.writeText(request.code); setCopied(true); };

  return (
    <div className="confirmation-screen">
      <section className="confirmation-main">
        <span className="confirmation-check"><Check size={44} /></span>
        <span className="eyebrow eyebrow--light">Solicitud registrada</span>
        <h1>¡Hemos recibido tu proyecto!</h1>
        <p>Revisaremos la información y te contactaremos para validar medidas, materiales e instalación.</p>
        <div className="confirmation-code"><small>Código de solicitud</small><strong>{request.code}</strong><button type="button" onClick={copyCode} aria-label="Copiar código"><Copy size={17} /></button><span>{copied ? "Código copiado" : "Guárdalo para el seguimiento"}</span></div>
        <div className="confirmation-actions"><Link className="button button--primary" href="/proforma?download=1"><Download size={17} /> Descargar proforma</Link><Link className="button button--secondary" href="/proforma"><Eye size={17} /> Ver cotización</Link><a className="button button--secondary" href={siteConfig.social.whatsapp} target="_blank" rel="noreferrer"><MessageCircle size={17} /> Hablar con asesor</a></div>
      </section>
      <aside className="confirmation-order">
        <small>Resumen de tu proyecto</small><h2>{request.items.reduce((sum, item) => sum + item.quantity, 0)} elementos</h2>
        <div>{request.items.map((item) => <article key={item.id}><span><Image src={item.image} alt="" fill sizes="64px" className="object-cover" /></span><div><b>{item.name}</b><small>{item.quantity} × {formatPEN(item.unitPrice)}</small></div><strong>{formatPEN(item.unitPrice * item.quantity)}</strong></article>)}</div>
        <footer><span>Total referencial</span><b>{formatPEN(request.total)}</b></footer>
      </aside>
      <section className="confirmation-next"><h2>¿Qué sucede ahora?</h2><div><article><b>01</b><h3>Revisamos tu proyecto</h3><p>El equipo analiza los detalles y referencias enviadas.</p></article><article><b>02</b><h3>Te enviamos la cotización</h3><p>Recibirás la validación comercial en tu correo o WhatsApp.</p></article><article><b>03</b><h3>Te asesoramos</h3><p>Coordinamos medidas, acabados, fabricación e instalación.</p></article></div></section>
    </div>
  );
}
