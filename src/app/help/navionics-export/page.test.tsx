import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import NavionicsExportGuidePage from "./page";
import { messages } from "./messages";

describe("NavionicsExportGuidePage", () => {
  it("renders the page heading", () => {
    render(<NavionicsExportGuidePage />);

    expect(
      screen.getByRole("heading", { level: 1, name: messages.heading }),
    ).toBeTruthy();
  });

  it("renders all 4 steps with titles", () => {
    render(<NavionicsExportGuidePage />);

    for (const step of messages.steps) {
      expect(
        screen.getByRole("heading", { level: 2, name: step.title }),
      ).toBeTruthy();
    }
  });

  it("renders all 4 step descriptions", () => {
    render(<NavionicsExportGuidePage />);

    for (const step of messages.steps) {
      expect(screen.getByText(step.description)).toBeTruthy();
    }
  });

  it("renders images with descriptive alt text", () => {
    render(<NavionicsExportGuidePage />);

    for (const step of messages.steps) {
      expect(screen.getByAltText(step.alt)).toBeTruthy();
    }
  });

  it("renders step numbers 1 through 4", () => {
    render(<NavionicsExportGuidePage />);

    for (let i = 1; i <= 4; i++) {
      expect(screen.getByText(String(i))).toBeTruthy();
    }
  });

  it("renders the CTA link with correct href", () => {
    render(<NavionicsExportGuidePage />);

    const ctaLink = screen.getByRole("link", { name: messages.cta });
    expect(ctaLink).toBeTruthy();
    expect(ctaLink.getAttribute("href")).toBe(messages.ctaHref);
  });

  it("renders the back link", () => {
    render(<NavionicsExportGuidePage />);

    const backLink = screen.getByRole("link", { name: /Back/ });
    expect(backLink).toBeTruthy();
    expect(backLink.getAttribute("href")).toBe("/");
  });
});
