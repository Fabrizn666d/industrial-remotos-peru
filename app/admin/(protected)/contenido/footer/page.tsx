import { ContentEditor } from "@/components/admin/ContentEditor";
import { getCmsDocument } from "@/lib/cms/content-repository";
import styles from "../../../admin.module.css";

export const dynamic = "force-dynamic";
export default async function FooterAdminPage() { const document = await getCmsDocument("footer"); return <><section className={styles.pageHeading}><div><span>Contenido</span><h1>Footer y enlaces</h1><p>Administra la descripción, navegación y enlaces legales.</p></div></section><ContentEditor initialDocument={document} /></>; }
