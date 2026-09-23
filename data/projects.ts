import type { Project } from "@/types/catalog";
import { siteConfig } from "@/data/site";

const tiktokUrl = siteConfig.social.tiktok;

export const projects: Project[] = [
  {
    id: "seccional-peatonal-san-miguel",
    slug: "seccional-peatonal-san-miguel",
    title: "Puerta seccional automática con peatonal integrada",
    description: "Acceso vehicular y peatonal integrado en una solución fabricada a medida.",
    category: "seccionales",
    badge: "RESIDENCIAL",
    location: "San Miguel",
    image: "/images/reales/puerta-21.jpg",
    tiktokUrl,
    featured: true
  },
  {
    id: "levadiza-surco",
    slug: "levadiza-surco",
    title: "Puerta levadiza automatizada con acabado madera",
    description: "Puerta levadiza automatizada con acabado coordinado para el ingreso residencial.",
    category: "levadizas",
    badge: "RESIDENCIAL",
    location: "Santiago de Surco",
    image: "/images/reales/puerta-22.jpg",
    tiktokUrl
  },
  {
    id: "corrediza-callao",
    slug: "corrediza-callao",
    title: "Puerta corrediza motorizada para acceso amplio",
    description: "Sistema corredizo motorizado preparado para un acceso vehicular de mayor amplitud.",
    category: "corredizas",
    badge: "COMERCIAL",
    location: "Callao",
    image: "/images/reales/puerta-17.jpg",
    tiktokUrl
  },
  {
    id: "estructura-sjl",
    slug: "estructura-sjl",
    title: "Estructura metálica fabricada a medida",
    description: "Estructura metálica ejecutada según las medidas y condiciones del proyecto.",
    category: "estructuras",
    badge: "ESTRUCTURAS",
    location: "San Juan de Lurigancho",
    image: "/images/reales/puerta-37.jpg",
    tiktokUrl
  },
  {
    id: "automatizacion-huacho",
    slug: "automatizacion-huacho",
    title: "Automatización de puerta con control remoto",
    description: "Integración de automatización y control para mejorar el uso cotidiano del acceso.",
    category: "automatizacion",
    badge: "RESIDENCIAL",
    location: "Huacho",
    image: "/images/reales/puerta-34.jpg",
    tiktokUrl
  },
  {
    id: "seccional-chancay",
    slug: "seccional-chancay",
    title: "Puerta seccional para ingreso residencial",
    description: "Puerta seccional fabricada para aprovechar el recorrido vertical del ingreso.",
    category: "seccionales",
    badge: "RESIDENCIAL",
    location: "Chancay",
    image: "/images/reales/puerta-15.jpg",
    tiktokUrl
  },
  {
    id: "corrediza-huaral",
    slug: "corrediza-huaral",
    title: "Puerta corrediza de fabricación metálica",
    description: "Acceso corredizo metálico desarrollado para las dimensiones del proyecto.",
    category: "corredizas",
    badge: "INDUSTRIAL",
    location: "Huaral",
    image: "/images/reales/puerta-19.jpg",
    tiktokUrl
  },
  {
    id: "levadiza-la-molina",
    slug: "levadiza-la-molina",
    title: "Puerta levadiza a medida con automatización",
    description: "Solución levadiza automatizada y adaptada al vano disponible.",
    category: "levadizas",
    badge: "RESIDENCIAL",
    location: "La Molina",
    image: "/images/reales/puerta-40.jpg",
    tiktokUrl
  },
  {
    id: "techo-policarbonato-lima",
    slug: "techo-policarbonato-lima",
    title: "Techo sol y sombra con policarbonato",
    description: "Cobertura metálica con policarbonato para proteger y aprovechar el espacio exterior.",
    category: "estructuras",
    badge: "ESTRUCTURAS",
    location: "Lima",
    image: "/images/reales/puerta-36.jpg",
    tiktokUrl
  },
  {
    id: "seccional-san-miguel",
    slug: "seccional-san-miguel",
    title: "Puerta seccional con panel importado",
    description: "Puerta seccional con panel y automatización coordinados para el acceso.",
    category: "seccionales",
    badge: "RESIDENCIAL",
    location: "San Miguel",
    image: "/images/reales/puerta-38.jpg",
    tiktokUrl
  }
];
