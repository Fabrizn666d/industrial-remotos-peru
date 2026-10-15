"use client";
import { useEffect, useState } from "react";
import { publishedPricingCatalog } from "@/lib/pricing/catalog";
import type { PricingCatalogDocument } from "@/lib/pricing/catalog-contracts";
import { DEFAULT_PROPOSAL_TERMS } from "@/lib/pricing/contracts";

const fallback = { title: "Puertas principales importadas", description: "Elige un modelo, una medida disponible y el color.", image: "/images/configurator/catalog/02_Puertas_importadas/Colores_propuestos/nogal.webp", visible: true, order: 3, destination: "/soluciones/puertas-principales" };
const fallbackDefinitions = publishedPricingCatalog as PricingCatalogDocument["definitions"];
export function usePublicPricingCatalog() {
  const [value, setValue] = useState<Pick<PricingCatalogDocument, "version" | "homeCard" | "definitions" | "proposalSettings" | "configuratorVisualOverrides" | "configuratorStepOverrides">>({ version: 1, homeCard: fallback, definitions: fallbackDefinitions, proposalSettings: DEFAULT_PROPOSAL_TERMS, configuratorVisualOverrides: [], configuratorStepOverrides: [] });
  useEffect(() => {
    let active = true;
    const load = () => fetch("/api/catalog/pricing", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((catalog: PricingCatalogDocument) => {
        if (active) setValue({ version: catalog.version, homeCard: catalog.homeCard, definitions: catalog.definitions, proposalSettings: catalog.proposalSettings, configuratorVisualOverrides: catalog.configuratorVisualOverrides, configuratorStepOverrides: catalog.configuratorStepOverrides });
      })
      .catch(() => undefined);
    void load();
    const refresh = () => { if (document.visibilityState === "visible") void load(); };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      active = false;
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);
  return value;
}
