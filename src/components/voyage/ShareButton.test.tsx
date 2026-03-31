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

function setUserAgent(userAgent: string) {
  Object.defineProperty(navigator, "userAgent", {
    value: userAgent,
    configurable: true,
  });
}

function setUserAgentData(mobile?: boolean) {
  Object.defineProperty(navigator, "userAgentData", {
    value:
      typeof mobile === "boolean"
        ? {
            mobile,
          }
        : undefined,
    configurable: true,
  });
}

describe("ShareButton", () => {
  beforeEach(async () => {
    vi.restoreAllMocks();
    const { toast } = await import("sonner");
    vi.mocked(toast.success).mockClear();
    vi.mocked(toast.error).mockClear();
    setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    );
    setUserAgentData(undefined);
    Object.defineProperty(navigator, "share", {
      value: undefined,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      writable: true,
      configurable: true,
    });
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

  it("calls navigator.share on mobile with correct params", async () => {
    const shareMock = vi.fn().mockResolvedValue(undefined);
    setUserAgent(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
    );
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

  });

  it("falls back to clipboard + toast on desktop even when navigator.share exists", async () => {
    const { toast } = await import("sonner");
    const shareMock = vi.fn().mockResolvedValue(undefined);
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    );
    Object.defineProperty(navigator, "share", {
      value: shareMock,
      writable: true,
      configurable: true,
    });
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

    expect(shareMock).not.toHaveBeenCalled();
  });

  it("falls back to clipboard + toast when navigator.share is undefined", async () => {
    const { toast } = await import("sonner");
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
    setUserAgent(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
    );
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
    setUserAgent(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
    );
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
  });
});
