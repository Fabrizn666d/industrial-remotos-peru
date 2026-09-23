"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, BriefcaseBusiness, Check, MessageCircle, Minus, Plus, RotateCcw, Send, Sparkles, Trash2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useProject } from "@/components/ProjectContext";
import { RobotAvatar } from "@/components/RobotAvatar";
import { products } from "@/data/products";

const quickReplies = [
  { label: "Puerta automática / garaje", product: "seccionales" },
  { label: "Puerta principal", product: "puertas-principales" },
  { label: "Techo o cobertura", product: "techos-coberturas" },
  { label: "Mampara o ventana", product: "ventanas-mamparas" },
  { label: "Baranda o acero", product: "acero-barandas" },
  { label: "Estructura metálica", product: "estructuras-especiales" },
  { label: "Cerco eléctrico", product: "cerco-electrico" },
  { label: "Drywall o cielorraso", product: "drywall-cielorrasos" },
  { label: "No sé qué solución necesito", product: "estructuras-especiales" }
];

function projectItemSummary(item: ReturnType<typeof useProject>["items"][number]) {
  const dimensions = item.configuration.dimensions;
  const measures = dimensions?.width || dimensions?.height
    ? `${dimensions.width ?? "?"} ${dimensions.unit} × ${dimensions.height ?? "?"} ${dimensions.unit}`
    : "Medidas por definir";
  return [measures, item.configuration.finish, item.configuration.design]
    .filter((value): value is string => Boolean(value) && value !== "Por definir")
    .join(" · ");
}

export function ProjectExperience() {
  const { items, count, drawerOpen, setDrawerOpen, removeItem, changeQuantity, clearProject } = useProject();
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [tip, setTip] = useState(false);
  const [selected, setSelected] = useState("");

  useEffect(() => {
    if (sessionStorage.getItem("irp-assistant-tip")) return;
    const show = window.setTimeout(() => setTip(true), 3200);
    const hide = window.setTimeout(() => {
      setTip(false);
      sessionStorage.setItem("irp-assistant-tip", "shown");
    }, 8500);
    return () => { window.clearTimeout(show); window.clearTimeout(hide); };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setAssistantOpen(false);
        setDrawerOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setDrawerOpen]);

  const selectedProduct = quickReplies.find((reply) => reply.label === selected)?.product ?? "estructuras-especiales";
  const recommendation = products.find((product) => product.id === selectedProduct) || products[0];

  return (
    <>
      <div className="quote-assistant">
        <AnimatePresence>
          {tip && !assistantOpen && (
            <motion.span className="quote-assistant__tip" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}>
              ¿Necesitas ayuda?
            </motion.span>
          )}
        </AnimatePresence>
        <button type="button" className="quote-assistant__button" onClick={() => { setAssistantOpen((value) => !value); setTip(false); }} aria-label="Abrir asistente de cotización" title="¿Necesitas ayuda?">
          <RobotAvatar />
          <i />
          <span>Asistente</span>
        </button>
      </div>

      <AnimatePresence>
        {assistantOpen && (
          <motion.aside className="assistant-panel" role="dialog" aria-modal="true" aria-label="Asistente de cotización" initial={{ opacity: 0, y: 24, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 18, scale: .98 }} transition={{ duration: .45, ease: [0.2, .75, 0, 1] }}>
            <button className="panel-close" type="button" onClick={() => setAssistantOpen(false)} aria-label="Cerrar asistente"><X size={18} /></button>
            <div className="assistant-panel__head">
              <span className="assistant-panel__avatar"><RobotAvatar /></span>
              <div><small><i /> En línea · IRP Asistente</small><h2>Hola 👋 ¿En qué te ayudamos?</h2></div>
              <Sparkles size={18} />
            </div>
            <div className="assistant-panel__conversation" aria-live="polite">
              <p className="is-bot">Cuéntame qué necesitas y te mostraré un buen punto de partida.</p>
              {selected && <><p className="is-user">{selected}</p><p className="is-bot"><Check size={14} /> Perfecto. Preparé una recomendación inicial para ti.</p></>}
            </div>
            {!selected ? <div className="assistant-panel__choices">
              {quickReplies.map((reply) => (
                <button type="button" key={reply.label} onClick={() => setSelected(reply.label)}>
                  <MessageCircle size={15} />{reply.label}
                </button>
              ))}
            </div> : <div className="assistant-panel__recommendation">
              <span><Image src={recommendation.image} alt="" fill sizes="92px" className="object-cover" /></span>
              <div><small>Solución sugerida</small><h3>{recommendation.name}</h3><p>{recommendation.description}</p><strong>Precio por confirmar</strong></div>
            </div>}
            <div className="assistant-panel__actions">
              {selected && <button type="button" onClick={() => setSelected("")}><RotateCcw size={15} /> Cambiar respuesta</button>}
              <Link className={"button button--primary assistant-panel__send " + (!selected ? "is-disabled" : "")} href={selected ? "/cotizar?producto=" + selectedProduct : "/asistente"} aria-disabled={!selected}>
                Configurar solución <Send size={17} />
              </Link>
            </div>
            <Link className="assistant-panel__full" href="/asistente">Usar el asistente completo <ArrowRight size={15} /></Link>
            <small className="privacy-note">Tus datos están protegidos. No enviamos nada sin tu acción.</small>
          </motion.aside>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {drawerOpen && (
          <div className="project-overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setDrawerOpen(false)}>
            <motion.aside className="project-drawer" role="dialog" aria-modal="true" aria-label="Mi proyecto" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ duration: .48, ease: [0.2, .75, 0, 1] }}>
              <div className="project-drawer__head">
                <div><small>Selección local</small><h2>Mi proyecto <b>{count}</b></h2></div>
                <button className="panel-close" type="button" onClick={() => setDrawerOpen(false)} aria-label="Cerrar Mi proyecto"><X /></button>
              </div>
              {items.length ? (
                <>
                  <div className="project-drawer__list">
                    {items.map((item) => (
                      <article key={item.id}>
                        <span className="project-drawer__image"><Image src={item.image} alt="" fill sizes="96px" className="object-cover" /></span>
                        <div className="project-drawer__info">
                          <h3>{item.name}</h3>
                          <p>{projectItemSummary(item)}</p>
                          <div className="quantity-control">
                            <button type="button" onClick={() => changeQuantity(item.id, -1)} aria-label="Quitar una unidad"><Minus size={14} /></button>
                            <span>{item.quantity}</span>
                            <button type="button" onClick={() => changeQuantity(item.id, 1)} aria-label="Agregar una unidad"><Plus size={14} /></button>
                          </div>
                        </div>
                        <button className="delete-item" type="button" onClick={() => removeItem(item.id)} aria-label={"Eliminar " + item.name}><Trash2 size={17} /></button>
                      </article>
                    ))}
                  </div>
                  <div className="project-drawer__footer">
                    <p>La selección no incluye precios: un asesor validará medidas, materiales e instalación.</p>
                    <Link className="button button--primary" href="/mi-proyecto" onClick={() => setDrawerOpen(false)}>Revisar mi proyecto <ArrowRight size={17} /></Link>
                    <button className="clear-project" type="button" onClick={clearProject}>Vaciar selección</button>
                  </div>
                </>
              ) : (
                <div className="project-empty">
                  <span><BriefcaseBusiness size={28} /></span>
                  <h3>Aún no agregaste soluciones</h3>
                  <p>Explora nuestras soluciones y reúne aquí todo lo que necesitas cotizar.</p>
                  <Link className="button button--primary" href="/soluciones" onClick={() => setDrawerOpen(false)}>Ver soluciones <ArrowRight size={17} /></Link>
                </div>
              )}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
