import type { Metadata } from "next";
import { Suspense } from "react";
import { Configurator } from "@/components/Configurator";
import { ToolHeader } from "@/components/ToolHeader";

export const metadata: Metadata = { title: "Configura tu proyecto", description: "Prepara una configuración visual para solicitar asesoría y cotización." };

export default function QuotePage() {
  return (
    <main id="contenido" className="quote-page">
      <div className="page-shell quote-page__toolbar"><ToolHeader /></div>
      <div className="page-shell quote-page__viewport"><Suspense fallback={<div className="configurator-loading">Preparando configurador…</div>}><Configurator /></Suspense></div>
    </main>
  );
}
