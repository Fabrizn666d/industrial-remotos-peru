import { ContentEditor } from "@/components/admin/ContentEditor";
import { getCmsDocument } from "@/lib/cms/content-repository";
import styles from "../../../admin.module.css";

export const dynamic = "force-dynamic";

export default async function AppearanceAdminPage() {
  const document = await getCmsDocument("company");
  return <>
    <section className={styles.pageHeading}>
      <div><span>Sistema</span><h1>Apariencia</h1><p>Configura el loader visual utilizado al navegar entre páginas públicas.</p></div>
    </section>
    <ContentEditor initialDocument={document} view="visual" />
  </>;
}
