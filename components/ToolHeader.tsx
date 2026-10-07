"use client";
import { ArrowLeft, BriefcaseBusiness } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { useProject } from "@/components/ProjectContext";

export function ToolHeader({ title = "Cotizador inteligente" }: { title?: string }) {
  const { count, setDrawerOpen } = useProject();
  return <header className="tool-header"><Link href="/" aria-label="Volver al sitio"><Logo compact /></Link><strong>{title}</strong><nav><button type="button" onClick={()=>setDrawerOpen(true)}><BriefcaseBusiness size={17}/>Mi proyecto <b>{count}</b></button><Link href="/"><ArrowLeft size={16}/>Salir</Link></nav></header>;
}
