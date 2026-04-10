import { useEffect } from "react";
import { useSettings } from "@/hooks/useSettings";
import { normalizeMediaUrl } from "@/utils/mediaUrl";

/**
 * Componente para atualizar dinamicamente o favicon
 * Baseado nas configurações do sistema
 */
const Favicon = () => {
  const { settings, loading } = useSettings();

  useEffect(() => {
    if (loading) return;

    // Remover favicons existentes
    const existingFavicons = document.querySelectorAll('link[rel*="icon"]');
    existingFavicons.forEach((link) => link.remove());

    // Adicionar novo favicon se configurado
    if (settings?.brandingLogoFavicon) {
      const faviconUrl = normalizeMediaUrl(settings.brandingLogoFavicon);
      const link = document.createElement("link");
      link.rel = "icon";
      link.type = "image/x-icon";
      link.href = faviconUrl;
      document.head.appendChild(link);

      // Também adicionar apple-touch-icon
      const appleLink = document.createElement("link");
      appleLink.rel = "apple-touch-icon";
      appleLink.href = faviconUrl;
      document.head.appendChild(appleLink);
    } else {
      // Fallback para favicon padrão se não configurado
      const link = document.createElement("link");
      link.rel = "icon";
      link.type = "image/x-icon";
      link.href = "/favicon.ico";
      document.head.appendChild(link);
    }
  }, [settings?.brandingLogoFavicon, loading]);

  return null; // Componente não renderiza nada visual
};

export default Favicon;
