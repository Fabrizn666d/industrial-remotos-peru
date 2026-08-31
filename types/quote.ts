import type { QuoteItem } from "@/types/catalog";

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
  code: string;
  createdAt: string;
  contact: QuoteContact;
  details: QuoteDetails;
  files: string[];
  items: QuoteItem[];
  total: number;
};

export const LAST_REQUEST_KEY = "irp-last-request-v1";

