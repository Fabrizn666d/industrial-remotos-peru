"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./admin.module.css";

const statuses = ["RECEIVED", "IN_REVIEW", "ANSWERED", "CLOSED"] as const;
type ComplaintStatus = (typeof statuses)[number];
const labels: Record<ComplaintStatus, string> = { RECEIVED: "Recibido", IN_REVIEW: "En revisión", ANSWERED: "Respondido", CLOSED: "Cerrado" };

export function ComplaintStatusControl({ id, initialStatus, initialResponse }: { id: string; initialStatus: ComplaintStatus; initialResponse: string }) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [responseText, setResponseText] = useState(initialResponse);
  const [saved, setSaved] = useState("");
  const update = async () => {
    setPending(true); setError(""); setSaved("");
    try {
      const response = await fetch(`/api/admin/complaints/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status, providerResponse: responseText }) });
      if (!response.ok) throw new Error("No se pudo guardar el estado");
      setSaved("Gestión guardada.");
      router.refresh();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "No se pudo guardar"); }
    finally { setPending(false); }
  };
  return <div className={styles.statusControl}><label>Estado<select value={status} disabled={pending} onChange={(event) => setStatus(event.target.value as ComplaintStatus)}>{statuses.map((value) => <option value={value} key={value}>{labels[value]}</option>)}</select></label><label>Respuesta al consumidor<textarea rows={7} maxLength={6000} value={responseText} onChange={(event) => setResponseText(event.target.value)} placeholder="Registra aquí la respuesta enviada al consumidor." /></label><button type="button" disabled={pending} onClick={update}>{pending ? "Guardando…" : "Guardar gestión"}</button>{error && <small role="alert">{error}</small>}{saved && <small>{saved}</small>}</div>;
}
