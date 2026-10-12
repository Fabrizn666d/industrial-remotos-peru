import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EditorialSolutionPage } from "@/components/solutions/EditorialSolutionPage";
import { findSolutionEditorialProfile } from "@/data/solution-editorial";
import { findSolutionPage, solutionPages } from "@/data/solution-pages";
import { siteConfig } from "@/data/site";
import { getCmsDocument } from "@/lib/cms/content-repository";

export function generateStaticParams() {
  return solutionPages.map((solution) => ({ slug: solution.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const solution = findSolutionPage(slug);
  const profile = findSolutionEditorialProfile(slug);
  if (!solution || !profile) return {};

  const configured = (await getCmsDocument("services")).content.items.find((item) => item.slug === slug);
  const title = configured?.title || solution.title;
  const description = configured?.heroDescription || profile.heroDescription;
  const image = configured?.heroImage.src || profile.visuals.hero.src;
  const socialTitle = `${title} | Industrial Remotos Perú`;
  const url = `/soluciones/${solution.slug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title: socialTitle, description, url, images: [{ url: image }] },
    twitter: { card: "summary_large_image", title: socialTitle, description, images: [image] }
  };
}

export default async function SolutionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const solution = findSolutionPage(slug);
  const profile = findSolutionEditorialProfile(slug);
  if (!solution || !profile) notFound();
  const configured = (await getCmsDocument("services")).content.items.find((item) => item.slug === slug);
  const publicSolution = configured ? { ...solution, title: configured.title, faqs: configured.faqs.map(({ question, answer }) => ({ question, answer })) } : solution;
  const publicProfile = configured ? { ...profile, heroHeading: configured.heroHeading, heroAccent: configured.heroAccent || undefined, heroDescription: configured.heroDescription, visuals: { ...profile.visuals, hero: { ...profile.visuals.hero, src: configured.heroImage.src } } } : profile;

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
      <EditorialSolutionPage solution={publicSolution} profile={publicProfile} />
    </>
  );
}
