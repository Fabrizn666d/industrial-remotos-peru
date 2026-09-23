import type { MetadataRoute } from "next";
import { siteConfig } from "@/data/site";
import { solutionPages } from "@/data/solution-pages";
import { products } from "@/data/products";
import { projects } from "@/data/projects";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/soluciones", ...solutionPages.map((solution) => `/soluciones/${solution.slug}`), "/productos", ...products.map((product) => `/productos/${product.id}`), "/proyectos", ...projects.map((project) => `/proyectos/${project.slug}`), "/nosotros", "/contacto", "/cotizar", "/asistente", "/libro-reclamaciones", "/politica-privacidad", "/terminos"];
  return routes.map((route) => ({
    url: siteConfig.url + route,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: route === "" ? 1 : .8
  }));
}
