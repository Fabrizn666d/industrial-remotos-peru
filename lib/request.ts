import { products } from "@/data/products";
import type { SubmittedRequest } from "@/types/quote";

export function buildExampleRequest(code = "COT-IRP-00284"): SubmittedRequest {
  const selected = [products[0], products[6], products[7], products[8]];
  const items = selected.map((product, index) => ({
    id: "example-" + product.id,
    productId: product.id,
    name: product.name,
    image: product.image,
    quantity: 1,
    finish: index === 0 ? "Nogal oscuro" : undefined,
    measures: ["3.20 m × 2.40 m", "5.00 m × 3.00 m", "3.50 m × 2.10 m", "6.00 m"][index],
    unitPrice: product.price
  }));
  return {
    code,
    createdAt: new Date().toISOString(),
    contact: { name: "Juan Pérez", email: "juanperez@gmail.com", phone: "987 654 321" },
    details: { projectType: "Vivienda residencial", location: "Santiago de Surco, Lima", stage: "En construcción", estimatedDate: "2026-09", notes: "Busco un acabado moderno y automatización silenciosa." },
    files: ["fachada-referencia.jpg", "vano-garaje.jpg"],
    items,
    total: items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  };
}

