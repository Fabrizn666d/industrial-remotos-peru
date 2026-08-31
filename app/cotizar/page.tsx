import type { Metadata } from "next";
import { Suspense } from "react";
import { Configurator } from "@/components/Configurator";

export const metadata: Metadata = { title: "Configurador inteligente", description: "Prepara una primera configuración para solicitar asesoría y cotización." };

export default function QuotePage() {
  return (
    <main id="contenido" className="quote-page">
      <div className="page-shell quote-page__head">
        <div><span className="eyebrow">Cotizador frontend</span><h1>Configurador inteligente</h1><p>Personaliza una primera idea paso a paso. La información se guarda en “Mi proyecto” y no representa un precio final.</p></div>
        <span className="quote-page__status"><i />Selección local y privada</span>
      </div>
      <div className="page-shell"><Suspense fallback={<div className="configurator-loading">Preparando configurador…</div>}><Configurator /></Suspense></div>
    </main>
  );
}
