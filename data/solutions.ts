import { solutionPages } from "@/data/solution-pages";
import type { Solution } from "@/types/catalog";

const icons: Record<string, Solution["icon"]> = {
  "puertas-automatizacion": "door", "puertas-principales": "entry", "techos-coberturas": "roof",
  "ventanas-mamparas": "window", "acero-barandas": "rail", "estructuras-metalicas": "structure",
  "cerco-electrico": "fence", "drywall-cielorrasos": "drywall"
};

export const solutions: Solution[] = solutionPages.map((item) => ({
  id: item.slug,
  title: item.title,
  kicker: item.eyebrow,
  description: item.summary,
  image: item.heroImage,
  href: `/soluciones/${item.slug}`,
  icon: icons[item.slug]
}));
