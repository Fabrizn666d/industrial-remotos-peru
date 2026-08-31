import type { RequestStatus } from "@/lib/backend/contracts";

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  NEW: "Nueva",
  IN_REVIEW: "En revisión",
  QUOTED: "Cotizada",
  PROFORMA_SENT: "Proforma enviada",
  CONTACTED: "Contactado",
  VISIT_SCHEDULED: "Visita coordinada",
  APPROVED: "Aprobada",
  MANUFACTURING: "Fabricación",
  INSTALLATION: "Instalación",
  COMPLETED: "Finalizada",
  REJECTED: "Rechazada",
  ARCHIVED: "Archivada"
};

export function formatAdminDate(value: string, includeTime = false) {
  return new Intl.DateTimeFormat("es-PE", includeTime
    ? { dateStyle: "medium", timeStyle: "short", timeZone: "America/Lima" }
    : { dateStyle: "medium", timeZone: "America/Lima" }
  ).format(new Date(value));
}
