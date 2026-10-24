"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface WishlistItem {
  slug: string;
  nameEn: string;
  nameAr?: string;
  brand: string;
  brandType?: "NICHE" | "DESIGNER";
  concentration?: string;
  price: number;
  compareAtPrice?: number | null;
  image: string;
  variantId?: string;
}

interface WishlistContextType {
  items: WishlistItem[];
  itemCount: number;
  isLoaded: boolean;
  isInWishlist: (slug: string) => boolean;
  toggleWishlist: (item: WishlistItem) => boolean;
  addItem: (item: WishlistItem) => void;
  removeItem: (slug: string) => void;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const STORAGE_KEY = "muschio_wishlist";

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch {
      // Ignore localStorage errors
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch {
        // Ignore localStorage errors
      }
    }
  }, [items, isLoaded]);

  const isInWishlist = useCallback(
    (slug: string) => {
      return items.some((item) => item.slug === slug);
    },
    [items]
  );

  const addItem = useCallback((item: WishlistItem) => {
    setItems((prev) => {
      if (prev.some((i) => i.slug === item.slug)) return prev;
      return [item, ...prev];
    });
  }, []);

  const removeItem = useCallback((slug: string) => {
    setItems((prev) => prev.filter((item) => item.slug !== slug));
  }, []);

  const toggleWishlist = useCallback(
    (item: WishlistItem): boolean => {
      let isAdded = false;
      setItems((prev) => {
        const exists = prev.some((i) => i.slug === item.slug);
        if (exists) {
          isAdded = false;
          return prev.filter((i) => i.slug !== item.slug);
        } else {
          isAdded = true;
          return [item, ...prev];
        }
      });
      return isAdded;
    },
    []
  );

  const clearWishlist = useCallback(() => {
    setItems([]);
  }, []);

  return (
    <WishlistContext.Provider
      value={{
        items,
        itemCount: items.length,
        isLoaded,
        isInWishlist,
        toggleWishlist,
        addItem,
        removeItem,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
