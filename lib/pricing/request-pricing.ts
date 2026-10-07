import type { PublicRequestSubmission } from "@/lib/backend/contracts";
import { calculateProjectPrice } from "@/lib/pricing/engine";
import type { PricingConfiguration } from "@/lib/pricing/contracts";
import { getPricingCatalogRepository } from "@/lib/pricing/catalog-repository";

export class PricingValidationError extends Error {
  constructor(message: string) { super(message); this.name = "PricingValidationError"; }
}

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function list(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

export function pricingConfigurationFromRequest(configuration: PublicRequestSubmission["items"][number]["configuration"]): PricingConfiguration {
  return {
    width: text(configuration.width), height: text(configuration.height), subtype: text(configuration.subtype),
    model: text(configuration.model), variant: text(configuration.variant), openingSystem: text(configuration.openingSystem),
    design: text(configuration.design), material: text(configuration.material), finish: text(configuration.finish),
    automation: text(configuration.automation), accessories: list(configuration.accessories), installation: text(configuration.installation)
  };
}

export async function calculateSubmissionPrice(input: PublicRequestSubmission) {
  const catalog = await getPricingCatalogRepository().getPublished();
  const result = calculateProjectPrice(input.items.map((item) => ({
    productId: item.productId || "unpublished",
    quantity: item.quantity,
    configuration: pricingConfigurationFromRequest(item.configuration)
  })), input.details.location, catalog.definitions, `v${catalog.version}`, catalog.proposalSettings);
  if (input.source === "CONFIGURATOR" || input.source === "ASSISTANT") {
    const invalidDoor = result.items.find((item) => item.result.status === "REQUIRES_EVALUATION" && item.result.classification !== "NOT_APPLICABLE");
    if (invalidDoor?.result.status === "REQUIRES_EVALUATION") throw new PricingValidationError(invalidDoor.result.reason);
  }
  return result;
}
