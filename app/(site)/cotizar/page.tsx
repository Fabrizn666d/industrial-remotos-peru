import type { Metadata } from "next";
import { Suspense } from "react";
import { Configurator } from "@/components/Configurator";

export const metadata: Metadata = { title: "Configura tu proyecto", description: "Prepara una configuración visual para solicitar asesoría y cotización." };

export default function QuotePage() {
  return (
    <main id="contenido" className="quote-page">
      <div className="page-shell quote-page__head">
        <div><span className="eyebrow">Cotiza tu proyecto</span><h1>Configurador visual</h1><p>Prepara una primera idea paso a paso. El borrador se guarda en tu navegador y el precio se confirma después de la revisión técnica.</p></div>
        <span className="quote-page__status"><i />Borrador local hasta enviarlo</span>
      </div>
      <div className="page-shell"><Suspense fallback={<div className="configurator-loading">Preparando configurador…</div>}><Configurator /></Suspense></div>
    </main>
  );
}
