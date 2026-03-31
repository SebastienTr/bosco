import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DeleteAccountSection } from "./DeleteAccountSection";
import { messages } from "./messages";

const mockReplace = vi.fn();
const mockToastError = vi.fn();
const mockToastSuccess = vi.fn();
const mockDeleteAccount = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    error: (...args: unknown[]) => mockToastError(...args),
    success: (...args: unknown[]) => mockToastSuccess(...args),
  },
}));

vi.mock("./actions", () => ({
  deleteAccount: (...args: unknown[]) => mockDeleteAccount(...args),
}));

describe("DeleteAccountSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the danger zone copy and confirmation dialog", async () => {
    render(<DeleteAccountSection />);

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: messages.danger.title,
      }),
    ).toBeTruthy();
    expect(screen.getByText(messages.danger.description)).toBeTruthy();

    fireEvent.click(
      screen.getByRole("button", {
        name: messages.danger.trigger,
      }),
    );

    expect(
      await screen.findByRole("heading", {
        level: 2,
        name: messages.danger.dialog.title,
      }),
    ).toBeTruthy();
    expect(screen.getByText(messages.danger.dialog.description)).toBeTruthy();
  });

  it("deletes the account, shows feedback, and redirects to the landing page", async () => {
    mockDeleteAccount.mockResolvedValue({
      data: { success: true },
      error: null,
    });

    render(<DeleteAccountSection />);

    fireEvent.click(
      screen.getByRole("button", {
        name: messages.danger.trigger,
      }),
    );
    fireEvent.click(
      await screen.findByRole("button", {
        name: messages.danger.dialog.confirm,
      }),
    );

    await waitFor(() => {
      expect(mockDeleteAccount).toHaveBeenCalledWith({
        confirmation: "delete-account",
      });
    });

    expect(mockToastSuccess).toHaveBeenCalledWith(
      messages.toast.accountDeletedSuccess,
    );
    expect(mockReplace).toHaveBeenCalledWith("/?accountDeleted=1");
  });

  it("shows an error toast when deletion fails", async () => {
    mockDeleteAccount.mockResolvedValue({
      data: null,
      error: {
        code: "EXTERNAL_SERVICE_ERROR",
        message: "Storage cleanup failed",
      },
    });

    render(<DeleteAccountSection />);

    fireEvent.click(
      screen.getByRole("button", {
        name: messages.danger.trigger,
      }),
    );
    fireEvent.click(
      await screen.findByRole("button", {
        name: messages.danger.dialog.confirm,
      }),
    );

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        messages.toast.accountDeletedError,
        expect.objectContaining({ duration: Infinity }),
      );
    });
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
