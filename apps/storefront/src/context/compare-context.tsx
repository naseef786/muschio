"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface CompareItem {
  slug: string;
  nameEn: string;
  nameAr?: string;
  brand: string;
  brandType?: "NICHE" | "DESIGNER";
  concentration?: string;
  perfumer?: string;
  perfumerBio?: string;
  origin?: string;
  scentFamily?: string;
  longevity?: string;
  sillage?: string;
  price: number;
  compareAtPrice?: number | null;
  image: string;
  volumeMl?: number;
  variantId?: string;
  topNotes?: string[];
  heartNotes?: string[];
  baseNotes?: string[];
}

interface CompareContextType {
  items: CompareItem[];
  itemCount: number;
  isLoaded: boolean;
  isDockOpen: boolean;
  setIsDockOpen: (open: boolean) => void;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  isInCompare: (slug: string) => boolean;
  toggleCompare: (item: CompareItem) => boolean;
  addItem: (item: CompareItem) => boolean;
  removeItem: (slug: string) => void;
  clearCompare: () => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

const STORAGE_KEY = "muschio_compare";
const MAX_COMPARE_ITEMS = 4;

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CompareItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDockOpen, setIsDockOpen] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setItems(parsed.slice(0, MAX_COMPARE_ITEMS));
        }
      }
    } catch {
      // Ignore localStorage errors
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch {
        // Ignore localStorage errors
      }
    }
  }, [items, isLoaded]);

  const isInCompare = useCallback(
    (slug: string) => items.some((item) => item.slug === slug),
    [items]
  );

  const addItem = useCallback(
    (item: CompareItem): boolean => {
      if (items.some((i) => i.slug === item.slug)) {
        return true;
      }
      if (items.length >= MAX_COMPARE_ITEMS) {
        return false;
      }
      setItems((prev) => [...prev, item]);
      setIsDockOpen(true);
      return true;
    },
    [items]
  );

  const removeItem = useCallback((slug: string) => {
    setItems((prev) => prev.filter((item) => item.slug !== slug));
  }, []);

  const toggleCompare = useCallback(
    (item: CompareItem): boolean => {
      const exists = items.some((i) => i.slug === item.slug);
      if (exists) {
        removeItem(item.slug);
        return false;
      } else {
        return addItem(item);
      }
    },
    [items, addItem, removeItem]
  );

  const clearCompare = useCallback(() => {
    setItems([]);
  }, []);

  return (
    <CompareContext.Provider
      value={{
        items,
        itemCount: items.length,
        isLoaded,
        isDockOpen,
        setIsDockOpen,
        isModalOpen,
        setIsModalOpen,
        isInCompare,
        toggleCompare,
        addItem,
        removeItem,
        clearCompare,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error("useCompare must be used within a CompareProvider");
  }
  return context;
}
