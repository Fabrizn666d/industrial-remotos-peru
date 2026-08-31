import { redirect } from "next/navigation";
import { oldProductToSolution } from "@/data/solution-pages";

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/soluciones/${oldProductToSolution[slug] ?? "puertas-automatizacion"}`);
}
