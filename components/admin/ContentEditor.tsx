"use client";

import { ArrowDown, ArrowUp, CopyPlus, Eye, EyeOff, Images, Plus, Save, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CmsDocument, CmsKey } from "@/lib/cms/content-contracts";
import { DirectMediaField, DirectMultiUpload } from "./DirectMediaField";
import { HomeContentEditor } from "./HomeContentEditor";
import styles from "./ContentEditor.module.css";

type JsonObject = Record<string, any>;

export function ContentEditor({ initialDocument, view = "default" }: { initialDocument: CmsDocument; view?: "default" | "visual" }) {
  const [cmsDocument, setCmsDocument] = useState(initialDocument);
  const [feedback, setFeedback] = useState<{ kind: "idle" | "saving" | "success" | "error"; message?: string }>({ kind: "idle" });
  const baseline = useRef(JSON.stringify(initialDocument.content));
  const dirty = useMemo(() => JSON.stringify(cmsDocument.content) !== baseline.current, [cmsDocument.content]);

  useEffect(() => {
    if (!dirty) return;
    const unload = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    const links = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement).closest("a");
      if (!anchor || anchor.target === "_blank" || anchor.href === location.href) return;
      if (!window.confirm("Tienes cambios sin guardar. ¿Quieres salir de esta página?")) { event.preventDefault(); event.stopPropagation(); }
    };
    window.addEventListener("beforeunload", unload);
    document.addEventListener("click", links, true);
    return () => { window.removeEventListener("beforeunload", unload); document.removeEventListener("click", links, true); };
  }, [dirty]);

  const update = (path: Array<string | number>, value: unknown) => setCmsDocument((current) => {
    const content = structuredClone(current.content) as JsonObject;
    let cursor: any = content;
    path.slice(0, -1).forEach((part) => { cursor = cursor[part]; });
    cursor[path[path.length - 1]] = value;
    return { ...current, content } as CmsDocument;
  });
  const arrayAt = (path: Array<string | number>) => path.reduce<any>((value, part) => value[part], cmsDocument.content as any) as any[];
  const replaceArray = (path: Array<string | number>, value: any[]) => update(path, value);
  const move = (path: Array<string | number>, index: number, direction: -1 | 1) => { const values = [...arrayAt(path)]; const target = index + direction; if (target < 0 || target >= values.length) return; [values[index], values[target]] = [values[target], values[index]]; replaceArray(path, values); };
  const remove = (path: Array<string | number>, index: number) => replaceArray(path, arrayAt(path).filter((_, itemIndex) => itemIndex !== index));
  const duplicate = (path: Array<string | number>, index: number) => { const values = [...arrayAt(path)]; const copy = structuredClone(values[index]); copy.id = crypto.randomUUID(); values.splice(index + 1, 0, copy); replaceArray(path, values); };

  const save = async () => {
    if (!dirty || feedback.kind === "saving") return;
    setFeedback({ kind: "saving" });
    try {
      const response = await fetch(`/api/admin/content/${cmsDocument.key}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ expectedVersion: cmsDocument.version, content: cmsDocument.content }) });
      const result = await response.json() as { document?: CmsDocument; error?: string };
      if (!response.ok || !result.document) throw new Error(result.error || "No se pudo guardar.");
      setCmsDocument(result.document);
      baseline.current = JSON.stringify(result.document.content);
      setFeedback({ kind: "success", message: "Cambios guardados y publicados." });
    } catch (error) { setFeedback({ kind: "error", message: error instanceof Error ? error.message : "No se pudo guardar." }); }
  };

  return <div className={styles.editor}>
    <header className={styles.toolbar}><div><span>Versión {cmsDocument.version || "inicial"}</span><small>{dirty ? "Cambios pendientes" : "Todo guardado"}</small></div><a href={publicPath(cmsDocument.key)} target="_blank" rel="noreferrer">Abrir página pública</a><button type="button" onClick={save} disabled={!dirty || feedback.kind === "saving"}><Save size={17} />{feedback.kind === "saving" ? "Guardando…" : "Guardar"}</button></header>
    {feedback.kind !== "idle" && feedback.kind !== "saving" && <p className={feedback.kind === "error" ? styles.error : styles.success} role="status">{feedback.message}</p>}
    {renderEditor(cmsDocument.key, cmsDocument.content as JsonObject, update, { move, remove, duplicate, replaceArray }, view)}
  </div>;
}

function publicPath(key: CmsKey) { return key === "about" ? "/nosotros" : key === "services" ? "/soluciones" : key === "projects" ? "/proyectos" : key === "contact" ? "/contacto" : "/"; }

type Update = (path: Array<string | number>, value: unknown) => void;
type Arrays = { move: (path: Array<string | number>, index: number, direction: -1 | 1) => void; remove: (path: Array<string | number>, index: number) => void; duplicate: (path: Array<string | number>, index: number) => void; replaceArray: (path: Array<string | number>, value: any[]) => void };

function renderEditor(key: CmsKey, content: JsonObject, update: Update, arrays: Arrays, view: "default" | "visual") {
  if (key === "home") return <HomeContentEditor content={content} update={update} arrays={arrays} />;
  if (key === "about") return <AboutEditor content={content} update={update} arrays={arrays} />;
  if (key === "services") return <ServicesEditor content={content} update={update} arrays={arrays} />;
  if (key === "projects") return <ProjectsEditor content={content} update={update} arrays={arrays} />;
  if (key === "contact") return <ContactEditor content={content} update={update} />;
  if (key === "company") return view === "visual" ? <VisualEditor content={content} update={update} /> : <CompanyEditor content={content} update={update} />;
  return <FooterEditor content={content} update={update} arrays={arrays} />;
}

function ServicesEditor({ content, update, arrays }: { content: JsonObject; update: Update; arrays: Arrays }) { return <>{content.items.map((service: JsonObject, serviceIndex: number) => <Section key={service.slug} title={service.title} description={`Página /soluciones/${service.slug}`}><div className={styles.grid}><Field label="Nombre del servicio" value={service.title} onChange={(value) => update(["items",serviceIndex,"title"],value)} /><Field label="Título principal" value={service.heroHeading} onChange={(value) => update(["items",serviceIndex,"heroHeading"],value)} /><Field label="Acento del título" value={service.heroAccent} onChange={(value) => update(["items",serviceIndex,"heroAccent"],value)} /><Field label="Descripción principal" value={service.heroDescription} onChange={(value) => update(["items",serviceIndex,"heroDescription"],value)} multiline /></div><ImageFields value={service.heroImage} path={["items",serviceIndex,"heroImage"]} update={update} /><h3>Preguntas frecuentes</h3>{service.faqs.map((faq: JsonObject, faqIndex: number) => <article className={styles.card} key={faq.id}><div className={styles.grid}><Field label="Pregunta" value={faq.question} onChange={(value) => update(["items",serviceIndex,"faqs",faqIndex,"question"],value)} /><Field label="Respuesta" value={faq.answer} onChange={(value) => update(["items",serviceIndex,"faqs",faqIndex,"answer"],value)} multiline /></div><RowActions index={faqIndex} count={service.faqs.length} path={["items",serviceIndex,"faqs"]} arrays={arrays} /></article>)}<button className={styles.add} type="button" onClick={() => arrays.replaceArray(["items",serviceIndex,"faqs"], [...service.faqs, { id: crypto.randomUUID(), question: "Nueva pregunta", answer: "Nueva respuesta" }])}><Plus size={16} />Agregar pregunta</button></Section>)}</>; }

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) { return <section className={styles.section}><header><h2>{title}</h2>{description && <p>{description}</p>}</header>{children}</section>; }
function Field({ label, value, onChange, multiline = false, type = "text", placeholder }: { label: string; value: string | number; onChange: (value: string) => void; multiline?: boolean; type?: string; placeholder?: string }) { return <label className={styles.field}><span>{label}</span>{multiline ? <textarea rows={4} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} /> : <input type={type} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />}</label>; }
function ImageFields({ value, path, update, removable = true }: { value: JsonObject; path: Array<string | number>; update: Update; removable?: boolean }) { return <div className={styles.mediaInputs}><DirectMediaField value={value.src} alt={value.alt} label="Imagen" removable={removable} onRemove={removable ? () => update([...path,"src"],"") : undefined} onChange={(item) => { update([...path,"src"],item.src); if(item.alt) update([...path,"alt"],item.alt); }} /><div className={styles.grid}><Field label="Texto alternativo" value={value.alt} onChange={(next) => update([...path, "alt"], next)} /><label className={styles.field}><span>Encuadre</span><select value={value.position} onChange={(event) => update([...path, "position"], event.target.value)}><option value="center">Centro</option><option value="top">Arriba</option><option value="bottom">Abajo</option><option value="left">Izquierda</option><option value="right">Derecha</option></select></label></div></div>; }
function RowActions({ index, count, path, arrays }: { index: number; count: number; path: Array<string | number>; arrays: Arrays }) { return <div className={styles.rowActions}><button type="button" onClick={() => arrays.move(path, index, -1)} disabled={index === 0} aria-label="Subir"><ArrowUp size={15} /></button><button type="button" onClick={() => arrays.move(path, index, 1)} disabled={index === count - 1} aria-label="Bajar"><ArrowDown size={15} /></button><button type="button" onClick={() => arrays.duplicate(path, index)} aria-label="Duplicar"><CopyPlus size={15} /></button><button type="button" onClick={() => arrays.remove(path, index)} aria-label="Quitar"><Trash2 size={15} /></button></div>; }

async function createVideoPoster(videoSrc: string, title: string) {
  const video = document.createElement("video");
  video.crossOrigin = "anonymous";
  video.muted = true;
  video.playsInline = true;
  video.preload = "metadata";
  video.src = videoSrc;
  await new Promise<void>((resolve, reject) => {
    video.addEventListener("loadeddata", () => resolve(), { once: true });
    video.addEventListener("error", () => reject(new Error("No se pudo leer el video para generar la portada.")), { once: true });
    video.load();
  });
  const target = Number.isFinite(video.duration) && video.duration > .2 ? Math.min(.6, video.duration * .2) : 0;
  if (target > 0) {
    video.currentTime = target;
    await new Promise<void>((resolve) => video.addEventListener("seeked", () => resolve(), { once: true }));
  }
  const scale = Math.min(1, 900 / Math.max(1, video.videoWidth));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
  canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
  canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", .84));
  if (!blob) throw new Error("El navegador no pudo generar la portada. Sube una imagen manualmente.");
  const form = new FormData();
  form.append("files", new File([blob], `${(title || "video").replace(/[^a-z0-9]+/gi,"-").toLowerCase()}-portada.webp`, { type: "image/webp" }));
  form.append("alt", title ? `Portada de ${title}` : "Portada de video de Industrial Remotos Perú");
  const response = await fetch("/api/admin/media", { method: "POST", body: form });
  const result = await response.json() as { items?: Array<{ src: string; alt: string }>; error?: string };
  if (!response.ok || !result.items?.[0]) throw new Error(result.error || "No se pudo guardar la portada.");
  return result.items[0];
}

function AboutVideoAdminCard({ item, index, count, update, arrays }: { item: JsonObject; index: number; count: number; update: Update; arrays: Arrays }) {
  const [posterState, setPosterState] = useState<{ busy: boolean; message: string; error: boolean }>({ busy: false, message: "", error: false });
  const generatePoster = async (videoSrc = item.videoSrc) => {
    if (!videoSrc || posterState.busy) return;
    setPosterState({ busy: true, message: "Generando y subiendo portada…", error: false });
    try {
      const poster = await createVideoPoster(videoSrc, item.title);
      update(["workVideos","items",index,"poster"], { src: poster.src, alt: poster.alt || `Portada de ${item.title || "video"}`, position: "center" });
      setPosterState({ busy: false, message: "Portada obtenida. Guarda la página para publicarla.", error: false });
    } catch (error) {
      setPosterState({ busy: false, message: error instanceof Error ? error.message : "No se pudo generar la portada.", error: true });
    }
  };
  const complete = Boolean(item.videoSrc && item.poster.src);
  return <article className={styles.videoAdminCard}>
    <header><div><span>Video {index + 1}</span><strong>{item.title || "Espacio sin título"}</strong></div><button className={styles.visibility} type="button" disabled={!complete} onClick={() => update(["workVideos","items",index,"published"],!item.published)}>{item.published ? <><Eye size={16}/>Publicado</> : <><EyeOff size={16}/>Sin publicar</>}</button></header>
    <div className={styles.grid}><Field label="Título breve (opcional)" value={item.title} onChange={(value) => update(["workVideos","items",index,"title"],value)} /><Field label="URL de TikTok (opcional)" value={item.tiktokUrl} onChange={(value) => update(["workVideos","items",index,"tiktokUrl"],value)} placeholder="https://www.tiktok.com/..." /></div>
    <div className={styles.videoMediaGrid}>
      <div><h3>Archivo de video</h3><DirectMediaField value={item.videoSrc} alt={item.title || "Video del trabajo de IRP"} kind="video" label="Video vertical" recommendation="MP4 o WebM, hasta 120 MB. En la web se reproduce sin sonido solo cuando la tarjeta está visible." removable onRemove={() => { update(["workVideos","items",index,"videoSrc"],""); update(["workVideos","items",index,"published"],false); }} onChange={(media) => { update(["workVideos","items",index,"videoSrc"],media.src); if(!item.poster.src) void generatePoster(media.src); }} /></div>
      <div><h3>Portada estática</h3><DirectMediaField value={item.poster.src} alt={item.poster.alt || item.title || "Portada del video"} label="Portada" recommendation="JPG, PNG, WebP o AVIF, hasta 12 MB. Recomendado vertical 9:16." removable onRemove={() => { update(["workVideos","items",index,"poster","src"],""); update(["workVideos","items",index,"published"],false); }} onChange={(media) => update(["workVideos","items",index,"poster"],{ src:media.src,alt:media.alt || `Portada de ${item.title || "video"}`,position:"center" })} />{item.videoSrc && <button className={styles.posterButton} type="button" disabled={posterState.busy} onClick={() => void generatePoster()}><Images size={16}/>{posterState.busy ? "Generando portada…" : "Obtener portada del video"}</button>}{posterState.message && <p className={posterState.error ? styles.videoError : styles.videoStatus}>{posterState.message}</p>}</div>
    </div>
    {!complete && <p className={styles.videoHint}>Sube el video y una portada para habilitar la publicación.</p>}
    <RowActions index={index} count={count} path={["workVideos","items"]} arrays={arrays} />
  </article>;
}

function AboutVideosEditor({ content, update, arrays }: { content: JsonObject; update: Update; arrays: Arrays }) {
  return <Section title="Videos de nuestro trabajo" description="Sube videos verticales desde PC o celular. MP4/WebM hasta 120 MB; portadas JPG/PNG/WebP/AVIF hasta 12 MB.">
    <div className={styles.grid}>
      <label className={styles.check}><input type="checkbox" checked={content.visible} onChange={(event) => update(["workVideos","visible"],event.target.checked)} />Activar sección</label>
      <a className={styles.adminLink} href="/nosotros?preview=videos" target="_blank" rel="noreferrer">Previsualizar contenido sin publicar</a>
      <Field label="Etiqueta" value={content.eyebrow} onChange={(value) => update(["workVideos","eyebrow"],value)} />
      <Field label="Título, línea 1" value={content.title} onChange={(value) => update(["workVideos","title"],value)} />
      <Field label="Título azul" value={content.titleAccent} onChange={(value) => update(["workVideos","titleAccent"],value)} />
      <Field label="Descripción" value={content.description} onChange={(value) => update(["workVideos","description"],value)} multiline />
      <Field label="Texto de Más trabajos en TikTok" value={content.moreLabel} onChange={(value) => update(["workVideos","moreLabel"],value)} />
      <Field label="URL de Más trabajos en TikTok" value={content.moreHref} onChange={(value) => update(["workVideos","moreHref"],value)} placeholder="https://www.tiktok.com/@..." />
    </div>
    <div className={styles.videoAdminList}>{content.items.map((item:JsonObject,index:number)=><AboutVideoAdminCard key={item.id} item={item} index={index} count={content.items.length} update={update} arrays={arrays}/>)}</div>
    <button className={styles.add} type="button" onClick={() => arrays.replaceArray(["workVideos","items"],[...content.items,{id:crypto.randomUUID(),title:"Nuevo video",videoSrc:"",poster:{src:"",alt:"",position:"center"},tiktokUrl:"",published:false}])}><Plus size={16}/>Agregar espacio de video</button>
  </Section>;
}

function AboutPresentationEditor({ content, update }: { content: JsonObject; update: Update }) {
  const presentation = content.presentation;
  return <Section title="Quiénes somos" description="Presentación institucional, video horizontal y fotografía alternativa. Los contadores que aparecen debajo se comparten con Inicio.">
    <label className={styles.check}><input type="checkbox" checked={presentation.visible} onChange={(event) => update(["presentation","visible"],event.target.checked)} />Mostrar sección</label>
    <div className={styles.grid}>
      <Field label="Etiqueta" value={presentation.eyebrow} onChange={(value) => update(["presentation","eyebrow"],value)} />
      <Field label="Título" value={presentation.title} onChange={(value) => update(["presentation","title"],value)} />
      <Field label="Primer párrafo" value={presentation.body} onChange={(value) => update(["presentation","body"],value)} multiline />
      <Field label="Segundo párrafo" value={presentation.bodySecondary} onChange={(value) => update(["presentation","bodySecondary"],value)} multiline />
      <Field label="Frase destacada" value={presentation.statement} onChange={(value) => update(["presentation","statement"],value)} />
    </div>
    <div className={styles.videoMediaGrid}>
      <div><h3>Video horizontal</h3><DirectMediaField value={presentation.videoSrc} alt="Video Quiénes somos" kind="video" label="Video de presentación" recommendation="MP4 o WebM, hasta 120 MB. Recomendado horizontal 16:9. Se carga en la página solo después de pulsar Play." removable onRemove={() => update(["presentation","videoSrc"],"")} onChange={(media) => update(["presentation","videoSrc"],media.src)} /></div>
      <div><h3>Portada del video</h3><ImageFields value={presentation.videoPoster} path={["presentation","videoPoster"]} update={update} /></div>
    </div>
    <div><h3>Fotografía alternativa</h3><p className={styles.videoHint}>Se muestra mientras no exista un video publicado y también sirve como respaldo de la portada.</p><ImageFields value={presentation.image} path={["presentation","image"]} update={update} /></div>
    <div className={styles.card}><h3>Contadores compartidos</h3><p className={styles.videoHint}>Nosotros reutiliza exactamente las métricas, arcos y animaciones de “Experiencia que respalda cada proyecto” del Home. Cualquier cambio realizado allí se refleja automáticamente en ambas páginas.</p><a className={styles.adminLink} href="/admin/contenido/inicio">Editar contadores en Inicio</a></div>
  </Section>;
}

function AboutEditor({ content, update, arrays }: { content: JsonObject; update: Update; arrays: Arrays }) { return <>
  <Section title="Hero" description="Hero panorámico de Nosotros con imágenes y encuadres independientes."><div className={styles.grid}><label className={styles.check}><input type="checkbox" checked={content.hero.visible} onChange={(event) => update(["hero","visible"],event.target.checked)} />Mostrar sección</label><label className={styles.check}><input type="checkbox" checked={content.hero.animationEnabled} onChange={(event) => update(["hero","animationEnabled"],event.target.checked)} />Activar animación de entrada</label><label className={styles.check}><input type="checkbox" checked={content.hero.stickyEnabled} onChange={(event) => update(["hero","stickyEnabled"],event.target.checked)} />Activar efecto sticky</label></div><div className={styles.grid}><Field label="Etiqueta" value={content.hero.eyebrow} onChange={(value) => update(["hero", "eyebrow"], value)} /><Field label="Título, línea 1" value={content.hero.titleLine1} onChange={(value) => update(["hero", "titleLine1"], value)} /><Field label="Título azul claro" value={content.hero.titleLine2} onChange={(value) => update(["hero", "titleLine2"], value)} /><Field label="Subtítulo" value={content.hero.description} onChange={(value) => update(["hero", "description"], value)} multiline /><Field label="Indicador" value={content.hero.indicator} onChange={(value) => update(["hero", "indicator"], value)} /></div><div className={styles.grid}><div><h3>Imagen PC</h3><ImageFields value={content.hero.image} path={["hero", "image"]} update={update} /></div><div><h3>Imagen celular</h3><ImageFields value={content.hero.mobileImage} path={["hero", "mobileImage"]} update={update} /></div></div></Section>
  <AboutPresentationEditor content={content} update={update} />
  <AboutVideosEditor content={content.workVideos} update={update} arrays={arrays} />
  <Section title="Misión y visión"><label className={styles.check}><input type="checkbox" checked={content.purpose.visible} onChange={(event) => update(["purpose","visible"],event.target.checked)} />Mostrar sección</label><div className={styles.grid}><ImageFields value={content.purpose.image} path={["purpose", "image"]} update={update} /><ImageFields value={content.purpose.mobileImage} path={["purpose", "mobileImage"]} update={update} /></div><div className={styles.grid}><Field label="Título de misión" value={content.purpose.missionTitle} onChange={(value) => update(["purpose", "missionTitle"], value)} /><Field label="Misión" value={content.purpose.missionBody} onChange={(value) => update(["purpose", "missionBody"], value)} multiline /><Field label="Título de visión" value={content.purpose.visionTitle} onChange={(value) => update(["purpose", "visionTitle"], value)} /><Field label="Visión" value={content.purpose.visionBody} onChange={(value) => update(["purpose", "visionBody"], value)} multiline /></div></Section>
  <Section title="Valores"><label className={styles.check}><input type="checkbox" checked={content.values.visible} onChange={(event) => update(["values","visible"],event.target.checked)} />Mostrar sección</label><div className={styles.grid}><Field label="Título, línea 1" value={content.values.title} onChange={(value) => update(["values", "title"], value)} /><Field label="Título azul" value={content.values.titleAccent} onChange={(value) => update(["values", "titleAccent"], value)} /></div><ImageFields value={content.values.image} path={["values","image"]} update={update} />{content.values.items.map((item: JsonObject, index: number) => <article className={styles.card} key={item.id}><div className={styles.grid}><Field label="Nombre" value={item.title} onChange={(value) => update(["values", "items", index, "title"], value)} /><Field label="Descripción" value={item.body} onChange={(value) => update(["values", "items", index, "body"], value)} multiline /></div><RowActions index={index} count={content.values.items.length} path={["values", "items"]} arrays={arrays} /></article>)}<button className={styles.add} type="button" onClick={() => arrays.replaceArray(["values", "items"], [...content.values.items, { id: crypto.randomUUID(), title: "Nuevo valor", body: "Descripción" }])}><Plus size={16} />Agregar valor</button></Section>
  <Section title="Ubicación y contacto" description="El mapa, dirección, teléfono y WhatsApp reutilizan la configuración global de Empresa."><label className={styles.check}><input type="checkbox" checked={content.cta.visible} onChange={(event) => update(["cta","visible"],event.target.checked)} />Mostrar sección</label><div className={styles.grid}><Field label="Mensaje del globo" value={content.cta.title} onChange={(value) => update(["cta", "title"], value)} /><Field label="Texto del botón de WhatsApp" value={content.cta.label} onChange={(value) => update(["cta", "label"], value)} /></div><ImageFields value={content.cta.image} path={["cta", "image"]} update={update} /><a className={styles.adminLink} href="/admin/configuracion/empresa">Editar mapa, dirección, teléfono y WhatsApp</a></Section>
  </>; }

function ProjectsEditor({ content, update, arrays }: { content: JsonObject; update: Update; arrays: Arrays }) { return <Section title="Galería" description="Sube varias imágenes, revisa sus miniaturas, ordénalas y publica cuando estén listas."><Field label="Título público" value={content.title} onChange={(value) => update(["title"],value)} /><DirectMultiUpload onUploaded={(media) => arrays.replaceArray(["items"],[...content.items,...media.map((item)=>({id:crypto.randomUUID(),image:{src:item.src,alt:item.alt || item.name,position:"center"},published:false}))])}/><div className={styles.galleryAdmin}>{content.items.map((item: JsonObject, index: number) => <article className={styles.galleryCard} key={item.id}><ImageFields value={item.image} path={["items",index,"image"]} update={update}/><button className={styles.visibility} type="button" onClick={() => update(["items", index, "published"], !item.published)}>{item.published ? <><Eye size={16} />Publicada</> : <><EyeOff size={16} />Oculta</>}</button><RowActions index={index} count={content.items.length} path={["items"]} arrays={arrays} /></article>)}</div><button className={styles.add} type="button" onClick={() => arrays.replaceArray(["items"], [...content.items, { id: crypto.randomUUID(), image: { src: "/images/reales/puerta-22.jpg", alt: "Describe la imagen", position: "center" }, published: false }])}><Plus size={16} />Agregar imagen</button></Section>; }

type MediaItem = { id: string; src: string; name: string; alt: string };
function MediaPickerButton({ onSelect }: { onSelect: (item: MediaItem) => void }) {
  const [open, setOpen] = useState(false); const [items, setItems] = useState<MediaItem[]>([]); const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  const show = async () => { setOpen(true); if (items.length) return; setLoading(true); setError(""); try { const response = await fetch("/api/admin/media"); const result = await response.json() as { items?: MediaItem[]; error?: string }; if (!response.ok || !result.items) throw new Error(result.error || "No se pudo abrir la biblioteca"); setItems(result.items); } catch (reason) { setError(reason instanceof Error ? reason.message : "No se pudo abrir"); } finally { setLoading(false); } };
  return <><button className={styles.pickMedia} type="button" onClick={show}><Images size={16} />Elegir de la biblioteca</button>{open && <div className={styles.pickerBackdrop} onMouseDown={(event) => { if (event.currentTarget === event.target) setOpen(false); }}><section className={styles.picker} role="dialog" aria-modal="true" aria-label="Biblioteca de medios"><header><div><h2>Biblioteca de medios</h2><p>Selecciona una imagen ya cargada.</p></div><button type="button" onClick={() => setOpen(false)} aria-label="Cerrar"><X /></button></header>{loading ? <p>Cargando…</p> : error ? <p role="alert">{error}</p> : <div>{items.map((item) => <button type="button" key={item.id} onClick={() => { onSelect(item); setOpen(false); }}><img src={item.src} alt="" /><span>{item.name}</span></button>)}</div>}{!loading && !error && !items.length && <p>No hay imágenes cargadas. Usa la sección Biblioteca de medios.</p>}</section></div>}</>;
}

function ContactEditor({ content, update }: { content: JsonObject; update: Update }) { return <>
  <Section title="Ventana de contacto" description="Estos textos aparecen en la ventana global que se abre desde todo el sitio."><div className={styles.grid}><Field label="Etiqueta" value={content.eyebrow} onChange={(value) => update(["eyebrow"], value)} /><Field label="Título azul marino" value={content.title} onChange={(value) => update(["title"], value)} /><Field label="Acento azul intenso" value={content.titleAccent} onChange={(value) => update(["titleAccent"], value)} /><Field label="Subtítulo" value={content.description} onChange={(value) => update(["description"], value)} multiline /><Field label="Título del formulario" value={content.formTitle} onChange={(value) => update(["formTitle"], value)} /><Field label="Texto del formulario" value={content.formDescription} onChange={(value) => update(["formDescription"], value)} multiline /><Field label="Texto del botón de envío" value={content.submitLabel} onChange={(value) => update(["submitLabel"], value)} /><Field label="Mensaje de confirmación" value={content.successMessage} onChange={(value) => update(["successMessage"], value)} multiline /></div></Section>
  <Section title="Fondos y encuadre" description="Configura por separado la fotografía horizontal de escritorio y la fotografía vertical de celular. La biblioteca es opcional."><div className={styles.grid}><div><h3>Fondo PC</h3><ImageFields value={content.desktopBackground} path={["desktopBackground"]} update={update} /></div><div><h3>Fondo celular</h3><ImageFields value={content.mobileBackground} path={["mobileBackground"]} update={update} /></div></div></Section>
  <Section title="WhatsApp y ubicación" description="El número, correo, dirección y enlace de Maps se administran en Empresa y contacto."><div className={styles.grid}><Field label="Título del bloque de WhatsApp" value={content.whatsappTitle} onChange={(value) => update(["whatsappTitle"], value)} /><Field label="Texto del bloque de WhatsApp" value={content.whatsappDescription} onChange={(value) => update(["whatsappDescription"], value)} multiline /><Field label="Texto del botón de WhatsApp" value={content.whatsappLabel} onChange={(value) => update(["whatsappLabel"], value)} /><Field label="Mensaje inicial de WhatsApp" value={content.whatsappMessage} onChange={(value) => update(["whatsappMessage"], value)} multiline /><label className={styles.check}><input type="checkbox" checked={content.showWhatsapp} onChange={(event) => update(["showWhatsapp"], event.target.checked)} />Mostrar WhatsApp</label><label className={styles.check}><input type="checkbox" checked={content.showMap} onChange={(event) => update(["showMap"], event.target.checked)} />Mostrar mapa</label></div><a className={styles.adminLink} href="/admin/configuracion/empresa">Editar teléfono, correo, dirección y mapa</a></Section>
</>; }

function VisualEditor({ content, update }: { content: JsonObject; update: Update }) {
  const transition = content.routeTransition;
  return <Section title="Loader de transición" description="Controla la transición metálica entre las páginas públicas. No modifica el video de introducción del Home.">
    <label className={styles.check}><input type="checkbox" checked={transition.enabled} onChange={(event) => update(["routeTransition","enabled"],event.target.checked)} />Activar loader entre páginas</label>
    <div className={styles.videoMediaGrid}>
      <div><h3>Fondo de titanio</h3><p className={styles.videoHint}>Imagen horizontal. Ambas mitades reutilizan exactamente este archivo y encuadre.</p><ImageFields value={transition.background} path={["routeTransition","background"]} update={update} removable={false} /></div>
      <div><h3>Logo central</h3><p className={styles.videoHint}>Usa PNG o WebP transparente para conservar el logo como elemento independiente.</p><ImageFields value={transition.logo} path={["routeTransition","logo"]} update={update} removable={false} /></div>
    </div>
  </Section>;
}

function CompanyEditor({ content, update }: { content: JsonObject; update: Update }) { const fields = [["commercialName","Nombre comercial"],["legalName","Razón social"],["ruc","RUC"],["address","Dirección legal"],["location","Ubicación mostrada"],["phoneDisplay","Teléfono visible"],["whatsappNumber","WhatsApp, solo números"],["email","Correo"],["mapUrl","Enlace de Google Maps"],["hours","Horario"],["coverage","Cobertura"],["facebook","Facebook"],["instagram","Instagram"],["tiktok","TikTok"]] as const; return <><Section title="Empresa y contacto" description="Fuente única para teléfono, correo, WhatsApp, dirección y mapa de la ventana de contacto."><div className={styles.grid}>{fields.map(([key,label]) => <Field key={key} label={label} value={content[key]} onChange={(value) => update([key], value)} placeholder={key === "mapUrl" ? "Pega un enlace de Google Maps" : undefined} />)}</div></Section><VisualEditor content={content} update={update} /></>; }

function FooterEditor({ content, update, arrays }: { content: JsonObject; update: Update; arrays: Arrays }) { return <><Section title="Pie de página"><Field label="Descripción" value={content.description} onChange={(value) => update(["description"], value)} multiline /></Section>{(["navigation","legal"] as const).map((group) => <Section title={group === "navigation" ? "Enlaces de navegación" : "Enlaces legales"} key={group}>{content[group].map((item: JsonObject,index: number) => <article className={styles.card} key={item.id}><div className={styles.grid}><Field label="Etiqueta" value={item.label} onChange={(value) => update([group,index,"label"], value)} /><Field label="Enlace" value={item.href} onChange={(value) => update([group,index,"href"], value)} /><label className={styles.check}><input type="checkbox" checked={item.visible} onChange={(event) => update([group,index,"visible"], event.target.checked)} />Visible</label></div><RowActions index={index} count={content[group].length} path={[group]} arrays={arrays} /></article>)}<button className={styles.add} type="button" onClick={() => arrays.replaceArray([group], [...content[group], { id: crypto.randomUUID(), label: "Nuevo enlace", href: "/", visible: true }])}><Plus size={16} />Agregar enlace</button></Section>)}</>; }
