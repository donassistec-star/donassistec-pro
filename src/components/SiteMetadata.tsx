import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useSettings } from "@/hooks/useSettings";

const DEFAULT_TITLE = "DonAssistec - Reconstrução de Telas e Peças para Lojistas";
const DEFAULT_DESCRIPTION =
  "Laboratório premium de reconstrução de telas e revenda de peças para lojistas e assistências técnicas. Peças originais, garantia de 90 dias e atendimento B2B exclusivo.";
const DEFAULT_KEYWORDS =
  "reconstrução de telas, peças para celular, assistência técnica, lojista, B2B, Apple, Samsung, Xiaomi, Motorola";

const upsertMetaByName = (name: string, content: string) => {
  let meta = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);

  if (!meta) {
    meta = document.createElement("meta");
    meta.name = name;
    document.head.appendChild(meta);
  }

  meta.content = content;
};

const upsertMetaByProperty = (property: string, content: string) => {
  let meta = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);

  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("property", property);
    document.head.appendChild(meta);
  }

  meta.content = content;
};

const ensureCanonical = (href: string) => {
  let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');

  if (!link) {
    link = document.createElement("link");
    link.rel = "canonical";
    document.head.appendChild(link);
  }

  link.href = href;
};

const SiteMetadata = () => {
  const location = useLocation();
  const { settings } = useSettings();

  useEffect(() => {
    const title = settings?.seoTitle?.trim() || settings?.siteName?.trim() || DEFAULT_TITLE;
    const description = settings?.seoDescription?.trim() || DEFAULT_DESCRIPTION;
    const keywords = settings?.seoKeywords?.trim() || DEFAULT_KEYWORDS;
    const origin = settings?.siteUrl?.trim() || window.location.origin;
    const pageUrl = new URL(location.pathname, origin).toString();
    const imageUrl =
      settings?.seoOgImage?.trim() || settings?.brandingLogoUrl?.trim() || `${origin}/favicon.ico`;

    document.title = title;
    ensureCanonical(pageUrl);

    upsertMetaByName("description", description);
    upsertMetaByName("keywords", keywords);
    upsertMetaByName("twitter:card", "summary_large_image");
    upsertMetaByName("twitter:url", pageUrl);
    upsertMetaByName("twitter:title", title);
    upsertMetaByName("twitter:description", description);
    upsertMetaByName("twitter:image", imageUrl);

    upsertMetaByProperty("og:type", "website");
    upsertMetaByProperty("og:url", pageUrl);
    upsertMetaByProperty("og:title", title);
    upsertMetaByProperty("og:description", description);
    upsertMetaByProperty("og:image", imageUrl);
    upsertMetaByProperty("og:locale", "pt_BR");
  }, [
    location.pathname,
    settings?.brandingLogoUrl,
    settings?.seoDescription,
    settings?.seoKeywords,
    settings?.seoOgImage,
    settings?.seoTitle,
    settings?.siteName,
    settings?.siteUrl,
  ]);

  return null;
};

export default SiteMetadata;
