import { HomeExperience } from "@/components/HomeExperience";
import { siteConfig } from "@/data/site";

const schema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteConfig.name,
  url: siteConfig.url,
  inLanguage: "es-PE"
};

export default function HomePage() {
  return (
    <>
      <HomeExperience />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </>
  );
}
