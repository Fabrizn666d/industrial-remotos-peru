import { ContentEditor } from "@/components/admin/ContentEditor";
import { getCmsDocument } from "@/lib/cms/content-repository";
import styles from "../../../admin.module.css";

export default async function AdminHomeContentPage() {
  const document = await getCmsDocument("home");
  return <><section className={styles.pageHeading}><div><span>Contenido</span><h1>Inicio</h1><p>Edita todas las secciones de la Home, sus modos de hero y recursos para escritorio y móvil.</p></div></section><ContentEditor initialDocument={document} /></>;
}
