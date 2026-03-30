import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProfilePage from "./page";
import { messages } from "./messages";

const mockRequireAuth = vi.fn();
const mockGetProfileByUserId = vi.fn();
const mockRedirect = vi.fn();

vi.mock("next/navigation", () => ({
  redirect: (...args: unknown[]) => mockRedirect(...args),
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: (...args: unknown[]) => mockRequireAuth(...args),
}));

vi.mock("@/lib/data/profiles", () => ({
  getProfileByUserId: (...args: unknown[]) => mockGetProfileByUserId(...args),
}));

vi.mock("../SharePendingRedirect", () => ({
  SharePendingRedirect: () => <div data-testid="share-pending-redirect" />,
}));

vi.mock("./ProfileForm", () => ({
  ProfileForm: () => <div data-testid="profile-form" />,
}));

vi.mock("./SignOutButton", () => ({
  SignOutButton: () => <button type="button">Sign out</button>,
}));

vi.mock("./DeleteAccountSection", () => ({
  DeleteAccountSection: () => <div data-testid="delete-account-section" />,
}));

describe("ProfilePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuth.mockResolvedValue({
      data: { id: "user-1" },
      error: null,
    });
    mockGetProfileByUserId.mockResolvedValue({
      data: { username: "captain" },
      error: null,
    });
  });

  it("keeps existing profile controls, adds the delete danger zone, and keeps the legal section", async () => {
    render(await ProfilePage());

    expect(screen.getByTestId("share-pending-redirect")).toBeTruthy();
    expect(screen.getByTestId("profile-form")).toBeTruthy();
    expect(screen.getByRole("button", { name: /sign out/i })).toBeTruthy();
    expect(screen.getByTestId("delete-account-section")).toBeTruthy();
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: messages.legal.title,
      }),
    ).toBeTruthy();
    expect(
      screen.getByRole("link", {
        name: messages.legal.privacy,
      }).getAttribute("href"),
    ).toBe("/legal/privacy");
    expect(
      screen.getByRole("link", {
        name: messages.legal.terms,
      }).getAttribute("href"),
    ).toBe("/legal/terms");
  });
});
