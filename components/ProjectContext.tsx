"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { products } from "@/data/products";
import type { Product, QuoteItem, QuoteItemConfiguration } from "@/types/catalog";

type ProjectContextValue = {
  items: QuoteItem[];
  count: number;
  hydrated: boolean;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  addProduct: (product: Product, configuration?: Partial<QuoteItemConfiguration>) => void;
  updateItem: (id: string, product: Product, configuration: Partial<QuoteItemConfiguration>) => void;
  duplicateItem: (id: string) => void;
  removeItem: (id: string) => void;
  changeQuantity: (id: string, delta: number) => void;
  clearProject: () => void;
};

const ProjectContext = createContext<ProjectContextValue | null>(null);
const STORAGE_KEY = "irp-project";
const LEGACY_STORAGE_KEYS = ["irp-project-v2"] as const;
const STORAGE_VERSION = 3 as const;

const dimensionsSchema = z.object({
  width: z.string().min(1).optional(),
  height: z.string().min(1).optional(),
  unit: z.literal("m")
}).strict();

const configurationSchema = z.object({
  subtype: z.string().min(1).optional(),
  dimensions: dimensionsSchema.optional(),
  design: z.string().min(1).optional(),
  panel: z.string().min(1).optional(),
  finish: z.string().min(1).optional(),
  automation: z.string().min(1).optional(),
  accessories: z.array(z.string().min(1)),
  installation: z.string().min(1).optional(),
  notes: z.string().min(1).optional()
}).strict();

const quoteItemSchema = z.object({
  id: z.string().min(1),
  productId: z.string().min(1),
  name: z.string().min(1),
  image: z.string().min(1),
  quantity: z.number().int().min(1).max(999),
  configuration: configurationSchema,
  price: z.object({ status: z.literal("pending") }).strict(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1)
}).strict();

const projectEnvelopeSchema = z.object({
  version: z.literal(STORAGE_VERSION),
  updatedAt: z.string().min(1),
  items: z.array(quoteItemSchema)
}).strict();

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function optionalText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function normalizeConfiguration(configuration: Partial<QuoteItemConfiguration> = {}): QuoteItemConfiguration {
  const width = optionalText(configuration.dimensions?.width);
  const height = optionalText(configuration.dimensions?.height);
  const accessories = Array.from(new Set((configuration.accessories ?? []).map((item) => item.trim()).filter(Boolean)));

  return {
    ...(optionalText(configuration.subtype) ? { subtype: optionalText(configuration.subtype) } : {}),
    ...(width || height ? { dimensions: { ...(width ? { width } : {}), ...(height ? { height } : {}), unit: "m" as const } } : {}),
    ...(optionalText(configuration.design) ? { design: optionalText(configuration.design) } : {}),
    ...(optionalText(configuration.panel) ? { panel: optionalText(configuration.panel) } : {}),
    ...(optionalText(configuration.finish) ? { finish: optionalText(configuration.finish) } : {}),
    ...(optionalText(configuration.automation) ? { automation: optionalText(configuration.automation) } : {}),
    accessories,
    ...(optionalText(configuration.installation) ? { installation: optionalText(configuration.installation) } : {}),
    ...(optionalText(configuration.notes) ? { notes: optionalText(configuration.notes) } : {})
  };
}

function parseLegacyMeasures(value: unknown): QuoteItemConfiguration["dimensions"] {
  if (typeof value !== "string") return undefined;
  const match = value.match(/([\d.,]+)\s*m?\s*[xX×]\s*([\d.,]+)/);
  if (!match) return undefined;
  return { width: match[1].replace(",", "."), height: match[2].replace(",", "."), unit: "m" };
}

function configurationFromUnknown(value: unknown, legacyItem: UnknownRecord): QuoteItemConfiguration {
  const stored = isRecord(value) ? value : {};
  const dimensions = isRecord(stored.dimensions)
    ? {
        width: optionalText(stored.dimensions.width),
        height: optionalText(stored.dimensions.height),
        unit: "m" as const
      }
    : parseLegacyMeasures(legacyItem.measures);
  const storedAccessories = Array.isArray(stored.accessories)
    ? stored.accessories.filter((item): item is string => typeof item === "string")
    : optionalText(legacyItem.accessory)
      ? [optionalText(legacyItem.accessory)!]
      : [];

  return normalizeConfiguration({
    subtype: optionalText(stored.subtype),
    dimensions,
    design: optionalText(stored.design),
    panel: optionalText(stored.panel),
    finish: optionalText(stored.finish) ?? optionalText(legacyItem.finish),
    automation: optionalText(stored.automation),
    accessories: storedAccessories,
    installation: optionalText(stored.installation),
    notes: optionalText(stored.notes)
  });
}

function migrateItem(value: unknown): QuoteItem | null {
  if (!isRecord(value)) return null;
  const productId = optionalText(value.productId);
  if (!productId) return null;
  const product = products.find((candidate) => candidate.id === productId);
  const name = product?.name ?? optionalText(value.name);
  const image = product?.image ?? optionalText(value.image);
  if (!name || !image) return null;
  const now = new Date().toISOString();
  const quantity = typeof value.quantity === "number" && Number.isFinite(value.quantity)
    ? Math.max(1, Math.min(999, Math.trunc(value.quantity)))
    : 1;
  const candidate = {
    id: optionalText(value.id) ?? crypto.randomUUID(),
    productId,
    name,
    image,
    quantity,
    configuration: configurationFromUnknown(value.configuration, value),
    price: { status: "pending" as const },
    createdAt: optionalText(value.createdAt) ?? now,
    updatedAt: now
  };
  const parsed = quoteItemSchema.safeParse(candidate);
  return parsed.success ? parsed.data : null;
}

function createEnvelope(items: QuoteItem[]) {
  return {
    version: STORAGE_VERSION,
    updatedAt: new Date().toISOString(),
    items
  };
}

function loadStoredProject(): { items: QuoteItem[]; migrated: boolean } {
  const keys = [STORAGE_KEY, ...LEGACY_STORAGE_KEYS];
  for (const key of keys) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    try {
      const value: unknown = JSON.parse(raw);
      const current = projectEnvelopeSchema.safeParse(value);
      if (current.success) return { items: current.data.items, migrated: key !== STORAGE_KEY };

      const legacyItems = Array.isArray(value)
        ? value
        : isRecord(value) && Array.isArray(value.items)
          ? value.items
          : null;
      if (legacyItems) {
        return { items: legacyItems.map(migrateItem).filter((item): item is QuoteItem => item !== null), migrated: true };
      }
    } catch {
      // Invalid or partially written browser data is discarded below.
    }
    localStorage.removeItem(key);
  }
  return { items: [], migrated: false };
}

function cloneConfiguration(configuration: QuoteItemConfiguration): QuoteItemConfiguration {
  return {
    ...configuration,
    ...(configuration.dimensions ? { dimensions: { ...configuration.dimensions } } : {}),
    accessories: [...configuration.accessories]
  };
}

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = loadStoredProject();
      setItems(stored.items);
      if (stored.migrated) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(createEnvelope(stored.items)));
        LEGACY_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
      }
    } catch {
      setItems([]);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(createEnvelope(items)));
    } catch {
      // The in-memory draft remains usable if browser storage is unavailable.
    }
  }, [hydrated, items]);

  useEffect(() => {
    document.body.classList.toggle("overlay-open", drawerOpen);
    return () => document.body.classList.remove("overlay-open");
  }, [drawerOpen]);

  const addProduct = useCallback((product: Product, configuration: Partial<QuoteItemConfiguration> = {}) => {
    const now = new Date().toISOString();
    setItems((current) => [...current, {
      id: crypto.randomUUID(),
      productId: product.id,
      name: product.name,
      image: product.image,
      quantity: 1,
      configuration: normalizeConfiguration(configuration),
      price: { status: "pending" as const },
      createdAt: now,
      updatedAt: now
    }]);
    setDrawerOpen(true);
  }, []);

  const updateItem = useCallback((id: string, product: Product, configuration: Partial<QuoteItemConfiguration>) => {
    setItems((current) => current.map((item) => item.id === id ? {
      ...item,
      productId: product.id,
      name: product.name,
      image: product.image,
      configuration: normalizeConfiguration(configuration),
      price: { status: "pending" as const },
      updatedAt: new Date().toISOString()
    } : item));
  }, []);

  const duplicateItem = useCallback((id: string) => {
    setItems((current) => {
      const index = current.findIndex((item) => item.id === id);
      if (index < 0) return current;
      const now = new Date().toISOString();
      const duplicate: QuoteItem = {
        ...current[index],
        id: crypto.randomUUID(),
        configuration: cloneConfiguration(current[index].configuration),
        price: { status: "pending" as const },
        createdAt: now,
        updatedAt: now
      };
      return [...current.slice(0, index + 1), duplicate, ...current.slice(index + 1)];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const changeQuantity = useCallback((id: string, delta: number) => {
    setItems((current) => current
      .map((item) => item.id === id ? {
        ...item,
        quantity: Math.max(0, item.quantity + delta),
        price: { status: "pending" as const },
        updatedAt: new Date().toISOString()
      } : item)
      .filter((item) => item.quantity > 0));
  }, []);

  const clearProject = useCallback(() => setItems([]), []);

  const value = useMemo(() => ({
    items,
    count: items.reduce((total, item) => total + item.quantity, 0),
    hydrated,
    drawerOpen,
    setDrawerOpen,
    addProduct,
    updateItem,
    duplicateItem,
    removeItem,
    changeQuantity,
    clearProject
  }), [items, hydrated, drawerOpen, addProduct, updateItem, duplicateItem, removeItem, changeQuantity, clearProject]);

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProject() {
  const value = useContext(ProjectContext);
  if (!value) throw new Error("useProject debe usarse dentro de ProjectProvider");
  return value;
}
