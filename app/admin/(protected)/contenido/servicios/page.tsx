import { ContentEditor } from "@/components/admin/ContentEditor";
import { getCmsDocument } from "@/lib/cms/content-repository";
import styles from "../../../admin.module.css";

export const dynamic = "force-dynamic";
export default async function AdminServicesContentPage() { const document = await getCmsDocument("services"); return <><section className={styles.pageHeading}><div><span>Contenido</span><h1>Servicios</h1><p>Edita el encabezado, la imagen principal y las preguntas frecuentes de cada servicio sin alterar su cotizador.</p></div></section><ContentEditor initialDocument={document} /></>; }
