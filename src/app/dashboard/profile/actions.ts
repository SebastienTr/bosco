"use server";

import type { ActionResponse } from "@/types";
import { requireAuth, signOut } from "@/lib/auth";
import {
  checkUsernameAvailability,
  disableProfile,
  updateProfile,
} from "@/lib/data/profiles";
import { deleteAccountData } from "@/lib/data/account-deletion";
import { uploadFile } from "@/lib/storage";
import { messages } from "./messages";
import {
  MAX_ORIGINAL_IMAGE_SIZE_BYTES,
  ProfileSchema,
  UsernameSchema,
  normalizeFormValue,
} from "./validation";
import { withLogging } from "@/lib/logging";

const DELETE_ACCOUNT_CONFIRMATION = "delete-account";

const _checkUsername = async (
  formData: FormData,
): Promise<ActionResponse<{ available: boolean }>> => {
  const username = normalizeFormValue(formData.get("username"));
  const result = UsernameSchema.safeParse(username);

  if (!result.success) {
    return {
      data: null,
      error: { code: "VALIDATION_ERROR", message: result.error.issues[0].message },
    };
  }

  const auth = await requireAuth();
  if (auth.error) {
    return { data: null, error: auth.error };
  }

  const available = await checkUsernameAvailability(result.data, auth.data.id);
  if (available.error) {
    return { data: null, error: available.error };
  }

  return { data: { available: available.data }, error: null };
};
export const checkUsername = withLogging("checkUsername", _checkUsername);

const _saveProfile = async (
  formData: FormData,
): Promise<ActionResponse<{ username: string }>> => {
  const auth = await requireAuth();
  if (auth.error) {
    return { data: null, error: auth.error };
  }

  const raw = {
    username: normalizeFormValue(formData.get("username")),
    boat_name: normalizeFormValue(formData.get("boat_name")),
    boat_type: normalizeFormValue(formData.get("boat_type")),
    bio: normalizeFormValue(formData.get("bio")),
  };

  const result = ProfileSchema.safeParse(raw);

  if (!result.success) {
    return {
      data: null,
      error: { code: "VALIDATION_ERROR", message: result.error.issues[0].message },
    };
  }

  // Check username availability before saving
  const available = await checkUsernameAvailability(result.data.username, auth.data.id);
  if (available.error) {
    return { data: null, error: available.error };
  }

  if (!available.data) {
    return {
      data: null,
      error: { code: "VALIDATION_ERROR", message: messages.fields.username.taken },
    };
  }

  const { data, error } = await updateProfile(auth.data.id, {
    username: result.data.username,
    boat_name: result.data.boat_name || null,
    boat_type: result.data.boat_type || null,
    bio: result.data.bio || null,
  });

  if (error) {
    if (error.code === "23505") {
      return {
        data: null,
        error: { code: "VALIDATION_ERROR", message: messages.fields.username.taken },
      };
    }

    return {
      data: null,
      error: { code: "EXTERNAL_SERVICE_ERROR", message: error.message },
    };
  }

  return { data: { username: data.username ?? result.data.username }, error: null };
};
export const saveProfile = withLogging("saveProfile", _saveProfile);

const _uploadPhoto = async (
  formData: FormData,
): Promise<ActionResponse<{ url: string }>> => {
  const auth = await requireAuth();
  if (auth.error) {
    return { data: null, error: auth.error };
  }

  const file = formData.get("file") as File | null;
  const field = formData.get("field") as string | null;

  if (!file || !(file instanceof File)) {
    return {
      data: null,
      error: { code: "VALIDATION_ERROR", message: messages.validation.noFileProvided },
    };
  }

  if (!field || !["profile_photo_url", "boat_photo_url"].includes(field)) {
    return {
      data: null,
      error: { code: "VALIDATION_ERROR", message: messages.validation.invalidPhotoField },
    };
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return {
      data: null,
      error: { code: "VALIDATION_ERROR", message: "Only JPEG, PNG, and WebP images are accepted" },
    };
  }

  if (file.size > MAX_ORIGINAL_IMAGE_SIZE_BYTES) {
    return {
      data: null,
      error: { code: "VALIDATION_ERROR", message: messages.validation.imageTooLarge },
    };
  }

  const ext = file.type.split("/")[1] === "jpeg" ? "jpg" : file.type.split("/")[1];
  const fileName = field === "profile_photo_url" ? `profile.${ext}` : `boat.${ext}`;
  const path = `${auth.data.id}/${fileName}`;

  const uploadResult = await uploadFile("avatars", path, file, {
    contentType: file.type,
    upsert: true,
  });

  if (uploadResult.error) {
    return { data: null, error: uploadResult.error };
  }

  // Update profile with new photo URL
  const { error } = await updateProfile(auth.data.id, {
    [field]: uploadResult.data.publicUrl,
  });

  if (error) {
    return {
      data: null,
      error: { code: "EXTERNAL_SERVICE_ERROR", message: error.message },
    };
  }

  return { data: { url: uploadResult.data.publicUrl }, error: null };
};
export const uploadPhoto = withLogging("uploadPhoto", _uploadPhoto);

const _deleteAccount = async (input: {
  confirmation: string;
}): Promise<ActionResponse<{ success: true }>> => {
  const auth = await requireAuth();
  if (auth.error) {
    return { data: null, error: auth.error };
  }

  if (input.confirmation !== DELETE_ACCOUNT_CONFIRMATION) {
    return {
      data: null,
      error: {
        code: "VALIDATION_ERROR",
        message: messages.danger.validationConfirmation,
      },
    };
  }

  const disableResult = await disableProfile(auth.data.id);
  if (disableResult.error) {
    return { data: null, error: disableResult.error };
  }

  const signOutResult = await signOut();
  if (signOutResult.error) {
    console.warn(
      `deleteAccount signOut failed for ${auth.data.id}: ${signOutResult.error.message}`,
    );
  }

  const deletionResult = await deleteAccountData(auth.data.id);
  if (deletionResult.error) {
    return { data: null, error: deletionResult.error };
  }

  return { data: { success: true }, error: null };
};
export const deleteAccount = withLogging("deleteAccount", _deleteAccount);
