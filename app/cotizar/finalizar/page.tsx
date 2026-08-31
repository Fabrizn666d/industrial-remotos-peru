import type { Metadata } from "next";
import { CheckoutExperience } from "@/components/CheckoutExperience";

export const metadata: Metadata = {
  title: "Finalizar solicitud",
  description: "Completa los datos de tu proyecto y solicita una cotización."
};

export default function FinalizeQuotePage() {
  return <main id="contenido" className="checkout-route"><div className="page-shell"><CheckoutExperience /></div></main>;
}
