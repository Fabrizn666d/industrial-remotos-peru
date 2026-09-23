import { ArrowRight, Home, MessageCircle } from "lucide-react";
import Link from "next/link";
import { siteConfig } from "@/data/site";

export default function NotFound() {
  return (
    <main id="contenido" className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top_right,#dbeafe,transparent_38%),linear-gradient(135deg,#f8fbff,#eef6ff)] px-5 py-24">
      <section className="w-full max-w-3xl rounded-[34px] border border-blue-100 bg-white/90 p-8 text-center shadow-soft backdrop-blur md:p-14">
        <span className="text-sm font-extrabold uppercase tracking-[.24em] text-blue-600">Error 404</span>
        <h1 className="mt-5 text-4xl font-bold tracking-[-.05em] text-slate-950 md:text-6xl">Este acceso no existe.</h1>
        <p className="mx-auto mt-5 max-w-xl leading-7 text-slate-600">La página pudo cambiar de dirección. Puedes volver al inicio o continuar explorando nuestras soluciones.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link className="button button--primary" href="/"><Home size={18} /> Ir al inicio</Link>
          <Link className="button button--secondary" href="/soluciones">Ver soluciones <ArrowRight size={18} /></Link>
          <a className="button button--secondary" href={siteConfig.social.whatsapp} target="_blank" rel="noreferrer"><MessageCircle size={18} /> Contacto</a>
        </div>
      </section>
    </main>
  );
}
