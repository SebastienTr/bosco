import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ActionFAB } from "./ActionFAB";

const messages = {
  openLabel: "Open ports panel",
  closeLabel: "Close ports panel",
};

describe("ActionFAB", () => {
  it("uses the correct aria-label and avoids rotating the close icon", () => {
    const { rerender } = render(
      <ActionFAB isOpen={false} onToggle={vi.fn()} messages={messages} />,
    );

    const button = screen.getByRole("button", { name: messages.openLabel });
    const icon = button.querySelector("svg");

    expect(button.className).toContain("absolute");
    expect(icon?.className.baseVal ?? icon?.className).not.toContain(
      "rotate-45",
    );

    rerender(
      <ActionFAB isOpen={true} onToggle={vi.fn()} messages={messages} />,
    );

    const openButton = screen.getByRole("button", { name: messages.closeLabel });
    const openIcon = openButton.querySelector("svg");

    expect(openButton).toBeTruthy();
    expect(openIcon?.className.baseVal ?? openIcon?.className).not.toContain(
      "rotate-45",
    );
  });
});
