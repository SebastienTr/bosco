import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LogEntryCard } from "./LogEntryCard";
import { createLightboxPhotoId } from "@/components/map/photo-markers-utils";

vi.mock("next/image", () => ({
  default: () => null,
}));

describe("LogEntryCard", () => {
  it("adds an accessible label to tappable photo thumbnails", () => {
    const onPhotoTap = vi.fn();

    render(
      <LogEntryCard
        entry={
          {
            id: "entry-1",
            entry_date: "2026-03-01",
            text: "A clear night watch.",
            leg_id: null,
            stopover_id: null,
            photo_urls: ["https://example.com/photo-1.jpg"],
          } as never
        }
        onPhotoTap={onPhotoTap}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open photo 1" }));

    expect(onPhotoTap).toHaveBeenCalledWith(
      createLightboxPhotoId("entry-1", 0),
    );
  });
});
