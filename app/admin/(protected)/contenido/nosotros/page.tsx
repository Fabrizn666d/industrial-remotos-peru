import { ContentEditor } from "@/components/admin/ContentEditor";
import { getCmsDocument } from "@/lib/cms/content-repository";
import styles from "../../../admin.module.css";

export const dynamic = "force-dynamic";
export default async function AboutAdminPage() { const document = await getCmsDocument("about"); return <><section className={styles.pageHeading}><div><span>Contenido</span><h1>Nosotros</h1><p>Edita las secciones de la página sin alterar su composición aprobada.</p></div></section><ContentEditor initialDocument={document} /></>; }
