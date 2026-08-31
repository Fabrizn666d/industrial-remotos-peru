import { ArrowLeft, CalendarDays, ClipboardCheck, FileText, Mail, MapPin, Paperclip, Phone, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { StatusBadge } from "@/app/admin/StatusBadge";
import { formatAdminDate } from "@/app/admin/status";
import { getRequestRepository } from "@/lib/backend/repository";
import { getAdminSession } from "@/lib/backend/auth";
import styles from "../../../admin.module.css";

export const dynamic = "force-dynamic";

function formatConfiguration(value: string | number | boolean | string[] | null) {
  if (value === null) return "Por definir";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return value ? "Sí" : "No";
  return String(value);
}

export default async function AdminRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  if (!await getAdminSession()) redirect("/admin/login");
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();
  const request = await getRequestRepository().findById(id);
  if (!request) notFound();

  return (
    <>
      <Link className={styles.backLink} href="/admin/solicitudes"><ArrowLeft size={16} /> Volver a solicitudes</Link>
      <section className={styles.detailHeading}>
        <div><span>Solicitud original</span><h1>{request.code}</h1><p>Registrada {formatAdminDate(request.createdAt, true)}</p></div>
        <StatusBadge status={request.status} />
      </section>

      <div className={styles.detailLayout}>
        <div className={styles.detailMain}>
          <section className={styles.panel}>
            <header className={styles.sectionHeader}><div><ShieldCheck size={19} /><h2>Snapshot inmutable</h2></div><small>La operación comercial no sobrescribe estos datos.</small></header>
            <div className={styles.contactGrid}>
              <article><span><ClipboardCheck size={17} /></span><div><small>Cliente</small><b>{request.contact.name}</b>{request.contact.documentNumber && <p>{request.contact.documentType || "Documento"}: {request.contact.documentNumber}</p>}</div></article>
              <article><span><Mail size={17} /></span><div><small>Correo</small><a href={`mailto:${request.contact.email}`}>{request.contact.email}</a></div></article>
              <article><span><Phone size={17} /></span><div><small>Teléfono</small><a href={`tel:${request.contact.phone.replace(/[^+\d]/g, "")}`}>{request.contact.phone}</a>{request.contact.whatsapp && <p>WhatsApp: {request.contact.whatsapp}</p>}</div></article>
              <article><span><MapPin size={17} /></span><div><small>Ubicación</small><b>{request.details.location}</b></div></article>
              <article><span><CalendarDays size={17} /></span><div><small>Etapa / fecha estimada</small><b>{request.details.stage || "No indicada"}</b>{request.details.estimatedDate && <p>{request.details.estimatedDate}</p>}</div></article>
            </div>
            <div className={styles.projectSummary}><small>Tipo de proyecto</small><h2>{request.details.projectType}</h2><p>{request.details.notes || "Sin observaciones adicionales."}</p></div>
          </section>

          <section className={styles.panel}>
            <header className={styles.sectionHeader}><div><FileText size={19} /><h2>Elementos solicitados</h2></div><small>{request.items.length} registros</small></header>
            <div className={styles.itemList}>{request.items.map((item, index) => <article key={item.id}>
              <span className={styles.itemNumber}>{String(index + 1).padStart(2, "0")}</span>
              <div className={styles.itemBody}><div><h3>{item.name}</h3><b>Cantidad: {item.quantity}</b></div>
                {Object.keys(item.configuration).length > 0 && <dl>{Object.entries(item.configuration).map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{formatConfiguration(value)}</dd></div>)}</dl>}
                {item.notes && <p>{item.notes}</p>}
              </div>
            </article>)}</div>
          </section>
        </div>

        <aside className={styles.detailAside}>
          <section className={styles.panel}><h2>Operación</h2><dl className={styles.operationList}>
            <div><dt>Estado</dt><dd><StatusBadge status={request.status} /></dd></div>
            <div><dt>Responsable</dt><dd>{request.assignedTo || "Sin asignar"}</dd></div>
            <div><dt>Origen</dt><dd>{request.source === "CONFIGURATOR" ? "Configurador público" : request.source === "CONTACT" ? "Formulario de contacto" : "Importación administrativa"}</dd></div>
            <div><dt>Última actualización</dt><dd>{formatAdminDate(request.updatedAt, true)}</dd></div>
          </dl><p className={styles.pendingNote}>Cambio de estado, asignación y notas se habilitan en el siguiente corte transaccional.</p></section>
          <section className={styles.panel}><h2><Paperclip size={18} /> Adjuntos</h2>{request.attachmentNames.length ? <ul className={styles.attachmentList}>{request.attachmentNames.map((name) => <li key={name}>{name}</li>)}</ul> : <p className={styles.muted}>No se registraron nombres de adjuntos.</p>}<p className={styles.pendingNote}>Este contrato no acepta binarios todavía; la integración con Object Storage será independiente.</p></section>
          <section className={styles.evidenceCard}><ShieldCheck size={21} /><h2>Evidencia preservada</h2><p>El payload original, los items y el código fueron creados juntos. Los cambios operativos futuros se registrarán aparte.</p></section>
        </aside>
      </div>
    </>
  );
}
