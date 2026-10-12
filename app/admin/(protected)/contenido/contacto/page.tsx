import { ContentEditor } from "@/components/admin/ContentEditor";
import { getCmsDocument } from "@/lib/cms/content-repository";
import styles from "../../../admin.module.css";

export const dynamic = "force-dynamic";
export default async function ContactAdminPage() { const document = await getCmsDocument("contact"); return <><section className={styles.pageHeading}><div><span>Contenido</span><h1>Contacto</h1><p>Edita la ventana global de contacto, sus mensajes y los canales visibles.</p></div></section><ContentEditor initialDocument={document} /></>; }
