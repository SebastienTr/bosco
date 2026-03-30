import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import Home from "./page";

describe("Home", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("renders legal links in the footer", () => {
    render(<Home />);

    expect(
      screen.getByRole("link", {
        name: /privacy policy/i,
      }).getAttribute("href"),
    ).toBe("/legal/privacy");
    expect(
      screen.getByRole("link", {
        name: /terms of service/i,
      }).getAttribute("href"),
    ).toBe("/legal/terms");
  });
});
