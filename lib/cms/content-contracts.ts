import { z } from "zod";

const text = (max: number) => z.string().trim().min(1).max(max);
const optionalText = (max: number) => z.string().trim().max(max).default("");

export const CmsImageSchema = z.object({
  src: text(700),
  alt: text(220),
  position: z.enum(["center", "top", "bottom", "left", "right"]).default("center")
}).strict();

export const CmsVideoSchema = z.object({
  src: text(700),
  alt: text(220),
  position: z.enum(["center", "top", "bottom", "left", "right"]).default("center")
}).strict();

const HomeButtonSchema = z.object({ label: text(90), href: text(300) }).strict();
const HomeCardSchema = z.object({
  id: text(80), title: text(160), body: text(500), image: CmsImageSchema,
  href: optionalText(300), icon: optionalText(50)
}).strict();

export const HomeContentSchema = z.object({
  hero: z.object({
    mode: z.enum(["composition", "image", "video"]),
    composition: z.object({
      eyebrow: text(180), desktopLines: z.array(text(180)).min(1).max(4), mobileLines: z.array(text(120)).min(1).max(5),
      desktopDescription: text(500), mobileDescription: text(400), primary: HomeButtonSchema, secondary: HomeButtonSchema,
      proofLeftTitle: text(100), proofLeftBody: text(180), proofRightTitle: text(100), proofRightBody: text(180),
      advisorImage: CmsImageSchema, advisorHref: text(300), desktopVideo: CmsVideoSchema, mobileVideo: CmsVideoSchema,
      desktopPoster: CmsImageSchema, mobilePoster: CmsImageSchema, fallbackImage: CmsImageSchema
    }).strict(),
    imageOnly: z.object({ desktop: CmsImageSchema, mobile: CmsImageSchema }).strict(),
    videoOnly: z.object({ desktop: CmsVideoSchema, mobile: CmsVideoSchema, desktopPoster: CmsImageSchema, mobilePoster: CmsImageSchema }).strict()
  }).strict(),
  needs: z.object({
    eyebrow: text(100), title: text(180), titleAccent: text(100), desktopDescription: text(500), mobileDescription: text(300),
    cta: HomeButtonSchema, process: z.array(z.object({ id: text(80), title: text(120), body: text(240), icon: text(50) }).strict()).min(1).max(8),
    services: z.array(HomeCardSchema).min(1).max(12)
  }).strict(),
  projects: z.object({
    eyebrow: text(100), title: text(180), titleAccent: text(180), description: text(700), cta: HomeButtonSchema,
    topGallery: z.array(CmsImageSchema).min(1).max(120), bottomGallery: z.array(CmsImageSchema).min(1).max(120)
  }).strict(),
  integrated: z.object({
    eyebrow: text(100), title: text(180), titleAccent: text(120), description: text(600), cta: HomeButtonSchema,
    desktopScene: CmsImageSchema, mobileScene: CmsImageSchema,
    services: z.array(z.object({ id: text(80), shortTitle: text(80), title: text(160), body: text(500), href: text(300), visible: z.boolean() }).strict()).min(1).max(12)
  }).strict(),
  impact: z.object({
    titleLine1: text(180), titleLine2: text(180), titleAccent: text(120), description: text(500),
    metrics: z.array(z.object({ id: text(80), value: z.number().min(0).max(999999), prefix: optionalText(12), suffix: optionalText(12), label: text(120), progress: z.number().min(0).max(100) }).strict()).min(1).max(6),
    gallery: z.array(CmsImageSchema).min(3).max(30)
  }).strict(),
  process: z.object({
    eyebrow: text(100), title: text(180), titleAccent: text(160), description: text(500),
    steps: z.array(HomeCardSchema.extend({ number: text(10) }).strict()).min(1).max(8),
    benefits: z.array(z.object({ id: text(80), firstLine: text(100), secondLine: text(120), icon: text(50) }).strict()).min(1).max(6),
    cta: HomeButtonSchema
  }).strict(),
  projectPath: z.object({
    eyebrow: text(100), title: text(180), titleAccent: text(120), description: text(500), desktopBackground: CmsImageSchema, mobileBackground: CmsImageSchema,
    assistant: z.object({ title: text(120), subtitle: text(160), description: text(500), button: HomeButtonSchema }).strict(),
    quote: z.object({ title: text(120), subtitle: text(160), description: text(500), preview: CmsImageSchema, button: HomeButtonSchema }).strict()
  }).strict(),
  coverage: z.object({
    eyebrow: text(100), title: text(180), description: text(500), points: z.array(z.object({ id: text(80), text: text(180), icon: text(50) }).strict()).min(1).max(6),
    mapHref: text(900), mapEmbedUrl: text(900), ctaEyebrow: text(100), ctaTitle: text(220), ctaDescription: text(500), primary: HomeButtonSchema, whatsappLabel: text(100), phoneLabel: text(100)
  }).strict()
}).strict();
export type HomeContent = z.infer<typeof HomeContentSchema>;

const RepeaterItemSchema = z.object({
  id: text(80),
  title: text(100),
  body: optionalText(500)
}).strict();

const AboutVideoPosterSchema = z.object({
  src: optionalText(700),
  alt: optionalText(220),
  position: z.enum(["center", "top", "bottom", "left", "right"]).default("center")
}).strict();

const AboutWorkVideoSchema = z.object({
  id: text(80),
  title: optionalText(120),
  videoSrc: optionalText(700),
  poster: AboutVideoPosterSchema,
  tiktokUrl: optionalText(700),
  published: z.boolean().default(false)
}).strict();

export const AboutContentSchema = z.object({
  hero: z.object({
    visible: z.boolean().default(true),
    eyebrow: text(80),
    titleLine1: text(120),
    titleLine2: text(120),
    description: text(320),
    indicator: text(120).default("Conoce nuestra esencia ↓"),
    animationEnabled: z.boolean().default(true),
    stickyEnabled: z.boolean().default(true),
    image: CmsImageSchema,
    mobileImage: CmsImageSchema.default({ src: "/NUEVO/NOSOTROS/Instalación profesional de portón negro-1.png", alt: "Equipo de Industrial Remotos Perú instalando un portón", position: "center" })
  }).strict(),
  workVideos: z.object({
    visible: z.boolean().default(true),
    eyebrow: text(100),
    title: text(180),
    titleAccent: text(180),
    description: text(360),
    moreLabel: optionalText(100),
    moreHref: optionalText(700),
    items: z.array(AboutWorkVideoSchema).max(24)
  }).strict().default({
    visible: true,
    eyebrow: "Nuestro trabajo, en acción",
    title: "Así damos forma",
    titleAccent: "a tus proyectos",
    description: "Del taller a la instalación. Mira cómo trabajamos.",
    moreLabel: "Más trabajos en TikTok",
    moreHref: "",
    items: [
      { id: "taller", title: "En el taller", videoSrc: "", poster: { src: "", alt: "", position: "center" }, tiktokUrl: "", published: false },
      { id: "instalacion", title: "Durante la instalación", videoSrc: "", poster: { src: "", alt: "", position: "center" }, tiktokUrl: "", published: false },
      { id: "resultado", title: "El resultado", videoSrc: "", poster: { src: "", alt: "", position: "center" }, tiktokUrl: "", published: false }
    ]
  }),
  presentation: z.object({
    visible: z.boolean().default(true),
    eyebrow: text(100).default("Industrial Remotos Perú"),
    title: text(180),
    titleAccent: text(180).default("Precisos en el trabajo."),
    body: text(900),
    bodySecondary: text(900).default("Acompañamos tu proyecto desde la primera idea hasta la instalación, con atención cercana y cuidado en cada detalle."),
    statement: text(220).default("Cercanos en el trato. Precisos en el trabajo."),
    videoSrc: optionalText(700),
    videoPoster: z.object({
      src: optionalText(700),
      alt: optionalText(220),
      position: z.enum(["center", "top", "bottom", "left", "right"]).default("center")
    }).strict().default({ src: "", alt: "Portada del video Quiénes somos", position: "center" }),
    highlights: z.array(RepeaterItemSchema.pick({ id: true, title: true })).min(1).max(6),
    image: CmsImageSchema.default({ src: "/NUEVO/NOSOTROS/Residencia contemporánea con ventanales al jardín-2.png", alt: "Ambiente contemporáneo con mamparas hacia el jardín", position: "center" })
  }).strict(),
  purpose: z.object({
    visible: z.boolean().default(true),
    image: CmsImageSchema,
    mobileImage: CmsImageSchema.default({ src: "/NUEVO/NOSOTROS/Terraza contemporánea con pérgola y jardín-3.png", alt: "Terraza contemporánea con pérgola y jardín", position: "center" }),
    missionTitle: text(80),
    missionBody: text(650),
    visionTitle: text(80),
    visionBody: text(650)
  }).strict(),
  values: z.object({
    visible: z.boolean().default(true),
    title: text(180),
    titleAccent: text(180).default("en los detalles."),
    items: z.array(RepeaterItemSchema).min(1).max(8),
    image: CmsImageSchema.default({ src: "/NUEVO/NOSOTROS/Técnico ajustando herrajes de fachada de vidrio-4.png", alt: "Técnico de Industrial Remotos Perú ajustando herrajes", position: "center" })
  }).strict(),
  cta: z.object({
    visible: z.boolean().default(true),
    title: text(180),
    label: text(80),
    href: text(300),
    image: CmsImageSchema
  }).strict()
}).strict();
export type AboutContent = z.infer<typeof AboutContentSchema>;

export const ProjectGalleryItemSchema = z.object({
  id: text(80),
  image: CmsImageSchema,
  published: z.boolean().default(true)
}).strict();

export const ProjectsContentSchema = z.object({
  title: text(120).default("Nuestros proyectos"),
  items: z.array(ProjectGalleryItemSchema).max(120)
}).strict();
export type ProjectsContent = z.infer<typeof ProjectsContentSchema>;

const ServiceFaqSchema = z.object({ id: text(80), question: text(240), answer: text(1200) }).strict();
export const ServicesContentSchema = z.object({
  items: z.array(z.object({
    slug: text(100),
    title: text(160),
    heroHeading: text(180),
    heroAccent: optionalText(120),
    heroDescription: text(700),
    heroImage: CmsImageSchema,
    faqs: z.array(ServiceFaqSchema).max(12)
  }).strict()).min(1).max(20)
}).strict();
export type ServicesContent = z.infer<typeof ServicesContentSchema>;

export const ContactContentSchema = z.object({
  eyebrow: text(80),
  title: text(180),
  titleAccent: text(120).default("tu proyecto."),
  description: text(420),
  formTitle: text(140),
  formDescription: text(420),
  desktopBackground: z.object({
    src: optionalText(700),
    alt: optionalText(220),
    position: z.enum(["center", "top", "bottom", "left", "right"]).default("center")
  }).strict().default({ src: "/NUEVO/CONTACTO/contacto-fondo-escritorio.webp", alt: "Entrada contemporánea con puerta de madera y vegetación", position: "center" }),
  mobileBackground: z.object({
    src: optionalText(700),
    alt: optionalText(220),
    position: z.enum(["center", "top", "bottom", "left", "right"]).default("center")
  }).strict().default({ src: "/NUEVO/CONTACTO/contacto-fondo-movil.webp", alt: "Entrada contemporánea vertical con puerta de madera y vegetación", position: "center" }),
  submitLabel: text(100).default("Enviar consulta"),
  whatsappLabel: text(100).default("Conversar por WhatsApp"),
  whatsappTitle: text(120).default("¿Lo conversamos?"),
  whatsappDescription: text(300).default("Escríbenos y cuéntanos tu idea."),
  whatsappMessage: text(700).default("Hola, Industrial Remotos Perú. Quisiera conversar sobre un proyecto."),
  showWhatsapp: z.boolean().default(true),
  successMessage: text(420).default("Tu consulta fue registrada correctamente. Nuestro equipo se comunicará contigo."),
  showMap: z.boolean().default(false),
  mapEmbedUrl: optionalText(900)
}).strict();
export type ContactContent = z.infer<typeof ContactContentSchema>;

export const CompanyContentSchema = z.object({
  commercialName: text(120),
  legalName: text(180),
  ruc: text(20),
  address: text(280),
  location: text(180),
  phoneDisplay: text(40),
  whatsappNumber: z.string().trim().regex(/^\d{9,15}$/),
  email: z.union([z.literal(""), z.string().trim().email().max(254)]),
  mapUrl: optionalText(900),
  hours: optionalText(180),
  coverage: optionalText(280),
  facebook: optionalText(500),
  instagram: optionalText(500),
  tiktok: optionalText(500),
  routeTransition: z.object({
    enabled: z.boolean().default(true),
    background: CmsImageSchema,
    logo: CmsImageSchema
  }).strict().default({
    enabled: true,
    background: { src: "/NUEVO/transicion-titanio-azul.webp", alt: "Textura de titanio azul marino", position: "center" },
    logo: { src: "/NUEVO/LOGO.png", alt: "Logo de Industrial Remotos Perú", position: "center" }
  })
}).strict();
export type CompanyContent = z.infer<typeof CompanyContentSchema>;

const LinkSchema = z.object({ id: text(80), label: text(80), href: text(300), visible: z.boolean() }).strict();
export const FooterContentSchema = z.object({
  description: text(420),
  navigation: z.array(LinkSchema).max(12),
  legal: z.array(LinkSchema).max(12)
}).strict();
export type FooterContent = z.infer<typeof FooterContentSchema>;

export const CmsSchemas = {
  home: HomeContentSchema,
  about: AboutContentSchema,
  services: ServicesContentSchema,
  projects: ProjectsContentSchema,
  contact: ContactContentSchema,
  company: CompanyContentSchema,
  footer: FooterContentSchema
} as const;

export type CmsKey = keyof typeof CmsSchemas;
export type CmsContentMap = {
  home: HomeContent;
  about: AboutContent;
  services: ServicesContent;
  projects: ProjectsContent;
  contact: ContactContent;
  company: CompanyContent;
  footer: FooterContent;
};

export type CmsDocument<K extends CmsKey = CmsKey> = {
  key: K;
  version: number;
  updatedAt: string;
  updatedBy: string;
  content: CmsContentMap[K];
};

export const CmsUpdateSchema = z.object({
  expectedVersion: z.number().int().min(0),
  content: z.unknown()
}).strict();

export function isCmsKey(value: string): value is CmsKey {
  return Object.prototype.hasOwnProperty.call(CmsSchemas, value);
}

export function parseCmsContent<K extends CmsKey>(key: K, value: unknown): CmsContentMap[K] {
  return CmsSchemas[key].parse(value) as CmsContentMap[K];
}
