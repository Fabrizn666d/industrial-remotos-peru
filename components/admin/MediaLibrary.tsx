"use client";

import { Copy, Trash2 } from "lucide-react";
import { useState } from "react";
import type { CmsMedia } from "@/lib/cms/media-repository";
import { DirectMediaField, DirectMultiUpload } from "./DirectMediaField";
import styles from "./MediaLibrary.module.css";

export function MediaLibrary({ initialItems }: { initialItems: CmsMedia[] }) {
  const [items,setItems]=useState(initialItems); const [feedback,setFeedback]=useState(""); const [lastVideo,setLastVideo]=useState("");
  const add=(newItems:CmsMedia[])=>{setItems((current)=>[...newItems,...current]);setFeedback(`${newItems.length} archivo(s) subido(s).`);};
  const remove=async(item:CmsMedia)=>{if(!confirm(`¿Quitar ${item.name} de la biblioteca?`))return;setFeedback("");const response=await fetch(`/api/admin/media/${item.id}`,{method:"DELETE"});const result=await response.json() as {error?:string};if(!response.ok){setFeedback(result.error||"No se pudo quitar");return;}setItems((current)=>current.filter((entry)=>entry.id!==item.id));setFeedback("Archivo eliminado.");};
  return <div className={styles.library}>
    <section className={styles.upload}><div><span><b>Subir imágenes</b><small>Varias a la vez; JPG, PNG, WebP o AVIF, hasta 12 MB cada una.</small></span></div><DirectMultiUpload label="Seleccionar imágenes" onUploaded={add}/></section>
    <DirectMediaField value={lastVideo} alt="Video de Industrial Remotos Perú" kind="video" label="Subir video" recommendation="MP4 o WebM, hasta 120 MB. El archivo queda disponible para cualquier hero." removable={Boolean(lastVideo)} onRemove={()=>setLastVideo("")} onChange={(item)=>{setLastVideo(item.src);add([item as CmsMedia]);}}/>
    {feedback&&<p className={styles.feedback} role="status">{feedback}</p>}
    <div className={styles.grid}>{items.map((item)=><article key={item.id}><div className={styles.image}>{item.mimeType.startsWith("video/")?<video src={item.src} muted controls preload="metadata"/>:<img src={item.src} alt=""/>}</div><div><b title={item.name}>{item.name}</b><small>{Math.max(1,Math.round(item.byteSize/1024))} KB · {item.mimeType.split("/").pop()?.toUpperCase()}</small><p>{item.alt||"Sin descripción"}</p></div><footer><button type="button" onClick={()=>navigator.clipboard.writeText(item.src)}><Copy/>Copiar enlace</button><button type="button" onClick={()=>void remove(item)}><Trash2/>Quitar</button></footer></article>)}</div>
    {!items.length&&<div className={styles.empty}>Todavía no hay archivos cargados en la biblioteca.</div>}
  </div>;
}
