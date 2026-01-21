import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { PhoneModel } from "@/data/models";

interface FavoritesContextType {
  favorites: string[];
  addFavorite: (modelId: string) => void;
  removeFavorite: (modelId: string) => void;
  toggleFavorite: (modelId: string) => void;
  isFavorite: (modelId: string) => boolean;
  clearFavorites: () => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const FAVORITES_STORAGE_KEY = "donassistec_favorites";

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return [];
        }
      }
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    }
  }, [favorites]);

  const addFavorite = (modelId: string) => {
    setFavorites((prev) => {
      if (!prev.includes(modelId)) {
        return [...prev, modelId];
      }
      return prev;
    });
  };

  const removeFavorite = (modelId: string) => {
    setFavorites((prev) => prev.filter((id) => id !== modelId));
  };

  const toggleFavorite = (modelId: string) => {
    setFavorites((prev) => {
      if (prev.includes(modelId)) {
        return prev.filter((id) => id !== modelId);
      }
      return [...prev, modelId];
    });
  };

  const isFavorite = (modelId: string) => {
    return favorites.includes(modelId);
  };

  const clearFavorites = () => {
    setFavorites([]);
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addFavorite,
        removeFavorite,
        toggleFavorite,
        isFavorite,
        clearFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error("useFavorites deve ser usado dentro de FavoritesProvider");
  }
  return context;
}
