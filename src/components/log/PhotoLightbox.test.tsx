import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { PhotoLightbox } from "./PhotoLightbox";
import type { LightboxPhoto } from "@/components/map/photo-markers-utils";

// Mock next/image to render plain <img>
vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    ...rest
  }: {
    src: string;
    alt: string;
    fill?: boolean;
    priority?: boolean;
    className?: string;
    sizes?: string;
  }) => <img src={src} alt={alt} data-testid="lightbox-img" />,
}));

const samplePhotos: LightboxPhoto[] = [
  {
    id: "entry-1:0",
    url: "https://example.com/photo1.jpg",
    caption: {
      text: "Sunset at the marina",
      location: "Porto Cervo",
      date: "30 March 2026",
    },
  },
  {
    id: "entry-1:1",
    url: "https://example.com/photo2.jpg",
    caption: {
      text: "Under sail",
      location: "Leg 1",
      date: "31 March 2026",
    },
  },
  {
    id: "entry-2:0",
    url: "https://example.com/photo3.jpg",
    caption: {
      text: "Anchored in the bay",
      location: "Cala di Volpe",
      date: "1 April 2026",
    },
  },
];

describe("PhotoLightbox", () => {
  it("renders nothing when photos array is empty", () => {
    const { container } = render(
      <PhotoLightbox photos={[]} initialIndex={0} onClose={vi.fn()} />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders photo at initial index", () => {
    render(
      <PhotoLightbox
        photos={samplePhotos}
        initialIndex={1}
        onClose={vi.fn()}
      />,
    );

    const img = screen.getByTestId("lightbox-img");
    expect(img.getAttribute("src")).toBe("https://example.com/photo2.jpg");
  });

  it("displays caption text, location, and date", () => {
    render(
      <PhotoLightbox
        photos={samplePhotos}
        initialIndex={0}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText("Sunset at the marina")).toBeTruthy();
    expect(screen.getByText(/Porto Cervo/)).toBeTruthy();
    expect(screen.getByText(/30 March 2026/)).toBeTruthy();
  });

  it("navigates to next photo on ArrowRight key", () => {
    render(
      <PhotoLightbox
        photos={samplePhotos}
        initialIndex={0}
        onClose={vi.fn()}
      />,
    );

    fireEvent.keyDown(document, { key: "ArrowRight" });

    const img = screen.getByTestId("lightbox-img");
    expect(img.getAttribute("src")).toBe("https://example.com/photo2.jpg");
  });

  it("navigates to previous photo on ArrowLeft key", () => {
    render(
      <PhotoLightbox
        photos={samplePhotos}
        initialIndex={1}
        onClose={vi.fn()}
      />,
    );

    fireEvent.keyDown(document, { key: "ArrowLeft" });

    const img = screen.getByTestId("lightbox-img");
    expect(img.getAttribute("src")).toBe("https://example.com/photo1.jpg");
  });

  it("wraps from last to first photo (circular navigation forward)", () => {
    render(
      <PhotoLightbox
        photos={samplePhotos}
        initialIndex={2}
        onClose={vi.fn()}
      />,
    );

    fireEvent.keyDown(document, { key: "ArrowRight" });

    const img = screen.getByTestId("lightbox-img");
    expect(img.getAttribute("src")).toBe("https://example.com/photo1.jpg");
  });

  it("wraps from first to last photo (circular navigation backward)", () => {
    render(
      <PhotoLightbox
        photos={samplePhotos}
        initialIndex={0}
        onClose={vi.fn()}
      />,
    );

    fireEvent.keyDown(document, { key: "ArrowLeft" });

    const img = screen.getByTestId("lightbox-img");
    expect(img.getAttribute("src")).toBe("https://example.com/photo3.jpg");
  });

  it("calls onClose on Escape key", () => {
    const onClose = vi.fn();
    render(
      <PhotoLightbox
        photos={samplePhotos}
        initialIndex={0}
        onClose={onClose}
      />,
    );

    fireEvent.keyDown(document, { key: "Escape" });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when close button is clicked", () => {
    const onClose = vi.fn();
    render(
      <PhotoLightbox
        photos={samplePhotos}
        initialIndex={0}
        onClose={onClose}
      />,
    );

    const closeButton = screen.getByLabelText("Close photo");
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("hides navigation arrows when only one photo", () => {
    const singlePhoto = [samplePhotos[0]];
    render(
      <PhotoLightbox
        photos={singlePhoto}
        initialIndex={0}
        onClose={vi.fn()}
      />,
    );

    expect(screen.queryByLabelText("Previous photo")).toBeNull();
    expect(screen.queryByLabelText("Next photo")).toBeNull();
  });

  it("shows navigation arrows when multiple photos", () => {
    render(
      <PhotoLightbox
        photos={samplePhotos}
        initialIndex={0}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByLabelText("Previous photo")).toBeTruthy();
    expect(screen.getByLabelText("Next photo")).toBeTruthy();
  });

  it("navigates when clicking prev/next buttons", () => {
    render(
      <PhotoLightbox
        photos={samplePhotos}
        initialIndex={0}
        onClose={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByLabelText("Next photo"));
    expect(screen.getByTestId("lightbox-img").getAttribute("src")).toBe(
      "https://example.com/photo2.jpg",
    );

    fireEvent.click(screen.getByLabelText("Previous photo"));
    expect(screen.getByTestId("lightbox-img").getAttribute("src")).toBe(
      "https://example.com/photo1.jpg",
    );
  });
});
