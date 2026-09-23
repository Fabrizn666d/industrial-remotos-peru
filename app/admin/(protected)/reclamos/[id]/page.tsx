import { ArrowLeft, CalendarDays, FileText, Mail, MapPin, Phone, UserRound } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { ComplaintStatusControl } from "@/app/admin/ComplaintStatusControl";
import { formatAdminDate } from "@/app/admin/status";
import { getAdminSession } from "@/lib/backend/auth";
import { findComplaint } from "@/lib/complaints";
import styles from "../../../admin.module.css";

export const dynamic = "force-dynamic";
export default async function ComplaintDetailPage({ params }: { params: Promise<{ id: string }> }) {
  if (!await getAdminSession()) redirect("/admin/login");
  const { id } = await params; if (!z.string().uuid().safeParse(id).success) notFound();
  const complaint = await findComplaint(id); if (!complaint) notFound();
  return <><Link className={styles.backLink} href="/admin/reclamos"><ArrowLeft size={16} />Volver a reclamos</Link><section className={styles.detailHeading}><div><span>{complaint.type}</span><h1>{complaint.code}</h1><p>Registrado {formatAdminDate(complaint.createdAt, true)}</p></div><span className={`${styles.statusBadge} ${styles[`complaint_${complaint.status}`]}`}>{complaint.status}</span></section><div className={styles.detailLayout}><div className={styles.detailMain}>
    <section className={styles.panel}><header className={styles.sectionHeader}><div><UserRound size={19} /><h2>Consumidor</h2></div></header><div className={styles.contactGrid}><article><span><UserRound size={17} /></span><div><small>Nombre</small><b>{complaint.consumer.name}</b><p>{complaint.consumer.documentType}: {complaint.consumer.documentNumber}</p></div></article><article><span><Mail size={17} /></span><div><small>Correo</small><a href={`mailto:${complaint.consumer.email}`}>{complaint.consumer.email}</a></div></article><article><span><Phone size={17} /></span><div><small>Teléfono</small><a href={`tel:${complaint.consumer.phone.replace(/[^+\d]/g, "")}`}>{complaint.consumer.phone}</a></div></article><article><span><MapPin size={17} /></span><div><small>Dirección declarada</small><b>{complaint.consumer.address}</b></div></article></div></section>
    <section className={styles.panel}><header className={styles.sectionHeader}><div><FileText size={19} /><h2>Registro original</h2></div></header><div className={styles.complaintCopy}><article><small>Producto o servicio</small><p>{complaint.contractedGood}</p></article><article><small>Detalle</small><p>{complaint.detail}</p></article><article><small>Pedido del consumidor</small><p>{complaint.requestedResolution}</p></article></div></section>
  </div><aside className={styles.detailAside}><section className={styles.panel}><h2>Gestión</h2><ComplaintStatusControl id={complaint.id} initialStatus={complaint.status} /></section><section className={styles.panel}><h2><CalendarDays size={18} />Datos del caso</h2><dl className={styles.operationList}><div><dt>Fecha del hecho</dt><dd>{complaint.incidentDate}</dd></div><div><dt>Tipo</dt><dd>{complaint.type}</dd></div><div><dt>Monto declarado</dt><dd>{complaint.amount || "No indicado"}</dd></div></dl></section></aside></div></>;
}
