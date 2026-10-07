import { PUBLIC_CATALOG_VERSION, pricingDefinition, type PublishedPricingDefinition } from "@/lib/pricing/catalog";
import { DEFAULT_PROPOSAL_TERMS, ProjectPricingSchema, type PriceBreakdownLine, type PriceRequestItem, type PricingResult, type ProjectPricing, type ProposalTerms } from "@/lib/pricing/contracts";

export const PROPOSAL_DISCLAIMER = DEFAULT_PROPOSAL_TERMS.disclaimer;

function decimal(value?: string) {
  if (!value) return null;
  const normalized = value.trim().replace(",", ".");
  if (!/^\d+(?:\.\d+)?$/.test(normalized)) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function evaluation(classification: PricingResult["classification"], reason: string, missing: string[], catalogVersion = PUBLIC_CATALOG_VERSION): PricingResult {
  return { status: "REQUIRES_EVALUATION", catalogVersion, classification, reason, missing, currency: "PEN" };
}

function multiplyMinor(value: number, quantity: number) {
  return Math.round(value * quantity);
}

export function calculateItemPrice(item: PriceRequestItem, catalog?: PublishedPricingDefinition[], catalogVersion = PUBLIC_CATALOG_VERSION): PricingResult {
  const requiresEvaluation = (
    classification: PricingResult["classification"],
    reason: string,
    missing: string[]
  ) => evaluation(classification, reason, missing, catalogVersion);
  const definition = pricingDefinition(item.productId, catalog);
  if (!definition) return requiresEvaluation("NOT_APPLICABLE", "Esta solución todavía no tiene una tarifa publicada y requiere evaluación técnica.", ["tarifa publicada"]);
  const config = item.configuration;

  if (definition.classification === "IMPORTED") {
    const model = definition.importedModels?.find((entry) => entry.id === config.model);
    if (!model) return requiresEvaluation("IMPORTED", "Selecciona uno de los modelos importados publicados.", ["modelo"]);
    const variant = model.variants.find((entry) => entry.id === config.variant);
    if (!variant) return requiresEvaluation("IMPORTED", "La medida debe corresponder a una variante publicada para el modelo.", ["medida disponible"]);
    if (!config.finish || !variant.allowedFinishes.includes(config.finish)) return requiresEvaluation("IMPORTED", "El acabado elegido no está habilitado para esta variante.", ["acabado compatible"]);
    const automation = model.automation.find((entry) => entry.id === config.automation || entry.label === config.automation);
    if (!automation) return requiresEvaluation("IMPORTED", "Selecciona la automatización habilitada para este modelo.", ["automatización"]);
    const breakdown: PriceBreakdownLine[] = [
      { key: "variant", label: `${model.name} · ${variant.label} · ${config.finish}`, amountMinor: multiplyMinor(variant.priceMinorByFinish[config.finish], item.quantity) }
    ];
    if (automation.priceMinor) breakdown.push({ key: "automation", label: automation.label, amountMinor: multiplyMinor(automation.priceMinor, item.quantity) });
    for (const accessory of config.accessories) {
      const published = model.accessories.find((entry) => entry.id === accessory || entry.label === accessory);
      if (!published) return requiresEvaluation("IMPORTED", `El complemento “${accessory}” no está habilitado para este modelo.`, ["complemento compatible"]);
      breakdown.push({ key: `accessory:${published.id}`, label: published.label, amountMinor: multiplyMinor(published.priceMinor, item.quantity) });
    }
    if (config.installation === "Incluir instalación") breakdown.push({ key: "installation", label: "Instalación", amountMinor: multiplyMinor(22_000, item.quantity) });
    const totalMinor = breakdown.reduce((sum, line) => sum + line.amountMinor, 0);
    return { status: "ESTIMATED", catalogVersion, classification: "IMPORTED", subtotalMinor: totalMinor, totalMinor, breakdown, assumptions: ["Medida cerrada y acabado compatibles con la variante publicada."], currency: "PEN" };
  }

  const width = decimal(config.width);
  const height = decimal(config.height);
  if (!width || !height) return requiresEvaluation(definition.classification, "Faltan medidas para calcular esta solución.", [!width ? "ancho" : "", !height ? "alto" : ""].filter(Boolean));

  if (definition.custom) {
    const rule = definition.custom;
    if (width < rule.minWidthM || width > rule.maxWidthM || height < rule.minHeightM || height > rule.maxHeightM) {
      return requiresEvaluation("MADE_TO_MEASURE", `Las medidas publicadas admiten ancho de ${rule.minWidthM} a ${rule.maxWidthM} m y alto de ${rule.minHeightM} a ${rule.maxHeightM} m.`, ["medidas dentro del rango"]);
    }
    if (!config.finish || !(config.finish in rule.finishPercentBps)) return requiresEvaluation("MADE_TO_MEASURE", "Selecciona un acabado publicado para la regla de fabricación.", ["acabado"]);
    const areaM2 = Math.round(width * height * 10_000) / 10_000;
    const billableAreaM2 = Math.max(areaM2, rule.minimumAreaM2);
    const rate = rule.areaRates.find((entry) => entry.upToM2 === null || billableAreaM2 <= entry.upToM2);
    if (!rate) return requiresEvaluation("MADE_TO_MEASURE", "No existe una tarifa válida para esta área.", ["tarifa de área"]);
    const baseMinor = Math.round(billableAreaM2 * rate.unitPriceMinor * item.quantity);
    const finishMinor = Math.round(baseMinor * rule.finishPercentBps[config.finish] / 10_000);
    const breakdown: PriceBreakdownLine[] = [
      { key: "base", label: `${billableAreaM2.toFixed(2)} m² facturables × S/ ${(rate.unitPriceMinor / 100).toFixed(2)}`, amountMinor: baseMinor }
    ];
    if (finishMinor) breakdown.push({ key: "finish", label: `Acabado ${config.finish}`, amountMinor: finishMinor });
    const automationMinor = rule.automationPrices[config.automation || ""];
    if (automationMinor === undefined && config.automation) return requiresEvaluation("MADE_TO_MEASURE", "La automatización elegida no es compatible con esta regla.", ["automatización compatible"]);
    if (automationMinor) breakdown.push({ key: "automation", label: config.automation!, amountMinor: multiplyMinor(automationMinor, item.quantity) });
    for (const accessory of config.accessories) {
      const amount = rule.accessoryPrices[accessory];
      if (amount === undefined) return requiresEvaluation("MADE_TO_MEASURE", `El accesorio “${accessory}” no está publicado para esta solución.`, ["accesorio compatible"]);
      breakdown.push({ key: `accessory:${accessory}`, label: accessory, amountMinor: multiplyMinor(amount, item.quantity) });
    }
    if (config.installation === "Incluir instalación") breakdown.push({ key: "installation", label: "Instalación", amountMinor: multiplyMinor(rule.installationMinor, item.quantity) });
    const totalMinor = breakdown.reduce((sum, line) => sum + line.amountMinor, 0);
    return { status: "ESTIMATED", catalogVersion, classification: "MADE_TO_MEASURE", subtotalMinor: totalMinor, totalMinor, breakdown, assumptions: areaM2 < rule.minimumAreaM2 ? [`Área real ${areaM2.toFixed(2)} m²; mínimo facturable ${rule.minimumAreaM2.toFixed(2)} m².`] : [], currency: "PEN" };
  }

  if (definition.simpleArea) {
    const rule = definition.simpleArea;
    const areaM2 = Math.round(width * height * 10_000) / 10_000;
    const billableAreaM2 = Math.max(areaM2, rule.minimumAreaM2);
    const breakdown: PriceBreakdownLine[] = [{ key: "base", label: `${billableAreaM2.toFixed(2)} m² facturables`, amountMinor: Math.round(billableAreaM2 * rule.unitPriceMinor * item.quantity) }];
    if (config.installation === "Incluir instalación") breakdown.push({ key: "installation", label: "Instalación", amountMinor: multiplyMinor(rule.installationMinor, item.quantity) });
    const totalMinor = breakdown.reduce((sum, line) => sum + line.amountMinor, 0);
    return { status: "ESTIMATED", catalogVersion, classification: "NOT_APPLICABLE", subtotalMinor: totalMinor, totalMinor, breakdown, assumptions: areaM2 < rule.minimumAreaM2 ? [`Mínimo facturable ${rule.minimumAreaM2.toFixed(2)} m².`] : [], currency: "PEN" };
  }

  return requiresEvaluation(definition.classification, "Esta solución requiere evaluación comercial.", ["regla de precio"]);
}

export function calculateProjectPrice(items: PriceRequestItem[], location: string, catalog?: PublishedPricingDefinition[], catalogVersion = PUBLIC_CATALOG_VERSION, proposalTerms: ProposalTerms = DEFAULT_PROPOSAL_TERMS): ProjectPricing {
  const pricedItems = items.map((item) => ({ productId: item.productId, quantity: item.quantity, result: calculateItemPrice(item, catalog, catalogVersion) }));
  const estimated = pricedItems.filter((item) => item.result.status === "ESTIMATED");
  const pending = pricedItems.length - estimated.length;
  const proposalCharges: PriceBreakdownLine[] = [];
  if (estimated.length && /villa\s+el\s+salvador/i.test(location)) proposalCharges.push({ key: "transport:ves", label: "Transporte demo · Villa El Salvador", amountMinor: 10_000 });
  const total = estimated.reduce((sum, item) => sum + (item.result.status === "ESTIMATED" ? item.result.totalMinor : 0), 0) + proposalCharges.reduce((sum, line) => sum + line.amountMinor, 0);
  return ProjectPricingSchema.parse({
    catalogVersion,
    status: pending === pricedItems.length ? "REQUIRES_EVALUATION" : pending ? "PARTIAL" : "ESTIMATED",
    items: pricedItems,
    proposalCharges,
    estimatedTotalMinor: estimated.length ? total : null,
    currency: "PEN",
    disclaimer: proposalTerms.disclaimer,
    proposalTerms
  });
}

export function formatPublicPrice(amountMinor: number) {
  return new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN", minimumFractionDigits: 2 }).format(amountMinor / 100).replace("PEN", "S/");
}

