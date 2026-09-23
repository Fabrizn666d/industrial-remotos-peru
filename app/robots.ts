import type { MetadataRoute } from "next";
import { siteConfig } from "@/data/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/confirmacion", "/cotizar/confirmacion", "/cotizar/finalizar", "/proforma"]
    },
    sitemap: siteConfig.url + "/sitemap.xml"
  };
}
