"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { muschioApi } from "../lib/api";

export interface CartItemModel {
  id: string;
  variantId: string;
  slug: string;
  title: string;
  titleAr: string;
  brand: string;
  price: number;
  compareAtPrice?: number | null;
  quantity: number;
  image: string;
  sizeLabel?: string;
}

interface CartContextType {
  items: CartItemModel[];
  addItem: (item: Omit<CartItemModel, "id"> & { id?: string }) => Promise<void>;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  subtotal: number;
  shipping: number;
  total: number;
  itemCount: number;
  cartDrawerOpen: boolean;
  setCartDrawerOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const INITIAL_CART: CartItemModel[] = [
  {
    id: "cart-1",
    variantId: "v1-amo-int53",
    slug: "amouage-interlude-53-man",
    title: "Interlude 53 Man Extrait de Parfum (100ml)",
    titleAr: "إنترلود 53 مان إكستري دو بارفان (100 مل)",
    brand: "Amouage",
    price: 1850,
    compareAtPrice: 2100,
    quantity: 1,
    image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=400&q=80",
    sizeLabel: "100ml Extrait",
  },
];

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItemModel[]>(INITIAL_CART);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("muschio_cart");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setItems(parsed);
        }
      }
    } catch (e) {
      // Ignore localStorage errors
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem("muschio_cart", JSON.stringify(items));
      } catch (e) {
        // Ignore
      }
    }
  }, [items, isLoaded]);

  const addItem = async (newItem: Omit<CartItemModel, "id"> & { id?: string }) => {
    const existingIndex = items.findIndex(
      (item) => item.variantId === newItem.variantId || (item.slug === newItem.slug && item.sizeLabel === newItem.sizeLabel)
    );

    if (existingIndex > -1) {
      setItems((prev) =>
        prev.map((item, idx) =>
          idx === existingIndex ? { ...item, quantity: item.quantity + (newItem.quantity || 1) } : item
        )
      );
    } else {
      const generatedId = newItem.id || `cart-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      setItems((prev) => [...prev, { ...newItem, id: generatedId, quantity: newItem.quantity || 1 }]);
    }

    // Try posting to live backend
    try {
      if (newItem.variantId && newItem.variantId.length > 10) {
        await muschioApi.addToCart({
          variantId: newItem.variantId,
          quantity: newItem.quantity || 1,
        });
      }
    } catch (e) {
      // Graceful offline fallback
    }

    setCartDrawerOpen(true);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQ = item.quantity + delta;
            return newQ > 0 ? { ...item, quantity: newQ } : null;
          }
          return item;
        })
        .filter((item): item is CartItemModel => item !== null)
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 500 || subtotal === 0 ? 0 : 35;
  const total = subtotal + shipping;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        subtotal,
        shipping,
        total,
        itemCount,
        cartDrawerOpen,
        setCartDrawerOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
