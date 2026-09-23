export type ProductAudience = "residencial" | "comercial" | "industrial";
export type ProductGroup = "puertas" | "puertas-principales" | "techos" | "ventanas" | "acero" | "estructuras" | "cerco" | "drywall" | "automatizacion";

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
  evidence: "real" | "reference";
};

export type Solution = {
  id: string;
  title: string;
  kicker: string;
  description: string;
  image: string;
  href: string;
  icon: "door" | "entry" | "roof" | "window" | "rail" | "structure" | "fence" | "drywall" | "automation";
};

export type ApproximateDimensions = {
  width?: string;
  height?: string;
  unit: "m";
};

export type QuoteItemConfiguration = {
  subtype?: string;
  dimensions?: ApproximateDimensions;
  design?: string;
  panel?: string;
  finish?: string;
  automation?: string;
  accessories: string[];
  installation?: string;
  notes?: string;
};

export type PendingPrice = {
  status: "pending";
};

export type QuoteItem = {
  id: string;
  productId: string;
  name: string;
  image: string;
  quantity: number;
  configuration: QuoteItemConfiguration;
  price: PendingPrice;
  createdAt: string;
  updatedAt: string;
};

export type ProjectCategory = "seccionales" | "levadizas" | "corredizas" | "estructuras" | "automatizacion";

export type Project = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: ProjectCategory;
  badge: "RESIDENCIAL" | "INDUSTRIAL" | "ESTRUCTURAS" | "COMERCIAL";
  location: string;
  image: string;
  tiktokUrl: string;
  featured?: boolean;
};

export type Service = {
  id: string;
  title: string;
  description: string;
  icon: "ruler" | "panels" | "automation" | "support";
};
