import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { QuoteEditor } from "@/components/control/QuoteEditor";
import { getAdminSession } from "@/lib/backend/auth";
import { getControlQuoteRepository } from "@/lib/control/repository";

export const dynamic = "force-dynamic";

export default async function EditQuotePage({ params }: { params: Promise<{ id: string }> }) {
  if (!await getAdminSession()) redirect("/admin/login");
  const parsed = z.string().uuid().safeParse((await params).id);
  if (!parsed.success) notFound();
  const repository = getControlQuoteRepository();
  const [quote, products] = await Promise.all([repository.findQuote(parsed.data), repository.listProducts()]);
  if (!quote) notFound();
  return <QuoteEditor initialQuote={quote} products={products} />;
}

