"use client";

import { Download, Mail, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Logo } from "@/components/Logo";
import { formatPEN } from "@/lib/currency";
import { buildExampleRequest } from "@/lib/request";
import { siteConfig } from "@/data/site";
import { LAST_REQUEST_KEY, type SubmittedRequest } from "@/types/quote";

export function ProformaDocument() {
  const params = useSearchParams();
  const [request, setRequest] = useState<SubmittedRequest | null>(null);
  const [downloading, setDownloading] = useState(false);
  const documentRef = useRef<HTMLElement>(null);
  const autoDownloaded = useRef(false);
  useEffect(() => {
    const saved = sessionStorage.getItem(LAST_REQUEST_KEY);
    setRequest(saved ? JSON.parse(saved) as SubmittedRequest : buildExampleRequest());
  }, []);

  const downloadPdf = useCallback(async () => {
    if (!request || !documentRef.current || downloading) return;
    setDownloading(true);
    try {
      await document.fonts.ready;
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([import("html2canvas"), import("jspdf")]);
      const canvas = await html2canvas(documentRef.current, { scale: 2, useCORS: true, backgroundColor: "#ffffff", logging: false });
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imageHeight = canvas.height * pageWidth / canvas.width;
      const image = canvas.toDataURL("image/jpeg", .94);
      let position = 0;
      pdf.addImage(image, "JPEG", 0, position, pageWidth, imageHeight, undefined, "FAST");
      for (let remaining = imageHeight - pageHeight; remaining > 0; remaining -= pageHeight) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(image, "JPEG", 0, position, pageWidth, imageHeight, undefined, "FAST");
      }
      pdf.save(`${request.code}.pdf`);
    } finally {
      setDownloading(false);
    }
  }, [downloading, request]);

  useEffect(() => {
    if (!request || params.get("download") !== "1" || autoDownloaded.current) return;
    autoDownloaded.current = true;
    const timer = window.setTimeout(() => void downloadPdf(), 700);
    return () => window.clearTimeout(timer);
  }, [downloadPdf, params, request]);

  if (!request) return <div className="proforma-loading">Preparando documento…</div>;
  const subtotal = request.total / 1.18;
  const igv = request.total - subtotal;
  const created = new Intl.DateTimeFormat("es-PE", { dateStyle: "medium" }).format(new Date(request.createdAt));

  return (
    <div className="proforma-page">
      <div className="proforma-toolbar"><p>Documento referencial listo para descargar</p><div><button className="button button--secondary" type="button" onClick={() => window.print()}>Imprimir</button><button className="button button--primary" type="button" onClick={() => void downloadPdf()} disabled={downloading}><Download size={17} /> {downloading ? "Generando…" : "Descargar PDF"}</button></div></div>
      <article className="proforma-document" ref={documentRef}>
        <header><Logo /><div><small>Proforma</small><h1>N.° {request.code}</h1></div><dl><div><dt>Fecha</dt><dd>{created}</dd></div><div><dt>Validez</dt><dd>15 días</dd></div><div><dt>Asesor</dt><dd>IRP Asesor Comercial</dd></div></dl></header>
        <section className="proforma-client"><div><small>Cliente</small><b>{request.contact.name}</b></div><div><small>Correo</small><b>{request.contact.email}</b></div><div><small>Teléfono</small><b>{request.contact.phone}</b></div><div><small>Proyecto</small><b>{request.details.projectType}</b></div><div><small>Ubicación</small><b>{request.details.location}</b></div><div><small>Etapa</small><b>{request.details.stage}</b></div></section>
        <div className="proforma-table-wrap"><table><thead><tr><th>#</th><th>Producto</th><th>Descripción</th><th>Medidas</th><th>Cant.</th><th>Precio unit.</th><th>Subtotal</th></tr></thead><tbody>{request.items.map((item, index) => <tr key={item.id}><td>{index + 1}</td><td><span className="proforma-product-image"><Image src={item.image} alt="" fill sizes="44px" className="object-cover" /></span><b>{item.name}</b></td><td>{item.finish || "Acabado por validar"}</td><td>{item.measures || "Por definir"}</td><td>{item.quantity}</td><td>{formatPEN(item.unitPrice)}</td><td>{formatPEN(item.unitPrice * item.quantity)}</td></tr>)}</tbody></table></div>
        <section className="proforma-bottom"><div><h2>Notas</h2><ul><li>Importes referenciales para demostrar el flujo frontend.</li><li>Validez del ejemplo: 15 días calendario.</li><li>Las medidas, materiales, automatización e instalación requieren validación técnica.</li></ul></div><dl><div><dt>Subtotal</dt><dd>{formatPEN(subtotal)}</dd></div><div><dt>IGV (18%)</dt><dd>{formatPEN(igv)}</dd></div><div><dt>Total</dt><dd>{formatPEN(request.total)}</dd></div></dl></section>
        <section className="proforma-signature"><span /><b>IRP Asesor Comercial</b><small>Firma y validación</small></section>
        <footer><span><Phone size={15} /> {siteConfig.phoneDisplay}</span><span><Mail size={15} /> ventas@industrialremotos.pe</span><span><MapPin size={15} /> {siteConfig.location}</span></footer>
      </article>
    </div>
  );
}
