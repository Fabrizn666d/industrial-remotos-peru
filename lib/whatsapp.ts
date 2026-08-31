import { siteConfig } from "@/data/site";

export type QuoteData = {
  name: string;
  phone: string;
  location: string;
  product: string;
  width?: string;
  height?: string;
  finish?: string;
  details?: string;
};

export function buildWhatsAppMessage(data: QuoteData) {
  const measurements =
    data.width || data.height
      ? [data.width ? "Ancho: " + data.width + " m" : "", data.height ? "Alto: " + data.height + " m" : ""]
          .filter(Boolean)
          .join(" · ")
      : "Por confirmar";

  return [
    "Hola, Industrial Remotos Perú. Quisiera solicitar una cotización.",
    "",
    "Nombre: " + data.name,
    "WhatsApp: " + data.phone,
    "Distrito / ubicación: " + data.location,
    "Tipo de proyecto: " + data.product,
    "Medidas aproximadas: " + measurements,
    "Acabado preferido: " + (data.finish || "Por definir"),
    "Descripción: " + (data.details || "Sin detalles adicionales")
  ].join("\n");
}

export function buildWhatsAppUrl(message: string) {
  return (
    "https://wa.me/" +
    siteConfig.whatsappNumber +
    "?text=" +
    encodeURIComponent(message)
  );
}

export function buildQuickQuoteUrl(subject: string) {
  return buildWhatsAppUrl(
    "Hola, Industrial Remotos Perú. Quisiera cotizar " +
      subject +
      ". ¿Podrían asesorarme?"
  );
}
