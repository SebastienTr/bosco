import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock ShareButton
vi.mock("./ShareButton", () => ({
  ShareButton: ({
    url,
    title,
    text,
    messages,
  }: {
    url: string;
    title: string;
    text: string;
    messages: { label: string };
  }) => (
    <button
      data-testid="share-button"
      data-url={url}
      data-title={title}
      data-text={text}
    >
      {messages.label}
    </button>
  ),
}));

import { DualCTA, type DualCTAMessages } from "./DualCTA";

const defaultMessages: DualCTAMessages = {
  headline: "Sail too? Create your own voyage",
  createLabel: "Get started",
  dismissLabel: "Dismiss",
  ariaLabel: "Create your own voyage on Bosco",
};

const shareMessages = {
  label: "Share this voyage",
  copied: "Link copied!",
  copyFailed: "Could not copy link",
};

const defaultProps = {
  publicUrl: "https://sailbosco.com/captain/atlantic",
  shareTitle: "Atlantic Crossing",
  shareText: "Check out this sailing voyage: Atlantic Crossing by @captain",
  messages: defaultMessages,
  shareMessages,
};

let mockStorage: Record<string, string> = {};

describe("DualCTA", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockStorage = {};
    vi.stubGlobal("sessionStorage", {
      getItem: vi.fn((key: string) => mockStorage[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        mockStorage[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete mockStorage[key];
      }),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("is not rendered before 10s timer", () => {
    render(<DualCTA {...defaultProps} />);

    expect(screen.queryByTestId("dual-cta")).toBeNull();
  });

  it("becomes visible after 10s timer fires", () => {
    render(<DualCTA {...defaultProps} />);

    act(() => {
      vi.advanceTimersByTime(10_000);
    });

    act(() => {
      vi.advanceTimersToNextTimer();
    });

    const bar = screen.getByTestId("dual-cta");
    expect(bar.className).toContain("translate-y-0");
  });

  it("renders create CTA with correct href /auth/login", () => {
    render(<DualCTA {...defaultProps} />);

    act(() => {
      vi.advanceTimersByTime(10_000);
    });

    act(() => {
      vi.advanceTimersToNextTimer();
    });

    const createLink = screen.getByTestId("dual-cta-create");
    expect(createLink.getAttribute("href")).toBe("/auth/login");
    expect(createLink.textContent).toBe("Get started");
  });

  it("renders ShareButton with correct props", () => {
    render(<DualCTA {...defaultProps} />);

    act(() => {
      vi.advanceTimersByTime(10_000);
      vi.runOnlyPendingTimers();
    });

    const shareButton = screen.getByTestId("share-button");
    expect(shareButton.getAttribute("data-url")).toBe(
      "https://sailbosco.com/captain/atlantic",
    );
    expect(shareButton.getAttribute("data-title")).toBe("Atlantic Crossing");
  });

  it("dismiss button hides the bar and sets sessionStorage", () => {
    render(<DualCTA {...defaultProps} />);

    act(() => {
      vi.advanceTimersByTime(10_000);
    });

    act(() => {
      vi.advanceTimersToNextTimer();
    });

    const dismissBtn = screen.getByTestId("dual-cta-dismiss");

    act(() => {
      dismissBtn.click();
    });

    // Bar should be removed from the DOM (dismissed state returns null)
    expect(screen.queryByTestId("dual-cta")).toBeNull();
    expect(sessionStorage.setItem).toHaveBeenCalledWith(
      "bosco-cta-dismissed",
      "true",
    );
  });

  it("stays hidden when sessionStorage has dismiss flag on mount", () => {
    mockStorage["bosco-cta-dismissed"] = "true";

    render(<DualCTA {...defaultProps} />);

    // Component returns null when dismissed
    expect(screen.queryByTestId("dual-cta")).toBeNull();
  });

  it("has correct aria-label and role attributes", () => {
    render(<DualCTA {...defaultProps} />);

    act(() => {
      vi.advanceTimersByTime(10_000);
    });

    act(() => {
      vi.advanceTimersToNextTimer();
    });

    const bar = screen.getByTestId("dual-cta");
    expect(bar.getAttribute("role")).toBe("complementary");
    expect(bar.getAttribute("aria-label")).toBe(
      "Create your own voyage on Bosco",
    );
  });

  it("passes the externalized share text to ShareButton", () => {
    render(<DualCTA {...defaultProps} />);

    act(() => {
      vi.advanceTimersByTime(10_000);
      vi.runOnlyPendingTimers();
    });

    const shareButton = screen.getByTestId("share-button");
    expect(shareButton.getAttribute("data-text")).toBe(defaultProps.shareText);
  });
});
