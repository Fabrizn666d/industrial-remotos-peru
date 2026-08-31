"use client";

import { ArrowLeft, ArrowRight, Check, ClipboardList, Contact, FileCheck2, ImagePlus, PackageCheck, Send, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, useMemo, useState } from "react";
import { useProject } from "@/components/ProjectContext";
import { products } from "@/data/products";
import { formatPEN } from "@/lib/currency";
import { LAST_REQUEST_KEY, type QuoteContact, type QuoteDetails, type SubmittedRequest } from "@/types/quote";

const steps = [
  { label: "Mi proyecto", icon: ShoppingBag },
  { label: "Datos", icon: Contact },
  { label: "Detalles", icon: ClipboardList },
  { label: "Resumen", icon: FileCheck2 },
  { label: "Enviar", icon: Send }
];

const initialContact: QuoteContact = { name: "", email: "", phone: "" };
const initialDetails: QuoteDetails = { projectType: "", location: "", stage: "En evaluación", estimatedDate: "", notes: "" };

export function CheckoutExperience() {
  const router = useRouter();
  const { items, count, clearProject } = useProject();
  const [active, setActive] = useState(0);
  const [contact, setContact] = useState(initialContact);
  const [details, setDetails] = useState(initialDetails);
  const [files, setFiles] = useState<string[]>([]);
  const [touched, setTouched] = useState(false);
  const total = useMemo(() => items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0), [items]);

  const valid = [
    items.length > 0,
    contact.name.trim().length >= 2 && /^\S+@\S+\.\S+$/.test(contact.email) && contact.phone.replace(/\D/g, "").length >= 7,
    details.projectType !== "" && details.location.trim().length >= 3,
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

  const submit = () => {
    const now = new Date();
    const code = "COT-IRP-" + String(now.getFullYear()).slice(-2) + String(now.getMonth() + 1).padStart(2, "0") + String(now.getDate()).padStart(2, "0") + "-" + Math.floor(1000 + Math.random() * 9000);
    const request: SubmittedRequest = { code, createdAt: now.toISOString(), contact, details, files, items, total };
    sessionStorage.setItem(LAST_REQUEST_KEY, JSON.stringify(request));
    clearProject();
    router.push("/cotizar/confirmacion/" + encodeURIComponent(code));
  };

  const onFiles = (event: ChangeEvent<HTMLInputElement>) => {
    setFiles(Array.from(event.target.files || []).slice(0, 4).map((file) => file.name));
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
        {active === 0 && <CheckoutCartReview items={items} total={total} />}
        {active === 1 && <div className="checkout-panel"><div className="checkout-panel__heading"><span className="eyebrow">Datos de contacto</span><h1>¿Dónde enviamos tu cotización?</h1><p>Usaremos estos datos únicamente para responder tu solicitud.</p></div><div className="checkout-form-grid"><label>Nombres y apellidos<input value={contact.name} onChange={(event) => setContact({ ...contact, name: event.target.value })} placeholder="Juan Pérez" autoComplete="name" />{touched && contact.name.trim().length < 2 && <small>Ingresa tu nombre.</small>}</label><label>Correo electrónico<input value={contact.email} onChange={(event) => setContact({ ...contact, email: event.target.value })} placeholder="juan@email.com" type="email" autoComplete="email" />{touched && !/^\S+@\S+\.\S+$/.test(contact.email) && <small>Ingresa un correo válido.</small>}</label><label>WhatsApp / teléfono<input value={contact.phone} onChange={(event) => setContact({ ...contact, phone: event.target.value })} placeholder="987 654 321" type="tel" autoComplete="tel" />{touched && contact.phone.replace(/\D/g, "").length < 7 && <small>Ingresa un teléfono válido.</small>}</label></div></div>}
        {active === 2 && <div className="checkout-panel"><div className="checkout-panel__heading"><span className="eyebrow">Detalles del proyecto</span><h1>Cuéntanos dónde y cuándo.</h1><p>Las medidas y especificaciones finales se validarán durante la asesoría.</p></div><div className="checkout-details-grid"><div className="checkout-form-grid"><label>Tipo de proyecto<select value={details.projectType} onChange={(event) => setDetails({ ...details, projectType: event.target.value })}><option value="">Selecciona una opción</option>{products.map((product) => <option key={product.id}>{product.name}</option>)}</select>{touched && !details.projectType && <small>Selecciona el tipo de proyecto.</small>}</label><label>Distrito o ubicación<input value={details.location} onChange={(event) => setDetails({ ...details, location: event.target.value })} placeholder="Santiago de Surco, Lima" />{touched && details.location.trim().length < 3 && <small>Indica la ubicación.</small>}</label><label>Etapa del proyecto<select value={details.stage} onChange={(event) => setDetails({ ...details, stage: event.target.value })}><option>En evaluación</option><option>En construcción</option><option>Remodelación</option><option>Listo para instalar</option></select></label><label>Fecha estimada<input value={details.estimatedDate} onChange={(event) => setDetails({ ...details, estimatedDate: event.target.value })} type="month" /></label><label className="is-wide">Observaciones<textarea value={details.notes} onChange={(event) => setDetails({ ...details, notes: event.target.value })} rows={4} placeholder="Uso del espacio, preferencias o restricciones." /></label></div><label className="checkout-dropzone"><ImagePlus size={26} /><b>Fotos de referencia</b><span>Sube hasta 4 imágenes para entender mejor el espacio.</span><input type="file" accept="image/*" multiple onChange={onFiles} />{files.length > 0 && <small>{files.join(" · ")}</small>}</label></div></div>}
        {active === 3 && <CheckoutSummary contact={contact} details={details} files={files} items={items} total={total} />}
        {active === 4 && <div className="checkout-send"><span><Send size={30} /></span><small className="eyebrow">Todo listo</small><h1>Revisa y envía tu solicitud.</h1><p>Generaremos un código de seguimiento y conservaremos el resumen en este navegador para mostrar la confirmación y la proforma.</p><div><b>{contact.name}</b><span>{contact.email} · {contact.phone}</span><strong>{count} elementos · {formatPEN(total)}</strong></div><button className="button button--primary" type="button" onClick={submit}>Enviar solicitud <ArrowRight size={17} /></button><small>Simulación frontend: todavía no se enviará información a un servidor.</small></div>}
      </section>

      <footer className="checkout-footer">
        {active === 0 ? <Link href="/mi-proyecto"><ArrowLeft size={17} /> Volver al carrito</Link> : <button type="button" onClick={() => setActive((value) => Math.max(0, value - 1))}><ArrowLeft size={17} /> Anterior</button>}
        {active < 4 && <button className="button button--primary" type="button" onClick={next} disabled={!valid}>Continuar <ArrowRight size={17} /></button>}
      </footer>
      </div>
      <aside className="checkout-side-summary">
        <span className="eyebrow">Resumen del proyecto</span><h2>{count} elementos</h2>
        <div className="checkout-side-summary__items">{items.slice(0, 4).map((item) => <article key={item.id}><span><Image src={item.image} alt="" fill sizes="58px" className="object-cover" /></span><div><b>{item.name}</b><small>{item.quantity} × {formatPEN(item.unitPrice)}</small></div></article>)}</div>
        <div className="checkout-side-summary__total"><span>Total referencial</span><strong>{formatPEN(total)}</strong></div>
        <p>El precio final se valida después de revisar medidas, ubicación e instalación.</p>
      </aside>
      </div>
    </div>
  );
}

function CheckoutCartReview({ items, total }: { items: ReturnType<typeof useProject>["items"]; total: number }) {
  return <div className="checkout-review"><div className="checkout-panel__heading"><span className="eyebrow">Mi proyecto</span><h1>Confirma tu selección.</h1><p>Puedes volver al carrito si necesitas cambiar cantidades o acabados.</p></div><div className="checkout-review__list">{items.map((item) => <article key={item.id}><span><Image src={item.image} alt="" fill sizes="90px" className="object-cover" /></span><div><h2>{item.name}</h2><p>{item.measures || "Medidas por definir"}{item.finish ? " · " + item.finish : ""}</p></div><b>{item.quantity} × {formatPEN(item.unitPrice)}</b></article>)}</div><div className="checkout-review__total"><span>Total referencial</span><strong>{formatPEN(total)}</strong></div></div>;
}

function CheckoutSummary({ contact, details, files, items, total }: { contact: QuoteContact; details: QuoteDetails; files: string[]; items: ReturnType<typeof useProject>["items"]; total: number }) {
  return <div className="checkout-summary"><div className="checkout-panel__heading"><span className="eyebrow">Resumen</span><h1>Verifica los datos de tu solicitud.</h1></div><div className="checkout-summary__grid"><article><small>Contacto</small><h2>{contact.name}</h2><p>{contact.email}<br />{contact.phone}</p></article><article><small>Proyecto</small><h2>{details.projectType}</h2><p>{details.location}<br />{details.stage}{details.estimatedDate ? " · " + details.estimatedDate : ""}</p></article><article><small>Referencias</small><h2>{files.length ? files.length + " archivos" : "Sin archivos"}</h2><p>{details.notes || "Sin observaciones adicionales."}</p></article></div><div className="checkout-summary__items">{items.map((item) => <span key={item.id}><b>{item.quantity} × {item.name}</b><strong>{formatPEN(item.unitPrice * item.quantity)}</strong></span>)}</div><div className="checkout-review__total"><span>Total referencial</span><strong>{formatPEN(total)}</strong></div></div>;
}
