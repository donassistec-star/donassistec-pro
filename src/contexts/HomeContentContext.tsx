import { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  defaultHomeContent,
  HomeContent,
} from "@/data/homeContent";
import { homeContentService } from "@/services/homeContentService";

interface HomeContentContextType {
  content: HomeContent;
  loading: boolean;
  updateContent: (partial: Partial<HomeContent>) => Promise<void>;
  resetContent: () => Promise<void>;
}

const HomeContentContext = createContext<HomeContentContextType | undefined>(
  undefined
);

const STORAGE_KEY = "donassistec_home_content_v1";

export const HomeContentProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [content, setContent] = useState<HomeContent>(defaultHomeContent);
  const [loading, setLoading] = useState(true);
  const contentRef = useRef<HomeContent>(defaultHomeContent);
  const lastRequestIdRef = useRef(0);

  useEffect(() => {
    const loadContent = async () => {
      try {
        setLoading(true);
        
        // Tentar buscar da API primeiro
        const apiContent = await homeContentService.get();
        
        if (apiContent) {
          const mergedContent = { ...defaultHomeContent, ...apiContent };
          contentRef.current = mergedContent;
          setContent(mergedContent);
          // Sincronizar com localStorage como backup
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedContent));
          } catch (error) {
            console.error("Erro ao salvar no localStorage:", error);
          }
        } else {
          // Fallback para localStorage se API não disponível
          try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
              const parsed = JSON.parse(stored) as HomeContent;
              const mergedContent = { ...defaultHomeContent, ...parsed };
              contentRef.current = mergedContent;
              setContent(mergedContent);
            }
          } catch (error) {
            console.error("Erro ao carregar do localStorage:", error);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar conteúdo da home:", error);
        // Fallback para localStorage em caso de erro
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            const parsed = JSON.parse(stored) as HomeContent;
            const mergedContent = { ...defaultHomeContent, ...parsed };
            contentRef.current = mergedContent;
            setContent(mergedContent);
          }
        } catch (storageError) {
          console.error("Erro ao carregar do localStorage:", storageError);
        }
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, []);

  const persist = async (next: HomeContent) => {
    const requestId = ++lastRequestIdRef.current;
    contentRef.current = next;
    setContent(next);
    
    // Tentar salvar na API primeiro
    try {
      const updated = await homeContentService.update(next);
      if (updated) {
        const mergedContent = { ...defaultHomeContent, ...updated };
        if (requestId === lastRequestIdRef.current) {
          contentRef.current = mergedContent;
          setContent(mergedContent);
        }
        // Se API funcionou, sincronizar localStorage
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedContent));
        } catch (error) {
          console.error("Erro ao salvar no localStorage:", error);
        }
        return;
      }
    } catch (error) {
      console.error("Erro ao salvar na API, usando localStorage:", error);
    }
    
    // Fallback para localStorage se API não disponível
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (error) {
      console.error("Erro ao salvar no localStorage:", error);
    }
  };

  const updateContent = async (partial: Partial<HomeContent>) => {
    const next = { ...contentRef.current, ...partial };
    await persist(next);
  };

  const resetContent = async () => {
    // Tentar resetar na API também
    try {
      const updated = await homeContentService.update(defaultHomeContent);
      if (updated) {
        const mergedContent = { ...defaultHomeContent, ...updated };
        contentRef.current = mergedContent;
        setContent(mergedContent);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedContent));
        } catch (error) {
          console.error("Erro ao salvar no localStorage:", error);
        }
        return;
      }
    } catch (error) {
      console.error("Erro ao resetar na API, usando localStorage:", error);
    }
    
    // Fallback para localStorage
    contentRef.current = defaultHomeContent;
    setContent(defaultHomeContent);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultHomeContent));
    } catch (error) {
      console.error("Erro ao salvar no localStorage:", error);
    }
  };

  return (
    <HomeContentContext.Provider value={{ content, loading, updateContent, resetContent }}>
      {children}
    </HomeContentContext.Provider>
  );
};

export const useHomeContent = () => {
  const ctx = useContext(HomeContentContext);
  if (!ctx) {
    throw new Error("useHomeContent deve ser usado dentro de HomeContentProvider");
  }
  return ctx;
};
