"use client";

import { ArrowLeft, ArrowRight, Check, CircleCheck, Cog, Layers3, Maximize2, PackagePlus, Palette, Ruler, Shield, Sparkles, Wrench } from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useProject } from "@/components/ProjectContext";
import { finishes, products } from "@/data/products";

const steps = [
  { label: "Tipo", icon: Layers3 }, { label: "Medidas", icon: Ruler }, { label: "Diseño", icon: Sparkles }, { label: "Panel", icon: Maximize2 },
  { label: "Color / acabado", icon: Palette }, { label: "Automatización", icon: Cog }, { label: "Accesorios", icon: Shield }, { label: "Instalación", icon: Wrench }
];

export function Configurator() {
  const params = useSearchParams();
  const initial = products.find((product) => product.id === params.get("producto")) ?? products[0];
  const [active, setActive] = useState(0);
  const [productId, setProductId] = useState(initial.id);
  const [width, setWidth] = useState("3.20");
  const [height, setHeight] = useState("2.40");
  const [finish, setFinish] = useState(finishes[2].name);
  const [automation, setAutomation] = useState("Por definir con el asesor");
  const [design, setDesign] = useState("Liso horizontal");
  const [panel, setPanel] = useState("Panel térmico");
  const [accessory, setAccessory] = useState("Control remoto");
  const [installation, setInstallation] = useState("Lima metropolitana");
  const [view, setView] = useState<"exterior" | "interior">("exterior");
  const [added, setAdded] = useState(false);
  const { addProduct } = useProject();
  const product = useMemo(() => products.find((item) => item.id === productId) ?? products[0], [productId]);
  const add = () => {
    addProduct(product, {
      finish,
      dimensions: { width, height, unit: "m" },
      design,
      panel,
      automation,
      accessories: [accessory],
      installation
    });
    setAdded(true);
  };

  return (
    <div className="configurator configurator-v2">
      <aside className="configurator__stepper" aria-label="Pasos del configurador">
        {steps.map(({ label, icon: Icon }, index) => <button key={label} type="button" className={index === active ? "is-active" : index < active ? "is-complete" : ""} onClick={() => setActive(index)}><span>{index < active ? <Check size={14} /> : <Icon size={15} />}</span><i>{String(index + 1).padStart(2, "0")}</i><small>{label}</small></button>)}
      </aside>

      <div className="configurator__workspace">
        <div className="configurator__visual-column">
          <div className={"configurator__preview is-" + view}>
            <Image src={product.image} alt={"Vista de referencia de " + product.name} fill priority sizes="(min-width: 1024px) 62vw, 100vw" className="object-cover" />
            <div className="configurator__shade" />
            <div className="preview-toggle"><button type="button" className={view === "exterior" ? "is-active" : ""} onClick={() => setView("exterior")}>Exterior</button><button type="button" className={view === "interior" ? "is-active" : ""} onClick={() => setView("interior")}>Interior</button></div>
            <div className="configurator__preview-label"><span>Vista {view}</span><b>{product.name}</b><small>{finish}</small></div>
          </div>
          <fieldset className="configurator__swatches"><legend>Color y acabado</legend><div>{finishes.map((item) => <button type="button" className={finish === item.name ? "is-selected" : ""} onClick={() => setFinish(item.name)} key={item.name} aria-label={"Seleccionar " + item.name} title={item.name}><i style={{ backgroundColor: item.color, backgroundImage: item.pattern === "wood" ? "repeating-linear-gradient(0deg, rgba(255,255,255,.08) 0 1px, rgba(0,0,0,.1) 1px 3px, transparent 3px 7px)" : item.pattern === "texture" ? "radial-gradient(circle,rgba(255,255,255,.35) 0 1px,transparent 1.5px)" : undefined }} />{finish === item.name && <Check size={14} />}<small>{item.name}</small></button>)}</div></fieldset>
        </div>

        <section className="configurator__controls glass-panel">
          <small>Paso {active + 1} de {steps.length}</small>
          <h2>{["Selecciona la solución", "Ingresa medidas aproximadas", "Elige el lenguaje del diseño", "Define el tipo de panel", "Selecciona un acabado", "¿Cómo quieres automatizar?", "Añade complementos", "Coordina la instalación"][active]}</h2>
          <p>Esta selección prepara tu solicitud. Un asesor validará técnicamente cada dato antes de cotizar.</p>
          {active === 0 && <div className="control-options control-options--list">{products.map((item) => <button className={productId === item.id ? "is-selected" : ""} type="button" onClick={() => setProductId(item.id)} key={item.id}><span><Image src={item.image} alt="" fill sizes="54px" className="object-cover" /></span><b>{item.name}</b>{productId === item.id && <CircleCheck size={18} />}</button>)}</div>}
          {active === 1 && <div className="measure-grid"><label>Ancho aproximado (m)<input inputMode="decimal" value={width} onChange={(event) => setWidth(event.target.value)} /></label><label>Alto aproximado (m)<input inputMode="decimal" value={height} onChange={(event) => setHeight(event.target.value)} /></label><p>Las medidas finales se confirman en visita técnica.</p></div>}
          {active === 2 && <ChoiceGrid options={["Liso horizontal", "Acanalado", "Con aplicaciones", "Diseño personalizado"]} value={design} setValue={setDesign} />}
          {active === 3 && <ChoiceGrid options={["Panel térmico", "Panel de aluminio", "Estructura metálica", "Por definir"]} value={panel} setValue={setPanel} />}
          {active === 4 && <div className="control-callout"><Palette size={25} /><b>{finish}</b><p>Usa los swatches bajo el visor. El acabado quedará registrado para validación técnica.</p></div>}
          {active === 5 && <ChoiceGrid options={["Motor + 2 controles", "Control desde celular", "Sistema manual", "Por definir con el asesor"]} value={automation} setValue={setAutomation} />}
          {active === 6 && <ChoiceGrid options={["Control remoto", "Sensor de seguridad", "Luz de cortesía", "Batería de respaldo"]} value={accessory} setValue={setAccessory} />}
          {active === 7 && <ChoiceGrid options={["Lima metropolitana", "Callao", "Provincia", "Solo fabricación"]} value={installation} setValue={setInstallation} />}
          <div className="configurator__nav"><button type="button" disabled={active === 0} onClick={() => setActive((value) => Math.max(0, value - 1))}><ArrowLeft size={17} />Anterior</button>{active < steps.length - 1 ? <button type="button" onClick={() => setActive((value) => Math.min(steps.length - 1, value + 1))}>Siguiente<ArrowRight size={17} /></button> : <button type="button" onClick={add}><PackagePlus size={17} />Agregar</button>}</div>
        </section>
      </div>

      <div className="configurator__summary glass-panel"><div><small>Tipo</small><b>{product.name}</b></div><div><small>Medidas</small><b>{width} m × {height} m</b></div><div><small>Panel</small><b>{panel}</b></div><div><small>Acabado</small><b>{finish}</b></div><span><small>Precio</small><b>Por cotizar</b></span><button type="button" onClick={add}>{added ? "Agregado" : "Agregar a mi proyecto"}<ArrowRight size={17} /></button></div>
    </div>
  );
}

function ChoiceGrid({ options, value, setValue }: { options: string[]; value: string; setValue: (value: string) => void }) {
  return <div className="control-options">{options.map((option) => <button className={value === option ? "is-selected" : ""} type="button" onClick={() => setValue(option)} key={option}>{value === option && <Check size={15} />}<span>{option}</span></button>)}</div>;
}
