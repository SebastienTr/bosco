import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchImageDataUrl } from "./image-data-url";

describe("fetchImageDataUrl", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns a data URL for remote images", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response("bosco-image", {
          status: 200,
          headers: { "content-type": "image/png" },
        }),
      ),
    );

    const result = await fetchImageDataUrl("https://example.com/cover.png");

    expect(result).toMatch(/^data:image\/png;base64,/);
  });

  it("returns null for non-image responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response("not-an-image", {
          status: 200,
          headers: { "content-type": "text/plain" },
        }),
      ),
    );

    await expect(
      fetchImageDataUrl("https://example.com/cover.txt"),
    ).resolves.toBeNull();
  });

  it("returns null when the fetch fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));

    await expect(
      fetchImageDataUrl("https://example.com/cover.png"),
    ).resolves.toBeNull();
  });
});
