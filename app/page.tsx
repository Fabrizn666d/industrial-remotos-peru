import { HomeExperience } from "@/components/HomeExperience";
import { siteConfig } from "@/data/site";

const schema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: siteConfig.name,
  description: "Fabricación, venta, instalación y automatización de soluciones de acceso.",
  telephone: siteConfig.phoneDisplay,
  address: { "@type": "PostalAddress", addressLocality: "San Miguel", addressRegion: "Lima", addressCountry: "PE" },
  areaServed: ["Lima", "Callao", "Perú"],
  sameAs: [siteConfig.social.facebook, siteConfig.social.instagram, siteConfig.social.tiktok]
};

export default function HomePage() {
  return (
    <>
      <HomeExperience />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </>
  );
}
