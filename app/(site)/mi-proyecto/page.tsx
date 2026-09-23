import type { Metadata } from "next";
import { MyProjectPage } from "@/components/MyProjectPage";

export const metadata: Metadata = { title: "Mi proyecto", description: "Revisa las soluciones guardadas para solicitar asesoría.", robots: { index: false, follow: false } };

export default function ProjectPage() {
  return <main id="contenido" className="my-project-route"><div className="page-shell"><MyProjectPage /></div></main>;
}
