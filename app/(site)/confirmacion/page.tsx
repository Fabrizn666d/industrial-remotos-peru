import type { Metadata } from "next";
import { Suspense } from "react";
import { ConfirmationScreen } from "@/components/ConfirmationScreen";

export const metadata: Metadata = { title: "Consultar solicitud", description: "Consulta los próximos pasos de tu solicitud.", robots: { index: false, follow: false } };

export default function ConfirmationPage() {
  return <main id="contenido" className="confirmation-route"><div className="page-shell"><Suspense fallback={<div className="confirmation-loading">Preparando confirmación…</div>}><ConfirmationScreen /></Suspense></div></main>;
}
