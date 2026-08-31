import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { IntroLoader } from "@/components/IntroLoader";
import { ProjectExperience } from "@/components/ProjectExperience";
import { ProjectProvider } from "@/components/ProjectContext";
import { siteConfig } from "@/data/site";

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
  description: "Diseño, fabricación, automatización e instalación de puertas, coberturas y estructuras a medida en Lima y todo el Perú.",
  keywords: ["puertas automáticas Lima", "puertas seccionales", "puertas levadizas", "automatización de puertas", "Industrial Remotos Perú"],
  openGraph: {
    title: "Industrial Remotos Perú",
    description: "Soluciones de acceso que combinan seguridad, diseño y automatización.",
    locale: "es_PE",
    type: "website",
    siteName: siteConfig.name,
    images: [{ url: "/images/reales/portada-puerta-seccional.jpg", width: 848, height: 480, alt: "Puerta seccional instalada por Industrial Remotos Perú" }]
  },
  alternates: { canonical: "/" },
  icons: { icon: "/brand-mark.svg" }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0B1E3A"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-PE">
      <body className={plusJakartaSans.variable}>
        <a className="skip-link" href="#contenido">Saltar al contenido</a>
        <ProjectProvider>
          <IntroLoader />
          <Header />
          {children}
          <Footer />
          <ProjectExperience />
        </ProjectProvider>
      </body>
    </html>
  );
}
