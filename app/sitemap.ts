import type { MetadataRoute } from "next";
import { siteConfig } from "@/data/site";
import { solutionPages } from "@/data/solution-pages";
import { products } from "@/data/products";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/soluciones", ...solutionPages.map((solution) => `/soluciones/${solution.slug}`), "/productos", ...products.map((product) => `/productos/${product.id}`), "/proyectos", "/nosotros", "/contacto", "/cotizar", "/asistente", "/politica-privacidad", "/terminos"];
  return routes.map((route) => ({
    url: siteConfig.url + route,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: route === "" ? 1 : .8
  }));
}
