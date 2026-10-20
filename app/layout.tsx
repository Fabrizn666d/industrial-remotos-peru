import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";
import { NavigationTransition } from "@/components/NavigationTransition";
import { siteConfig } from "@/data/site";
import { defaultCmsContent } from "@/lib/cms/content-defaults";
import { HOME_INTRO_SEEN_CLASS, HOME_INTRO_SESSION_KEY } from "@/lib/home-intro-session";

const plusJakartaSans = localFont({
  src: "../Plus_Jakarta_Sans/PlusJakartaSans-VariableFont_wght.ttf",
  variable: "--font-plus-jakarta",
  display: "swap",
  style: "normal",
  weight: "200 800"
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "Industrial Remotos Perú | Soluciones de acceso a medida",
    template: "%s | Industrial Remotos Perú"
  },
  description: "Diseño, fabricación, automatización e instalación de puertas, coberturas y estructuras desarrolladas a medida.",
  keywords: ["puertas automáticas Lima", "puertas seccionales", "puertas levadizas", "automatización de puertas", "Industrial Remotos Perú"],
  openGraph: {
    title: "Industrial Remotos Perú",
    description: "Soluciones de acceso que combinan seguridad, diseño y automatización.",
    locale: "es_PE",
    type: "website",
    siteName: siteConfig.name,
    images: [{ url: "/images/reales/portada-puerta-seccional.jpg", width: 848, height: 480, alt: "Puerta seccional instalada por Industrial Remotos Perú" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Industrial Remotos Perú",
    description: "Soluciones de acceso que combinan seguridad, diseño y automatización.",
    images: ["/images/reales/portada-puerta-seccional.jpg"]
  },
  manifest: "/manifest.webmanifest",
  icons: { icon: "/brand-mark.svg", apple: "/logo-original-transparent.png" }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000A13"
};

const introPreflight = `try{const h=document.documentElement,k="${HOME_INTRO_SESSION_KEY}",c="${HOME_INTRO_SEEN_CLASS}";if(location.pathname!=="/"){if(sessionStorage.getItem(k)==="seen")h.classList.add(c)}else if(new URLSearchParams(location.search).get("intro")==="1"){h.dataset.irpIntroCurrent="play"}else if(sessionStorage.getItem(k)==="seen"){h.classList.add(c)}else{h.dataset.irpIntroCurrent="play"}}catch{}`;
const introFirstPaintCss = `html[data-irp-intro-current="play"],html[data-irp-intro-current="play"] body{background:#000a13!important}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-PE" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <Script id="irp-home-intro-preflight" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: introPreflight }} />
        <style dangerouslySetInnerHTML={{ __html: introFirstPaintCss }} />
      </head>
      <body className={plusJakartaSans.variable}>
        <a className="skip-link" href="#contenido">Saltar al contenido</a>
        <NavigationTransition config={defaultCmsContent.company.routeTransition} />
        {children}
      </body>
    </html>
  );
}
