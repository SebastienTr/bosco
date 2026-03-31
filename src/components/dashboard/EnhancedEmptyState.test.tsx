import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { EnhancedEmptyState } from "./EnhancedEmptyState";

vi.mock("next/dynamic", () => ({
  default: () => {
    const MockMap = () => <div data-testid="demo-map-animation" />;
    MockMap.displayName = "MockMap";
    return MockMap;
  },
}));

const defaultMessages = {
  headline: "Your first voyage awaits",
  step1: "Export your track from Navionics",
  step2: "Share the GPX file to Bosco",
  step3: "Your voyage appears on the map",
  cta: "Create your first voyage",
  seeExample: "See an example",
};

describe("EnhancedEmptyState", () => {
  it("renders headline text", () => {
    render(
      <EnhancedEmptyState
        messages={defaultMessages}
        createVoyageTrigger={<button>Create</button>}
        showcaseUrl="/Seb/goteborg-to-nice"
      />,
    );

    expect(screen.getByText("Your first voyage awaits")).toBeTruthy();
  });

  it("renders all 3 steps", () => {
    render(
      <EnhancedEmptyState
        messages={defaultMessages}
        createVoyageTrigger={<button>Create</button>}
        showcaseUrl="/Seb/goteborg-to-nice"
      />,
    );

    expect(screen.getByText(/Export your track from Navionics/)).toBeTruthy();
    expect(screen.getByText(/Share the GPX file to Bosco/)).toBeTruthy();
    expect(screen.getByText(/Your voyage appears on the map/)).toBeTruthy();
  });

  it("renders CTA button via createVoyageTrigger prop", () => {
    render(
      <EnhancedEmptyState
        messages={defaultMessages}
        createVoyageTrigger={
          <button data-testid="cta-button">Create your first voyage</button>
        }
        showcaseUrl="/Seb/goteborg-to-nice"
      />,
    );

    expect(screen.getByTestId("cta-button")).toBeTruthy();
    expect(screen.getByText("Create your first voyage")).toBeTruthy();
  });

  it('renders "See an example" link with correct href', () => {
    render(
      <EnhancedEmptyState
        messages={defaultMessages}
        createVoyageTrigger={<button>Create</button>}
        showcaseUrl="/Seb/goteborg-to-nice"
      />,
    );

    const link = screen.getByRole("link", { name: /See an example/ });
    expect(link).toBeTruthy();
    expect(link.getAttribute("href")).toBe("/Seb/goteborg-to-nice");
  });

  it("renders helpLink when provided", () => {
    render(
      <EnhancedEmptyState
        messages={defaultMessages}
        createVoyageTrigger={<button>Create</button>}
        showcaseUrl="/Seb/goteborg-to-nice"
        helpLink={{
          label: "How to export from Navionics?",
          href: "/help/navionics-export",
        }}
      />,
    );

    const link = screen.getByRole("link", {
      name: "How to export from Navionics?",
    });
    expect(link).toBeTruthy();
    expect(link.getAttribute("href")).toBe("/help/navionics-export");
  });

  it("does not render helpLink when not provided", () => {
    render(
      <EnhancedEmptyState
        messages={defaultMessages}
        createVoyageTrigger={<button>Create</button>}
        showcaseUrl="/Seb/goteborg-to-nice"
      />,
    );

    expect(
      screen.queryByRole("link", { name: /How to export/ }),
    ).toBeNull();
  });

  it("renders map demo placeholder (mocked dynamic import)", () => {
    render(
      <EnhancedEmptyState
        messages={defaultMessages}
        createVoyageTrigger={<button>Create</button>}
        showcaseUrl="/Seb/goteborg-to-nice"
      />,
    );

    expect(screen.getByTestId("demo-map-animation")).toBeTruthy();
  });
});
