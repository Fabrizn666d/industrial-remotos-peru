"use client";

import { Download, ExternalLink, MessageCircle, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { RequestStatus } from "@/lib/backend/contracts";
import styles from "./admin.module.css";

export function RequestOperations({
  requestId,
  code,
  customerName,
  phone,
  initialStatus,
  initialAssignee,
  statuses
}: {
  requestId: string;
  code: string;
  customerName: string;
  phone: string;
  initialStatus: RequestStatus;
  initialAssignee: string | null;
  statuses: Array<{ value: RequestStatus; label: string }>;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [assignedTo, setAssignedTo] = useState(initialAssignee ?? "");
  const [internalNote, setInternalNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");
  const digits = phone.replace(/\D/g, "");
  const whatsapp = `https://wa.me/${digits.startsWith("51") ? digits : `51${digits}`}?text=${encodeURIComponent(`Hola ${customerName}, te escribimos de Industrial Remotos Perú sobre tu propuesta ${code}.`)}`;

  async function save() {
    setBusy(true);
    setFeedback("");
    try {
      const response = await fetch(`/api/admin/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, assignedTo, ...(internalNote.trim() ? { internalNote: internalNote.trim() } : {}) })
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || "No se pudo guardar");
      setInternalNote("");
      setFeedback("Operación actualizada y registrada en el historial.");
      router.refresh();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "No se pudo guardar");
    } finally {
      setBusy(false);
    }
  }

  return <div className={styles.requestOperations}>
    <label>Estado<select value={status} onChange={(event) => setStatus(event.target.value as RequestStatus)}>{statuses.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select></label>
    <label>Responsable<input type="email" value={assignedTo} onChange={(event) => setAssignedTo(event.target.value)} placeholder="asesor@empresa.com" /></label>
    <label>Nota interna<textarea value={internalNote} onChange={(event) => setInternalNote(event.target.value)} maxLength={2000} rows={4} placeholder="Seguimiento visible solo para el equipo" /></label>
    <button type="button" onClick={save} disabled={busy}><Save size={15} />{busy ? "Guardando…" : "Guardar seguimiento"}</button>
    {feedback && <small role="status">{feedback}</small>}
    <div className={styles.requestOperationLinks}>
      <a href={`/api/admin/requests/${requestId}/pdf`} target="_blank" rel="noreferrer"><ExternalLink size={14}/>Ver propuesta</a>
      <a href={`/api/admin/requests/${requestId}/pdf?download=1`}><Download size={14}/>Descargar PDF</a>
      <a href={whatsapp} target="_blank" rel="noreferrer"><MessageCircle size={14}/>WhatsApp</a>
      <Link href={`/admin/cotizaciones/nueva?solicitud=${requestId}`}>Preparar cotización comercial</Link>
    </div>
  </div>;
}
