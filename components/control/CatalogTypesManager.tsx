"use client";

import { Archive, ArrowDown, ArrowUp, Boxes, CopyPlus, Eye, EyeOff, Layers3, PackagePlus, Plus, RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import { DirectMediaField } from "@/components/admin/DirectMediaField";
import type { PricingCatalogDocument } from "@/lib/pricing/catalog-contracts";
import styles from "./CatalogTypesManager.module.css";

type Definition = PricingCatalogDocument["definitions"][number];
type CatalogType = Definition["catalogTypes"][number];

function newType(order: number): CatalogType {
  const id = crypto.randomUUID();
  return {
    id,
    value: `tipo-${id.slice(0, 8)}`,
    label: "Nuevo tipo",
    description: "Describe brevemente cuándo conviene elegir esta opción.",
    image: "/images/placeholders/puerta-contraplacada-temporal.png",
    published: false,
    archived: false,
    order,
    allowCustomDesign: true,
  };
}

export function CatalogTypesManager({ definition, onChange, onOpenModels }: {
  definition: Definition;
  onChange: (definition: Definition) => void;
  onOpenModels: (typeId: string) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const types = definition.catalogTypes.slice().sort((left, right) => left.order - right.order);
  const editing = types.find((type) => type.id === editingId);
  const models = definition.importedModels ?? [];

  const commit = (next: CatalogType[]) => onChange({ ...definition, catalogTypes: next });
  const update = (id: string, mutate: (type: CatalogType) => CatalogType) => commit(definition.catalogTypes.map((type) => type.id === id ? mutate(type) : type));
  const modelCount = (type: CatalogType, includeArchived = false) => models.filter((model) => (includeArchived || !model.archived) && (model.catalogTypeId === type.id || (!model.catalogTypeId && model.openingSystem === type.value))).length;

  function add() {
    const value = newType(types.length);
    commit([...definition.catalogTypes, value]);
    setEditingId(value.id);
  }

  function duplicate(type: CatalogType) {
    const copy = { ...structuredClone(type), id: crypto.randomUUID(), value: `tipo-${crypto.randomUUID().slice(0, 8)}`, label: `${type.label} copia`, published: false, archived: false, order: types.length };
    commit([...definition.catalogTypes, copy]);
    setEditingId(copy.id);
  }

  function move(type: CatalogType, direction: -1 | 1) {
    const active = types.filter((entry) => !entry.archived);
    const from = active.findIndex((entry) => entry.id === type.id);
    const to = from + direction;
    if (from < 0 || to < 0 || to >= active.length) return;
    const reordered = [...active];
    [reordered[from], reordered[to]] = [reordered[to], reordered[from]];
    const orderById = new Map(reordered.map((entry, index) => [entry.id, index]));
    commit(definition.catalogTypes.map((entry) => orderById.has(entry.id) ? { ...entry, order: orderById.get(entry.id)! } : entry));
  }

  function archive(type: CatalogType) {
    const nextArchived = !type.archived;
    const count = modelCount(type);
    if (nextArchived && count && !window.confirm(`Este tipo tiene ${count} modelo${count === 1 ? "" : "s"}. Se archivarán también para que dejen de mostrarse. ¿Continuar?`)) return;
    onChange({
      ...definition,
      catalogTypes: definition.catalogTypes.map((entry) => entry.id === type.id ? { ...entry, archived: nextArchived, published: nextArchived ? false : entry.published } : entry),
      importedModels: models.map((model) => model.catalogTypeId === type.id ? { ...model, archived: nextArchived, published: nextArchived ? false : model.published } : model),
    });
    if (nextArchived) setEditingId(null);
  }

  function remove(type: CatalogType) {
    if (modelCount(type, true)) {
      window.alert("Este tipo todavía tiene modelos asociados. Archívalo o mueve sus modelos antes de eliminarlo definitivamente.");
      return;
    }
    if (!window.confirm(`¿Eliminar definitivamente el tipo “${type.label}”?`)) return;
    commit(definition.catalogTypes.filter((entry) => entry.id !== type.id));
    setEditingId(null);
  }

  if (editing) return <div className={styles.editor}>
    <button className={styles.back} type="button" onClick={() => setEditingId(null)}>← Volver a tipos</button>
    <section className={styles.formCard}>
      <header className={styles.heading}><span><Layers3 size={20}/></span><div><small>Ficha del tipo</small><h2>{editing.label}</h2><p>Esta tarjeta aparece antes del catálogo y agrupa únicamente los modelos compatibles.</p></div></header>
      <div className={styles.grid}>
        <label className={styles.full}>Nombre visible<input value={editing.label} onChange={(event) => update(editing.id, (value) => ({ ...value, label: event.target.value }))}/></label>
        <label className={styles.full}>Descripción<textarea rows={3} value={editing.description} onChange={(event) => update(editing.id, (value) => ({ ...value, description: event.target.value }))}/></label>
        <label>Estado<select value={editing.archived ? "archived" : editing.published ? "published" : "draft"} onChange={(event) => update(editing.id, (value) => event.target.value === "archived" ? { ...value, archived: true, published: false } : { ...value, archived: false, published: event.target.value === "published" })}><option value="draft">Borrador / oculto</option><option value="published">Publicado</option><option value="archived">Archivado</option></select></label>
        <label>Orden<input type="number" min="0" value={editing.order} onChange={(event) => update(editing.id, (value) => ({ ...value, order: Number(event.target.value) || 0 }))}/></label>
        <label className={styles.checkbox}><input type="checkbox" checked={editing.allowCustomDesign} onChange={(event) => update(editing.id, (value) => ({ ...value, allowCustomDesign: event.target.checked }))}/>Permitir que el cliente suba su propio diseño</label>
      </div>
      <DirectMediaField value={editing.image} alt={editing.label} label="Imagen principal del tipo" recommendation="Se verá en la tarjeta de selección del cotizador." onChange={(item) => update(editing.id, (value) => ({ ...value, image: item.src, ...(!value.thumbnail ? { thumbnail: item.src } : {}) }))}/>
      <DirectMediaField value={editing.thumbnail ?? editing.image} alt={`Miniatura ${editing.label}`} label="Miniatura" recommendation="Versión ligera para celular y tarjetas pequeñas." onChange={(item) => update(editing.id, (value) => ({ ...value, thumbnail: item.src }))}/>
      <details className={styles.technical}><summary>Dato interno</summary><p>Clave estable: <code>{editing.value}</code>. No cambia al renombrar y protege solicitudes existentes.</p></details>
    </section>
    <section className={styles.actions}>
      <button type="button" onClick={() => duplicate(editing)}><CopyPlus size={16}/>Duplicar tipo</button>
      <button type="button" onClick={() => archive(editing)}>{editing.archived ? <RotateCcw size={16}/> : <Archive size={16}/>} {editing.archived ? "Restaurar" : "Archivar"}</button>
      <button className={styles.danger} type="button" onClick={() => remove(editing)}><Trash2 size={16}/>Eliminar definitivamente</button>
    </section>
  </div>;

  return <section className={styles.formCard}>
    <header className={styles.listHeader}><div><small>Organización del catálogo</small><h2>Tipos de producto</h2><p>El cliente elige primero un tipo y después ve sus modelos. Puedes administrar cada grupo por separado.</p></div><button className={styles.primary} type="button" onClick={add}><Plus size={16}/>Agregar tipo</button></header>
    <div className={styles.summary}><Boxes size={18}/><span><b>{types.filter((type) => !type.archived).length}</b> tipos activos</span><span><b>{types.filter((type) => !type.archived && type.published).length}</b> visibles</span><span><b>{models.filter((model) => !model.archived).length}</b> modelos asignados</span></div>
    <div className={styles.typeGrid}>
      {types.map((type, index) => <article className={`${styles.typeCard} ${type.archived ? styles.archived : ""}`} key={type.id}>
        <div className={styles.image}><img src={type.thumbnail ?? type.image} alt=""/><i>{type.archived ? "Archivado" : type.published ? "Publicado" : "Borrador"}</i></div>
        <div className={styles.body}><small>{modelCount(type)} modelos</small><h3>{type.label}</h3><p>{type.description || "Sin descripción."}</p></div>
        <div className={styles.orderActions}><button type="button" aria-label={`Subir ${type.label}`} disabled={index === 0 || type.archived} onClick={() => move(type, -1)}><ArrowUp size={15}/></button><button type="button" aria-label={`Bajar ${type.label}`} disabled={index === types.length - 1 || type.archived} onClick={() => move(type, 1)}><ArrowDown size={15}/></button></div>
        <div className={styles.cardActions}><button type="button" onClick={() => setEditingId(type.id)}>Editar</button><button type="button" disabled={type.archived} onClick={() => onOpenModels(type.id)}><PackagePlus size={15}/>Ver modelos</button><button type="button" aria-label={type.published ? `Ocultar ${type.label}` : `Publicar ${type.label}`} disabled={type.archived} onClick={() => update(type.id, (value) => ({ ...value, published: !value.published }))}>{type.published ? <EyeOff size={15}/> : <Eye size={15}/>}</button></div>
      </article>)}
    </div>
    {!types.length && <div className={styles.empty}><Layers3 size={28}/><h3>Todavía no hay tipos</h3><p>Crea el primer tipo para organizar los modelos de este servicio.</p><button className={styles.primary} type="button" onClick={add}><Plus size={16}/>Crear primer tipo</button></div>}
  </section>;
}
