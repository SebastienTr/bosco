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
  const [open, setOpen] = useState(false);

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
      {/* Toggle button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="absolute bottom-3 left-3 z-[500] flex min-h-[44px] items-center gap-1 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-navy shadow-card transition-colors hover:bg-foam"
        aria-label="Toggle leg list"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M8 6L21 6" />
          <path d="M8 12L21 12" />
          <path d="M8 18L21 18" />
          <path d="M3 6L3.01 6" />
          <path d="M3 12L3.01 12" />
          <path d="M3 18L3.01 18" />
        </svg>
        Legs ({legs.length})
      </button>

      {/* Panel */}
      {open && (
        <div className="absolute bottom-16 left-3 z-[500] flex w-56 max-w-[calc(100vw-24px)] max-h-[calc(100dvh-160px)] flex-col rounded-lg bg-white shadow-overlay">
          <div className="flex shrink-0 items-center justify-between border-b px-3 py-2">
            <h2 className="font-heading text-sm font-semibold text-navy">
              Legs
            </h2>
            <button
              onClick={() => setOpen(false)}
              className="rounded p-1 text-mist hover:text-navy"
              aria-label="Close leg list"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <ul className="min-h-0 flex-1 overflow-y-auto">
            {legs.map((leg, index) => (
              <li
                key={leg.id}
                className="group flex items-center border-b border-foam last:border-b-0"
              >
                <button
                  className="flex min-h-[40px] flex-1 items-baseline gap-1.5 px-3 py-1.5 text-left"
                  onClick={() => {
                    /* future: zoom to leg on map */
                  }}
                >
                  <span className="shrink-0 text-xs font-bold text-navy">
                    {index + 1}
                  </span>
                  <span className="truncate text-xs text-slate">
                    {formatDate(leg.started_at)}
                    {leg.distance_nm != null && (
                      <> · {formatDistanceNm(leg.distance_nm)}</>
                    )}
                    {leg.duration_seconds != null && (
                      <> · {formatDuration(leg.duration_seconds)}</>
                    )}
                  </span>
                </button>
                <button
                  onClick={() => openDeleteDialog(leg.id)}
                  disabled={isDeleting}
                  className="shrink-0 p-2 text-mist opacity-0 transition-opacity group-hover:opacity-100 hover:text-coral disabled:opacity-50 lg:opacity-0"
                  aria-label={`Delete leg ${index + 1}`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
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
        </div>
      )}

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
