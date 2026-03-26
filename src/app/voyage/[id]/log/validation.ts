import { z } from "zod";
import { messages } from "./messages";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function isValidEntryDate(value: string): boolean {
  if (!ISO_DATE_REGEX.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

const EntryDateSchema = z
  .string()
  .refine(isValidEntryDate, messages.validation.invalidDate);

export const CreateLogEntrySchema = z.object({
  voyageId: z.string().regex(UUID_REGEX, messages.validation.invalidVoyageId),
  entryDate: EntryDateSchema,
  text: z
    .string()
    .trim()
    .min(1, messages.validation.textRequired)
    .max(10000, messages.validation.textTooLong),
  legId: z.string().regex(UUID_REGEX).nullable(),
  stopoverId: z.string().regex(UUID_REGEX).nullable(),
  photoUrls: z.array(z.string()).default([]),
});

export const UpdateLogEntrySchema = z.object({
  id: z.string().regex(UUID_REGEX, messages.validation.invalidEntryId),
  voyageId: z.string().regex(UUID_REGEX, messages.validation.invalidVoyageId),
  entryDate: EntryDateSchema,
  text: z
    .string()
    .trim()
    .min(1, messages.validation.textRequired)
    .max(10000, messages.validation.textTooLong),
  legId: z.string().regex(UUID_REGEX).nullable(),
  stopoverId: z.string().regex(UUID_REGEX).nullable(),
  photoUrls: z.array(z.string()).default([]),
});

export const DeleteLogEntrySchema = z.object({
  id: z.string().regex(UUID_REGEX, messages.validation.invalidEntryId),
  voyageId: z.string().regex(UUID_REGEX, messages.validation.invalidVoyageId),
});

export const DeleteLogPhotoSchema = z.object({
  voyageId: z.string().regex(UUID_REGEX, messages.validation.invalidVoyageId),
  entryId: z
    .string()
    .regex(UUID_REGEX, messages.validation.invalidEntryId)
    .optional(),
  url: z.string().url(messages.validation.invalidPhotoUrl),
});

export function normalizeFormValue(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}
