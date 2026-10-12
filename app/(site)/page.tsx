import type { Metadata } from "next";
import { HomeExperience } from "@/components/HomeExperience";
import { companyLegalData, siteConfig } from "@/data/site";
import { getCmsDocument } from "@/lib/cms/content-repository";

const schema = [
  { "@context": "https://schema.org", "@type": "WebSite", name: siteConfig.name, url: siteConfig.url, inLanguage: "es-PE" },
  { "@context": "https://schema.org", "@type": "Organization", name: companyLegalData.legalName, url: siteConfig.url, telephone: siteConfig.phoneDisplay, taxID: companyLegalData.ruc, sameAs: [siteConfig.social.facebook, siteConfig.social.instagram, siteConfig.social.tiktok] }
];

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default async function HomePage() {
  const home = await getCmsDocument("home");
  return (
    <>
      <HomeExperience content={home.content} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </>
  );
}
