import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProfileForm } from "./ProfileForm";
import { messages } from "./messages";

const mockPush = vi.fn();
const mockToastError = vi.fn();
const mockToastSuccess = vi.fn();
const mockCheckUsername = vi.fn();
const mockSaveProfile = vi.fn();
const mockUploadPhoto = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    error: (...args: unknown[]) => mockToastError(...args),
    success: (...args: unknown[]) => mockToastSuccess(...args),
  },
}));

vi.mock("@/lib/utils/image", () => ({
  validateImageFile: vi.fn(() => ({ valid: true })),
  compressImage: vi.fn(async (file: File) => file),
}));

vi.mock("./actions", () => ({
  checkUsername: (...args: unknown[]) => mockCheckUsername(...args),
  saveProfile: (...args: unknown[]) => mockSaveProfile(...args),
  uploadPhoto: (...args: unknown[]) => mockUploadPhoto(...args),
}));

describe("ProfileForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows inline username validation on blur and blocks submit", () => {
    render(<ProfileForm profile={null} isEdit={false} />);

    const usernameInput = screen.getByRole("textbox", {
      name: /username/i,
    });
    fireEvent.change(usernameInput, { target: { value: "ab" } });
    fireEvent.blur(usernameInput);

    expect(screen.getByText(messages.validation.usernameTooShort)).toBeTruthy();

    const submitButton = screen.getByRole("button", {
      name: messages.actions.save,
    });
    fireEvent.click(submitButton);

    expect(mockSaveProfile).not.toHaveBeenCalled();
    expect(submitButton).toHaveProperty("disabled", true);
  });

  it("cancels the pending availability lookup when input becomes too short", async () => {
    vi.useFakeTimers();

    render(<ProfileForm profile={null} isEdit={false} />);

    const usernameInput = screen.getByRole("textbox", {
      name: /username/i,
    });
    fireEvent.change(usernameInput, { target: { value: "captain" } });
    fireEvent.change(usernameInput, { target: { value: "ca" } });

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(mockCheckUsername).not.toHaveBeenCalled();

    vi.useRealTimers();
  });
});
