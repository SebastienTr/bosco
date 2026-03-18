import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PortsPanel } from "./PortsPanel";

const stopovers = [
  {
    id: "sto-1",
    name: "Gothenburg",
    country: "Sweden",
    arrived_at: "2025-07-15T00:00:00.000Z",
  },
  {
    id: "sto-2",
    name: "Lysekil",
    country: "Sweden",
    arrived_at: "2025-07-17T00:00:00.000Z",
  },
];

const messages = {
  header: "Ports of Call",
  ariaLabel: "Ports of call",
  closeLabel: "Close ports panel",
  emptyState: "No stopovers yet",
};

describe("PortsPanel", () => {
  it("dismisses on swipe left but not on swipe right", () => {
    const onClose = vi.fn();

    render(
      <PortsPanel
        stopovers={stopovers}
        isOpen={true}
        onClose={onClose}
        onSelectStopover={vi.fn()}
        messages={messages}
      />,
    );

    const mobileNav = screen.getAllByRole("navigation", {
      name: messages.ariaLabel,
    })[0];

    fireEvent.touchStart(mobileNav, {
      touches: [{ clientX: 200 }],
    });
    fireEvent.touchEnd(mobileNav, {
      changedTouches: [{ clientX: 80 }],
    });

    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.touchStart(mobileNav, {
      touches: [{ clientX: 80 }],
    });
    fireEvent.touchEnd(mobileNav, {
      changedTouches: [{ clientX: 200 }],
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("moves focus with arrow keys in the desktop sidebar", () => {
    render(
      <PortsPanel
        stopovers={stopovers}
        isOpen={true}
        onClose={vi.fn()}
        onSelectStopover={vi.fn()}
        messages={messages}
      />,
    );

    const desktopNav = screen.getAllByRole("navigation", {
      name: messages.ariaLabel,
    })[1];
    const [firstButton, secondButton] = within(desktopNav).getAllByRole(
      "button",
    );

    firstButton.focus();
    fireEvent.keyDown(firstButton, { key: "ArrowDown" });

    expect(document.activeElement).toBe(secondButton);

    fireEvent.keyDown(secondButton, { key: "ArrowUp" });

    expect(document.activeElement).toBe(firstButton);
  });

  it("adds visible focus styles to summary and stopover items", () => {
    render(
      <PortsPanel
        stopovers={stopovers}
        isOpen={true}
        onClose={vi.fn()}
        onSelectStopover={vi.fn()}
        messages={messages}
      />,
    );

    const desktopNav = screen.getAllByRole("navigation", {
      name: messages.ariaLabel,
    })[1];
    const summary = desktopNav.querySelector("summary");
    const [firstButton] = within(desktopNav).getAllByRole("button");

    expect(summary?.className).toContain("focus-visible:outline-ocean");
    expect(firstButton.className).toContain("focus-visible:outline-ocean");
  });
});
