"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ProductCard } from "@/components/PublicComponents";
import { products } from "@/data/products";
import type { ProductAudience, ProductGroup } from "@/types/catalog";

const groups: Array<{ value: "todos" | ProductGroup; label: string }> = [
  { value: "todos", label: "Todos" },
  { value: "puertas", label: "Puertas automáticas" },
  { value: "puertas-principales", label: "Puertas principales" },
  { value: "techos", label: "Techos" },
  { value: "ventanas", label: "Ventanas y mamparas" },
  { value: "acero", label: "Acero y barandas" },
  { value: "estructuras", label: "Estructuras" },
  { value: "cerco", label: "Cerco eléctrico" },
  { value: "drywall", label: "Drywall" },
  { value: "automatizacion", label: "Automatización" }
];

export function CatalogExperience() {
  const params = useSearchParams();
  const requested = params.get("categoria") as ProductGroup | null;
  const [group, setGroup] = useState<"todos" | ProductGroup>(requested && groups.some((item) => item.value === requested) ? requested : "todos");
  const [audience, setAudience] = useState<"todos" | ProductAudience>("todos");
  const [system, setSystem] = useState<"todos" | "automatizado" | "manual">("todos");
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const visible = useMemo(() => products.filter((product) => {
    const groupMatch = group === "todos" || product.group === group;
    const audienceMatch = audience === "todos" || product.audiences.includes(audience);
    const systemMatch = system === "todos" || (system === "automatizado" ? product.group === "puertas" || product.group === "automatizacion" : product.group !== "automatizacion");
    const queryMatch = !search || (product.name + " " + product.description).toLowerCase().includes(search.toLowerCase());
    return groupMatch && audienceMatch && systemMatch && queryMatch;
  }), [group, audience, system, search]);

  return (
    <div className="catalog-layout">
      <aside className={"catalog-filters" + (filtersOpen ? " is-open" : "")}>
        <div className="catalog-filters__head"><SlidersHorizontal size={17} /><h2>Filtros</h2><button type="button" onClick={() => setFiltersOpen(false)} aria-label="Cerrar filtros">×</button></div>
        <fieldset>
          <legend>Categoría</legend>
          {groups.map((item) => <label key={item.value}><input type="checkbox" checked={group === item.value} onChange={() => setGroup(item.value)} /><span>{item.label}</span></label>)}
        </fieldset>
        <fieldset>
          <legend>Tipo de uso</legend>
          {(["todos", "residencial", "comercial", "industrial"] as const).map((item) => <label key={item}><input type="checkbox" checked={audience === item} onChange={() => setAudience(item)} /><span>{item === "todos" ? "Todos los usos" : item}</span></label>)}
        </fieldset>
        <fieldset>
          <legend>Sistema</legend>
          {(["todos", "automatizado", "manual"] as const).map((item) => <label key={item}><input type="checkbox" checked={system === item} onChange={() => setSystem(item)} /><span>{item === "todos" ? "Todos los sistemas" : item}</span></label>)}
        </fieldset>
        <button type="button" onClick={() => { setGroup("todos"); setAudience("todos"); setSystem("todos"); setSearch(""); }}>Limpiar filtros</button>
      </aside>
      <div className="catalog-main">
        <div className="catalog-tools">
          <label><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar soluciones..." /></label>
          <span>{visible.length} soluciones</span>
          <button className="catalog-filter-trigger" type="button" onClick={() => setFiltersOpen(true)}><SlidersHorizontal size={16} /> Filtros</button>
        </div>
        <div className="catalog-pills">
          {groups.map((item) => <button type="button" className={group === item.value ? "is-active" : ""} onClick={() => setGroup(item.value)} key={item.value}>{item.label}</button>)}
        </div>
        {visible.length ? <div className="catalog-grid">{visible.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="catalog-empty"><h2>No encontramos coincidencias</h2><p>Prueba otra categoría o consulta directamente con nuestro asistente.</p></div>}
      </div>
    </div>
  );
}
