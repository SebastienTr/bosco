import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { ShareButton } from "./ShareButton";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockMessages = {
  label: "Share this voyage",
  copied: "Link copied!",
  copyFailed: "Could not copy link",
};

const defaultProps = {
  url: "https://sailbosco.com/seb/mediterranean-2025",
  title: "Mediterranean 2025",
  text: "Check out this sailing voyage: Mediterranean 2025 by @seb",
  messages: mockMessages,
};

describe("ShareButton", () => {
  beforeEach(async () => {
    vi.restoreAllMocks();
    const { toast } = await import("sonner");
    vi.mocked(toast.success).mockClear();
    vi.mocked(toast.error).mockClear();
  });

  it("renders with correct aria-label", () => {
    render(<ShareButton {...defaultProps} />);

    const button = screen.getByRole("button", { name: mockMessages.label });
    expect(button).toBeTruthy();
  });

  it("has a minimum 44px touch target", () => {
    render(<ShareButton {...defaultProps} />);

    const button = screen.getByRole("button", { name: mockMessages.label });
    expect(button.className).toContain("min-h-[44px]");
    expect(button.className).toContain("min-w-[44px]");
  });

  it("calls navigator.share when available with correct params", async () => {
    const shareMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "share", {
      value: shareMock,
      writable: true,
      configurable: true,
    });

    render(<ShareButton {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: mockMessages.label }));

    await waitFor(() => {
      expect(shareMock).toHaveBeenCalledWith({
        title: defaultProps.title,
        text: defaultProps.text,
        url: defaultProps.url,
      });
    });

    // Cleanup
    Object.defineProperty(navigator, "share", {
      value: undefined,
      writable: true,
      configurable: true,
    });
  });

  it("falls back to clipboard + toast when navigator.share is undefined", async () => {
    const { toast } = await import("sonner");

    Object.defineProperty(navigator, "share", {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: writeTextMock },
      writable: true,
      configurable: true,
    });

    render(<ShareButton {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: mockMessages.label }));

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalledWith(defaultProps.url);
      expect(toast.success).toHaveBeenCalledWith(mockMessages.copied);
    });
  });

  it("handles navigator.share AbortError gracefully (no error toast)", async () => {
    const { toast } = await import("sonner");

    const abortError = new DOMException("Share cancelled", "AbortError");
    const shareMock = vi.fn().mockRejectedValue(abortError);
    Object.defineProperty(navigator, "share", {
      value: shareMock,
      writable: true,
      configurable: true,
    });

    render(<ShareButton {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: mockMessages.label }));

    await waitFor(() => {
      expect(shareMock).toHaveBeenCalled();
    });

    expect(toast.error).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();

    // Cleanup
    Object.defineProperty(navigator, "share", {
      value: undefined,
      writable: true,
      configurable: true,
    });
  });

  it("handles clipboard failure with error toast", async () => {
    const { toast } = await import("sonner");

    Object.defineProperty(navigator, "share", {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const writeTextMock = vi
      .fn()
      .mockRejectedValue(new Error("Clipboard denied"));
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: writeTextMock },
      writable: true,
      configurable: true,
    });

    render(<ShareButton {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: mockMessages.label }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(mockMessages.copyFailed);
    });
  });

  it("falls back to clipboard when navigator.share throws non-AbortError", async () => {
    const { toast } = await import("sonner");

    const shareMock = vi
      .fn()
      .mockRejectedValue(new Error("NotAllowedError"));
    Object.defineProperty(navigator, "share", {
      value: shareMock,
      writable: true,
      configurable: true,
    });

    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: writeTextMock },
      writable: true,
      configurable: true,
    });

    render(<ShareButton {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: mockMessages.label }));

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalledWith(defaultProps.url);
      expect(toast.success).toHaveBeenCalledWith(mockMessages.copied);
    });

    // Cleanup
    Object.defineProperty(navigator, "share", {
      value: undefined,
      writable: true,
      configurable: true,
    });
  });
});
