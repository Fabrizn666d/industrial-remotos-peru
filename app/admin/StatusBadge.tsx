import type { RequestStatus } from "@/lib/backend/contracts";
import { REQUEST_STATUS_LABELS } from "@/app/admin/status";
import styles from "./admin.module.css";

export function StatusBadge({ status }: { status: RequestStatus }) {
  return <span className={`${styles.statusBadge} ${styles[`status_${status}`]}`}>{REQUEST_STATUS_LABELS[status]}</span>;
}
