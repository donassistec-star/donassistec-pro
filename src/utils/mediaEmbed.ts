const DIRECT_VIDEO_EXTENSIONS = [
  ".mp4",
  ".webm",
  ".ogg",
  ".mov",
  ".m4v",
  ".m3u8",
];

export type MediaEmbedResult =
  | { kind: "iframe"; src: string; provider: "youtube" | "instagram" | "vimeo" }
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

  if (isDirectVideoUrl(url)) {
    return { kind: "video", src: url };
  }

  return { kind: "unsupported", src: url };
};
