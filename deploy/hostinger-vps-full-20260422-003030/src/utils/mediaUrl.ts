export const normalizeMediaUrl = (url?: string | null) => {
  if (!url) return "";

  try {
    const parsed = new URL(url, window.location.origin);

    if (window.location.protocol === "https:" && parsed.protocol === "http:") {
      parsed.protocol = "https:";
    }

    return parsed.toString();
  } catch {
    return url;
  }
};
