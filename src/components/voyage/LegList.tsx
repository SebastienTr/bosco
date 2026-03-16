"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { formatDistanceNm, formatDuration } from "@/lib/utils/format";
import type { Leg } from "@/lib/data/legs";
import { messages } from "@/app/voyage/[id]/messages";
import type { ActionResponse } from "@/types";

interface LegListProps {
  legs: Leg[];
  onDelete: (legId: string) => Promise<ActionResponse<null>>;
}

function formatDate(iso: string | null): string {
  if (!iso) return "\u2014";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function LegList({ legs, onDelete }: LegListProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  function openDeleteDialog(legId: string) {
    if (isDeleting) return;
    setPendingDeleteId(legId);
    dialogRef.current?.showModal();
  }

  async function handleConfirmDelete() {
    if (!pendingDeleteId || isDeleting) return;
    const legId = pendingDeleteId;
    dialogRef.current?.close();
    setPendingDeleteId(null);
    setIsDeleting(true);

    try {
      const result = await onDelete(legId);
      if (result.error) {
        toast.error(result.error.message || messages.legs.deleteErrorToast);
        return;
      }
      toast.success(messages.legs.deletedToast);
    } catch {
      toast.error(messages.legs.deleteErrorToast);
    } finally {
      setIsDeleting(false);
    }
  }

  if (legs.length === 0) return null;

  return (
    <>
      <ul className="flex flex-col gap-2 p-2">
        {legs.map((leg, index) => (
          <li
            key={leg.id}
            className="flex items-center justify-between rounded-lg bg-white/90 px-3 py-2 shadow-sm backdrop-blur-sm"
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-navy">
                Leg {index + 1}
              </span>
              <span className="text-xs text-slate">
                {formatDate(leg.started_at)}
                {leg.distance_nm != null && (
                  <> &middot; {formatDistanceNm(leg.distance_nm)}</>
                )}
                {leg.duration_seconds != null && (
                  <> &middot; {formatDuration(leg.duration_seconds)}</>
                )}
              </span>
            </div>
            <button
              onClick={() => openDeleteDialog(leg.id)}
              disabled={isDeleting}
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-slate transition-colors hover:bg-red-50 hover:text-[#EF4444] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-slate"
              aria-label={`Delete leg ${index + 1}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        className="rounded-[var(--radius-card)] bg-white p-6 shadow-overlay backdrop:bg-black/50"
      >
        <h2 className="font-heading text-h2 text-navy">
          {messages.legs.deleteConfirmTitle}
        </h2>
        <p className="mt-2 text-body text-slate">
          {messages.legs.deleteConfirmDescription}
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => {
              dialogRef.current?.close();
              setPendingDeleteId(null);
            }}
            disabled={isDeleting}
            className="inline-flex min-h-[44px] items-center rounded-lg px-4 py-2 text-navy hover:bg-foam"
          >
            {messages.legs.cancelButton}
          </button>
          <button
            onClick={handleConfirmDelete}
            disabled={!pendingDeleteId || isDeleting}
            className="inline-flex min-h-[44px] items-center rounded-lg bg-[#EF4444] px-4 py-2 font-semibold text-white"
          >
            {messages.legs.deleteConfirmButton}
          </button>
        </div>
      </dialog>
    </>
  );
}
