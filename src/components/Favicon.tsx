import { useEffect, useState } from "react";

const FAVICON_ENDPOINT = "/api/settings/favicon";
const FAVICON_EVENT = "branding:favicon-updated";

const ensureHeadLink = (selector: string, rel: string) => {
  const existing = document.querySelector<HTMLLinkElement>(selector);
  if (existing) return existing;

  const link = document.createElement("link");
  link.rel = rel;
  document.head.appendChild(link);
  return link;
};

const applyFavicon = (version: number) => {
  const suffix = version ? `?v=${version}` : "";
  const href = `${FAVICON_ENDPOINT}${suffix}`;

  const iconLink = ensureHeadLink('link[rel="icon"]#dynamic-favicon', "icon");
  iconLink.id = "dynamic-favicon";
  iconLink.href = href;

  const shortcutLink = ensureHeadLink('link[rel="shortcut icon"]', "shortcut icon");
  shortcutLink.href = href;

  const appleLink = ensureHeadLink(
    'link[rel="apple-touch-icon"]#dynamic-apple-touch-icon',
    "apple-touch-icon"
  );
  appleLink.id = "dynamic-apple-touch-icon";
  appleLink.href = href;
};

const Favicon = () => {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    applyFavicon(version);
  }, [version]);

  useEffect(() => {
    const handleFaviconUpdated = () => {
      setVersion(Date.now());
    };

    window.addEventListener(FAVICON_EVENT, handleFaviconUpdated);
    return () => {
      window.removeEventListener(FAVICON_EVENT, handleFaviconUpdated);
    };
  }, []);

  return null;
};

export default Favicon;
