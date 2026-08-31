import type { Metadata } from "next";
import { Suspense } from "react";
import { ProformaDocument } from "@/components/ProformaDocument";

export const metadata: Metadata = { title: "Proforma de ejemplo", description: "Documento referencial de la solicitud de cotización." };

export default function ProformaPage() {
  return <main id="contenido" className="proforma-route"><div className="page-shell"><Suspense fallback={<div className="proforma-loading">Preparando documento…</div>}><ProformaDocument /></Suspense></div></main>;
}
