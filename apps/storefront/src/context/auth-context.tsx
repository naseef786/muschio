"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { muschioApi } from "../lib/api";

export interface SavedAddress {
  id: string;
  label: string; // e.g. "Home Villa", "Dubai Office", "Majlis"
  fullName: string;
  phone: string;
  email?: string;
  country: string; // "AE", "SA", "QA", "KW", "BH", "OM"
  city: string;
  stateOrEmirate: string;
  addressLine1: string;
  isDefault: boolean;
}

export type LoyaltyTier = "PRIVILEGE" | "GOLD_SILLAGE" | "ROYAL_AMBASSADOR";

export interface ClientProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  tier: LoyaltyTier;
  loyaltyPoints: number;
  loyaltyCreditsAed: number;
  joinedDate: string;
}

interface AuthContextType {
  user: ClientProfile | null;
  isLoggedIn: boolean;
  savedAddresses: SavedAddress[];
  defaultAddress: SavedAddress | null;
  login: (email: string, password?: string) => Promise<boolean>;
  signup: (data: { name: string; email: string; phone?: string; password?: string }) => Promise<boolean>;
  logout: () => void;
  saveAddress: (address: Omit<SavedAddress, "id"> & { id?: string }) => SavedAddress;
  updateAddress: (id: string, address: Partial<SavedAddress>) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  redeemedLoyaltyCredits: number;
  setRedeemedLoyaltyCredits: (amount: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);



function deduplicateAddressList(list: SavedAddress[]): SavedAddress[] {
  const seen = new Set<string>();
  const unique: SavedAddress[] = [];
  for (const addr of list) {
    const street = (addr.addressLine1 || "").trim().toLowerCase();
    const city = (addr.city || "").trim().toLowerCase();
    const country = (addr.country || "AE").trim().toUpperCase();
    const key = `${street}|${city}|${country}`;
    if (street && !seen.has(key)) {
      seen.add(key);
      unique.push(addr);
    }
  }
  return unique;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ClientProfile | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [redeemedLoyaltyCredits, setRedeemedLoyaltyCredits] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load user and addresses from localStorage on client mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("muschio_client_user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }

      const storedAddresses = localStorage.getItem("muschio_client_addresses");
      if (storedAddresses) {
        const parsed = JSON.parse(storedAddresses);
        if (Array.isArray(parsed)) {
          setSavedAddresses(deduplicateAddressList(parsed));
        }
      }
    } catch {
      // Ignore local storage parse errors
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Sync fresh profile from live backend if logged in
  useEffect(() => {
    if (!isLoaded || !user?.email) return;
    let active = true;

    muschioApi.getCustomerProfile().then((res) => {
      if (!active || !res?.customer) return;
      setUser((currentUser) => {
        if (!currentUser) return null;
        const fallbackName = `${res.customer.firstName || ""} ${res.customer.lastName || ""}`.trim() || currentUser.name;
        return {
          id: res.customer.id,
          name: res.customer.name || fallbackName,
          email: res.customer.email,
          phone: res.customer.phone || currentUser.phone,
          tier: res.customer.tier,
          loyaltyPoints: res.customer.loyaltyPoints,
          loyaltyCreditsAed: res.customer.loyaltyCreditsAed,
          joinedDate: res.customer.joinedDate,
        };
      });

      if (res.addresses && res.addresses.length > 0) {
        const formatted: SavedAddress[] = res.addresses.map((a: any) => ({
          id: a.id,
          label: a.label || (a.countryCode === "AE" ? "Dubai Address" : "GCC Residence"),
          fullName: a.fullName,
          phone: a.phone,
          email: a.email || res.customer.email,
          country: a.countryCode || "AE",
          city: a.city,
          stateOrEmirate: a.emirateState || a.city,
          addressLine1: a.streetAddress,
          isDefault: Boolean(a.isDefault),
        }));
        setSavedAddresses(deduplicateAddressList(formatted));
      }
    }).catch(() => {});

    return () => {
      active = false;
    };
  }, [isLoaded, user?.email]);

  // Sync to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      if (user) {
        localStorage.setItem("muschio_client_user", JSON.stringify(user));
      } else {
        localStorage.removeItem("muschio_client_user");
      }
    } catch {}
  }, [user, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem("muschio_client_addresses", JSON.stringify(savedAddresses));
    } catch {}
  }, [savedAddresses, isLoaded]);

  const login = useCallback(async (email: string, password?: string): Promise<boolean> => {
    try {
      const backendRes = await muschioApi.loginCustomer(email, password);
      if (backendRes?.customer) {
        const client: ClientProfile = {
          id: backendRes.customer.id,
          name: backendRes.customer.name || email.split("@")[0] || "Private Client",
          email: backendRes.customer.email,
          phone: backendRes.customer.phone || "+971 50 123 4567",
          tier: backendRes.customer.tier,
          loyaltyPoints: backendRes.customer.loyaltyPoints,
          loyaltyCreditsAed: backendRes.customer.loyaltyCreditsAed,
          joinedDate: backendRes.customer.joinedDate,
        };
        setUser(client);

        if (backendRes.addresses?.length) {
          const formatted: SavedAddress[] = backendRes.addresses.map((a: any) => ({
            id: a.id,
            label: a.label || (a.countryCode === "AE" ? "Dubai Address" : "GCC Residence"),
            fullName: a.fullName,
            phone: a.phone,
            email: a.email || client.email,
            country: a.countryCode || "AE",
            city: a.city,
            stateOrEmirate: a.emirateState || a.city,
            addressLine1: a.streetAddress,
            isDefault: Boolean(a.isDefault),
          }));
          setSavedAddresses(formatted);
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const signup = useCallback(
    async (data: { name: string; email: string; phone?: string; password?: string }): Promise<boolean> => {
      try {
        const backendRes = await muschioApi.registerCustomer(data);
        if (backendRes?.customer) {
          const client: ClientProfile = {
            id: backendRes.customer.id,
            name: backendRes.customer.name || data.name,
            email: backendRes.customer.email,
            phone: backendRes.customer.phone || data.phone || "+971 50 000 0000",
            tier: backendRes.customer.tier,
            loyaltyPoints: backendRes.customer.loyaltyPoints,
            loyaltyCreditsAed: backendRes.customer.loyaltyCreditsAed,
            joinedDate: backendRes.customer.joinedDate,
          };
          setUser(client);
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    [],
  );

  const logout = useCallback(() => {
    setUser(null);
    setRedeemedLoyaltyCredits(0);
    localStorage.removeItem("muschio_client_user");
    localStorage.removeItem("muschio_session_token");
  }, []);

  const saveAddress = useCallback(
    (addrInput: Omit<SavedAddress, "id"> & { id?: string }): SavedAddress => {
      const street = (addrInput.addressLine1 || "").trim().toLowerCase();
      const city = (addrInput.city || "").trim().toLowerCase();
      const country = (addrInput.country || "AE").trim().toUpperCase();
      const normKey = `${street}|${city}|${country}`;

      let returnedAddress: SavedAddress | null = null;

      setSavedAddresses((prev) => {
        const existingIdx = prev.findIndex((a) => {
          if (addrInput.id && a.id === addrInput.id) return true;
          const aKey = `${(a.addressLine1 || "").trim().toLowerCase()}|${(a.city || "").trim().toLowerCase()}|${(a.country || "AE").trim().toUpperCase()}`;
          return aKey === normKey;
        });

        let updated: SavedAddress[];
        const target = existingIdx > -1 ? prev[existingIdx] : undefined;
        if (target) {
          const merged: SavedAddress = {
            ...target,
            ...addrInput,
            id: target.id,
            label: addrInput.label || target.label,
            isDefault: addrInput.isDefault ?? target.isDefault,
          };
          returnedAddress = merged;
          updated = prev.map((a, i) => (i === existingIdx ? merged : a));
        } else {
          const newAddress: SavedAddress = {
            ...addrInput,
            id: addrInput.id || `addr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            label: addrInput.label || (addrInput.country === "AE" ? "Dubai Address" : "GCC Residence"),
            isDefault: addrInput.isDefault ?? (prev.length === 0),
          };
          returnedAddress = newAddress;
          updated = [newAddress, ...prev];
        }

        // If this address is default, unmark others
        if (addrInput.isDefault) {
          const targetId = returnedAddress?.id;
          updated = updated.map((a) => (a.id === targetId ? { ...a, isDefault: true } : { ...a, isDefault: false }));
        }

        return deduplicateAddressList(updated);
      });

      // Sync with backend if client is signed in
      if (user && street) {
        muschioApi
          .createSavedAddress({
            fullName: addrInput.fullName,
            phone: addrInput.phone,
            email: addrInput.email || user.email,
            streetAddress: addrInput.addressLine1,
            city: addrInput.city,
            emirateState: addrInput.stateOrEmirate,
            countryCode: addrInput.country || "AE",
            isDefault: addrInput.isDefault,
            label: addrInput.label,
          })
          .then((created) => {
            if (created?.id) {
              setSavedAddresses((prev) =>
                deduplicateAddressList(
                  prev.map((a) => (a.id === returnedAddress?.id ? { ...a, id: created.id } : a)),
                ),
              );
            }
          })
          .catch(() => {});
      }

      return (
        returnedAddress || {
          ...addrInput,
          id: addrInput.id || `addr-${Date.now()}`,
          label: addrInput.label || "Dubai Address",
          isDefault: false,
        }
      );
    },
    [user],
  );

  const updateAddress = useCallback(
    (id: string, partial: Partial<SavedAddress>) => {
      setSavedAddresses((prev) =>
        prev.map((a) => {
          if (a.id === id) {
            return { ...a, ...partial };
          }
          if (partial.isDefault) {
            return { ...a, isDefault: false };
          }
          return a;
        }),
      );

      if (user && !id.startsWith("addr-")) {
        muschioApi
          .updateSavedAddress(id, {
            fullName: partial.fullName,
            phone: partial.phone,
            email: partial.email,
            streetAddress: partial.addressLine1,
            city: partial.city,
            emirateState: partial.stateOrEmirate,
            countryCode: partial.country,
            isDefault: partial.isDefault,
            label: partial.label,
          })
          .catch(() => {});
      }
    },
    [user],
  );

  const deleteAddress = useCallback(
    (id: string) => {
      setSavedAddresses((prev) => {
        const filtered = prev.filter((a) => a.id !== id);
        const hadDefault = prev.find((a) => a.id === id)?.isDefault;
        if (hadDefault && filtered.length > 0 && filtered[0]) {
          filtered[0].isDefault = true;
        }
        return filtered;
      });
      if (user && !id.startsWith("addr-")) {
        muschioApi.deleteSavedAddress(id).catch(() => {});
      }
    },
    [user],
  );

  const setDefaultAddress = useCallback(
    (id: string) => {
      setSavedAddresses((prev) =>
        prev.map((a) => ({
          ...a,
          isDefault: a.id === id,
        })),
      );
      if (user && !id.startsWith("addr-")) {
        muschioApi.setDefaultSavedAddress(id).catch(() => {});
      }
    },
    [user],
  );

  const defaultAddress = savedAddresses.find((a) => a.isDefault) || savedAddresses[0] || null;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: Boolean(user),
        savedAddresses,
        defaultAddress,
        login,
        signup,
        logout,
        saveAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        redeemedLoyaltyCredits,
        setRedeemedLoyaltyCredits,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
