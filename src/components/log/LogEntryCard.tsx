"use client";

import { useState } from "react";
import Image from "next/image";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { LogEntry } from "@/lib/data/log-entries";
import { messages } from "@/app/voyage/[id]/log/messages";

interface LogEntryCardProps {
  entry: LogEntry;
  stopoverName?: string | null;
  legLabel?: string | null;
  onEdit?: () => void;
  onDelete?: () => void;
  onPhotoTap?: (url: string) => void;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function LogEntryCard({
  entry,
  stopoverName,
  legLabel,
  onEdit,
  onDelete,
  onPhotoTap,
}: LogEntryCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const photoUrls = (entry.photo_urls ?? []) as string[];

  async function handleDelete() {
    if (!onDelete) return;
    setIsDeleting(true);
    onDelete();
  }

  return (
    <div className="rounded-[12px] bg-sand p-4 shadow-card">
      {/* Date */}
      <h3 className="font-heading text-base text-navy">
        {formatDate(entry.entry_date)}
      </h3>

      {/* Linked entities */}
      {(stopoverName || legLabel) && (
        <p className="mt-0.5 font-body text-xs text-mist">
          {stopoverName && <span>{stopoverName}</span>}
          {stopoverName && legLabel && <span> · </span>}
          {legLabel && <span>{legLabel}</span>}
        </p>
      )}

      {/* Text */}
      <p className="mt-2 whitespace-pre-wrap font-body text-sm text-navy">
        {entry.text}
      </p>

      {/* Photos */}
      {photoUrls.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {photoUrls.slice(0, 4).map((url, index) =>
            onPhotoTap ? (
              <button
                key={url}
                type="button"
                onClick={() => onPhotoTap(url)}
                aria-label={messages.photos.openLabel(index + 1)}
                aria-haspopup="dialog"
                className="h-12 w-12 overflow-hidden rounded focus-visible:outline-2 focus-visible:outline-ocean focus-visible:outline-offset-2"
              >
                <Image
                  src={url}
                  alt=""
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded object-cover"
                />
              </button>
            ) : (
              <Image
                key={url}
                src={url}
                alt=""
                width={48}
                height={48}
                className="h-12 w-12 rounded object-cover"
              />
            ),
          )}
          {photoUrls.length > 4 && (
            <div className="flex h-12 w-12 items-center justify-center rounded bg-navy/10 font-body text-xs font-semibold text-navy">
              +{photoUrls.length - 4}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      {(onEdit || onDelete) && (
        <div className="mt-3 flex gap-2">
          {onEdit && (
            <button
              onClick={onEdit}
              className="inline-flex min-h-[36px] items-center gap-1 rounded-md px-2 py-1 font-body text-xs text-mist transition-colors hover:text-navy"
              aria-label={messages.form.submit}
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
                <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
              </svg>
            </button>
          )}

          {onDelete && (
            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <button
                    disabled={isDeleting}
                    className="inline-flex min-h-[36px] items-center gap-1 rounded-md px-2 py-1 font-body text-xs text-mist transition-colors hover:text-[#EF4444]"
                    aria-label={messages.delete.confirmButton}
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
                }
              />
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {messages.delete.confirmTitle}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {messages.delete.confirmDescription}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>
                    {messages.delete.cancelButton}
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-[#EF4444] text-white hover:bg-[#EF4444]/80"
                  >
                    {messages.delete.confirmButton}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      )}
    </div>
  );
}
