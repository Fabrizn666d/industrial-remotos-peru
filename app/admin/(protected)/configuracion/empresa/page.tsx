import {adminAccess} from "@/lib/admin/http";
import { ContentEditor } from "@/components/admin/ContentEditor";
import { getCmsDocument } from "@/lib/cms/content-repository";
import styles from "../../../admin.module.css";

export const dynamic = "force-dynamic";
export default async function CompanyAdminPage() { await adminAccess(undefined,"editor"); const document = await getCmsDocument("company"); return <><section className={styles.pageHeading}><div><span>Sistema</span><h1>Empresa y contacto</h1><p>Fuente única de datos públicos y legales de Industrial Remotos Perú.</p></div></section><ContentEditor initialDocument={document} /></>; }
