import { Settings2 } from "lucide-react";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/backend/auth";
import { getPricingCatalogRepository } from "@/lib/pricing/catalog-repository";
import { PricingCatalogManager } from "@/components/control/PricingCatalogManager";
import styles from "../../../admin.module.css";
export const dynamic = "force-dynamic";
export default async function PricingCatalogPage(){const session=await getAdminSession();if(!session)redirect("/admin/login");if(session.role==="COMMERCIAL")redirect("/admin");const repository=getPricingCatalogRepository();const [draft,published]=await Promise.all([repository.getDraft(),repository.getPublished()]);return <><section className={styles.pageHeading}><div><span>Configuración</span><h1>Cotizador y asistente</h1><p>Catálogo compartido, puertas importadas, fabricación a medida y versión publicada.</p></div><Settings2 size={28}/></section><PricingCatalogManager initialDraft={draft} publishedVersion={published.version}/></>}
