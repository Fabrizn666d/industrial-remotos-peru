"use client";

import { ArrowRight, Building2, Check, Factory, Home, MessageCircle, PackagePlus, Send, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { RobotAvatar } from "@/components/RobotAvatar";
import { useProject } from "@/components/ProjectContext";
import { products } from "@/data/products";

const STORAGE_KEY = "irp-assistant-v2";
const intents = [
  { label: "Puerta automática / garaje", product: "seccionales" },
  { label: "Puerta principal", product: "puertas-principales" },
  { label: "Techo o cobertura", product: "techos-coberturas" },
  { label: "Mampara o ventana", product: "ventanas-mamparas" },
  { label: "Baranda o acero", product: "acero-barandas" },
  { label: "Estructura metálica", product: "estructuras-especiales" },
  { label: "Cerco eléctrico", product: "cerco-electrico" },
  { label: "Drywall o cielorraso", product: "drywall-cielorrasos" },
  { label: "No estoy seguro", product: "estructuras-especiales" }
] as const;
const uses = [{ label: "Residencial", icon: Home }, { label: "Comercial", icon: Building2 }, { label: "Industrial", icon: Factory }];
type Intent = (typeof intents)[number];
type StoredState = { product?: string; use?: string; location?: string; measures?: string; detail?: string };

export function AssistantExperience() {
  const [intent, setIntent] = useState<Intent | null>(null);
  const [use, setUse] = useState("");
  const [location, setLocation] = useState("");
  const [measures, setMeasures] = useState("");
  const [detail, setDetail] = useState("");
  const [draft, setDraft] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [added, setAdded] = useState(false);
  const { addProduct } = useProject();

  useEffect(() => {
    try {
      const stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "{}") as StoredState;
      const storedIntent = intents.find((item) => item.product === stored.product);
      if (storedIntent) setIntent(storedIntent);
      setUse(stored.use ?? ""); setLocation(stored.location ?? ""); setMeasures(stored.measures ?? ""); setDetail(stored.detail ?? "");
    } catch { /* Session data is optional. */ }
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ product: intent?.product, use, location, measures, detail } satisfies StoredState));
  }, [detail, hydrated, intent, location, measures, use]);

  const recommendation = useMemo(() => products.find((product) => product.id === (intent?.product || "seccionales")) || products[0], [intent]);
  const configuration = useMemo(() => ({ subtype: use || undefined, notes: [location && `Ubicación: ${location}`, measures && `Medidas aproximadas: ${measures}`, detail].filter(Boolean).join(". ") || undefined, accessories: [] as string[] }), [detail, location, measures, use]);
  const configureUrl = `/cotizar?${new URLSearchParams({ producto: recommendation.id, ...(use ? { subtype: use } : {}), ...([location, measures, detail].filter(Boolean).length ? { notes: [location && `Ubicación: ${location}`, measures && `Medidas: ${measures}`, detail].filter(Boolean).join(". ") } : {}) }).toString()}`;
  const stage = !intent ? "intent" : !use ? "use" : !location ? "location" : !measures ? "measures" : !detail ? "detail" : "result";

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
          {location && <><p className="is-user">{location}</p><p className="is-bot">Indica medidas aproximadas. También puedes escribir “por definir”.</p></>}
          {measures && <><p className="is-user">{measures}</p><p className="is-bot">Por último, cuéntame el acabado o necesidad principal.</p></>}
          {detail && <><p className="is-user">{detail}</p><p className="is-bot">Listo. Preparé una ficha inicial sin calcular un precio no validado.</p></>}
        </div>
        {stage === "intent" && <div className="assistant-chat__chips">{intents.map((item) => <button type="button" key={item.label} onClick={() => { setIntent(item); setAdded(false); }}><MessageCircle size={15} />{item.label}</button>)}</div>}
        {stage === "use" && <div className="assistant-chat__uses">{uses.map(({ label, icon: Icon }) => <button type="button" key={label} onClick={() => setUse(label)}><Icon size={20} />{label}</button>)}</div>}
        <form className="assistant-chat__input" onSubmit={send}><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={stage === "location" ? "Distrito o ciudad" : stage === "measures" ? "Ej. 3.20 m × 2.40 m" : stage === "detail" ? "Acabado o necesidad" : "Añade información…"} aria-label="Respuesta para IRP Asistente" /><button type="submit" aria-label="Enviar respuesta"><Send size={18} /></button></form>
        <small className="privacy-note">La conversación se conserva solo durante esta sesión. No compartimos estos datos con Analytics.</small>
      </section>

      <aside className="assistant-recommendation glass-panel" key={recommendation.id}>
        <div className="assistant-recommendation__media"><Image src={recommendation.image} alt={`Referencia de ${recommendation.name}`} fill priority sizes="(min-width: 900px) 46vw, 92vw" className="object-cover" /><span>{recommendation.evidence === "real" ? "Trabajo registrado" : "Referencia visual"}</span></div>
        <div className="assistant-recommendation__body"><span className="eyebrow eyebrow--light">{use || "Solución sugerida"}</span><h2>{recommendation.name}</h2><p>{recommendation.description}</p><ul>{recommendation.benefits.slice(0, 3).map((benefit) => <li key={benefit}><Check size={16} />{benefit}</li>)}</ul>{location && <p><strong>Ubicación:</strong> {location}</p>}<div><small>Evaluación comercial</small><strong>Precio por confirmar</strong></div><Link className="button button--primary" href={configureUrl}>Configurar recomendación <ArrowRight size={17} /></Link><button className="button assistant-recommendation__add" type="button" onClick={add}><PackagePlus size={17} />{added ? "Agregado a Mi Proyecto" : "Agregar a Mi Proyecto"}</button></div>
      </aside>
    </div>
  );
}
