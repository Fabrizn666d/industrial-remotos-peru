import type { Metadata } from "next";
import { Check, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductDetailActions } from "@/components/ProductDetailActions";
import { ProductDetailTabs } from "@/components/ProductDetailTabs";
import { products } from "@/data/products";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = products.find((item) => item.id === slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: `/productos/${product.id}` }
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = products.find((item) => item.id === slug);
  if (!product) notFound();

  return (
    <main id="contenido" className="product-detail-page">
      <nav className="page-shell breadcrumbs" aria-label="Migas de pan">
        <Link href="/">Inicio</Link><ChevronRight size={12} />
        <Link href="/productos">Productos</Link><ChevronRight size={12} />
        <span aria-current="page">{product.shortName}</span>
      </nav>

      <section className="page-shell product-detail">
        <div className="product-gallery">
          <div className="product-gallery__main">
            <Image src={product.gallery[0] ?? product.image} alt={product.name} fill priority sizes="(min-width: 900px) 58vw, 100vw" className="object-cover" />
            <span>{product.evidence === "real" ? "Fotografía de referencia del sistema" : "Referencia visual del servicio"}</span>
          </div>
          <div className="product-gallery__thumbs" aria-label="Galería de referencias">
            {product.gallery.slice(1, 4).map((image, index) => (
              <span key={image}><Image src={image} alt={`${product.name}, referencia ${index + 2}`} fill sizes="(min-width: 900px) 18vw, 31vw" className="object-cover" /></span>
            ))}
          </div>
        </div>

        <div className="product-detail__copy">
          <span className="eyebrow">{product.group.replace("automatizacion", "automatización")}</span>
          <h1>{product.name}</h1>
          <p className="product-detail__lead">{product.description}</p>
          <p>{product.longDescription}</p>
          <ul>{product.benefits.map((benefit) => <li key={benefit}><Check size={16} />{benefit}</li>)}</ul>
          <ProductDetailActions product={product} />
        </div>
      </section>

      <ProductDetailTabs product={product} />
    </main>
  );
}
