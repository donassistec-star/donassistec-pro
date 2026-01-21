import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { PhoneModel } from "@/data/models";

interface CartItem {
  model: PhoneModel;
  services: {
    reconstruction?: boolean;
    glassReplacement?: boolean;
    partsAvailable?: boolean;
  };
  quantity: number;
  notes?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (model: PhoneModel, services: CartItem["services"], quantity?: number, notes?: string) => void;
  removeItem: (modelId: string) => void;
  updateItem: (modelId: string, updates: Partial<CartItem>) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getItemCount: (modelId: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "donassistec_cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return [];
        }
      }
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items]);

  const addItem = (model: PhoneModel, services: CartItem["services"], quantity = 1, notes?: string) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.model.id === model.id);
      
      if (existingIndex >= 0) {
        // Atualiza item existente
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
          services: { ...updated[existingIndex].services, ...services },
          notes: notes || updated[existingIndex].notes,
        };
        return updated;
      }
      
      // Adiciona novo item
      return [...prev, { model, services, quantity, notes }];
    });
  };

  const removeItem = (modelId: string) => {
    setItems((prev) => prev.filter((item) => item.model.id !== modelId));
  };

  const updateItem = (modelId: string, updates: Partial<CartItem>) => {
    setItems((prev) =>
      prev.map((item) =>
        item.model.id === modelId ? { ...item, ...updates } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getItemCount = (modelId: string) => {
    const item = items.find((item) => item.model.id === modelId);
    return item?.quantity || 0;
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateItem,
        clearCart,
        getTotalItems,
        getItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
