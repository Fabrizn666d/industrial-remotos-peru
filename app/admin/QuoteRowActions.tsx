"use client";

import { Copy, Download, Eye, MoreHorizontal, Pencil, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { QuoteStatus } from "@/lib/control/quote-contracts";
import styles from "./admin.module.css";

export function QuoteRowActions({ id, code, status }: { id: string; code: string; status: QuoteStatus }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function action(value: "duplicate" | "void") {
    if (pending) return;
    if (value === "void" && !window.confirm(`¿Anular ${code}? Esta acción conservará el documento como anulado.`)) return;
    setPending(true);
    try {
      const response = await fetch(`/api/admin/quotes/${id}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: value })
      });
      const payload = await response.json() as { id?: string; error?: string };
      if (!response.ok) throw new Error(payload.error || "No se pudo completar la acción");
      if (value === "duplicate" && payload.id) router.push(`/admin/cotizaciones/${payload.id}`);
      else router.refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "No se pudo completar la acción");
    } finally {
      setPending(false);
      setOpen(false);
    }
  }

  return (
    <div className={styles.quoteActions}>
      <button type="button" onClick={() => setOpen((value) => !value)} aria-label={`Acciones de ${code}`}><MoreHorizontal size={17} /></button>
      {open && <div className={styles.quoteActionsMenu}>
        <Link href={`/admin/cotizaciones/${id}`}><Pencil size={14} />{status === "DRAFT" ? "Abrir y editar" : "Abrir"}</Link>
        <a href={`/api/admin/quotes/${id}/pdf`} target="_blank" rel="noreferrer"><Eye size={14} />Vista previa</a>
        <a href={`/api/admin/quotes/${id}/pdf?download=1`}><Download size={14} />Descargar PDF</a>
        <button type="button" onClick={() => action("duplicate")} disabled={pending}><Copy size={14} />Duplicar</button>
        {status !== "VOID" && <button className={styles.dangerAction} type="button" onClick={() => action("void")} disabled={pending}><XCircle size={14} />Anular</button>}
      </div>}
    </div>
  );
}

