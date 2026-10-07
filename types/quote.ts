import type { QuoteItem } from "@/types/catalog";
import type { ProjectPricing } from "@/lib/pricing/contracts";

export type QuoteContact = {
  name: string;
  email: string;
  phone: string;
  documentType: "DNI" | "RUC";
  documentNumber: string;
  businessName: string;
};

export type QuoteDetails = {
  projectType: string;
  location: string;
  region: string;
  province: string;
  district: string;
  address: string;
  stage: string;
  estimatedDate: string;
  notes: string;
};

export type SubmittedRequest = {
  requestId: string;
  code: string;
  createdAt: string;
  accessToken: string | null;
  contact: QuoteContact;
  details: QuoteDetails;
  files: string[];
  items: QuoteItem[];
  pricing: ProjectPricing;
};

export const LAST_REQUEST_KEY = "irp-last-request-v2";
