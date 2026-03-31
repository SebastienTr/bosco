"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { validateImageFile, compressImage } from "@/lib/utils/image";
import { showActionError } from "@/lib/toast-helpers";
import type { LogEntry } from "@/lib/data/log-entries";
import {
  createLogEntry,
  deleteLogPhoto,
  updateLogEntry,
  uploadLogPhoto,
} from "@/app/voyage/[id]/log/actions";
import { messages } from "@/app/voyage/[id]/log/messages";

interface LogEntryFormProps {
  voyageId: string;
  legs: { id: string; sort_order?: number; started_at: string | null }[];
  stopovers: { id: string; name: string | null }[];
  existingEntry?: LogEntry;
  onClose: () => void;
}

export function LogEntryForm({
  voyageId,
  legs,
  stopovers,
  existingEntry,
  onClose,
}: LogEntryFormProps) {
  const router = useRouter();
  const isEditMode = !!existingEntry;

  const [entryDate, setEntryDate] = useState(
    existingEntry?.entry_date ?? new Date().toISOString().split("T")[0],
  );
  const [text, setText] = useState(existingEntry?.text ?? "");
  const [legId, setLegId] = useState(existingEntry?.leg_id ?? "");
  const [stopoverId, setStopoverId] = useState(
    existingEntry?.stopover_id ?? "",
  );
  const [photoUrls, setPhotoUrls] = useState<string[]>(
    () => (existingEntry?.photo_urls as string[] | undefined) ?? [],
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [removingPhotoUrl, setRemovingPhotoUrl] = useState<string | null>(null);

  // Validation state
  const [textError, setTextError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);

  function validateText(value: string) {
    if (!value.trim()) {
      setTextError(messages.form.textRequired);
      return false;
    }
    setTextError(null);
    return true;
  }

  function validateDate(value: string) {
    if (!value) {
      setDateError(messages.form.dateRequired);
      return false;
    }

    const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const isValidDate =
      isoDateRegex.test(value) &&
      !Number.isNaN(new Date(`${value}T00:00:00.000Z`).getTime()) &&
      new Date(`${value}T00:00:00.000Z`).toISOString().startsWith(value);

    if (!isValidDate) {
      setDateError(messages.validation.invalidDate);
      return false;
    }
    setDateError(null);
    return true;
  }

  async function handlePhotoUpload(files: FileList) {
    setIsUploading(true);

    for (const file of Array.from(files)) {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        toast.error(
          validation.error.includes("type")
            ? messages.validation.invalidFileType
            : messages.validation.fileTooLarge,
          { duration: Infinity },
        );
        continue;
      }

      try {
        const compressed = await compressImage(file, { maxSizeMB: 1 });
        const formData = new FormData();
        formData.set("voyageId", voyageId);
        formData.set("file", compressed);

        const result = await uploadLogPhoto(formData);

        if (result.error) {
          showActionError(result.error, { message: messages.toast.photoError });
          continue;
        }

        setPhotoUrls((prev) => [...prev, result.data.url]);
        toast.success(messages.toast.photoUploaded);
      } catch {
        toast.error(messages.toast.photoError, { duration: Infinity });
      }
    }

    setIsUploading(false);
  }

  async function handleRemovePhoto(urlToRemove: string) {
    setRemovingPhotoUrl(urlToRemove);

    const result = await deleteLogPhoto({
      voyageId,
      url: urlToRemove,
      ...(existingEntry ? { entryId: existingEntry.id } : {}),
    });

    setRemovingPhotoUrl(null);

    if (result.error) {
      showActionError(result.error, { message: messages.toast.photoDeleteError });
      return;
    }

    setPhotoUrls((prev) =>
      result.data?.photoUrls ?? prev.filter((url) => url !== urlToRemove),
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const isTextValid = validateText(text);
    const isDateValid = validateDate(entryDate);
    if (!isTextValid || !isDateValid) return;

    setIsSubmitting(true);

    const formData = new FormData();
    formData.set("voyageId", voyageId);
    formData.set("entryDate", entryDate);
    formData.set("text", text);
    formData.set("photoUrls", JSON.stringify(photoUrls));
    if (legId) formData.set("legId", legId);
    if (stopoverId) formData.set("stopoverId", stopoverId);

    if (isEditMode && existingEntry) {
      formData.set("id", existingEntry.id);
      const result = await updateLogEntry(formData);
      setIsSubmitting(false);

      if (result.error) {
        showActionError(result.error, { message: messages.toast.updateError });
        return;
      }

      toast.success(messages.toast.updated);
    } else {
      const result = await createLogEntry(formData);
      setIsSubmitting(false);

      if (result.error) {
        showActionError(result.error, { message: messages.toast.createError });
        return;
      }

      toast.success(messages.toast.created);
    }

    router.refresh();
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      {/* Date */}
      <div className="space-y-1">
        <Label
          htmlFor="entryDate"
          className="font-body text-[13px] font-semibold text-slate"
        >
          {messages.form.dateLabel}
        </Label>
        <input
          id="entryDate"
          type="date"
          value={entryDate}
          onChange={(e) => {
            setEntryDate(e.target.value);
            validateDate(e.target.value);
          }}
          onBlur={() => validateDate(entryDate)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 font-body text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean focus-visible:ring-offset-2"
          required
        />
        {dateError && (
          <p className="font-body text-xs text-[#EF4444]">{dateError}</p>
        )}
      </div>

      {/* Text */}
      <div className="space-y-1">
        <Label
          htmlFor="entryText"
          className="font-body text-[13px] font-semibold text-slate"
        >
          {messages.form.textLabel}
        </Label>
        <Textarea
          id="entryText"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (textError) validateText(e.target.value);
          }}
          onBlur={() => validateText(text)}
          placeholder={messages.form.textPlaceholder}
          rows={4}
          className="font-body"
          required
        />
        {textError && (
          <p className="font-body text-xs text-[#EF4444]">{textError}</p>
        )}
      </div>

      {/* Leg dropdown */}
      {legs.length > 0 && (
        <div className="space-y-1">
          <Label
            htmlFor="legId"
            className="font-body text-[13px] font-semibold text-slate"
          >
            {messages.form.legLabel}
          </Label>
          <select
            id="legId"
            value={legId}
            onChange={(e) => setLegId(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 font-body text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean focus-visible:ring-offset-2"
          >
            <option value="">{messages.form.legNone}</option>
            {legs.map((leg, index) => {
              const from = stopovers[index]?.name;
              const to = stopovers[index + 1]?.name;
              const label =
                from && to
                  ? `${from} → ${to}`
                  : from
                    ? `${from} → …`
                    : to
                      ? `… → ${to}`
                      : `Leg ${index + 1}`;
              return (
                <option key={leg.id} value={leg.id}>
                  {label}
                </option>
              );
            })}
          </select>
        </div>
      )}

      {/* Stopover dropdown */}
      {stopovers.length > 0 && (
        <div className="space-y-1">
          <Label
            htmlFor="stopoverId"
            className="font-body text-[13px] font-semibold text-slate"
          >
            {messages.form.stopoverLabel}
          </Label>
          <select
            id="stopoverId"
            value={stopoverId}
            onChange={(e) => setStopoverId(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 font-body text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean focus-visible:ring-offset-2"
          >
            <option value="">{messages.form.stopoverNone}</option>
            {stopovers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name || "Unnamed"}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Photos */}
      <div className="space-y-1">
        <Label className="font-body text-[13px] font-semibold text-slate">
          {messages.form.photosLabel}
        </Label>

        {photoUrls.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {photoUrls.map((url) => (
              <div key={url} className="group relative">
                <Image
                  src={url}
                  alt=""
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded-md object-cover"
                />
                <button
                  type="button"
                  onClick={() => void handleRemovePhoto(url)}
                  disabled={removingPhotoUrl === url || isSubmitting}
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#EF4444] text-white opacity-0 transition-opacity group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-100"
                  aria-label="Remove photo"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
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
            ))}
          </div>
        )}

        <label className="cursor-pointer">
          <input
            type="file"
            className="hidden"
            accept="image/jpeg,image/png,image/webp"
            multiple
            disabled={isUploading}
            onChange={(e) => {
              const files = e.target.files;
              if (files && files.length > 0) {
                handlePhotoUpload(files);
              }
              e.target.value = "";
            }}
          />
          <span className="inline-flex min-h-[44px] items-center rounded-md border border-navy/20 px-4 py-2 font-body text-sm text-navy transition-colors hover:bg-foam">
            {isUploading ? "Uploading..." : messages.form.addPhoto}
          </span>
        </label>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          disabled={isSubmitting || isUploading || removingPhotoUrl !== null}
          className="bg-coral font-semibold text-white hover:bg-coral/80"
        >
          {isSubmitting ? messages.form.submitting : messages.form.submit}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          disabled={isSubmitting}
          className="text-navy"
        >
          {messages.form.cancel}
        </Button>
      </div>
    </form>
  );
}
