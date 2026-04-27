import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { PhoneModel } from "@/data/models";

/** Serviço ou peça selecionada pelo lojista no modelo (com preço para orçamento) */
export interface SelectedService {
  service_id: string;
  name: string;
  price: number;
}

interface CartItem {
  model: PhoneModel;
  services: {
    reconstruction?: boolean;
    glassReplacement?: boolean;
    partsAvailable?: boolean;
  };
  quantity: number;
  notes?: string;
  /** Serviços/peças escolhidos pelo lojista (com preço). Se vazio, orçamento sob consulta. */
  selectedServices?: SelectedService[];
}

function selectionKey(selected?: SelectedService[]): string {
  if (!selected || selected.length === 0) return "";
  return selected
    .map((s) => s.service_id)
    .sort()
    .join(",");
}

interface CartContextType {
  items: CartItem[];
  addItem: (model: PhoneModel, services: CartItem["services"], quantity?: number, notes?: string, selectedServices?: SelectedService[]) => void;
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

  const addItem = (
    model: PhoneModel,
    services: CartItem["services"],
    quantity = 1,
    notes?: string,
    selectedServices?: SelectedService[]
  ) => {
    setItems((prev) => {
      const key = selectionKey(selectedServices);
      const existingIndex = prev.findIndex(
        (item) => item.model.id === model.id && selectionKey(item.selectedServices) === key
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
          services: { ...updated[existingIndex].services, ...services },
          notes: notes || updated[existingIndex].notes,
          selectedServices: selectedServices ?? updated[existingIndex].selectedServices,
        };
        return updated;
      }

      return [...prev, { model, services, quantity, notes, selectedServices }];
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
