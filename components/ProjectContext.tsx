"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { products } from "@/data/products";
import type { Product, QuoteItem } from "@/types/catalog";

type ProjectContextValue = {
  items: QuoteItem[];
  count: number;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  addProduct: (product: Product, options?: { finish?: string; measures?: string; unitPrice?: number }) => void;
  removeItem: (id: string) => void;
  changeQuantity: (id: string, delta: number) => void;
  clearProject: () => void;
};

const ProjectContext = createContext<ProjectContextValue | null>(null);
const STORAGE_KEY = "irp-project-v2";

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as QuoteItem[];
        setItems(parsed.map((item) => ({
          ...item,
          unitPrice: Number.isFinite(item.unitPrice)
            ? item.unitPrice
            : products.find((product) => product.id === item.productId)?.price ?? 0
        })));
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [hydrated, items]);

  useEffect(() => {
    document.body.classList.toggle("overlay-open", drawerOpen);
    return () => document.body.classList.remove("overlay-open");
  }, [drawerOpen]);

  const addProduct = useCallback((product: Product, options?: { finish?: string; measures?: string; unitPrice?: number }) => {
    setItems((current) => {
      const existing = current.find((item) =>
        item.productId === product.id &&
        item.finish === options?.finish &&
        item.measures === options?.measures
      );
      if (existing) {
        return current.map((item) =>
          item.id === existing.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...current, {
        id: crypto.randomUUID(),
        productId: product.id,
        name: product.name,
        image: product.image,
        quantity: 1,
        finish: options?.finish,
        measures: options?.measures,
        unitPrice: options?.unitPrice ?? product.price
      }];
    });
    setDrawerOpen(true);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const changeQuantity = useCallback((id: string, delta: number) => {
    setItems((current) =>
      current
        .map((item) => item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item)
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const value = useMemo(() => ({
    items,
    count: items.reduce((total, item) => total + item.quantity, 0),
    drawerOpen,
    setDrawerOpen,
    addProduct,
    removeItem,
    changeQuantity,
    clearProject: () => setItems([])
  }), [items, drawerOpen, addProduct, removeItem, changeQuantity]);

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProject() {
  const value = useContext(ProjectContext);
  if (!value) throw new Error("useProject debe usarse dentro de ProjectProvider");
  return value;
}
