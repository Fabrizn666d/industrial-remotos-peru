"use client";

import { ContactDialogContent, contactDialogStyle, useContactDialog } from "@/components/ContactDialog";
import styles from "@/components/ContactDialog.module.css";

type HomeContactSectionProps = {
  id?: string;
  originPage?: string;
  titleId?: string;
  descriptionId?: string;
};

export function HomeContactSection({
  id = "contacto",
  originPage = "/#contacto",
  titleId = "home-contact-title",
  descriptionId = "home-contact-description"
}: HomeContactSectionProps = {}) {
  const { content, company, services } = useContactDialog();

  return (
    <section className={styles.homeSection} id={id} aria-labelledby={titleId}>
      <div
        className={`${styles.dialog} ${styles.embeddedDialog}`}
        style={contactDialogStyle(content)}
      >
        <ContactDialogContent
          content={content}
          company={company}
          services={services}
          originPage={originPage}
          titleId={titleId}
          descriptionId={descriptionId}
        />
      </div>
    </section>
  );
}
