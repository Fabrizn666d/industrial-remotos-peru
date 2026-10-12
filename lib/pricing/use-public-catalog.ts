"use client";
import { useEffect, useState } from "react";
import { publishedPricingCatalog } from "@/lib/pricing/catalog";
import type { PricingCatalogDocument } from "@/lib/pricing/catalog-contracts";
import { DEFAULT_PROPOSAL_TERMS } from "@/lib/pricing/contracts";

const fallback = { title: "Puertas principales importadas", description: "Elige un modelo, una medida disponible y el color.", image: "/images/placeholders/puerta-contraplacada-temporal.png", visible: true, order: 3, destination: "/soluciones/puertas-principales" };
export function usePublicPricingCatalog() {
  const [value, setValue] = useState<Pick<PricingCatalogDocument, "version" | "homeCard" | "definitions" | "proposalSettings">>({ version: 1, homeCard: fallback, definitions: publishedPricingCatalog, proposalSettings: DEFAULT_PROPOSAL_TERMS });
  useEffect(() => { let active = true; fetch("/api/catalog/pricing").then((response) => response.ok ? response.json() : Promise.reject()).then((catalog: PricingCatalogDocument) => { if (active) setValue({ version: catalog.version, homeCard: catalog.homeCard, definitions: catalog.definitions, proposalSettings: catalog.proposalSettings }); }).catch(() => undefined); return () => { active = false; }; }, []);
  return value;
}
