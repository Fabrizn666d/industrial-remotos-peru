import { products } from "@/data/products";
import { projects } from "@/data/projects";
import { solutionPages } from "@/data/solution-pages";

export type SearchEntry = { title: string; type: "Solución" | "Producto" | "Proyecto" | "Ayuda"; summary: string; href: string; keywords: string };

const help: SearchEntry[] = [
  { title: "¿Qué información necesito para cotizar?", type: "Ayuda", summary: "Medidas aproximadas, ubicación, fotografías y tipo de uso.", href: "/contacto", keywords: "cotización medidas visita técnica" },
  { title: "Libro de Reclamaciones", type: "Ayuda", summary: "Registra un reclamo o queja y recibe una constancia.", href: "/libro-reclamaciones", keywords: "reclamo queja consumidor" }
];

export const searchIndex: SearchEntry[] = [
  ...solutionPages.map((item) => ({ title: item.title, type: "Solución" as const, summary: item.summary, href: `/soluciones/${item.slug}`, keywords: `${item.benefits.join(" ")} ${item.uses.join(" ")}` })),
  ...products.map((item) => ({ title: item.name, type: "Producto" as const, summary: item.description, href: `/productos/${item.id}`, keywords: `${item.group} ${item.audiences.join(" ")} ${item.benefits.join(" ")}` })),
  ...projects.map((item) => ({ title: item.title, type: "Proyecto" as const, summary: item.description, href: "/proyectos", keywords: `${item.category} ${item.location}` })),
  ...help
];
