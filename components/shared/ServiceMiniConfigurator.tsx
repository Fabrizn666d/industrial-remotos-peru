"use client";

import { ArrowRight, PackagePlus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useProject } from "@/components/ProjectContext";
import { products } from "@/data/products";
import type { SolutionPage } from "@/data/solution-pages";
import styles from "./ServiceMiniConfigurator.module.css";

export function ServiceMiniConfigurator({ solution }: { solution: SolutionPage }) {
  const product = products.find((item) => item.id === solution.quoteProduct);
  const { addProduct } = useProject();
  const [values, setValues] = useState<Record<string, string>>({});
  const [added, setAdded] = useState(false);
  const customFields = Object.fromEntries(solution.miniFields
    .filter((field) => !["width", "height", "subtype", "design", "finish", "automation"].includes(field.key) && values[field.key])
    .map((field) => [field.key, values[field.key]]));
  const additionalNotes = solution.miniFields
    .filter((field) => customFields[field.key])
    .map((field) => `${field.label}: ${customFields[field.key]}`)
    .join(". ");
  const previewSummary = solution.miniFields
    .filter((field) => values[field.key])
    .map((field) => `${field.label}: ${values[field.key]}`)
    .join(" · ");
  const quoteHref = `/cotizar?${new URLSearchParams({
    producto: solution.quoteProduct,
    ...(values.width ? { width: values.width } : {}),
    ...(values.height ? { height: values.height } : {}),
    ...(values.subtype ? { subtype: values.subtype } : {}),
    ...(values.design ? { design: values.design } : {}),
    ...(values.finish ? { finish: values.finish } : {}),
    ...(values.automation ? { automation: values.automation } : {}),
    ...(additionalNotes ? { notes: additionalNotes } : {})
  }).toString()}`;
  const add = () => {
    if (!product) return;
    addProduct(product, {
      subtype: values.subtype,
      dimensions: values.width || values.height ? { width: values.width, height: values.height, unit: "m" } : undefined,
      design: values.design,
      finish: values.finish,
      automation: values.automation,
      accessories: [],
      notes: additionalNotes || undefined,
      customFields
    });
    setAdded(true);
    window.dispatchEvent(new CustomEvent("irp:analytics", { detail: { name: "project_add", parameters: { service: solution.slug } } }));
  };
  return <section className={styles.section} aria-labelledby="mini-configurator-title">
    <div className={styles.shell}>
      <div className={styles.panel}>
        <span className={styles.eyebrow}>Configuración inicial</span><h2 id="mini-configurator-title">Cuéntanos lo esencial.</h2><p>Guarda una primera configuración en Mi Proyecto. El precio queda por confirmar después de la evaluación comercial.</p>
        <div className={styles.form}>{solution.miniFields.map((field) => <label key={field.key}>{field.label}{field.type === "select" ? <select value={values[field.key] ?? ""} onChange={(e) => setValues((current) => ({ ...current, [field.key]: e.target.value }))}><option value="">Selecciona</option>{field.options?.map((option) => <option key={option}>{option}</option>)}</select> : <input type={field.type} min={field.type === "number" ? "0" : undefined} step={field.type === "number" ? "0.01" : undefined} placeholder={field.placeholder} value={values[field.key] ?? ""} onChange={(e) => setValues((current) => ({ ...current, [field.key]: e.target.value }))} />}</label>)}</div>
        <div className={styles.actions}><button type="button" onClick={add} disabled={!product}><PackagePlus size={17} />{added ? "Agregado a Mi Proyecto" : "Agregar a Mi Proyecto"}</button><Link href={quoteHref} data-analytics="configurator_start">Continuar cotización <ArrowRight size={17} /></Link></div>
        {added && <p className={styles.success} role="status">La configuración quedó guardada. Puedes continuar o revisarla en Mi Proyecto.</p>}
      </div>
      <div className={styles.preview}><Image src={solution.heroImage} alt={`Referencia para ${solution.title}`} fill sizes="(max-width:820px) 100vw, 46vw" /><span className={styles.shade} /><div className={styles.summary}><small>{solution.verifiedReal ? "Trabajo registrado" : "Referencia visual"}</small><h3>{solution.shortTitle}</h3><p>{previewSummary || "Completa los datos principales"}</p><strong>Precio por confirmar</strong></div></div>
    </div>
  </section>;
}
