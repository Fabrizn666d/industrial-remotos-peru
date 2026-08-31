import type { Metadata } from "next";
import { AssistantExperience } from "@/components/AssistantExperience";

export const metadata: Metadata = { title: "IRP Asistente", description: "Encuentra una primera ruta para configurar tu proyecto." };

export default function AssistantPage() {
  return <main id="contenido" className="assistant-route"><div className="page-shell"><AssistantExperience /></div></main>;
}

