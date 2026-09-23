"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./admin.module.css";

const statuses = ["RECEIVED", "IN_REVIEW", "ANSWERED", "CLOSED"] as const;
type ComplaintStatus = (typeof statuses)[number];
const labels: Record<ComplaintStatus, string> = { RECEIVED: "Recibido", IN_REVIEW: "En revisión", ANSWERED: "Respondido", CLOSED: "Cerrado" };

export function ComplaintStatusControl({ id, initialStatus }: { id: string; initialStatus: ComplaintStatus }) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const update = async (next: ComplaintStatus) => {
    const previous = status; setStatus(next); setPending(true); setError("");
    try {
      const response = await fetch(`/api/admin/complaints/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: next }) });
      if (!response.ok) throw new Error("No se pudo guardar el estado");
      router.refresh();
    } catch (reason) { setStatus(previous); setError(reason instanceof Error ? reason.message : "No se pudo guardar"); }
    finally { setPending(false); }
  };
  return <div className={styles.statusControl}><label>Estado<select value={status} disabled={pending} onChange={(event) => update(event.target.value as ComplaintStatus)}>{statuses.map((value) => <option value={value} key={value}>{labels[value]}</option>)}</select></label>{error && <small role="alert">{error}</small>}</div>;
}
