import type { MetadataRoute } from "next";
import { siteConfig } from "@/data/site";
import { solutionPages } from "@/data/solution-pages";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/soluciones", ...solutionPages.map((solution) => `/soluciones/${solution.slug}`), "/proyectos", "/nosotros", "/contacto", "/cotizar", "/asistente"];
  return routes.map((route) => ({
    url: siteConfig.url + route,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: route === "" ? 1 : .8
  }));
}
