"use client";

import { ArrowRight, Building2, Check, Factory, Home, MessageCircle, Send, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { RobotAvatar } from "@/components/RobotAvatar";
import { products } from "@/data/products";

const intents = [
  { label: "Quiero automatizar mi puerta", product: "automatizacion" },
  { label: "Necesito un techo para mi terraza", product: "techos-coberturas" },
  { label: "Busco ventanas o mamparas", product: "ventanas-mamparas" },
  { label: "Quiero cotizar una puerta seccional", product: "seccionales" },
  { label: "Tengo un proyecto especial", product: "estructuras-especiales" }
];

const uses = [{ label: "Residencial", icon: Home }, { label: "Comercial", icon: Building2 }, { label: "Industrial", icon: Factory }];

export function AssistantExperience() {
  const [intent, setIntent] = useState<(typeof intents)[number] | null>(null);
  const [use, setUse] = useState("");
  const [draft, setDraft] = useState("");
  const [custom, setCustom] = useState("");
  const recommendation = useMemo(() => products.find((product) => product.id === (intent?.product || "seccionales")) || products[0], [intent]);
  const configureUrl = intent ? "/cotizar?producto=" + intent.product + (use ? "&uso=" + use.toLowerCase() : "") : "/cotizar";

  const sendCustom = (event: FormEvent) => {
    event.preventDefault();
    if (!draft.trim()) return;
    setCustom(draft.trim());
    setIntent({ label: draft.trim(), product: "estructuras-especiales" });
    setDraft("");
  };

  return (
    <div className="assistant-experience assistant-v2">
      <section className="assistant-chat glass-panel" aria-live="polite">
        <header><span><RobotAvatar /></span><div><small>En línea · respuesta inmediata</small><h1>IRP Asistente</h1></div><Sparkles size={18} /></header>
        <div className="assistant-chat__intro"><span className="eyebrow eyebrow--light">Orientación guiada</span><h2>Diseñemos la solución correcta para tu proyecto.</h2><p>Cuéntanos qué necesitas y prepararemos una recomendación inicial.</p></div>
        <div className="assistant-chat__messages"><p className="is-bot">¡Hola! Elige la opción que más se parece a lo que tienes en mente.</p>{intent && <p className="is-user">{custom || intent.label}</p>}{intent && <p className="is-bot">Perfecto. ¿El proyecto es residencial, comercial o industrial?</p>}{use && <p className="is-user">{use}</p>}{use && <p className="is-bot">Listo. Actualicé la ficha técnica de la derecha con una primera propuesta.</p>}</div>
        {!intent && <div className="assistant-chat__chips">{intents.map((item) => <button type="button" key={item.label} onClick={() => setIntent(item)}><MessageCircle size={15} />{item.label}</button>)}</div>}
        {intent && !use && <div className="assistant-chat__uses">{uses.map(({ label, icon: Icon }) => <button type="button" key={label} onClick={() => setUse(label)}><Icon size={20} />{label}</button>)}</div>}
        <form className="assistant-chat__input" onSubmit={sendCustom}><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Escribe tu necesidad…" aria-label="Escribe tu necesidad" /><button type="submit" aria-label="Enviar mensaje"><Send size={18} /></button></form>
        <small className="privacy-note">Tu información está protegida. Un asesor validará la recomendación final.</small>
      </section>

      <aside className="assistant-recommendation glass-panel" key={recommendation.id}>
        <div className="assistant-recommendation__media"><Image src={recommendation.image} alt={recommendation.name} fill priority sizes="(min-width: 900px) 46vw, 92vw" className="object-cover" /><span>Orientación inicial</span></div>
        <div className="assistant-recommendation__body"><span className="eyebrow eyebrow--light">{use || "Solución sugerida"}</span><h2>{recommendation.name}</h2><p>{recommendation.description}</p><ul>{recommendation.benefits.slice(0, 3).map((benefit) => <li key={benefit}><Check size={16} />{benefit}</li>)}</ul><div><small>Evaluación comercial</small><strong>Precio por confirmar</strong></div><Link className="button button--primary" href={configureUrl}>Abrir configuración recomendada <ArrowRight size={17} /></Link></div>
      </aside>
    </div>
  );
}
