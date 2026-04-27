import { describe, expect, it } from "vitest";
import {
  parseRetailerTrainingVideos,
  serializeRetailerTrainingVideos,
} from "../retailerTrainingVideosService";

describe("retailerTrainingVideosService", () => {
  it("parses valid JSON and sorts by order", () => {
    const videos = parseRetailerTrainingVideos(
      JSON.stringify([
        { id: "2", title: "B", url: "https://b.com", order: 2, published: true },
        { id: "1", title: "A", url: "https://a.com", order: 0, published: false },
      ])
    );

    expect(videos).toHaveLength(2);
    expect(videos[0].title).toBe("A");
    expect(videos[1].title).toBe("B");
    expect(videos[0].published).toBe(false);
  });

  it("returns empty list for invalid JSON", () => {
    expect(parseRetailerTrainingVideos("not-json")).toEqual([]);
  });

  it("serializes videos with normalized order", () => {
    const serialized = serializeRetailerTrainingVideos([
      { id: "9", title: "Video", url: "https://x.com", order: 7, published: true },
    ]);
    const parsed = JSON.parse(serialized);

    expect(parsed[0].order).toBe(0);
    expect(parsed[0].title).toBe("Video");
  });

  it("creates deterministic fallback ids when id is missing", () => {
    const videos = parseRetailerTrainingVideos(
      JSON.stringify([
        { title: "Como comprar", url: "https://a.com/video", category: "Compras" },
      ])
    );

    expect(videos[0].id).toBe("como-comprar-https-a-com-video-compras");
  });
});
