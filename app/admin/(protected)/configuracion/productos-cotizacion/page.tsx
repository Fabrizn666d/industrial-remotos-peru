import { Package } from "lucide-react";
import { redirect } from "next/navigation";
import { ProductTemplateManager } from "@/components/control/ProductTemplateManager";
import { getAdminSession } from "@/lib/backend/auth";
import { getControlQuoteRepository } from "@/lib/control/repository";
import { QUOTE_DIAGRAM_PRESETS } from "@/lib/control/quote-seeds";
import styles from "../../../admin.module.css";

export const dynamic = "force-dynamic";

export default async function QuoteProductsPage() {
  if (!await getAdminSession()) redirect("/admin/login");
  const products = await getControlQuoteRepository().listProducts(true);
  return (
    <>
      <section className={styles.pageHeading}><div><span>Configuración</span><h1>Productos de cotización</h1><p>Define el contenido que se autocompleta al agregar productos a una proforma.</p></div><Package size={28} /></section>
      <ProductTemplateManager initialProducts={products} diagramPresets={QUOTE_DIAGRAM_PRESETS} />
    </>
  );
}
