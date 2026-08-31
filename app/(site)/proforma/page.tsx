import type { Metadata } from "next";
import { Suspense } from "react";
import { ProformaDocument } from "@/components/ProformaDocument";

export const metadata: Metadata = { title: "Estado de proforma", description: "Consulta si existe un documento comercial emitido para tu solicitud.", robots: { index: false, follow: false } };

export default function ProformaPage() {
  return <main id="contenido" className="proforma-route"><div className="page-shell"><Suspense fallback={<div className="proforma-loading">Preparando documento…</div>}><ProformaDocument /></Suspense></div></main>;
}
