"use client";

import { ArrowUpRight, ChevronDown } from "lucide-react";
import Image from "next/image";
import { useId, useState } from "react";
import styles from "./ServiceInteractiveShowcase.module.css";

export type SupportedSlug =
  | "puertas-automatizacion"
  | "techos-coberturas"
  | "ventanas-mamparas"
  | "acero-barandas"
  | "cerco-electrico"
  | "drywall-cielorrasos";

const ASSET = "/images/service-showcases";

function QuoteLink() {
  return <a className={styles.quoteLink} href="#cotizar">Cotiza tu proyecto <ArrowUpRight aria-hidden="true" /></a>;
}

function Switcher({ items, active, onChange, label }: { items: string[]; active: number; onChange: (index: number) => void; label: string }) {
  const id = useId();
  return <div className={styles.switcher} role="tablist" aria-label={label}>{items.map((item, index) => (
    <button key={item} id={`${id}-tab-${index}`} type="button" role="tab" aria-selected={active === index} aria-controls={`${id}-panel`} data-active={active === index} onClick={() => onChange(index)}>{item}</button>
  ))}<span id={`${id}-panel`} className={styles.srOnly} role="tabpanel" aria-live="polite">Mostrando {items[active]}</span></div>;
}

function GarageShowcase() {
  const items = [
    { title: "Seccional" as const, description: "Paneles articulados que ascienden por guías y se recogen bajo el techo.", image: `${ASSET}/garage/garaje-seccional.webp` },
    { title: "Corrediza" as const, description: "La hoja se desplaza lateralmente por un recorrido libre junto al cerramiento.", image: `${ASSET}/garage/garaje-corrediza.webp` },
    { title: "Batiente" as const, description: "Las hojas giran desde sus bisagras y necesitan un área de apertura despejada.", image: "/images/configurator/garaje-batiente.webp" }
  ];
  const [active, setActive] = useState(0);
  return <section id="modelos" className={`${styles.showcase} ${styles.garage}`} aria-label="Tipos de apertura para puertas de garaje" data-showcase-active={items[active].title}>
    <header className={styles.garageHeader}>
      <span>TIPOS DE APERTURA</span>
      <h2>La apertura ideal <strong>para tu espacio.</strong></h2>
      <p>Conoce nuestras opciones seccionales, corredizas y batientes.</p>
    </header>
    <div className={styles.garageMedia}>{items.map((entry, index) => <Image key={entry.image} src={entry.image} alt={`Puerta de garaje ${entry.title.toLowerCase()}`} fill sizes="100vw" data-active={active === index} className={styles.swapImage} />)}</div>
    <div className={styles.garageControls}>
      <Switcher items={items.map((entry) => entry.title)} active={active} onChange={setActive} label="Tipos de apertura" />
    </div>
  </section>;
}

function ShadeShowcase() {
  const items = [
    { title: "Patio", image: `${ASSET}/shade/fondo-principal.webp`, description: "Una zona de sombra que ordena y acompaña el exterior." },
    { title: "Terraza", image: `${ASSET}/shade/terraza.webp`, description: "Protección y luz para disfrutar un ambiente abierto." },
    { title: "Cochera", image: "/images/configurator/catalog/04_Pergolas_y_techos/Propuestas/pergola-lamas.webp", description: "Una cubierta liviana que se integra al acceso vehicular." }
  ];
  const [active, setActive] = useState(0);
  return <section id="modelos" className={`${styles.showcase} ${styles.shade}`} aria-labelledby="shade-title" data-showcase-active={items[active].title}>
    <div className={styles.shadeStage}>
      {items.map((item, index) => <Image key={item.image} src={item.image} alt={`${item.title} con techo sol y sombra`} fill sizes="100vw" data-active={active === index} className={styles.swapImage} />)}
      <div className={styles.shadeCopy}><span className={styles.eyebrow}>SOL Y SOMBRA</span><h2 id="shade-title">Luz que transforma <strong>tu espacio.</strong></h2><p>Sistemas de sombra para patios, terrazas o cocheras, adaptados a cada proyecto.</p><QuoteLink /></div>
    </div>
    <div className={styles.shadeChoices}><div><span>APLICACIONES</span><h3>{items[active].title}</h3><p aria-live="polite">{items[active].description}</p></div><div className={styles.imageTabs}>{items.map((item, index) => <button key={item.title} type="button" data-active={active === index} aria-pressed={active === index} onClick={() => setActive(index)}><span className={styles.choiceImage}><Image src={item.image} alt="" fill sizes="180px" /></span><strong>{item.title}</strong></button>)}</div></div>
  </section>;
}

function GlassShowcase() {
  const items = [
    { title: "Ventanas", image: "/images/configurator/catalog/05_Mamparas_y_ventanas/Propuestas/ventana-proyectante.webp", description: "Aberturas que aportan ventilación y luz natural." },
    { title: "Mamparas", image: `${ASSET}/glass/fondo-principal.webp`, description: "Conexión visual entre interior y exterior." },
    { title: "Divisiones", image: `${ASSET}/glass/division-vidrio.webp`, description: "Separación funcional sin perder amplitud visual." }
  ];
  const [active, setActive] = useState(1);
  const item = items[active];
  return <section id="modelos" className={`${styles.showcase} ${styles.glass}`} aria-labelledby="glass-title" data-showcase-active={item.title}>
    <header className={styles.glassHeader}><div><span className={styles.eyebrow}>VENTANAS, MAMPARAS Y DIVISIONES</span><h2 id="glass-title">Abre tu espacio <strong>a la luz.</strong></h2></div><p>Soluciones en vidrio y aluminio que conectan ambientes y conservan su amplitud visual.</p></header>
    <div className={styles.glassGallery}>
      <div className={styles.glassMain}>{items.map((entry, index) => <Image key={entry.image} src={entry.image} alt={entry.title} fill sizes="(min-width: 900px) 68vw, 100vw" data-active={active === index} className={styles.swapImage} />)}</div>
      <aside className={styles.glassAside}><Switcher items={items.map((entry) => entry.title)} active={active} onChange={setActive} label="Soluciones en vidrio" /><div aria-live="polite"><span>ESPACIOS QUE SE ADAPTAN</span><h3>{item.title}</h3><p>{item.description}</p></div><QuoteLink /></aside>
    </div>
  </section>;
}

function RailingsShowcase() {
  return <section id="modelos" className={`${styles.showcase} ${styles.railings}`} aria-label="Pasamanos, barandas y rejas para ventanas">
    <figure className={`${styles.railGalleryItem} ${styles.railGalleryPrimary}`}>
      <Image src={`${ASSET}/railings/pasamanos-ambiental.webp`} alt="Pasamanos de acero inoxidable instalado junto a una escalera" fill sizes="100vw" priority />
      <figcaption>Pasamanos</figcaption>
    </figure>
    <div className={styles.railGalleryPair}>
      <figure className={styles.railGalleryItem}>
        <Image src={`${ASSET}/railings/fondo-principal.webp`} alt="Baranda de vidrio con pasamanos de acero inoxidable" fill sizes="(min-width: 801px) 50vw, 100vw" />
        <figcaption>Barandas</figcaption>
      </figure>
      <figure className={styles.railGalleryItem}>
        <Image src={`${ASSET}/railings/rejas-ventanas.webp`} alt="Reja metálica negra instalada sobre una ventana residencial" fill sizes="(min-width: 801px) 50vw, 100vw" />
        <figcaption>Rejas para ventanas</figcaption>
      </figure>
    </div>
  </section>;
}

function WireDiagram({ count, large = false }: { count: number; large?: boolean }) {
  const first = 22;
  const last = 112;
  return <svg className={`${styles.wireDiagram} ${large ? styles.wireDiagramLarge : ""}`} data-wire-count={count} viewBox="0 0 180 140" role={large ? "img" : undefined} aria-label={large ? `Esquema preciso de cerco con ${count} hilos horizontales` : undefined} aria-hidden={large ? undefined : "true"}><path className={styles.wirePost} d="M28 10v120M20 130h18M152 10v120M144 130h18" />{Array.from({ length: count }, (_, index) => { const y = count === 1 ? first : first + index * ((last - first) / (count - 1)); return <g key={index} data-wire-line><circle cx="28" cy={y} r="4" /><circle cx="152" cy={y} r="4" /><path d={`M32 ${y}h116`} /></g>; })}</svg>;
}

function FenceShowcase() {
  const items = [4, 5, 6, 8].map((count) => ({ count, title: `${count} hilos`, description: `Representación de ${count} hilos horizontales. La separación, altura y equipo se confirman después de evaluar el perímetro.` }));
  const [active, setActive] = useState(0);
  const item = items[active];
  return <section id="modelos" className={`${styles.showcase} ${styles.fence}`} aria-labelledby="fence-title" data-showcase-active={item.title}>
    <header className={styles.fenceHeader}><span className={styles.eyebrow}>CERCO ELÉCTRICO</span><h2 id="fence-title">Tu perímetro, <strong>en perspectiva.</strong></h2><p>La fotografía muestra el entorno. El esquema permite comparar únicamente la cantidad de hilos.</p><QuoteLink /></header>
    <div className={styles.fenceLayout}>
      <figure className={styles.fencePhoto}><Image src={`${ASSET}/fence/fondo-principal.webp`} alt="Cerco eléctrico instalado en el perímetro de una vivienda" fill sizes="(min-width: 1000px) 64vw, 100vw" /><span><Image src={`${ASSET}/fence/detalle-aisladores.webp`} alt="Detalle ambiental de aisladores" fill sizes="220px" /></span></figure>
      <aside className={styles.wireInspector}><div className={styles.selectedWire} aria-live="polite"><WireDiagram count={item.count} large /><span>ESQUEMA SELECCIONADO</span><h3>{item.title}</h3><p>{item.description}</p></div><div className={styles.wireOptions} role="tablist" aria-label="Cantidad de hilos">{items.map((entry, index) => <button key={entry.count} type="button" role="tab" aria-selected={active === index} data-active={active === index} onClick={() => setActive(index)}><WireDiagram count={entry.count} /><strong>{entry.count}</strong><small>hilos</small></button>)}</div></aside>
    </div>
  </section>;
}

function DrywallShowcase() {
  const items = [
    { title: "División", description: "Crea nuevos ambientes con tabiques que organizan el espacio.", detail: "Muro divisorio" },
    { title: "Cielorraso", description: "Integra un acabado superior limpio y continuo.", detail: "Plano de cielorraso" },
    { title: "Revestimiento", description: "Renueva muros y superficies según las condiciones del proyecto.", detail: "Superficie revestida" }
  ];
  const [active, setActive] = useState(0);
  const item = items[active];
  return <section id="modelos" className={`${styles.showcase} ${styles.drywall}`} aria-labelledby="drywall-title" data-showcase-active={item.title}>
    <div className={styles.drywallTop}>
      <div className={styles.drywallMedia}><Image src={`${ASSET}/drywall/fondo-principal.webp`} alt="Ambiente terminado con soluciones de drywall" fill sizes="(min-width: 1000px) 66vw, 100vw" /><button className={`${styles.hotspot} ${styles.drywallSpot1}`} data-active={active === 0} type="button" aria-label="Mostrar división de drywall" aria-pressed={active === 0} onClick={() => setActive(0)}><span>1</span><small>División</small></button><button className={`${styles.hotspot} ${styles.drywallSpot2}`} data-active={active === 1} type="button" aria-label="Mostrar cielorraso de drywall" aria-pressed={active === 1} onClick={() => setActive(1)}><span>2</span><small>Cielorraso</small></button><button className={`${styles.hotspot} ${styles.drywallSpot3}`} data-active={active === 2} type="button" aria-label="Mostrar revestimiento de drywall" aria-pressed={active === 2} onClick={() => setActive(2)}><span>3</span><small>Revestimiento</small></button></div>
      <header className={styles.drywallHeader}><span className={styles.eyebrow}>DRYWALL Y CIELORRASOS</span><h2 id="drywall-title">Imagina tu espacio. <strong>Transfórmalo.</strong></h2><p>Selecciona un punto de la imagen para conocer cada aplicación.</p><QuoteLink /></header>
    </div>
    <div className={styles.drywallDetails}>
      <figure className={styles.installation}><Image src={`${ASSET}/drywall/detalle-instalacion.webp`} alt="Instalación de placa de drywall sobre estructura" fill sizes="(min-width: 900px) 42vw, 100vw" /></figure>
      <div className={styles.drywallInfo}><div className={styles.drywallActive} aria-live="polite"><span>APLICACIÓN {active + 1}</span><h3>{item.title}</h3><strong>{item.detail}</strong><p>{item.description}</p></div><div className={styles.drywallAccordion}>{items.map((entry, index) => <button key={entry.title} type="button" data-active={active === index} aria-expanded={active === index} onClick={() => setActive(index)}><span><strong>{entry.title}</strong>{active === index && <small>{entry.description}</small>}</span><ChevronDown aria-hidden="true" /></button>)}</div></div>
    </div>
  </section>;
}

export function ServiceInteractiveShowcase({ slug }: { slug: SupportedSlug }) {
  if (slug === "puertas-automatizacion") return <GarageShowcase />;
  if (slug === "techos-coberturas") return <ShadeShowcase />;
  if (slug === "ventanas-mamparas") return <GlassShowcase />;
  if (slug === "acero-barandas") return <RailingsShowcase />;
  if (slug === "cerco-electrico") return <FenceShowcase />;
  return <DrywallShowcase />;
}
