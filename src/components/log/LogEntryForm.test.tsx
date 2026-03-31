/* eslint-disable @next/next/no-img-element */
import type { ComponentProps } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LogEntryForm } from "./LogEntryForm";

const mockRefresh = vi.fn();
const mockToastError = vi.fn();
const mockDeleteLogPhoto = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: mockRefresh,
  }),
}));

vi.mock("next/image", () => ({
  default: (props: ComponentProps<"img">) => <img alt={props.alt ?? ""} {...props} />,
}));

vi.mock("sonner", () => ({
  toast: {
    error: (...args: unknown[]) => mockToastError(...args),
    success: vi.fn(),
  },
}));

vi.mock("@/lib/utils/image", () => ({
  validateImageFile: vi.fn(() => ({ valid: true })),
  compressImage: vi.fn(async (file: File) => file),
}));

vi.mock("@/app/voyage/[id]/log/actions", () => ({
  createLogEntry: vi.fn(),
  updateLogEntry: vi.fn(),
  uploadLogPhoto: vi.fn(),
  deleteLogPhoto: (...args: unknown[]) => mockDeleteLogPhoto(...args),
}));

const voyageId = "550e8400-e29b-41d4-a716-446655440000";
const photoUrl = "https://example.com/photo.jpg";

describe("LogEntryForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes persisted photos immediately in edit mode", async () => {
    mockDeleteLogPhoto.mockResolvedValue({
      data: { photoUrls: [] },
      error: null,
    });

    const existingEntry = {
      id: "660e8400-e29b-41d4-a716-446655440000",
      voyage_id: voyageId,
      entry_date: "2026-03-20",
      text: "Arrived in Marseille",
      leg_id: null,
      stopover_id: null,
      photo_urls: [photoUrl] as string[],
      created_at: "2026-03-20T12:00:00.000Z",
      updated_at: "2026-03-20T12:00:00.000Z",
    };

    const { container } = render(
      <LogEntryForm
        voyageId={voyageId}
        legs={[]}
        stopovers={[]}
        existingEntry={existingEntry}
        onClose={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Remove photo" }));

    await waitFor(() =>
      expect(mockDeleteLogPhoto).toHaveBeenCalledWith({
        voyageId,
        entryId: existingEntry.id,
        url: photoUrl,
      }),
    );

    await waitFor(() =>
      expect(container.querySelector(`img[src="${photoUrl}"]`)).toBeNull(),
    );
  });

  it("keeps the photo in place when deletion fails", async () => {
    mockDeleteLogPhoto.mockResolvedValue({
      data: null,
      error: {
        code: "EXTERNAL_SERVICE_ERROR",
        message: "Delete failed",
      },
    });

    const { container } = render(
      <LogEntryForm
        voyageId={voyageId}
        legs={[]}
        stopovers={[]}
        existingEntry={
          {
            id: "660e8400-e29b-41d4-a716-446655440000",
            voyage_id: voyageId,
            entry_date: "2026-03-20",
            text: "Arrived in Marseille",
            leg_id: null,
            stopover_id: null,
            photo_urls: [photoUrl] as string[],
            created_at: "2026-03-20T12:00:00.000Z",
            updated_at: "2026-03-20T12:00:00.000Z",
          }
        }
        onClose={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Remove photo" }));

    await waitFor(() =>
      expect(mockToastError).toHaveBeenCalledWith(
        "Failed to remove photo",
        expect.objectContaining({ duration: Infinity }),
      ),
    );
    expect(container.querySelector(`img[src="${photoUrl}"]`)).toBeTruthy();
  });
});
