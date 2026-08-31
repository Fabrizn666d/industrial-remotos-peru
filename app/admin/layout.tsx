import type { Metadata } from "next";
import styles from "./admin.module.css";

export const metadata: Metadata = {
  title: { default: "Industrial Remotos Control", template: "%s | IRP Control" },
  robots: { index: false, follow: false, nocache: true }
};

export default function AdminBoundaryLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${styles.adminBoundary} adminBoundary`}>{children}</div>;
}
