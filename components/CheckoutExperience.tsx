"use client";

import { ArrowLeft, ArrowRight, Check, FileCheck2, Info, PackageCheck, Paperclip, Send, ShoppingBag, Trash2, Upload, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useProject } from "@/components/ProjectContext";
import { LAST_REQUEST_KEY, type QuoteContact, type QuoteDetails, type SubmittedRequest } from "@/types/quote";
import type { QuoteItem, QuoteItemConfiguration } from "@/types/catalog";
import { readSessionAttribution } from "@/lib/attribution";
import { calculateProjectPrice, formatPublicPrice, PROPOSAL_DISCLAIMER } from "@/lib/pricing/engine";
import type { ProjectPricing } from "@/lib/pricing/contracts";
import { usePublicPricingCatalog } from "@/lib/pricing/use-public-catalog";

const steps = [
  { label: "Revisar soluciones", icon: ShoppingBag },
  { label: "Datos y referencias", icon: Paperclip },
  { label: "Solicitud enviada", icon: FileCheck2 }
] as const;

const projectContextOptions = ["Vivienda", "Departamento", "Condominio", "Negocio o local comercial", "Oficina", "Terreno u obra nueva", "Industria o almacén", "Institución", "Otro"] as const;
const initialContact: QuoteContact = { name: "", email: "", phone: "", documentType: "DNI", documentNumber: "", businessName: "" };
const initialDetails: QuoteDetails = { projectType: "", location: "", region: "Lima", province: "", district: "", address: "", stage: "", estimatedDate: "", notes: "" };

type UploadedReference = { id: string; token: string; name: string; mimeType: string; byteSize: number; url: string };
type CreatedResponse = { id: string; code: string; createdAt: string; accessToken: string | null; replayed: boolean; pricing: ProjectPricing };

function isCreatedResponse(value: unknown): value is CreatedResponse {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<CreatedResponse>;
  return typeof candidate.id === "string" && typeof candidate.code === "string" && typeof candidate.createdAt === "string" && (candidate.accessToken === null || typeof candidate.accessToken === "string") && Boolean(candidate.pricing) && typeof candidate.replayed === "boolean";
}

function uploadReference(file: File, draftId: string, progress: (value: number) => void): Promise<UploadedReference> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("POST", "/api/request-attachments");
    request.responseType = "json";
    request.upload.addEventListener("progress", (event) => { if (event.lengthComputable) progress(Math.round(event.loaded / event.total * 100)); });
    request.addEventListener("load", () => request.status >= 200 && request.status < 300 ? resolve(request.response.item as UploadedReference) : reject(new Error(request.response?.error || "No pudimos subir el archivo.")));
    request.addEventListener("error", () => reject(new Error("No pudimos conectar con el almacenamiento privado.")));
    const form = new FormData(); form.append("file", file); form.append("draftId", draftId); request.send(form);
  });
}

function compactConfiguration(configuration: QuoteItemConfiguration) {
  const values: Record<string, string | string[] | boolean> = {};
  if (configuration.subtype) values.subtype = configuration.subtype;
  if (configuration.dimensions?.width) values.width = configuration.dimensions.width;
  if (configuration.dimensions?.height) values.height = configuration.dimensions.height;
  if (configuration.dimensions) values.unit = configuration.dimensions.unit;
  if (configuration.measurementsUnknown) values.measurementsUnknown = true;
  for (const key of ["design", "panel", "finish", "automation", "model", "variant", "openingSystem", "material", "notes"] as const) if (configuration[key]) values[key] = configuration[key]!;
  if (configuration.accessories.length) values.accessories = configuration.accessories;
  for (const [key, value] of Object.entries(configuration.customFields ?? {})) values[`custom_${key}`] = value;
  return values;
}

function pricingConfiguration(item: QuoteItem) {
  const configuration = item.configuration;
  const factor = configuration.dimensions?.unit === "mm" ? 0.001 : 1;
  const meters = (value?: string) => value ? String(Number(value.replace(",", ".")) * factor) : undefined;
  return { width: meters(configuration.dimensions?.width), height: meters(configuration.dimensions?.height), measurementsUnknown: configuration.measurementsUnknown, subtype: configuration.subtype, model: configuration.model, variant: configuration.variant, openingSystem: configuration.openingSystem, design: configuration.design, panel: configuration.panel, material: configuration.material, finish: configuration.finish, automation: configuration.automation, accessories: configuration.accessories };
}

function dimensionsLabel(item: QuoteItem) {
  const dimensions = item.configuration.dimensions;
  if (item.configuration.measurementsUnknown || (!dimensions?.width && !dimensions?.height)) return "Medidas por definir";
  return `${dimensions.width ?? "?"} ${dimensions.unit} × ${dimensions.height ?? "?"} ${dimensions.unit}`;
}

function itemSummary(item: QuoteItem) {
  return [item.configuration.customFields?.modelLabel, item.configuration.openingSystem, dimensionsLabel(item), item.configuration.finish].filter(Boolean).join(" · ");
}

export function CheckoutExperience() {
  const publicCatalog = usePublicPricingCatalog();
  const router = useRouter();
  const { items, count, removeItem, removeItems } = useProject();
  const [active, setActive] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>(() => items.map((item) => item.id));
  const [contact, setContact] = useState(initialContact);
  const [details, setDetails] = useState(initialDetails);
  const [references, setReferences] = useState<UploadedReference[]>([]);
  const [uploading, setUploading] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const submissionId = useRef<string | null>(null);
  const draftId = useRef<string | null>(null);

  useEffect(() => setSelectedIds((current) => {
    const available = new Set(items.map((item) => item.id));
    const kept = current.filter((id) => available.has(id));
    return kept.length || !items.length ? kept : items.map((item) => item.id);
  }), [items]);

  const selectedItems = useMemo(() => items.filter((item) => selectedIds.includes(item.id)), [items, selectedIds]);
  const pricing = calculateProjectPrice(selectedItems.map((item) => ({ productId: item.productId, quantity: item.quantity, configuration: pricingConfiguration(item) })), details.location, publicCatalog.definitions, `v${publicCatalog.version}`, publicCatalog.proposalSettings, publicCatalog.configuratorStepOverrides);
  const dataValid = contact.name.trim().length >= 2 && contact.phone.replace(/\D/g, "").length >= 7 && (!contact.email.trim() || /^\S+@\S+\.\S+$/.test(contact.email)) && (contact.documentType === "DNI" ? /^\d{8}$/.test(contact.documentNumber) : /^\d{11}$/.test(contact.documentNumber) && contact.businessName.trim().length >= 2) && details.projectType !== "" && details.region.trim().length >= 2 && details.district.trim().length >= 2;

  const next = () => { setTouched(true); if (!selectedItems.length) return; setTouched(false); setActive(1); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const handleUpload = async (files: File[]) => {
    const selected = files.slice(0, Math.max(0, 8 - references.length));
    const allowed = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "video/mp4", "video/webm", "video/quicktime"]);
    if (!selected.length) return;
    if (selected.some((file) => !allowed.has(file.type) || file.size > (file.type.startsWith("video/") ? 35 : 8) * 1024 * 1024)) { setUploadError("Usa fotos de hasta 8 MB o videos MP4, WebM o MOV de hasta 35 MB."); return; }
    draftId.current ??= crypto.randomUUID(); setUploadError(""); setUploading(1);
    const uploaded: UploadedReference[] = [];
    try {
      for (let index = 0; index < selected.length; index += 1) uploaded.push(await uploadReference(selected[index], draftId.current, (value) => setUploading(Math.round(((index + value / 100) / selected.length) * 100))));
      setReferences((current) => [...current, ...uploaded]); setUploading(0);
    } catch (error) {
      await Promise.all(uploaded.map((item) => fetch(item.url, { method: "DELETE" }).catch(() => undefined)));
      setUploading(0); setUploadError(error instanceof Error ? error.message : "No pudimos subir los archivos.");
    }
  };

  const removeReference = async (item: UploadedReference) => {
    const response = await fetch(item.url, { method: "DELETE" }).catch(() => null);
    if (response?.ok) setReferences((current) => current.filter((entry) => entry.id !== item.id));
    else setUploadError("No pudimos quitar el archivo. Vuelve a intentarlo.");
  };

  const submit = async () => {
    setTouched(true);
    if (submitting || !dataValid || !selectedItems.length || publicCatalog.status !== "ready" || uploading > 0) return;
    setSubmitting(true); setSubmitError(""); submissionId.current ??= crypto.randomUUID();
    const normalizedDetails = { ...details, location: [details.district.trim(), details.region.trim()].filter(Boolean).join(", "), province: "", stage: "", estimatedDate: "" };
    const attribution = readSessionAttribution();
    const payload = {
      clientSubmissionId: submissionId.current,
      contact: { name: contact.name.trim(), email: contact.email.trim(), phone: contact.phone.trim(), documentType: contact.documentType, documentNumber: contact.documentNumber.trim(), ...(contact.documentType === "RUC" ? { businessName: contact.businessName.trim() } : {}) },
      details: { projectType: normalizedDetails.projectType, location: normalizedDetails.location, region: normalizedDetails.region.trim(), district: normalizedDetails.district.trim(), ...(normalizedDetails.address.trim() ? { address: normalizedDetails.address.trim() } : {}), ...(normalizedDetails.notes.trim() ? { notes: normalizedDetails.notes.trim() } : {}) },
      items: selectedItems.map((item) => ({ clientItemId: item.id, productId: item.productId, name: item.name, quantity: item.quantity, configuration: compactConfiguration(item.configuration) })),
      attachmentNames: [...new Set([...references.map((item) => item.name), ...selectedItems.flatMap((item) => Object.entries(item.configuration.customFields ?? {}).filter(([key]) => /^attachmentName\d*$/.test(key)).map(([, name]) => name))])].slice(0, 8),
      referenceAttachments: references,
      ...(attribution ? { attribution } : {}),
      source: selectedItems.some((item) => item.configuration.customFields?.source === "ASSISTANT") ? "ASSISTANT" as const : "CONFIGURATOR" as const
    };
    try {
      const response = await fetch("/api/requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const body: unknown = await response.json().catch(() => null);
      if (!response.ok || !isCreatedResponse(body)) throw new Error(body && typeof body === "object" && "error" in body && typeof body.error === "string" ? body.error : "No pudimos registrar la solicitud. Intenta nuevamente.");
      const request: SubmittedRequest = { requestId: body.id, code: body.code, createdAt: body.createdAt, accessToken: body.accessToken, contact, details: normalizedDetails, files: references.map((item) => item.name), items: selectedItems, pricing: body.pricing };
      sessionStorage.setItem(LAST_REQUEST_KEY, JSON.stringify(request));
      window.dispatchEvent(new CustomEvent("irp:analytics", { detail: { name: "quote_submit" } }));
      removeItems(selectedIds);
      router.push(`/cotizar/confirmacion/${encodeURIComponent(body.code)}${body.accessToken ? `?token=${encodeURIComponent(body.accessToken)}` : ""}`);
    } catch (error) { setSubmitError(error instanceof Error ? error.message : "No pudimos registrar la solicitud."); }
    finally { setSubmitting(false); }
  };

  if (!items.length) return <div className="checkout-empty"><span><PackageCheck size={36} /></span><h1>Tu proyecto no tiene elementos.</h1><p>Agrega al menos una solución para comenzar la solicitud.</p><Link className="button button--primary" href="/soluciones">Explorar soluciones <ArrowRight size={17} /></Link></div>;
  if (publicCatalog.status !== "ready") return <div className="checkout-empty" role={publicCatalog.status === "error" ? "alert" : "status"}><span><PackageCheck size={36} /></span><h1>{publicCatalog.status === "error" ? "No pudimos sincronizar el catálogo." : "Sincronizando el catálogo publicado…"}</h1><p>No enviaremos tu proyecto con datos desactualizados.</p>{publicCatalog.status === "error" && <button className="button button--primary" type="button" onClick={publicCatalog.retry}>Reintentar</button>}</div>;

  return <div className="checkout-experience">
    <div className="checkout-stepper" aria-label="Progreso de la solicitud">{steps.map(({ label, icon: Icon }, index) => <button type="button" key={label} className={index === active ? "is-active" : index < active ? "is-complete" : ""} disabled={index > active || index === 2} onClick={() => index < 2 && setActive(index)}><span>{index < active ? <Check size={15} /> : <Icon size={16} />}</span><small>{label}</small></button>)}</div>
    <div className="checkout-layout-v2"><div className="checkout-flow-column"><section className="checkout-card">
      {active === 0 ? <CheckoutCartReview items={items} selectedIds={selectedIds} setSelectedIds={setSelectedIds} removeItem={removeItem} pricing={pricing} /> : <div className="checkout-panel"><div className="checkout-panel__heading"><span className="eyebrow">Datos y referencias</span><h1>Cuéntanos sobre tu proyecto.</h1><p>Guardamos tus datos y archivos de forma privada para preparar la cotización.</p></div><div className="checkout-details-grid"><div className="checkout-form-grid">
        <label className="is-wide">Nombres y apellidos<input value={contact.name} onChange={(event) => setContact({ ...contact, name: event.target.value })} autoComplete="name" />{touched && contact.name.trim().length < 2 && <small>Ingresa tu nombre.</small>}</label>
        <label>Tipo de documento<select value={contact.documentType} onChange={(event) => setContact({ ...contact, documentType: event.target.value as "DNI" | "RUC", documentNumber: "", businessName: "" })}><option value="DNI">DNI</option><option value="RUC">RUC</option></select></label>
        <label>{contact.documentType}<input value={contact.documentNumber} onChange={(event) => setContact({ ...contact, documentNumber: event.target.value.replace(/\D/g, "").slice(0, contact.documentType === "DNI" ? 8 : 11) })} inputMode="numeric" />{touched && !new RegExp(`^\\d{${contact.documentType === "DNI" ? 8 : 11}}$`).test(contact.documentNumber) && <small>Revisa el número.</small>}</label>
        {contact.documentType === "RUC" && <label className="is-wide">Razón social<input value={contact.businessName} onChange={(event) => setContact({ ...contact, businessName: event.target.value })} autoComplete="organization" />{touched && contact.businessName.trim().length < 2 && <small>Ingresa la razón social.</small>}</label>}
        <label>WhatsApp / teléfono<input value={contact.phone} onChange={(event) => setContact({ ...contact, phone: event.target.value })} type="tel" autoComplete="tel" />{touched && contact.phone.replace(/\D/g, "").length < 7 && <small>Ingresa un teléfono válido.</small>}</label>
        <label>Correo (opcional)<input value={contact.email} onChange={(event) => setContact({ ...contact, email: event.target.value })} type="email" autoComplete="email" />{touched && contact.email && !/^\S+@\S+\.\S+$/.test(contact.email) && <small>Revisa el correo.</small>}</label>
        <label className="is-wide">Tipo de inmueble<select value={details.projectType} onChange={(event) => setDetails({ ...details, projectType: event.target.value })}><option value="">Selecciona una opción</option>{projectContextOptions.map((option) => <option value={option} key={option}>{option}</option>)}</select>{touched && !details.projectType && <small>Selecciona una opción.</small>}</label>
        <label>Ciudad<input value={details.region} onChange={(event) => setDetails({ ...details, region: event.target.value })} autoComplete="address-level1" />{touched && details.region.trim().length < 2 && <small>Indica la ciudad.</small>}</label>
        <label>Distrito<input value={details.district} onChange={(event) => setDetails({ ...details, district: event.target.value })} autoComplete="address-level3" />{touched && details.district.trim().length < 2 && <small>Indica el distrito.</small>}</label>
        <label className="is-wide">Dirección o referencia (opcional)<input value={details.address} onChange={(event) => setDetails({ ...details, address: event.target.value })} autoComplete="street-address" /></label>
        <label className="is-wide">Observaciones (opcional)<textarea value={details.notes} onChange={(event) => setDetails({ ...details, notes: event.target.value })} rows={4} /></label>
      </div><div className="checkout-dropzone"><Info size={25} /><b>Fotos, planos o videos</b><span>Opcional. Archivos privados: fotos hasta 8 MB y videos hasta 35 MB.</span><label className="button button--secondary"><Upload size={16} /> Adjuntar archivos<input hidden multiple type="file" accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm,video/quicktime" onChange={(event) => { void handleUpload(Array.from(event.target.files ?? [])); event.target.value = ""; }} /></label>{uploading > 0 && <small>Subiendo {uploading}%…</small>}{references.map((item) => <small key={item.id} className="checkout-uploaded-file"><span>{item.name}</span><button type="button" onClick={() => void removeReference(item)} aria-label={`Quitar ${item.name}`}><X size={13} /></button></small>)}{uploadError && <small role="alert">{uploadError}</small>}</div></div></div>}
    </section><footer className="checkout-footer">{active === 0 ? <Link href="/mi-proyecto"><ArrowLeft size={17} /> Volver a Mi proyecto</Link> : <button type="button" onClick={() => setActive(0)}><ArrowLeft size={17} /> Anterior</button>}{active === 0 ? <button className="button button--primary" type="button" onClick={next} disabled={!selectedItems.length}>Continuar <ArrowRight size={17} /></button> : <button className="button button--primary" type="button" onClick={() => void submit()} disabled={submitting || uploading > 0}>{submitting ? "Enviando…" : "Enviar solicitud"} <Send size={17} /></button>}</footer>{submitError && <p className="checkout-submit-error" role="alert">{submitError}</p>}</div>
      <aside className="checkout-side-summary"><span className="eyebrow">Solicitud actual</span><h2>{selectedItems.reduce((total, item) => total + item.quantity, 0)} seleccionados de {count}</h2><div className="checkout-side-summary__items">{selectedItems.slice(0, 4).map((item) => <article key={item.id}><span><Image src={item.image} alt="" fill sizes="58px" className="object-cover" /></span><div><b>{item.name}</b><small>{itemSummary(item)}</small></div></article>)}</div><div className="checkout-side-summary__total"><span>{pricing.status === "ESTIMATED" ? "Total estimado" : "Estado"}</span><strong>{pricing.status === "ESTIMATED" && pricing.estimatedTotalMinor !== null ? formatPublicPrice(pricing.estimatedTotalMinor) : "Pendiente"}</strong></div><p>{PROPOSAL_DISCLAIMER}</p></aside>
    </div>
  </div>;
}

function CheckoutCartReview({ items, selectedIds, setSelectedIds, removeItem, pricing }: { items: QuoteItem[]; selectedIds: string[]; setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>; removeItem: (id: string) => void; pricing: ProjectPricing }) {
  const allSelected = selectedIds.length === items.length;
  return <div className="checkout-review"><div className="checkout-panel__heading"><span className="eyebrow">Revisar soluciones</span><h1>Elige qué deseas enviar.</h1><p>Lo que no selecciones permanecerá en Mi proyecto para otra solicitud.</p></div><label className="checkout-select-all"><input type="checkbox" checked={allSelected} onChange={() => setSelectedIds(allSelected ? [] : items.map((item) => item.id))} /> Seleccionar todo</label><div className="checkout-review__list">{items.map((item) => { const selectedIndex = selectedIds.indexOf(item.id); const result = selectedIndex >= 0 ? pricing.items[selectedIndex]?.result : undefined; return <article key={item.id} className={selectedIndex >= 0 ? "is-selected" : ""}><input aria-label={`Seleccionar ${item.name}`} type="checkbox" checked={selectedIndex >= 0} onChange={() => setSelectedIds((current) => current.includes(item.id) ? current.filter((id) => id !== item.id) : [...current, item.id])} /><span><Image src={item.image} alt="" fill sizes="90px" className="object-cover" /></span><div><h2>{item.configuration.customFields?.modelLabel ? `${item.name} · ${item.configuration.customFields.modelLabel}` : item.name}</h2><p>{itemSummary(item)}</p><div className="checkout-review__actions"><Link href={`/cotizar?producto=${encodeURIComponent(item.productId)}&editar=${encodeURIComponent(item.id)}`}>Editar</Link><button type="button" onClick={() => removeItem(item.id)}><Trash2 size={13} /> Eliminar</button></div></div><b>{result?.status === "ESTIMATED" ? formatPublicPrice(result.totalMinor) : "Pendiente"}</b></article>; })}</div>{!selectedIds.length && <p className="checkout-submit-error" role="alert">Selecciona al menos una solución para continuar.</p>}</div>;
}
