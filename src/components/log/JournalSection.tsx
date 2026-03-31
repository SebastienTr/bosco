"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { LogEntry } from "@/lib/data/log-entries";
import type { Leg } from "@/lib/data/legs";
import type { Stopover } from "@/lib/data/stopovers";
import { LogEntryCard } from "./LogEntryCard";
import { LogEntryForm } from "./LogEntryForm";
import { deleteLogEntry } from "@/app/voyage/[id]/log/actions";
import { messages } from "@/app/voyage/[id]/log/messages";

interface JournalSectionProps {
  entries: LogEntry[];
  legs: Leg[];
  stopovers: Stopover[];
  voyageId: string;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onPhotoTap?: (photoId: string) => void;
}

export function JournalSection({
  entries,
  legs,
  stopovers,
  voyageId,
  isOpen,
  onToggle,
  onClose,
  onPhotoTap,
}: JournalSectionProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<LogEntry | undefined>(
    undefined,
  );

  function getLegLabel(legId: string | null): string | null {
    if (!legId) return null;
    const index = legs.findIndex((l) => l.id === legId);
    if (index < 0) return null;
    const from = stopovers[index]?.name;
    const to = stopovers[index + 1]?.name;
    if (from && to) return `${from} → ${to}`;
    if (from) return `${from} → …`;
    if (to) return `… → ${to}`;
    return `Leg ${index + 1}`;
  }

  function getStopoverName(stopoverId: string | null): string | null {
    if (!stopoverId) return null;
    const s = stopovers.find((s) => s.id === stopoverId);
    return s?.name || null;
  }

  function handleEdit(entry: LogEntry) {
    setEditingEntry(entry);
    setShowForm(true);
  }

  async function handleDelete(entry: LogEntry) {
    const result = await deleteLogEntry({ id: entry.id, voyageId });
    if (result.error) {
      toast.error(messages.toast.deleteError);
      return;
    }
    toast.success(messages.toast.deleted);
    router.refresh();
  }

  function handleCloseForm() {
    setShowForm(false);
    setEditingEntry(undefined);
  }

  function handleAddNew() {
    setEditingEntry(undefined);
    setShowForm(true);
  }

  return (
    <>
      {/* Toggle button — positioned bottom-right */}
      <button
        onClick={() => {
          if (isOpen && showForm) return;

          if (!isOpen && entries.length === 0) {
            handleAddNew();
          }

          onToggle();
        }}
        className="absolute bottom-10 right-3 z-[500] flex min-h-[44px] items-center gap-1 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-navy shadow-card transition-colors hover:bg-foam"
        aria-label="Toggle journal"
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
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
        </svg>
        {entries.length > 0
          ? messages.journal.toggle(entries.length)
          : messages.journal.addEntry}
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="absolute bottom-[5.5rem] right-3 z-[500] flex w-80 max-w-[calc(100vw-24px)] max-h-[calc(100dvh-160px)] flex-col rounded-lg bg-white shadow-overlay">
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b px-3 py-2">
            <h2 className="font-heading text-sm font-semibold text-navy">
              {messages.journal.title}
            </h2>
            <div className="flex items-center gap-1">
              {!showForm && (
                <button
                  onClick={handleAddNew}
                  className="rounded px-2 py-1 text-xs font-semibold text-ocean hover:bg-ocean/10"
                >
                  {messages.journal.addEntry}
                </button>
              )}
              <button
                onClick={() => {
                  handleCloseForm();
                  onClose();
                }}
                className="rounded p-1 text-mist hover:text-navy"
                aria-label="Close journal"
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
          </div>

          {/* Content */}
          <div className="min-h-0 flex-1 overflow-y-auto">
            {showForm ? (
              <LogEntryForm
                voyageId={voyageId}
                legs={legs}
                stopovers={stopovers}
                existingEntry={editingEntry}
                onClose={handleCloseForm}
              />
            ) : (
              <div className="space-y-3 p-3">
                {entries.map((entry) => (
                  <LogEntryCard
                    key={entry.id}
                    entry={entry}
                    stopoverName={getStopoverName(entry.stopover_id)}
                    legLabel={getLegLabel(entry.leg_id)}
                    onEdit={() => handleEdit(entry)}
                    onDelete={() => handleDelete(entry)}
                    onPhotoTap={onPhotoTap}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
