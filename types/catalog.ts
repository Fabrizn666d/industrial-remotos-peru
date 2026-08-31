export type ProductAudience = "residencial" | "comercial" | "industrial";
export type ProductGroup = "puertas" | "techos" | "ventanas" | "acero" | "estructuras" | "automatizacion";

export type Finish = {
  name: string;
  color: string;
  pattern?: "wood" | "texture" | "solid";
};

export type Product = {
  id: string;
  name: string;
  shortName: string;
  group: ProductGroup;
  description: string;
  longDescription: string;
  audiences: ProductAudience[];
  image: string;
  gallery: string[];
  benefits: string[];
  finishes: Finish[];
  tiktokUrl: string;
  evidence: "real" | "service";
  price: number;
};

export type Solution = {
  id: string;
  title: string;
  kicker: string;
  description: string;
  image: string;
  href: string;
  icon: "door" | "roof" | "window" | "rail" | "structure" | "automation";
};

export type QuoteItem = {
  id: string;
  productId: string;
  name: string;
  image: string;
  quantity: number;
  finish?: string;
  measures?: string;
  unitPrice: number;
};

export type ProjectCategory = "seccionales" | "levadizas" | "corredizas" | "estructuras" | "automatizacion";

export type Project = {
  id: string;
  title: string;
  category: ProjectCategory;
  badge: "RESIDENCIAL" | "INDUSTRIAL" | "ESTRUCTURAS" | "COMERCIAL";
  location: string;
  image: string;
  tiktokUrl: string;
};

export type Service = {
  id: string;
  title: string;
  description: string;
  icon: "ruler" | "panels" | "automation" | "support";
};
