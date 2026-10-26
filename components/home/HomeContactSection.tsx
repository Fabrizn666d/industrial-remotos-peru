"use client";

import { ContactDialogContent, contactDialogStyle, useContactDialog } from "@/components/ContactDialog";
import styles from "@/components/ContactDialog.module.css";

export function HomeContactSection() {
  const { content, company, services } = useContactDialog();

  return (
    <section className={styles.homeSection} id="contacto" aria-labelledby="home-contact-title">
      <div
        className={`${styles.dialog} ${styles.embeddedDialog}`}
        style={contactDialogStyle(content)}
      >
        <ContactDialogContent
          content={content}
          company={company}
          services={services}
          originPage="/#contacto"
          titleId="home-contact-title"
          descriptionId="home-contact-description"
        />
      </div>
    </section>
  );
}
