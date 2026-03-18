import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StopoverSheet } from "./StopoverSheet";

const messages = {
  arrivedLabel: "Arrived",
  departedLabel: "Departed",
  durationLabel: "Duration",
  addNotePlaceholder: "Add a note...",
  closeLabel: "Close stopover details",
  nightsUnit: (n: number) => (n === 1 ? "1 night" : `${n} nights`),
  hoursUnit: (n: number) => (n === 1 ? "1 hour" : `${n} hours`),
  sheetAriaLabel: "Stopover details",
};

describe("StopoverSheet", () => {
  it("focuses the close button and dismisses on Escape", () => {
    const onDismiss = vi.fn();

    render(
      <StopoverSheet
        name="Brest"
        country="France"
        countryCode="fr"
        arrivedAt="2025-07-15T00:00:00.000Z"
        departedAt="2025-07-17T00:00:00.000Z"
        onDismiss={onDismiss}
        messages={messages}
      />,
    );

    const closeButton = screen.getByRole("button", {
      name: messages.closeLabel,
    });

    expect(document.activeElement).toBe(closeButton);
    expect(screen.getByText("2 nights")).toBeTruthy();

    fireEvent.keyDown(document, { key: "Escape" });

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("dismisses when the backdrop is clicked and uses map-relative positioning", () => {
    const onDismiss = vi.fn();
    const { container } = render(
      <StopoverSheet
        name="Brest"
        country="France"
        countryCode="fr"
        arrivedAt="2025-07-15T00:00:00.000Z"
        departedAt="2025-07-17T00:00:00.000Z"
        onDismiss={onDismiss}
        messages={messages}
      />,
    );

    const backdrop = container.querySelector('div[aria-hidden="true"]');
    const dialog = screen.getByRole("dialog", { name: messages.sheetAriaLabel });

    fireEvent.click(backdrop!);

    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(dialog.className).toContain("absolute");
    expect(dialog.className).not.toContain("fixed");
  });
});
