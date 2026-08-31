"use client";

import { Check, Plus } from "lucide-react";
import { useState } from "react";
import { useProject } from "@/components/ProjectContext";
import { formatPEN } from "@/lib/currency";
import type { Product } from "@/types/catalog";

export function ProductDetailActions({ product }: { product: Product }) {
  const [finish, setFinish] = useState(product.finishes[0]?.name ?? "");
  const { addProduct } = useProject();
  return (
    <div className="detail-actions">
      <div className="detail-price"><small>Precio referencial desde</small><strong>{formatPEN(product.price)}</strong></div>
      {product.finishes.length > 0 && (
        <fieldset className="finish-selector">
          <legend>Colores y acabados disponibles</legend>
          <div>
            {product.finishes.map((item) => (
              <button
                style={{
                  backgroundColor: item.color,
                  backgroundImage: item.pattern === "wood"
                    ? "repeating-linear-gradient(0deg, rgba(255,255,255,.07) 0 1px, rgba(0,0,0,.08) 1px 3px, transparent 3px 7px)"
                    : item.pattern === "texture"
                      ? "radial-gradient(circle at 30% 25%, rgba(255,255,255,.3) 0 1px, transparent 1.5px)"
                      : undefined,
                  backgroundSize: item.pattern === "texture" ? "5px 5px" : undefined
                }}
                type="button"
                className={finish === item.name ? "is-selected" : ""}
                onClick={() => setFinish(item.name)}
                key={item.name}
                aria-label={item.name}
              >
                <span>{item.name}</span>
                {finish === item.name && <Check size={14} />}
              </button>
            ))}
          </div>
          <p>{finish || "Se define durante la asesoría"}</p>
        </fieldset>
      )}
      <div className="detail-actions__buttons">
        <a className="button button--primary" href={"/cotizar?producto=" + product.id}>Personalizar y cotizar</a>
        <button className="button button--secondary" type="button" onClick={() => addProduct(product, { finish })}><Plus size={18} /> Agregar a Mi proyecto</button>
      </div>
      <p className="no-price-note">El precio se confirma después de validar medidas, material, automatización e instalación.</p>
    </div>
  );
}
