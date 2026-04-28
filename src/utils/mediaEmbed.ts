const DIRECT_VIDEO_EXTENSIONS = [
  ".mp4",
  ".webm",
  ".ogg",
  ".mov",
  ".m4v",
  ".m3u8",
];

export type MediaEmbedResult =
  | { kind: "iframe"; src: string; provider: "youtube" | "instagram" | "vimeo" | "facebook" | "tiktok" | "kwai" }
  | { kind: "video"; src: string }
  | { kind: "unsupported"; src: string };

const isDirectVideoUrl = (value: string) => {
  const normalized = value.toLowerCase().split("?")[0].split("#")[0];
  return DIRECT_VIDEO_EXTENSIONS.some((extension) => normalized.endsWith(extension));
};

const getYouTubeEmbedUrl = (url: string, autoplay = false) => {
  let videoId = "";

  if (url.includes("youtube.com/watch?v=")) {
    videoId = url.split("v=")[1]?.split("&")[0] || "";
  } else if (url.includes("youtu.be/")) {
    videoId = url.split("youtu.be/")[1]?.split("?")[0] || "";
  } else if (url.includes("youtube.com/shorts/")) {
    videoId = url.split("youtube.com/shorts/")[1]?.split("?")[0] || "";
  } else if (url.includes("youtube.com/embed/")) {
    return url;
  }

  if (!videoId) return null;

  const params = new URLSearchParams();
  if (autoplay) params.set("autoplay", "1");
  params.set("mute", "1");
  params.set("loop", "1");
  params.set("playlist", videoId);

  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
};

const getInstagramEmbedUrl = (url: string) => {
  try {
    const parsed = new URL(url);

    if (!parsed.hostname.includes("instagram.com")) {
      return null;
    }

    const cleanPath = parsed.pathname.replace(/\/$/, "");
    if (!/^\/(reel|p|tv)\//.test(cleanPath)) {
      return null;
    }

    return `https://www.instagram.com${cleanPath}/embed`;
  } catch {
    return null;
  }
};

const getVimeoEmbedUrl = (url: string, autoplay = false) => {
  try {
    const parsed = new URL(url);

    if (parsed.hostname === "player.vimeo.com") {
      return url;
    }

    if (!parsed.hostname.includes("vimeo.com")) {
      return null;
    }

    const match = parsed.pathname.match(/\/(\d+)(?:$|\/)/);
    if (!match) return null;

    const params = new URLSearchParams();
    if (autoplay) params.set("autoplay", "1");
    params.set("muted", "1");
    params.set("loop", "1");

    return `https://player.vimeo.com/video/${match[1]}?${params.toString()}`;
  } catch {
    return null;
  }
};

const getFacebookEmbedUrl = (url: string) => {
  try {
    const parsed = new URL(url);

    // facebook.com/watch/?v= or facebook.com/watch?v=
    if (url.includes("facebook.com/watch/")) {
      const videoId = url.split("v=")[1]?.split("&")[0] || url.split("watch/")[1]?.split("?")[0];
      if (videoId) {
        return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=0&width=auto`;
      }
    }

    // facebook.com/reel/ or facebook.com/p/
    if (url.includes("facebook.com/reel/") || url.includes("facebook.com/p/")) {
      const videoId = parsed.pathname.split("/").filter(Boolean).pop();
      if (videoId) {
        return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=0&width=auto`;
      }
    }

    // fb.watch short URL
    if (url.includes("fb.watch/")) {
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=0&width=auto`;
    }

    return null;
  } catch {
    return null;
  }
};

const getTikTokEmbedUrl = (url: string) => {
  try {
    const parsed = new URL(url);

    if (!parsed.hostname.includes("tiktok.com")) {
      return null;
    }

    // Remove trailing slash and get clean path
    const cleanPath = parsed.pathname.replace(/\/$/, "");

    // Must be a video path (not profile)
    if (!/\/video\/\d+/.test(cleanPath) && !cleanPath.includes("@")) {
      return null;
    }

    // Use the embed endpoint
    return `https://www.tiktok.com/embed/v2/${cleanPath.split("/video/")[1]?.split("/")[0] || ""}`;
  } catch {
    return null;
  }
};

const getKwaiEmbedUrl = (url: string) => {
  try {
    const parsed = new URL(url);

    if (!parsed.hostname.includes("kwai.com") && !parsed.hostname.includes("kuaishou.com")) {
      return null;
    }

    // Extract video ID from various Kwai URL formats
    const videoIdMatch = url.match(/\/short-video\/(\d+)|\/v\?.*videoId=(\d+)|\/short\/(\d+)/);
    if (videoIdMatch) {
      const videoId = videoIdMatch[1] || videoIdMatch[2] || videoIdMatch[3];
      if (videoId) {
        return `https://www.kwai.com/embed/${videoId}`;
      }
    }

    return null;
  } catch {
    return null;
  }
};

export const resolveMediaEmbed = (
  rawUrl: string,
  options?: { autoplay?: boolean },
): MediaEmbedResult => {
  const url = rawUrl.trim();
  const autoplay = options?.autoplay === true;

  if (!url) {
    return { kind: "unsupported", src: "" };
  }

  const youtube = getYouTubeEmbedUrl(url, autoplay);
  if (youtube) {
    return { kind: "iframe", src: youtube, provider: "youtube" };
  }

  const instagram = getInstagramEmbedUrl(url);
  if (instagram) {
    return { kind: "iframe", src: instagram, provider: "instagram" };
  }

  const vimeo = getVimeoEmbedUrl(url, autoplay);
  if (vimeo) {
    return { kind: "iframe", src: vimeo, provider: "vimeo" };
  }

  const facebook = getFacebookEmbedUrl(url);
  if (facebook) {
    return { kind: "iframe", src: facebook, provider: "facebook" };
  }

  const tiktok = getTikTokEmbedUrl(url);
  if (tiktok) {
    return { kind: "iframe", src: tiktok, provider: "tiktok" };
  }

  const kwai = getKwaiEmbedUrl(url);
  if (kwai) {
    return { kind: "iframe", src: kwai, provider: "kwai" };
  }

  if (isDirectVideoUrl(url)) {
    return { kind: "video", src: url };
  }

  return { kind: "unsupported", src: url };
};
