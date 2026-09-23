import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Industrial Remotos Perú",
    short_name: "Industrial Remotos",
    description: "Soluciones de acceso, automatización y fabricación a medida.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fbff",
    theme_color: "#000A13",
    lang: "es-PE",
    icons: [{ src: "/brand-mark.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }]
  };
}
