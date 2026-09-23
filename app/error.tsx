"use client";

import { RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("route_render_error", error.digest || error.message); }, [error]);
  return (
    <main className="grid min-h-[70svh] place-items-center bg-slate-50 px-5 py-24">
      <section className="max-w-xl rounded-[30px] border border-slate-200 bg-white p-8 text-center shadow-soft md:p-12">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-blue-600">No se pudo mostrar esta página</p>
        <h1 className="mt-4 text-4xl font-bold tracking-[-.045em] text-slate-950">Algo no salió como esperábamos.</h1>
        <p className="mt-4 leading-7 text-slate-600">Puedes volver a intentarlo. Si el problema continúa, regresa al inicio para seguir navegando.</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3"><button className="button button--primary" type="button" onClick={reset}><RotateCcw size={18} /> Reintentar</button><Link className="button button--secondary" href="/">Volver al inicio</Link></div>
      </section>
    </main>
  );
}
