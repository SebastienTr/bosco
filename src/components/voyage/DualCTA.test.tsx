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

import { DualCTA, type DualCTAMessages } from "./DualCTA";

const defaultMessages: DualCTAMessages = {
  headline: "Sail too? Create your own voyage",
  createLabel: "Get started",
  dismissLabel: "Dismiss",
  ariaLabel: "Create your own voyage on Bosco",
};

const defaultProps = {
  messages: defaultMessages,
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

  it("is not visible initially before 10s timer", () => {
    render(<DualCTA {...defaultProps} />);

    const bar = screen.getByTestId("dual-cta");
    expect(bar.className).toContain("opacity-0");
  });

  it("becomes visible after 10s timer fires", () => {
    render(<DualCTA {...defaultProps} />);

    act(() => {
      vi.advanceTimersByTime(10_000);
    });

    const bar = screen.getByTestId("dual-cta");
    expect(bar.className).toContain("opacity-100");
    expect(bar.className).not.toContain("opacity-0");
  });

  it("renders create CTA with correct href /auth/login", () => {
    render(<DualCTA {...defaultProps} />);

    act(() => {
      vi.advanceTimersByTime(10_000);
    });

    const createLink = screen.getByTestId("dual-cta-create");
    expect(createLink.getAttribute("href")).toBe("/auth/login");
    expect(createLink.textContent).toBe("Get started");
  });

  it("renders headline text", () => {
    render(<DualCTA {...defaultProps} />);

    expect(
      screen.getByText("Sail too? Create your own voyage"),
    ).toBeTruthy();
  });

  it("dismiss button hides the bar and sets sessionStorage", () => {
    render(<DualCTA {...defaultProps} />);

    act(() => {
      vi.advanceTimersByTime(10_000);
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

    const bar = screen.getByTestId("dual-cta");
    expect(bar.getAttribute("role")).toBe("complementary");
    expect(bar.getAttribute("aria-label")).toBe(
      "Create your own voyage on Bosco",
    );
  });
});
