"use client";

import { ArrowLeft, ArrowRight, Check, ClipboardList, Contact, FileCheck2, Info, PackageCheck, Send, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useProject } from "@/components/ProjectContext";
import { products } from "@/data/products";
import { LAST_REQUEST_KEY, type QuoteContact, type QuoteDetails, type SubmittedRequest } from "@/types/quote";
import type { QuoteItem, QuoteItemConfiguration } from "@/types/catalog";
import { readSessionAttribution } from "@/lib/attribution";
import { calculateProjectPrice, formatPublicPrice, PROPOSAL_DISCLAIMER } from "@/lib/pricing/engine";
import type { ProjectPricing } from "@/lib/pricing/contracts";
import { usePublicPricingCatalog } from "@/lib/pricing/use-public-catalog";

const steps = [
  { label: "Mi proyecto", icon: ShoppingBag },
  { label: "Datos", icon: Contact },
  { label: "Detalles", icon: ClipboardList },
  { label: "Resumen", icon: FileCheck2 },
  { label: "Enviar", icon: Send }
];

const initialContact: QuoteContact = { name: "", email: "", phone: "", documentType: "DNI", documentNumber: "", businessName: "" };
const initialDetails: QuoteDetails = { projectType: "", location: "", region: "Lima", province: "Lima", district: "", address: "", stage: "En evaluación", estimatedDate: "", notes: "" };

type CreatedResponse = {
  id: string;
  code: string;
  createdAt: string;
  accessToken: string | null;
  replayed: boolean;
  pricing: ProjectPricing;
};

function isCreatedResponse(value: unknown): value is CreatedResponse {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<CreatedResponse>;
  return typeof candidate.id === "string"
    && typeof candidate.code === "string"
    && typeof candidate.createdAt === "string"
    && (candidate.accessToken === null || typeof candidate.accessToken === "string")
    && Boolean(candidate.pricing)
    && typeof candidate.replayed === "boolean";
}

function compactConfiguration(configuration: QuoteItemConfiguration) {
  const values: Record<string, string | string[]> = {};
  if (configuration.subtype) values.subtype = configuration.subtype;
  if (configuration.dimensions?.width) values.width = configuration.dimensions.width;
  if (configuration.dimensions?.height) values.height = configuration.dimensions.height;
  if (configuration.dimensions) values.unit = configuration.dimensions.unit;
  if (configuration.design) values.design = configuration.design;
  if (configuration.panel) values.panel = configuration.panel;
  if (configuration.finish) values.finish = configuration.finish;
  if (configuration.automation) values.automation = configuration.automation;
  if (configuration.model) values.model = configuration.model;
  if (configuration.variant) values.variant = configuration.variant;
  if (configuration.openingSystem) values.openingSystem = configuration.openingSystem;
  if (configuration.material) values.material = configuration.material;
  if (configuration.accessories.length) values.accessories = configuration.accessories;
  if (configuration.installation) values.installation = configuration.installation;
  if (configuration.notes) values.notes = configuration.notes;
  for (const [key, value] of Object.entries(configuration.customFields ?? {})) values[`custom_${key}`] = value;
  return values;
}

function dimensionsLabel(item: QuoteItem) {
  const dimensions = item.configuration.dimensions;
  if (!dimensions?.width && !dimensions?.height) return "Medidas por definir";
  return `${dimensions.width ?? "?"} ${dimensions.unit} × ${dimensions.height ?? "?"} ${dimensions.unit}`;
}

function itemSummary(item: QuoteItem) {
  return [dimensionsLabel(item), item.configuration.finish, item.configuration.design]
    .filter((value): value is string => Boolean(value) && value !== "Por definir")
    .join(" · ");
}

export function CheckoutExperience() {
  const publicCatalog = usePublicPricingCatalog();
  const router = useRouter();
  const { items, count, clearProject } = useProject();
  const [active, setActive] = useState(0);
  const [contact, setContact] = useState(initialContact);
  const [details, setDetails] = useState(initialDetails);
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const submissionId = useRef<string | null>(null);
  const pricing = calculateProjectPrice(items.map((item) => ({ productId: item.productId, quantity: item.quantity, configuration: { width: item.configuration.dimensions?.width, height: item.configuration.dimensions?.height, subtype: item.configuration.subtype, model: item.configuration.model, variant: item.configuration.variant, openingSystem: item.configuration.openingSystem, design: item.configuration.design, material: item.configuration.material, finish: item.configuration.finish, automation: item.configuration.automation, accessories: item.configuration.accessories, installation: item.configuration.installation } })), details.location, publicCatalog.definitions, `v${publicCatalog.version}`, publicCatalog.proposalSettings);

  const valid = [
    items.length > 0,
    contact.name.trim().length >= 2 && /^\S+@\S+\.\S+$/.test(contact.email) && contact.phone.replace(/\D/g, "").length >= 7 && (contact.documentType === "DNI" ? /^\d{8}$/.test(contact.documentNumber) : /^\d{11}$/.test(contact.documentNumber) && contact.businessName.trim().length >= 2),
    details.projectType !== "" && details.region.trim().length >= 2 && details.province.trim().length >= 2 && details.district.trim().length >= 2 && details.address.trim().length >= 3,
    true,
    true
  ][active];

  const next = () => {
    setTouched(true);
    if (!valid) return;
    setTouched(false);
    setActive((value) => Math.min(steps.length - 1, value + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = async () => {
    if (submitting || !items.length) return;
    setSubmitting(true);
    setSubmitError("");
    submissionId.current ??= crypto.randomUUID();

    const attribution = readSessionAttribution();
    const payload = {
      clientSubmissionId: submissionId.current,
      contact: {
        name: contact.name.trim(),
        email: contact.email.trim(),
        phone: contact.phone.trim()
        ,documentType: contact.documentType,
        documentNumber: contact.documentNumber.trim(),
        ...(contact.documentType === "RUC" ? { businessName: contact.businessName.trim() } : {})
      },
      details: {
        projectType: details.projectType,
        location: details.location.trim(),
        region: details.region.trim(), province: details.province.trim(), district: details.district.trim(), address: details.address.trim(),
        ...(details.stage ? { stage: details.stage } : {}),
        ...(details.estimatedDate ? { estimatedDate: details.estimatedDate } : {}),
        ...(details.notes.trim() ? { notes: details.notes.trim() } : {})
      },
      items: items.map((item) => ({
        clientItemId: item.id,
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        configuration: compactConfiguration(item.configuration)
      })),
      attachmentNames: [],
      ...(attribution ? { attribution } : {}),
      source: items.some((item) => item.configuration.customFields?.source === "ASSISTANT") ? "ASSISTANT" as const : "CONFIGURATOR" as const
    };

    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const body: unknown = await response.json().catch(() => null);
      if (!response.ok || !isCreatedResponse(body)) {
        const message = body && typeof body === "object" && "error" in body && typeof body.error === "string"
          ? body.error
          : "No pudimos registrar la solicitud. Intenta nuevamente.";
        throw new Error(message);
      }

      const request: SubmittedRequest = {
        requestId: body.id,
        code: body.code,
        createdAt: body.createdAt,
        accessToken: body.accessToken,
        contact,
        details,
        files: [],
        items,
        pricing: body.pricing
      };
      sessionStorage.setItem(LAST_REQUEST_KEY, JSON.stringify(request));
      window.dispatchEvent(new CustomEvent("irp:analytics", { detail: { name: "quote_submit" } }));
      clearProject();
      router.push(`/cotizar/confirmacion/${encodeURIComponent(body.code)}${body.accessToken ? `?token=${encodeURIComponent(body.accessToken)}` : ""}`);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "No pudimos registrar la solicitud.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!items.length) {
    return <div className="checkout-empty"><span><PackageCheck size={36} /></span><h1>Tu proyecto no tiene elementos.</h1><p>Agrega al menos una solución para comenzar la solicitud.</p><Link className="button button--primary" href="/soluciones">Explorar soluciones <ArrowRight size={17} /></Link></div>;
  }

  return (
    <div className="checkout-experience">
      <div className="checkout-stepper" aria-label="Progreso de la solicitud">
        {steps.map(({ label, icon: Icon }, index) => <button type="button" key={label} className={index === active ? "is-active" : index < active ? "is-complete" : ""} disabled={index > active} onClick={() => setActive(index)}><span>{index < active ? <Check size={15} /> : <Icon size={16} />}</span><small>{label}</small></button>)}
      </div>

      <div className="checkout-layout-v2">
        <div className="checkout-flow-column">
          <section className="checkout-card">
            {active === 0 && <CheckoutCartReview items={items} pricing={pricing} />}
            {active === 1 && <div className="checkout-panel"><div className="checkout-panel__heading"><span className="eyebrow">Datos de contacto</span><h1>¿Cómo nos comunicamos contigo?</h1><p>Usaremos estos datos únicamente para atender esta solicitud.</p></div><div className="checkout-form-grid"><label>Nombres y apellidos<input value={contact.name} onChange={(event) => setContact({ ...contact, name: event.target.value })} placeholder="Nombre completo" autoComplete="name" />{touched && contact.name.trim().length < 2 && <small>Ingresa tu nombre.</small>}</label><label>Correo electrónico<input value={contact.email} onChange={(event) => setContact({ ...contact, email: event.target.value })} placeholder="nombre@correo.com" type="email" autoComplete="email" />{touched && !/^\S+@\S+\.\S+$/.test(contact.email) && <small>Ingresa un correo válido.</small>}</label><label>WhatsApp / teléfono<input value={contact.phone} onChange={(event) => setContact({ ...contact, phone: event.target.value })} placeholder="Número de contacto" type="tel" autoComplete="tel" />{touched && contact.phone.replace(/\D/g, "").length < 7 && <small>Ingresa un teléfono válido.</small>}</label><label>Tipo de documento<select value={contact.documentType} onChange={(event) => setContact({ ...contact, documentType: event.target.value as "DNI" | "RUC", documentNumber: "", businessName: "" })}><option value="DNI">DNI</option><option value="RUC">RUC</option></select></label><label>{contact.documentType}<input value={contact.documentNumber} onChange={(event) => setContact({ ...contact, documentNumber: event.target.value.replace(/\D/g, "").slice(0, contact.documentType === "DNI" ? 8 : 11) })} inputMode="numeric" autoComplete="off" placeholder={contact.documentType === "DNI" ? "8 dígitos" : "11 dígitos"} />{touched && !new RegExp(`^\\d{${contact.documentType === "DNI" ? 8 : 11}}$`).test(contact.documentNumber) && <small>Revisa el número de documento.</small>}</label>{contact.documentType === "RUC" && <label>Razón social<input value={contact.businessName} onChange={(event) => setContact({ ...contact, businessName: event.target.value })} placeholder="Razón social" autoComplete="organization" />{touched && contact.businessName.trim().length < 2 && <small>Ingresa la razón social.</small>}</label>}</div></div>}
            {active === 2 && <div className="checkout-panel"><div className="checkout-panel__heading"><span className="eyebrow">Detalles del proyecto</span><h1>Cuéntanos dónde y cuándo.</h1><p>Las medidas y especificaciones finales se validarán durante la asesoría.</p></div><div className="checkout-details-grid"><div className="checkout-form-grid"><label>Tipo de proyecto<select value={details.projectType} onChange={(event) => setDetails({ ...details, projectType: event.target.value })}><option value="">Selecciona una opción</option>{products.map((product) => <option value={product.name} key={product.id}>{product.name}</option>)}</select>{touched && !details.projectType && <small>Selecciona el tipo de proyecto.</small>}</label><label>Región<input value={details.region} onChange={(event) => setDetails({ ...details, region: event.target.value })} autoComplete="address-level1" /></label><label>Provincia<input value={details.province} onChange={(event) => setDetails({ ...details, province: event.target.value })} autoComplete="address-level2" /></label><label>Distrito<input value={details.district} onChange={(event) => { const district = event.target.value; setDetails({ ...details, district, location: [district, details.province, details.region].filter(Boolean).join(", ") }); }} autoComplete="address-level3" />{touched && details.district.trim().length < 2 && <small>Indica el distrito.</small>}</label><label className="is-wide">Dirección o referencia<input value={details.address} onChange={(event) => setDetails({ ...details, address: event.target.value })} autoComplete="street-address" placeholder="Dirección, urbanización o referencia" />{touched && details.address.trim().length < 3 && <small>Indica una referencia.</small>}</label><label>Etapa del proyecto<select value={details.stage} onChange={(event) => setDetails({ ...details, stage: event.target.value })}><option>En evaluación</option><option>En construcción</option><option>Remodelación</option><option>Listo para instalar</option></select></label><label>Fecha estimada<input value={details.estimatedDate} onChange={(event) => setDetails({ ...details, estimatedDate: event.target.value })} type="month" /></label><label className="is-wide">Observaciones<textarea value={details.notes} onChange={(event) => setDetails({ ...details, notes: event.target.value })} rows={4} placeholder="Uso del espacio, preferencias o restricciones." /></label></div><div className="checkout-dropzone" role="note"><Info size={25} /><b>Fotos y planos</b><span>El envío de archivos se habilitará con almacenamiento privado. No mostramos una carga ficticia.</span></div></div></div>}
            {active === 3 && <CheckoutSummary contact={contact} details={details} items={items} pricing={pricing} />}
            {active === 4 && <div className="checkout-send"><span><Send size={30} /></span><small className="eyebrow">Todo listo</small><h1>Registra tu propuesta.</h1><p>El servidor volverá a validar catálogo, compatibilidades y precios antes de guardar.</p><div><b>{contact.name}</b><span>{contact.email} · {contact.phone}</span><strong>{pricing.estimatedTotalMinor !== null ? formatPublicPrice(pricing.estimatedTotalMinor) : "Requiere evaluación"}</strong></div><button className="button button--primary" type="button" onClick={submit} disabled={submitting}>{submitting ? "Preparando tu propuesta…" : "Confirmar y enviar"} <ArrowRight size={17} /></button>{submitError && <small role="alert">{submitError}</small>}<small>{PROPOSAL_DISCLAIMER}</small></div>}
          </section>

          <footer className="checkout-footer">
            {active === 0 ? <Link href="/mi-proyecto"><ArrowLeft size={17} /> Volver a Mi proyecto</Link> : <button type="button" onClick={() => setActive((value) => Math.max(0, value - 1))}><ArrowLeft size={17} /> Anterior</button>}
            {active < 4 && <button className="button button--primary" type="button" onClick={next} disabled={!valid}>Continuar <ArrowRight size={17} /></button>}
          </footer>
        </div>

        <aside className="checkout-side-summary">
          <span className="eyebrow">Resumen del proyecto</span><h2>{count} {count === 1 ? "elemento" : "elementos"}</h2>
          <div className="checkout-side-summary__items">{items.slice(0, 4).map((item) => <article key={item.id}><span><Image src={item.image} alt="" fill sizes="58px" className="object-cover" /></span><div><b>{item.name}</b><small>{item.quantity} × {itemSummary(item)}</small></div></article>)}</div>
          <div className="checkout-side-summary__total"><span>Total estimado</span><strong>{pricing.estimatedTotalMinor !== null ? formatPublicPrice(pricing.estimatedTotalMinor) : "Requiere evaluación"}</strong></div>
          <p>{PROPOSAL_DISCLAIMER}</p>
        </aside>
      </div>
    </div>
  );
}

function CheckoutCartReview({ items, pricing }: { items: QuoteItem[]; pricing: ProjectPricing }) {
  return <div className="checkout-review"><div className="checkout-panel__heading"><span className="eyebrow">Mi proyecto</span><h1>Confirma tu selección.</h1><p>Puedes volver a Mi proyecto si necesitas editar, duplicar o cambiar cantidades.</p></div><div className="checkout-review__list">{items.map((item,index) => {const result=pricing.items[index]?.result;return <article key={item.id}><span><Image src={item.image} alt="" fill sizes="90px" className="object-cover" /></span><div><h2>{item.name}</h2><p>{itemSummary(item)}</p></div><b>{result?.status==="ESTIMATED"?formatPublicPrice(result.totalMinor):"Requiere evaluación"}</b></article>})}</div><div className="checkout-review__total"><span>Total estimado</span><strong>{pricing.estimatedTotalMinor!==null?formatPublicPrice(pricing.estimatedTotalMinor):"Requiere evaluación"}</strong></div><p>{PROPOSAL_DISCLAIMER}</p></div>;
}

function CheckoutSummary({ contact, details, items, pricing }: { contact: QuoteContact; details: QuoteDetails; items: QuoteItem[]; pricing: ProjectPricing }) {
  return <div className="checkout-summary"><div className="checkout-panel__heading"><span className="eyebrow">Resumen</span><h1>Verifica los datos de tu propuesta.</h1></div><div className="checkout-summary__grid"><article><small>Contacto</small><h2>{contact.name}</h2><p>{contact.documentType} {contact.documentNumber}<br/>{contact.businessName||""}<br />{contact.email}<br />{contact.phone}</p></article><article><small>Proyecto</small><h2>{details.projectType}</h2><p>{details.location}<br/>{details.address}<br />{details.stage}{details.estimatedDate ? " · " + details.estimatedDate : ""}</p></article><article><small>Observaciones</small><h2>Información adicional</h2><p>{details.notes || "Sin observaciones adicionales."}</p></article></div><div className="checkout-summary__items">{items.map((item,index) => {const result=pricing.items[index]?.result;return <span key={item.id}><b>{item.quantity} × {item.name}</b><strong>{result?.status==="ESTIMATED"?formatPublicPrice(result.totalMinor):"Evaluación"}</strong></span>})}</div><div className="checkout-review__total"><span>Total estimado</span><strong>{pricing.estimatedTotalMinor!==null?formatPublicPrice(pricing.estimatedTotalMinor):"Requiere evaluación"}</strong></div><p>{PROPOSAL_DISCLAIMER}</p></div>;
}
