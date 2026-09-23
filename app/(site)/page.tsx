import { HomeExperience } from "@/components/HomeExperience";
import { companyLegalData, siteConfig } from "@/data/site";

const schema = [
  { "@context": "https://schema.org", "@type": "WebSite", name: siteConfig.name, url: siteConfig.url, inLanguage: "es-PE" },
  { "@context": "https://schema.org", "@type": "Organization", name: companyLegalData.legalName, url: siteConfig.url, telephone: siteConfig.phoneDisplay, taxID: companyLegalData.ruc, sameAs: [siteConfig.social.facebook, siteConfig.social.instagram, siteConfig.social.tiktok] }
];

export default function HomePage() {
  return (
    <>
      <HomeExperience />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </>
  );
}
