export const siteConfig = {
  name: "Industrial Remotos Perú",
  slogan: "Garantía y confianza",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  phoneDisplay: "+51 987 908 444",
  phoneCompact: "987 908 444",
  whatsappNumber: "51987908444",
  hours: "Lun – Sáb · 8:00 am – 6:00 pm",
  location: "San Miguel, Lima – Perú",
  coverage: "Lima, Callao y atención a todo el Perú",
  social: {
    facebook: "https://www.facebook.com/industrial5.H",
    instagram: "https://www.instagram.com/industrialremotos/",
    tiktok: "https://www.tiktok.com/@industrialremotos1",
    whatsapp: "https://wa.me/51987908444"
  },
  developer: { name: "Wilo Studio", url: "https://wilostudio.site" }
} as const;

export const navItems = [
  { label: "Inicio", href: "/" },
  { label: "Soluciones", href: "/soluciones" },
  { label: "Proyectos", href: "/proyectos" },
  { label: "Nosotros", href: "/nosotros" },
  { label: "Contacto", href: "/contacto" }
] as const;

export const serviceNavItems = [
  { label: "Puertas y automatización", href: "/soluciones/puertas-automatizacion" },
  { label: "Techos y coberturas", href: "/soluciones/techos-coberturas" },
  { label: "Ventanas y mamparas", href: "/soluciones/ventanas-mamparas" },
  { label: "Acero inoxidable y barandas", href: "/soluciones/acero-barandas" },
  { label: "Estructuras metálicas", href: "/soluciones/estructuras-metalicas" },
  { label: "Trabajos especiales", href: "/soluciones/trabajos-especiales" }
] as const;
