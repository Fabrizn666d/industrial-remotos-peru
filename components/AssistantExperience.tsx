"use client";

import { ArrowRight, Building2, Check, Factory, Home, MessageCircle, PackagePlus, Send, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { RobotAvatar } from "@/components/RobotAvatar";
import { useProject } from "@/components/ProjectContext";
import { products } from "@/data/products";
import { pricingDefinition } from "@/lib/pricing/catalog";
import { calculateItemPrice, formatPublicPrice } from "@/lib/pricing/engine";
import { usePublicPricingCatalog } from "@/lib/pricing/use-public-catalog";

const STORAGE_KEY = "irp-assistant-v2";
const intents = [
  { label: "Puerta automática / garaje", product: "seccionales" },
  { label: "Puerta principal", product: "puertas-principales" },
  { label: "Techo o cobertura", product: "techos-coberturas" },
  { label: "Mampara o ventana", product: "ventanas-mamparas" },
  { label: "Baranda o acero", product: "acero-barandas" },
  { label: "Estructura metálica", product: "estructuras-especiales" },
  { label: "Puerta a medida", product: "puertas-a-medida" },
  { label: "Drywall o cielorraso", product: "drywall-cielorrasos" },
  { label: "No estoy seguro", product: "estructuras-especiales" }
] as const;
const uses = [{ label: "Residencial", icon: Home }, { label: "Comercial", icon: Building2 }, { label: "Industrial", icon: Factory }];
type Intent = (typeof intents)[number];
type StoredState = { product?: string; use?: string; location?: string; measures?: string; detail?: string; model?: string; variant?: string; finish?: string; automation?: string; doorType?: string; openingSystem?: string; material?: string };

export function AssistantExperience() {
  const publicCatalog = usePublicPricingCatalog();
  const [intent, setIntent] = useState<Intent | null>(null);
  const [use, setUse] = useState("");
  const [location, setLocation] = useState("");
  const [measures, setMeasures] = useState("");
  const [detail, setDetail] = useState("");
  const [model, setModel] = useState("");
  const [variant, setVariant] = useState("");
  const [finish, setFinish] = useState("");
  const [automation, setAutomation] = useState("");
  const [doorType, setDoorType] = useState("");
  const [openingSystem, setOpeningSystem] = useState("");
  const [material, setMaterial] = useState("");
  const [draft, setDraft] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [added, setAdded] = useState(false);
  const { addProduct } = useProject();

  useEffect(() => {
    try {
      const stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "{}") as StoredState;
      const storedIntent = intents.find((item) => item.product === stored.product);
      if (storedIntent) setIntent(storedIntent);
      setUse(stored.use ?? ""); setLocation(stored.location ?? ""); setMeasures(stored.measures ?? ""); setDetail(stored.detail ?? ""); setModel(stored.model ?? ""); setVariant(stored.variant ?? ""); setFinish(stored.finish ?? ""); setAutomation(stored.automation ?? ""); setDoorType(stored.doorType ?? ""); setOpeningSystem(stored.openingSystem ?? ""); setMaterial(stored.material ?? "");
    } catch { /* Session data is optional. */ }
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ product: intent?.product, use, location, measures, detail, model, variant, finish, automation, doorType, openingSystem, material } satisfies StoredState));
  }, [automation, detail, doorType, finish, hydrated, intent, location, material, measures, model, openingSystem, use, variant]);

  const recommendation = useMemo(() => products.find((product) => product.id === (intent?.product || "seccionales")) || products[0], [intent]);
  const definition = useMemo(() => pricingDefinition(recommendation.id, publicCatalog.definitions), [recommendation.id, publicCatalog.definitions]);
  const imported = definition?.classification === "IMPORTED";
  const madeToMeasure = definition?.classification === "MADE_TO_MEASURE";
  const selectedModel = definition?.importedModels?.find((entry) => entry.id === model);
  const selectedVariant = selectedModel?.variants.find((entry) => entry.id === variant);
  const parsedMeasures = measures.match(/([\d.,]+)\s*(?:m)?\s*[xX×]\s*([\d.,]+)/);
  const configuration = useMemo(() => ({ subtype: doorType || undefined, dimensions: parsedMeasures ? { width: parsedMeasures[1].replace(",", "."), height: parsedMeasures[2].replace(",", "."), unit: "m" as const } : undefined, model: model || undefined, variant: variant || undefined, openingSystem: openingSystem || undefined, material: material || undefined, finish: finish || undefined, automation: automation || undefined, notes: [use && `Uso: ${use}`, location && `Ubicación: ${location}`, detail].filter(Boolean).join(". ") || undefined, accessories: [] as string[], customFields: { source: "ASSISTANT" } }), [automation, detail, doorType, finish, location, material, measures, model, openingSystem, parsedMeasures, use, variant]);
  const price = useMemo(() => calculateItemPrice({ productId: recommendation.id, quantity: 1, configuration: { width: configuration.dimensions?.width, height: configuration.dimensions?.height, subtype: configuration.subtype, model: configuration.model, variant: configuration.variant, openingSystem: configuration.openingSystem, material: configuration.material, finish: configuration.finish, automation: configuration.automation, accessories: [], installation: "Por definir" } }, publicCatalog.definitions, `v${publicCatalog.version}`), [configuration, publicCatalog, recommendation.id]);
  const configureUrl = `/cotizar?${new URLSearchParams({ producto: recommendation.id, ...(doorType ? { subtype: doorType } : {}), ...(model ? { model } : {}), ...(variant ? { variant } : {}), ...(openingSystem ? { openingSystem } : {}), ...(material ? { material } : {}), ...(finish ? { finish } : {}), ...(automation ? { automation } : {}), ...([location, measures, detail].filter(Boolean).length ? { notes: [location && `Ubicación: ${location}`, measures && `Medidas: ${measures}`, detail].filter(Boolean).join(". ") } : {}) }).toString()}`;
  const stage = !intent ? "intent" : !use ? "use" : !location ? "location" : imported && !model ? "model" : imported && !variant ? "variant" : madeToMeasure && !measures ? "measures" : madeToMeasure && !doorType ? "doorType" : madeToMeasure && !openingSystem ? "opening" : madeToMeasure && !material ? "material" : (imported || madeToMeasure) && !finish ? "finish" : (imported || madeToMeasure) && !automation ? "automation" : !imported && !madeToMeasure && !measures ? "measures" : !imported && !madeToMeasure && !detail ? "detail" : "result";

  const send = (event: FormEvent) => {
    event.preventDefault();
    const value = draft.trim();
    if (!value) return;
    if (stage === "location") setLocation(value);
    else if (stage === "measures") setMeasures(value);
    else if (stage === "detail") {
      setDetail(value);
      window.dispatchEvent(new CustomEvent("irp:analytics", { detail: { name: "irp_recommendation", parameters: { service: recommendation.group } } }));
    } else if (stage === "intent") setIntent(intents[8]);
    else setDetail((current) => [current, value].filter(Boolean).join(". "));
    setDraft("");
  };
  const add = () => {
    addProduct(recommendation, configuration);
    setAdded(true);
    window.dispatchEvent(new CustomEvent("irp:analytics", { detail: { name: "project_add", parameters: { source: "assistant", service: recommendation.group } } }));
  };

  return (
    <div className="assistant-experience assistant-v2">
      <section className="assistant-chat glass-panel" aria-live="polite">
        <header><span><RobotAvatar /></span><div><small>Orientación guiada</small><h1>IRP Asistente</h1></div><Sparkles size={18} /></header>
        <div className="assistant-chat__intro"><span className="eyebrow eyebrow--light">Sin respuestas inventadas</span><h2>Preparemos la solución correcta para tu proyecto.</h2><p>IRP organiza la información inicial; el equipo valida la recomendación y el precio.</p></div>
        <div className="assistant-chat__messages">
          <p className="is-bot">¡Hola! Elige la solución que más se parece a lo que necesitas.</p>
          {intent && <><p className="is-user">{intent.label}</p><p className="is-bot">¿El proyecto es residencial, comercial o industrial?</p></>}
          {use && <><p className="is-user">{use}</p><p className="is-bot">¿En qué distrito o ciudad se encuentra?</p></>}
          {location && <><p className="is-user">{location}</p><p className="is-bot">{imported ? "Elige uno de los modelos importados disponibles." : "Indica ancho y alto, por ejemplo 3.20 × 2.40 m."}</p></>}
          {model && <><p className="is-user">{selectedModel?.name}</p><p className="is-bot">Elige una medida disponible para este modelo.</p></>}
          {variant && <><p className="is-user">{selectedVariant?.label}</p><p className="is-bot">Elige uno de los acabados compatibles.</p></>}
          {finish && (imported || madeToMeasure) && <><p className="is-user">{finish}</p><p className="is-bot">¿Qué opción de automatización deseas?</p></>}
          {measures && <><p className="is-user">{measures}</p><p className="is-bot">{madeToMeasure ? "Elige el tipo de puerta que fabricaremos." : "Por último, cuéntame el acabado o necesidad principal."}</p></>}
          {doorType && <><p className="is-user">{doorType}</p><p className="is-bot">Elige el sistema de apertura.</p></>}
          {openingSystem && <><p className="is-user">{openingSystem}</p><p className="is-bot">Selecciona el material principal.</p></>}
          {material && <><p className="is-user">{material}</p><p className="is-bot">Elige un acabado compatible.</p></>}
          {detail && <><p className="is-user">{detail}</p><p className="is-bot">Listo. Preparé una ficha inicial sin calcular un precio no validado.</p></>}
        </div>
        {stage === "intent" && <div className="assistant-chat__chips">{intents.map((item) => <button type="button" key={item.label} onClick={() => { setIntent(item); setModel(""); setVariant(""); setFinish(""); setAutomation(""); setMeasures(""); setDetail(""); setDoorType(""); setOpeningSystem(""); setMaterial(""); setAdded(false); }}><MessageCircle size={15} />{item.label}</button>)}</div>}
        {stage === "use" && <div className="assistant-chat__uses">{uses.map(({ label, icon: Icon }) => <button type="button" key={label} onClick={() => setUse(label)}><Icon size={20} />{label}</button>)}</div>}
        {stage === "model" && <div className="assistant-chat__chips">{definition?.importedModels?.map((item) => <button type="button" key={item.id} onClick={() => { setModel(item.id); setVariant(""); setFinish(""); setAutomation(""); }}>{item.name}</button>)}</div>}
        {stage === "variant" && <div className="assistant-chat__chips">{selectedModel?.variants.map((item) => <button type="button" key={item.id} onClick={() => { setVariant(item.id); setFinish(""); }}>{item.label}</button>)}</div>}
        {stage === "doorType" && <div className="assistant-chat__chips">{["Levadiza","Corrediza","Batiente","Seccional"].map((item)=><button type="button" key={item} onClick={()=>setDoorType(item)}>{item}</button>)}</div>}
        {stage === "opening" && <div className="assistant-chat__chips">{["Vertical","Lateral","Batiente"].map((item)=><button type="button" key={item} onClick={()=>setOpeningSystem(item)}>{item}</button>)}</div>}
        {stage === "material" && <div className="assistant-chat__chips">{["Acero","Panel seccional","Aluminio"].map((item)=><button type="button" key={item} onClick={()=>setMaterial(item)}>{item}</button>)}</div>}
        {stage === "finish" && <div className="assistant-chat__chips">{(selectedVariant?.allowedFinishes ?? Object.keys(definition?.custom?.finishPercentBps ?? {})).map((item) => <button type="button" key={item} onClick={() => setFinish(item)}>{item}</button>)}</div>}
        {stage === "automation" && <div className="assistant-chat__chips">{(selectedModel?.automation ?? Object.keys(definition?.custom?.automationPrices ?? {}).map((label)=>({id:label,label}))).map((item) => <button type="button" key={item.id} onClick={() => setAutomation(item.id)}>{item.label}</button>)}</div>}
        {["location", "measures", "detail", "result"].includes(stage) && <form className="assistant-chat__input" onSubmit={send}><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={stage === "location" ? "Distrito o ciudad" : stage === "measures" ? "Ej. 3.20 m × 2.40 m" : stage === "detail" ? "Acabado o necesidad" : "Añade una nota opcional…"} aria-label="Respuesta para IRP Asistente" /><button type="submit" aria-label="Enviar respuesta"><Send size={18} /></button></form>}
        <small className="privacy-note">La conversación se conserva solo durante esta sesión. No compartimos estos datos con Analytics.</small>
      </section>

      <aside className="assistant-recommendation glass-panel" key={recommendation.id}>
        <div className="assistant-recommendation__media"><Image src={recommendation.image} alt={`Referencia de ${recommendation.name}`} fill priority sizes="(min-width: 900px) 46vw, 92vw" className="object-cover" /><span>{recommendation.evidence === "real" ? "Trabajo registrado" : "Referencia visual"}</span></div>
        <div className="assistant-recommendation__body"><span className="eyebrow eyebrow--light">{use || "Solución sugerida"}</span><h2>{recommendation.name}</h2><p>{recommendation.description}</p><ul>{recommendation.benefits.slice(0, 3).map((benefit) => <li key={benefit}><Check size={16} />{benefit}</li>)}</ul>{location && <p><strong>Ubicación:</strong> {location}</p>}<div><small>Propuesta preliminar</small><strong>{price.status === "ESTIMATED" ? formatPublicPrice(price.totalMinor) : "Requiere evaluación"}</strong></div><Link className="button button--primary" href={configureUrl}>Configurar recomendación <ArrowRight size={17} /></Link><button className="button assistant-recommendation__add" type="button" onClick={add} disabled={stage !== "result"}><PackagePlus size={17} />{added ? "Agregado a Mi Proyecto" : "Agregar a Mi Proyecto"}</button></div>
      </aside>
    </div>
  );
}
