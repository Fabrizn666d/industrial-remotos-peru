"use client";

import { Building2, Factory, Home, MessageCircle, Send, Sparkles } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Configurator } from "@/components/Configurator";
import { RobotAvatar } from "@/components/RobotAvatar";

const STORAGE_KEY = "irp-assistant-v3";
const intents = [
  { label: "Puerta de garaje", product: "seccionales" },
  { label: "Puerta principal a medida", product: "puertas-a-medida" },
  { label: "Puerta principal importada", product: "puertas-principales" },
  { label: "Puerta contraplacada", product: "puertas-contraplacadas" },
  { label: "Techo o sol y sombra", product: "techos-coberturas" },
  { label: "Ventana, mampara o división", product: "ventanas-mamparas" },
  { label: "Baranda o pasamanos", product: "acero-barandas" },
  { label: "Drywall o cielorraso", product: "drywall-cielorrasos" },
  { label: "Automatización", product: "automatizacion" },
  { label: "Cerco eléctrico", product: "cerco-electrico" },
  { label: "Estructura especial", product: "estructuras-especiales" },
] as const;
const uses = [{ label: "Residencial", icon: Home }, { label: "Comercial", icon: Building2 }, { label: "Industrial", icon: Factory }];
type Intent = (typeof intents)[number];
type StoredState = { product?: string; use?: string; location?: string };

export function AssistantExperience() {
  const [intent, setIntent] = useState<Intent | null>(null);
  const [use, setUse] = useState("");
  const [location, setLocation] = useState("");
  const [draft, setDraft] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "{}") as StoredState;
      const storedIntent = intents.find((item) => item.product === stored.product);
      if (storedIntent) setIntent(storedIntent);
      setUse(stored.use ?? "");
      setLocation(stored.location ?? "");
    } catch { /* La sesión es opcional. */ }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ product: intent?.product, use, location } satisfies StoredState));
  }, [hydrated, intent, location, use]);

  const stage = !intent ? "intent" : !use ? "use" : !location ? "location" : "configurator";
  const send = (event: FormEvent) => {
    event.preventDefault();
    const value = draft.trim();
    if (!value) return;
    if (stage === "location") setLocation(value);
    setDraft("");
  };
  const resetIntent = (next: Intent) => {
    setIntent(next);
    setUse("");
    setLocation("");
  };

  return (
    <div className="assistant-experience assistant-v2">
      <section className="assistant-chat glass-panel" aria-live="polite">
        <header><span><RobotAvatar /></span><div><small>Orientación guiada</small><h1>IRP Asistente</h1></div><Sparkles size={18} /></header>
        <div className="assistant-chat__intro"><span className="eyebrow eyebrow--light">Flujo compartido</span><h2>Preparemos la solución correcta.</h2><p>El asistente usa exactamente las mismas preguntas, compatibilidades y precios del cotizador.</p></div>
        <div className="assistant-chat__messages">
          <p className="is-bot">Elige la solución que necesitas.</p>
          {intent && <><p className="is-user">{intent.label}</p><p className="is-bot">¿El proyecto es residencial, comercial o industrial?</p></>}
          {use && <><p className="is-user">{use}</p><p className="is-bot">¿En qué distrito o ciudad se encuentra?</p></>}
          {location && <><p className="is-user">{location}</p><p className="is-bot">Continúa con la configuración técnica. La instalación ya está incluida.</p></>}
        </div>
        {stage === "intent" && <div className="assistant-chat__chips">{intents.map((item) => <button type="button" key={item.product} onClick={() => resetIntent(item)}><MessageCircle size={15} />{item.label}</button>)}</div>}
        {stage === "use" && <div className="assistant-chat__uses">{uses.map(({ label, icon: Icon }) => <button type="button" key={label} onClick={() => setUse(label)}><Icon size={20} />{label}</button>)}</div>}
        {stage === "location" && <form className="assistant-chat__input" onSubmit={send}><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Distrito o ciudad" aria-label="Distrito o ciudad" /><button type="submit" aria-label="Enviar respuesta"><Send size={18} /></button></form>}
        {stage === "configurator" && <button type="button" className="button assistant-recommendation__add" onClick={() => { setIntent(null); setUse(""); setLocation(""); }}>Cambiar solución</button>}
        <small className="privacy-note">La conversación se conserva únicamente durante esta sesión.</small>
      </section>

      <aside className="assistant-recommendation glass-panel">
        {intent && location ? (
          <Configurator key={`${intent.product}-${use}-${location}`} embedded initialProductId={intent.product} initialNotes={`Uso: ${use}. Ubicación: ${location}.`} source="ASSISTANT" />
        ) : (
          <div className="assistant-recommendation__body"><span className="eyebrow eyebrow--light">Configuración estructurada</span><h2>Completa los datos iniciales</h2><p>Luego aparecerá aquí el flujo específico para la solución elegida, sin preguntas de otros servicios.</p></div>
        )}
      </aside>
    </div>
  );
}
