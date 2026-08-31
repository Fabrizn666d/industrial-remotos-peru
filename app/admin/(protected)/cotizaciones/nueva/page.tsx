import { redirect } from "next/navigation";
import { QuoteEditor } from "@/components/control/QuoteEditor";
import { getAdminSession } from "@/lib/backend/auth";
import { getControlQuoteRepository } from "@/lib/control/repository";

export const dynamic = "force-dynamic";

export default async function NewQuotePage() {
  if (!await getAdminSession()) redirect("/admin/login");
  const products = await getControlQuoteRepository().listProducts();
  return <QuoteEditor products={products} />;
}

