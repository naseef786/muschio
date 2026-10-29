"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { z } from "zod";
const SavedItemSchema = z.object({
  id: z.string().min(1).max(100),
  variantId: z.string().min(1).max(100),
  slug: z.string().min(1),
  title: z.string(),
  titleAr: z.string(),
  brand: z.string(),
  price: z.number().finite().positive(),
  compareAtPrice: z.number().finite().positive().nullable().optional(),
  quantity: z.number().int().min(1).max(99),
  image: z
    .string()
    .refine((value) => value.startsWith("/") || /^https:\/\//.test(value)),
  sizeLabel: z.string().optional(),
  volume: z.string().optional(),
  stockQuantity: z.number().int().nonnegative().optional(),
});

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
  volume?: string;
  stockQuantity?: number;
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

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItemModel[]>([]);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("muschio_cart");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setItems(
            parsed.flatMap((item) => {
              const result = SavedItemSchema.safeParse(item);
              return result.success ? [result.data] : [];
            }),
          );
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

  const addItem = async (
    newItem: Omit<CartItemModel, "id"> & { id?: string },
  ) => {
    setItems((items) => {
      // Grouping: strictly by variantId or slug + volume/sizeLabel
      // Different bottle sizes of the same perfume are treated as distinct cart items!
      const existingIndex = items.findIndex(
        (item) =>
          item.variantId === newItem.variantId ||
          (item.slug === newItem.slug && (item.volume || item.sizeLabel) === (newItem.volume || newItem.sizeLabel)),
      );

      const maxStock = newItem.stockQuantity ?? 99;

      if (existingIndex > -1) {
        return items.map((item, idx) => {
          if (idx !== existingIndex) return item;
          const currentLimit = item.stockQuantity ?? maxStock;
          const requestedTotal = item.quantity + (newItem.quantity || 1);
          const finalQ = Math.min(Math.min(99, currentLimit), requestedTotal);
          return {
            ...item,
            quantity: finalQ,
            volume: newItem.volume || item.volume,
            stockQuantity: item.stockQuantity ?? newItem.stockQuantity,
          };
        });
      } else {
        const generatedId =
          newItem.id ||
          `cart-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        const initialQ = Math.min(Math.min(99, maxStock), newItem.quantity || 1);
        return [
          ...items,
          { ...newItem, id: generatedId, quantity: initialQ },
        ];
      }
    });

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
            const maxAllowed = Math.min(99, item.stockQuantity ?? 99);
            const newQ = Math.min(maxAllowed, item.quantity + delta);
            return newQ > 0 ? { ...item, quantity: newQ } : null;
          }
          return item;
        })
        .filter((item): item is CartItemModel => item !== null),
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
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
