import { settingsService } from "./settingsService";
import { normalizeMediaUrl } from "@/utils/mediaUrl";

export interface RetailerTrainingVideo {
  id: string;
  title: string;
  description?: string;
  url: string;
  thumbnail?: string;
  duration?: string;
  category?: string;
  order: number;
  published: boolean;
}

const SETTINGS_KEY = "retailerTrainingVideos";

const buildFallbackId = (
  video: Partial<RetailerTrainingVideo>,
  index: number
) => {
  const source = [video.title, video.url, video.category, index]
    .filter(Boolean)
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return source || `video-${index}`;
};

const normalizeVideo = (
  video: Partial<RetailerTrainingVideo>,
  index: number
): RetailerTrainingVideo => ({
  id: String(video.id || buildFallbackId(video, index)),
  title: String(video.title || "").trim(),
  description: String(video.description || "").trim(),
  url: String(video.url || "").trim(),
  thumbnail: normalizeMediaUrl(String(video.thumbnail || "").trim()),
  duration: String(video.duration || "").trim(),
  category: String(video.category || "").trim(),
  order:
    typeof video.order === "number" && Number.isFinite(video.order)
      ? video.order
      : index,
  published: video.published !== false,
});

export const parseRetailerTrainingVideos = (
  rawValue?: string
): RetailerTrainingVideo[] => {
  if (!rawValue) return [];

  try {
    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item, index) => normalizeVideo(item, index))
      .filter((item) => item.title && item.url)
      .sort((a, b) => a.order - b.order);
  } catch {
    return [];
  }
};

export const serializeRetailerTrainingVideos = (
  videos: RetailerTrainingVideo[]
): string =>
  JSON.stringify(
    videos.map((video, index) => ({
      ...normalizeVideo(video, index),
      order: index,
    }))
  );

export const retailerTrainingVideosService = {
  async getPublic(): Promise<RetailerTrainingVideo[]> {
    const settings = await settingsService.getPublic();
    return parseRetailerTrainingVideos(settings?.[SETTINGS_KEY]);
  },

  async getAdmin(): Promise<RetailerTrainingVideo[]> {
    const settings = await settingsService.getAll();
    return parseRetailerTrainingVideos(settings?.[SETTINGS_KEY]);
  },

  async save(videos: RetailerTrainingVideo[]): Promise<RetailerTrainingVideo[]> {
    const normalized = videos.map((video, index) => normalizeVideo(video, index));
    await settingsService.update({
      [SETTINGS_KEY]: serializeRetailerTrainingVideos(normalized),
    });
    return normalized.sort((a, b) => a.order - b.order);
  },
};
