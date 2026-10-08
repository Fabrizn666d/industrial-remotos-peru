import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EditorialSolutionPage } from "@/components/solutions/EditorialSolutionPage";
import { findSolutionEditorialProfile } from "@/data/solution-editorial";
import { findSolutionPage, solutionPages } from "@/data/solution-pages";
import { siteConfig } from "@/data/site";

export function generateStaticParams() {
  return solutionPages.map((solution) => ({ slug: solution.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const solution = findSolutionPage(slug);
  const profile = findSolutionEditorialProfile(slug);
  if (!solution || !profile) return {};

  const title = solution.title;
  const socialTitle = `${solution.title} | Industrial Remotos Perú`;
  const url = `/soluciones/${solution.slug}`;
  return {
    title,
    description: profile.heroDescription,
    alternates: { canonical: url },
    openGraph: { title: socialTitle, description: profile.heroDescription, url, images: [{ url: profile.visuals.hero.src }] },
    twitter: { card: "summary_large_image", title: socialTitle, description: profile.heroDescription, images: [profile.visuals.hero.src] }
  };
}

export default async function SolutionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const solution = findSolutionPage(slug);
  const profile = findSolutionEditorialProfile(slug);
  if (!solution || !profile) notFound();

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: siteConfig.url },
      { "@type": "ListItem", position: 2, name: "Soluciones", item: `${siteConfig.url}/soluciones` },
      { "@type": "ListItem", position: 3, name: solution.title, item: `${siteConfig.url}/soluciones/${solution.slug}` }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c") }} />
      <EditorialSolutionPage solution={solution} profile={profile} />
    </>
  );
}
