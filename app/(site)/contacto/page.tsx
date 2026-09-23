import type { Metadata } from "next";
import { Clock3, MapPin, MessageCircle, Phone } from "lucide-react";
import { ContactExperience } from "@/components/ContactExperience";
import { PageHero } from "@/components/PublicComponents";
import { siteConfig } from "@/data/site";
import { FaqSection } from "@/components/FaqSection";

export const metadata: Metadata = { title: "Contacto", description: "Conversa con Industrial Remotos Perú y cuéntanos sobre tu proyecto." };

export default function ContactPage() {
  return (
    <main id="contenido">
      <PageHero eyebrow="Hablemos" title={<>Cuéntanos qué espacio quieres <em>transformar.</em></>} copy="Envíanos los primeros datos. Continuaremos por WhatsApp para revisar fotos, medidas y condiciones del proyecto." />
      <section className="contact-section">
        <div className="page-shell contact-layout">
          <aside className="contact-info">
            <span className="eyebrow eyebrow--light">Atención directa</span><h2>Una conversación clara desde el primer contacto.</h2><p>No necesitas tener todos los detalles. Podemos ayudarte a identificar la solución correcta.</p>
            <div><a href={"tel:+" + siteConfig.whatsappNumber}><Phone size={19} /><span><small>Teléfono / WhatsApp</small>{siteConfig.phoneDisplay}</span></a><span><MapPin size={19} /><i><small>Dirección</small>{siteConfig.location}</i></span>{siteConfig.hours && <span><Clock3 size={19} /><i><small>Horario</small>{siteConfig.hours}</i></span>}</div>
            <a className="button button--light" href={siteConfig.social.whatsapp} target="_blank" rel="noreferrer"><MessageCircle size={18} />Abrir WhatsApp</a>
          </aside>
          <ContactExperience />
        </div>
      </section>
      <FaqSection />
    </main>
  );
}
