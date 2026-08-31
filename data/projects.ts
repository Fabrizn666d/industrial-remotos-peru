import type { Project } from "@/types/catalog";
import { siteConfig } from "@/data/site";

const tiktokUrl = siteConfig.social.tiktok;

export const projects: Project[] = [
  {
    id: "seccional-peatonal-san-miguel",
    title: "Puerta seccional automática con peatonal integrada",
    category: "seccionales",
    badge: "RESIDENCIAL",
    location: "San Miguel",
    image: "/images/reales/puerta-21.jpg",
    tiktokUrl
  },
  {
    id: "levadiza-surco",
    title: "Puerta levadiza automatizada con acabado madera",
    category: "levadizas",
    badge: "RESIDENCIAL",
    location: "Santiago de Surco",
    image: "/images/reales/puerta-22.jpg",
    tiktokUrl
  },
  {
    id: "corrediza-callao",
    title: "Puerta corrediza motorizada para acceso amplio",
    category: "corredizas",
    badge: "COMERCIAL",
    location: "Callao",
    image: "/images/reales/puerta-17.jpg",
    tiktokUrl
  },
  {
    id: "estructura-sjl",
    title: "Estructura metálica fabricada a medida",
    category: "estructuras",
    badge: "ESTRUCTURAS",
    location: "San Juan de Lurigancho",
    image: "/images/reales/puerta-37.jpg",
    tiktokUrl
  },
  {
    id: "automatizacion-huacho",
    title: "Automatización de puerta con control remoto",
    category: "automatizacion",
    badge: "RESIDENCIAL",
    location: "Huacho",
    image: "/images/reales/puerta-34.jpg",
    tiktokUrl
  },
  {
    id: "seccional-chancay",
    title: "Puerta seccional para ingreso residencial",
    category: "seccionales",
    badge: "RESIDENCIAL",
    location: "Chancay",
    image: "/images/reales/puerta-15.jpg",
    tiktokUrl
  },
  {
    id: "corrediza-huaral",
    title: "Puerta corrediza de fabricación metálica",
    category: "corredizas",
    badge: "INDUSTRIAL",
    location: "Huaral",
    image: "/images/reales/puerta-19.jpg",
    tiktokUrl
  },
  {
    id: "levadiza-la-molina",
    title: "Puerta levadiza a medida con automatización",
    category: "levadizas",
    badge: "RESIDENCIAL",
    location: "La Molina",
    image: "/images/reales/puerta-40.jpg",
    tiktokUrl
  },
  {
    id: "techo-policarbonato-lima",
    title: "Techo sol y sombra con policarbonato",
    category: "estructuras",
    badge: "ESTRUCTURAS",
    location: "Lima",
    image: "/images/reales/puerta-36.jpg",
    tiktokUrl
  },
  {
    id: "seccional-san-miguel",
    title: "Puerta seccional con panel importado",
    category: "seccionales",
    badge: "RESIDENCIAL",
    location: "San Miguel",
    image: "/images/reales/puerta-38.jpg",
    tiktokUrl
  }
];
