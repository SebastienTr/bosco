import { z } from "zod";
import { messages } from "./messages";

export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 20;
export const MAX_ORIGINAL_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

const USERNAME_PATTERN = /^[a-z][a-z0-9-]*$/;

const OptionalTextField = (max: number, tooLongMessage: string) =>
  z.string().trim().max(max, tooLongMessage).optional().or(z.literal(""));

export const UsernameSchema = z
  .string()
  .trim()
  .min(1, messages.validation.usernameRequired)
  .min(USERNAME_MIN_LENGTH, messages.validation.usernameTooShort)
  .max(USERNAME_MAX_LENGTH, messages.validation.usernameTooLong)
  .regex(USERNAME_PATTERN, messages.validation.invalidFormat);

export const ProfileSchema = z.object({
  username: UsernameSchema,
  boat_name: OptionalTextField(100, messages.validation.boatNameTooLong),
  boat_type: OptionalTextField(100, messages.validation.boatTypeTooLong),
  bio: OptionalTextField(500, messages.validation.bioTooLong),
});

export function normalizeFormValue(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value : "";
}

export function getUsernameValidationError(value: string): string | null {
  const result = UsernameSchema.safeParse(value);
  return result.success ? null : result.error.issues[0]?.message ?? null;
}
