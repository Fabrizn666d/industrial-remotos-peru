import { ContentEditor } from "@/components/admin/ContentEditor";
import { getCmsDocument } from "@/lib/cms/content-repository";
import styles from "../../../admin.module.css";

export const dynamic = "force-dynamic";
export default async function ProjectsAdminPage() { const document = await getCmsDocument("projects"); return <><section className={styles.pageHeading}><div><span>Contenido</span><h1>Proyectos</h1><p>Agrega, ordena, encuadra, publica u oculta fotografías de la galería.</p></div></section><ContentEditor initialDocument={document} /></>; }
