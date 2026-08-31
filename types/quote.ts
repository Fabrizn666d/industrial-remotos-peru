import type { PendingPrice, QuoteItem } from "@/types/catalog";

export type QuoteContact = {
  name: string;
  email: string;
  phone: string;
};

export type QuoteDetails = {
  projectType: string;
  location: string;
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
  pricing: PendingPrice;
};

export const LAST_REQUEST_KEY = "irp-last-request-v2";
