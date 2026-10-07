"use client";
import { useEffect, useState } from "react";
import { publishedPricingCatalog } from "@/lib/pricing/catalog";
import type { PricingCatalogDocument } from "@/lib/pricing/catalog-contracts";
import { DEFAULT_PROPOSAL_TERMS } from "@/lib/pricing/contracts";

const fallback = { title: "Puertas a medida", description: "Puertas diseñadas y fabricadas según tu espacio y estilo.", image: "/images/reales/puerta-22.jpg", visible: true, order: 2, destination: "/soluciones/puertas-a-medida" };
export function usePublicPricingCatalog() {
  const [value, setValue] = useState<Pick<PricingCatalogDocument, "version" | "homeCard" | "definitions" | "proposalSettings">>({ version: 1, homeCard: fallback, definitions: publishedPricingCatalog, proposalSettings: DEFAULT_PROPOSAL_TERMS });
  useEffect(() => { let active = true; fetch("/api/catalog/pricing").then((response) => response.ok ? response.json() : Promise.reject()).then((catalog: PricingCatalogDocument) => { if (active) setValue({ version: catalog.version, homeCard: catalog.homeCard, definitions: catalog.definitions, proposalSettings: catalog.proposalSettings }); }).catch(() => undefined); return () => { active = false; }; }, []);
  return value;
}
