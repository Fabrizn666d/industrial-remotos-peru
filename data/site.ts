export const siteConfig = {
  name: "Industrial Remotos Perú",
  slogan: "Garantía y confianza",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  phoneDisplay: "+51 987 908 444",
  phoneCompact: "987 908 444",
  whatsappNumber: "51987908444",
  hours: "",
  location: "Lima - Villa El Salvador",
  coverage: "Consulta disponibilidad para tu ubicación.",
  social: {
    facebook: "https://www.facebook.com/industrial5.H",
    instagram: "https://www.instagram.com/industrialremotos/",
    tiktok: "https://www.tiktok.com/@industrialremotos1",
    whatsapp: "https://wa.me/51987908444"
  },
  developer: { name: "Wilo Studio", url: "https://wilostudio.site" }
} as const;

export const companyLegalData = {
  legalName: "INDUSTRIAL REMOTOS PERU S.A.C.",
  ruc: "20615226361",
  address: "LIMA - VILLA EL SALVADOR",
} as const;

export const navItems = [
  { label: "Inicio", href: "/" },
  { label: "Soluciones", href: "/soluciones" },
  { label: "Catálogo", href: "/productos" },
  { label: "Proyectos", href: "/proyectos" },
  { label: "Nosotros", href: "/nosotros" },
  { label: "Contacto", href: "/contacto" }
] as const;

export const serviceNavItems = [
  { label: "Puertas y automatización", href: "/soluciones/puertas-automatizacion" },
  { label: "Puertas principales", href: "/soluciones/puertas-principales" },
  { label: "Techos y coberturas", href: "/soluciones/techos-coberturas" },
  { label: "Ventanas y mamparas", href: "/soluciones/ventanas-mamparas" },
  { label: "Acero inoxidable y barandas", href: "/soluciones/acero-barandas" },
  { label: "Estructuras metálicas", href: "/soluciones/estructuras-metalicas" },
  { label: "Cerco eléctrico", href: "/soluciones/cerco-electrico" },
  { label: "Drywall y cielorrasos", href: "/soluciones/drywall-cielorrasos" }
] as const;
