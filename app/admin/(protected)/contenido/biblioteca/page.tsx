import { MediaLibrary } from "@/components/admin/MediaLibrary";
import { listCmsMedia } from "@/lib/cms/media-repository";
import styles from "../../../admin.module.css";

export const dynamic = "force-dynamic";
export default async function MediaAdminPage() { const items = await listCmsMedia(); return <><section className={styles.pageHeading}><div><span>Contenido</span><h1>Biblioteca de medios</h1><p>Archivos persistentes para las páginas públicas. Las imágenes en uso no se pueden eliminar.</p></div></section><MediaLibrary initialItems={items} /></>; }
