import type { QuoteStatus } from "@/lib/control/quote-contracts";
import styles from "./admin.module.css";

const labels: Record<QuoteStatus, string> = {
  DRAFT: "Borrador",
  ISSUED: "Emitida",
  VOID: "Anulada"
};

export function QuoteStatusBadge({ status }: { status: QuoteStatus }) {
  return <span className={`${styles.statusBadge} ${styles[`quoteStatus_${status}`]}`}>{labels[status]}</span>;
}

