"use client";

import { ImagePlus, Library, RotateCcw, Trash2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import styles from "./DirectMediaField.module.css";

export type MediaItem = { id: string; name: string; mimeType: string; byteSize: number; alt: string; createdAt: string; src: string };

function uploadFiles(files: File[], alt: string, progress: (value: number) => void): Promise<MediaItem[]> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("POST", "/api/admin/media");
    request.responseType = "json";
    request.upload.addEventListener("progress", (event) => { if (event.lengthComputable) progress(Math.round(event.loaded / event.total * 100)); });
    request.addEventListener("load", () => request.status >= 200 && request.status < 300 ? resolve(request.response.items as MediaItem[]) : reject(new Error(request.response?.error || "No se pudo subir el archivo.")));
    request.addEventListener("error", () => reject(new Error("Se perdió la conexión durante la subida.")));
    const form = new FormData();
    files.forEach((file) => form.append("files", file));
    form.append("alt", alt || "Archivo de Industrial Remotos Perú");
    request.send(form);
  });
}

export function DirectMediaField({ value, alt, kind = "image", label = "Archivo", recommendation, removable = false, onChange, onRemove }: {
  value: string; alt: string; kind?: "image" | "video"; label?: string; recommendation?: string; removable?: boolean;
  onChange: (item: MediaItem) => void; onRemove?: () => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const retry = useRef<File | null>(null);
  const [state, setState] = useState<{ progress: number; error: string; uploaded: boolean }>({ progress: 0, error: "", uploaded: false });
  const [picker, setPicker] = useState<MediaItem[] | null>(null);
  const run = async (file: File) => {
    retry.current = file; setState({ progress: 1, error: "", uploaded: false });
    try { const [item] = await uploadFiles([file], alt, (progress) => setState({ progress, error: "", uploaded: false })); onChange(item); setState({ progress: 100, error: "", uploaded: true }); }
    catch (error) { setState({ progress: 0, error: error instanceof Error ? error.message : "No se pudo subir.", uploaded: false }); }
  };
  const openLibrary = async () => {
    const response = await fetch("/api/admin/media", { cache: "no-store" });
    const result = await response.json() as { items?: MediaItem[]; error?: string };
    if (!response.ok) return setState((current) => ({ ...current, error: result.error || "No se pudo abrir la biblioteca." }));
    setPicker((result.items || []).filter((item) => kind === "video" ? item.mimeType.startsWith("video/") : item.mimeType.startsWith("image/")));
  };
  return <div className={styles.card}>
    <div className={styles.preview}>{value ? kind === "video" ? <video src={value} muted playsInline controls preload="metadata" /> : <img src={value} alt={alt} /> : <span><ImagePlus /> Sin archivo</span>}</div>
    <div className={styles.body}><strong>{label}</strong><p>{recommendation || (kind === "video" ? "MP4 o WebM, hasta 120 MB." : "JPG, PNG, WebP o AVIF, hasta 12 MB.")}</p>
      <input ref={input} hidden type="file" accept={kind === "video" ? "video/mp4,video/webm" : "image/jpeg,image/png,image/webp,image/avif"} onChange={(event) => { const file = event.target.files?.[0]; if (file) void run(file); event.target.value = ""; }} />
      <div className={styles.actions}><button type="button" onClick={() => input.current?.click()}><Upload />{value ? "Reemplazar" : "Subir desde mi dispositivo"}</button><button type="button" className={styles.secondary} onClick={() => void openLibrary()}><Library />Elegir archivo existente</button>{removable && value && <button type="button" className={styles.remove} onClick={onRemove}><Trash2 />Quitar</button>}</div>
      {state.progress > 0 && state.progress < 100 && <div className={styles.progress} aria-label={`Subida ${state.progress}%`}><i style={{ width: `${state.progress}%` }} /><span>{state.progress}%</span></div>}
      {state.uploaded && <small className={styles.success}>Archivo subido. Guarda la página para publicar.</small>}
      {state.error && <div className={styles.error}><span>{state.error}</span>{retry.current && <button type="button" onClick={() => void run(retry.current!)}><RotateCcw />Reintentar</button>}</div>}
    </div>
    {picker && <div className={styles.backdrop} role="dialog" aria-modal="true" aria-label="Biblioteca de medios"><div className={styles.picker}><header><div><h2>Biblioteca</h2><p>Selecciona un archivo ya subido.</p></div><button type="button" onClick={() => setPicker(null)} aria-label="Cerrar"><X /></button></header><div>{picker.length ? picker.map((item) => <button type="button" key={item.id} onClick={() => { onChange(item); setPicker(null); }} aria-label={`Elegir ${item.name}`}>{item.mimeType.startsWith("video/") ? <video src={item.src} muted /> : <img src={item.src} alt="" />}<span>{item.name}</span></button>) : <p>No hay archivos compatibles.</p>}</div></div></div>}
  </div>;
}

export function DirectMultiUpload({ label = "Subir varios archivos", onUploaded }: { label?: string; onUploaded: (items: MediaItem[]) => void }) {
  const input = useRef<HTMLInputElement>(null); const retry = useRef<File[]>([]); const [state, setState] = useState({ progress: 0, error: "" });
  const run = async (files: File[]) => { retry.current = files; setState({ progress: 1, error: "" }); try { const items = await uploadFiles(files, "Galería de Industrial Remotos Perú", (progress) => setState({ progress, error: "" })); onUploaded(items); setState({ progress: 100, error: "" }); } catch (error) { setState({ progress: 0, error: error instanceof Error ? error.message : "No se pudo subir." }); } };
  return <div className={styles.multi}><input ref={input} hidden multiple type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={(event) => { const files = Array.from(event.target.files || []); if (files.length) void run(files); event.target.value = ""; }} /><button type="button" onClick={() => input.current?.click()}><Upload />{label}</button>{state.progress > 0 && state.progress < 100 && <span>{state.progress}%</span>}{state.progress === 100 && <small>Archivos subidos. Ordénalos y guarda para publicar.</small>}{state.error && <span className={styles.error}>{state.error} <button type="button" onClick={() => void run(retry.current)}>Reintentar</button></span>}</div>;
}
