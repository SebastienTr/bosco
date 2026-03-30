"use server";

import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import {
  getVoyageById,
  updateVoyage as updateVoyageDb,
  deleteVoyage as deleteVoyageDb,
  checkSlugAvailability,
} from "@/lib/data/voyages";
import { uploadFile, deleteFile } from "@/lib/storage";
import type { ActionResponse } from "@/types";
import type { Voyage } from "@/lib/data/voyages";
import { withLogging } from "@/lib/logging";
import { messages } from "./messages";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_ORIGINAL_IMAGE_SIZE_BYTES = 18 * 1024 * 1024;

const UpdateVoyageSchema = z.object({
  voyageId: z.string().regex(UUID_REGEX, "Invalid voyage ID"),
  name: z
    .string()
    .trim()
    .min(1, "Voyage name is required")
    .max(100, "Name must be under 100 characters"),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  slug: z
    .string()
    .trim()
    .min(3, "Slug must be at least 3 characters")
    .max(100, "Slug must be under 100 characters")
    .regex(
      /^[a-z0-9][a-z0-9-]*[a-z0-9]$/,
      "Slug must start and end with a letter or number, and contain only lowercase letters, numbers, and hyphens",
    ),
});

function normalizeFormValue(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

function getStoragePathFromPublicUrl(
  publicUrl: string,
  bucket: string,
): string | null {
  try {
    const { pathname } = new URL(publicUrl);
    const bucketMarker = `/${bucket}/`;
    const bucketIndex = pathname.indexOf(bucketMarker);

    if (bucketIndex === -1) {
      return null;
    }

    return decodeURIComponent(pathname.slice(bucketIndex + bucketMarker.length));
  } catch {
    return null;
  }
}

async function verifyOwnership(
  voyageId: string,
  userId: string,
): Promise<
  | { voyage: Voyage; error: null }
  | { voyage: null; error: { code: "FORBIDDEN" | "NOT_FOUND"; message: string } }
> {
  const { data: voyage, error } = await getVoyageById(voyageId);

  if (error) {
    return {
      voyage: null,
      error: { code: "NOT_FOUND", message: "Voyage not found" },
    };
  }

  if (!voyage || voyage.user_id !== userId) {
    return {
      voyage: null,
      error: { code: "FORBIDDEN", message: "You do not own this voyage" },
    };
  }

  return { voyage, error: null };
}

const _updateVoyage = async (
  formData: FormData,
): Promise<ActionResponse<Voyage>> => {
  const authResult = await requireAuth();
  if (authResult.error) {
    return { data: null, error: authResult.error };
  }

  const raw = {
    voyageId: normalizeFormValue(formData.get("voyageId")),
    name: normalizeFormValue(formData.get("name")),
    description: normalizeFormValue(formData.get("description")),
    slug: normalizeFormValue(formData.get("slug")),
  };

  const parsed = UpdateVoyageSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      data: null,
      error: {
        code: "VALIDATION_ERROR",
        message: parsed.error.issues[0].message,
      },
    };
  }

  const ownership = await verifyOwnership(
    parsed.data.voyageId,
    authResult.data.id,
  );
  if (ownership.error) {
    return { data: null, error: ownership.error };
  }

  // Check slug uniqueness if slug changed
  if (parsed.data.slug !== ownership.voyage.slug) {
    const available = await checkSlugAvailability(
      authResult.data.id,
      parsed.data.slug,
    );
    if (available.error) {
      return { data: null, error: available.error };
    }
    if (!available.data) {
      return {
        data: null,
        error: {
          code: "VALIDATION_ERROR",
          message: "This slug is already used by another voyage",
        },
      };
    }
  }

  const { data, error } = await updateVoyageDb(parsed.data.voyageId, {
    name: parsed.data.name,
    description: parsed.data.description || null,
    slug: parsed.data.slug,
  });

  if (error) {
    return {
      data: null,
      error: { code: "EXTERNAL_SERVICE_ERROR", message: error.message },
    };
  }

  return { data, error: null };
};
export const updateVoyage = withLogging("updateVoyage", _updateVoyage);

const _deleteVoyage = async (input: {
  voyageId: string;
}): Promise<ActionResponse<{ success: true }>> => {
  const authResult = await requireAuth();
  if (authResult.error) {
    return { data: null, error: authResult.error };
  }

  if (!UUID_REGEX.test(input.voyageId)) {
    return {
      data: null,
      error: { code: "VALIDATION_ERROR", message: "Invalid voyage ID" },
    };
  }

  const ownership = await verifyOwnership(input.voyageId, authResult.data.id);
  if (ownership.error) {
    return { data: null, error: ownership.error };
  }

  // Delete cover image from storage if it exists
  if (ownership.voyage.cover_image_url) {
    const storagePath = getStoragePathFromPublicUrl(
      ownership.voyage.cover_image_url,
      "voyage-covers",
    );

    if (storagePath) {
      await deleteFile("voyage-covers", [storagePath]);
    }
  }

  const { error } = await deleteVoyageDb(input.voyageId);

  if (error) {
    return {
      data: null,
      error: { code: "EXTERNAL_SERVICE_ERROR", message: error.message },
    };
  }

  return { data: { success: true }, error: null };
};
export const deleteVoyage = withLogging("deleteVoyage", _deleteVoyage);

const _toggleVisibility = async (input: {
  voyageId: string;
  isPublic: boolean;
}): Promise<ActionResponse<Voyage>> => {
  const authResult = await requireAuth();
  if (authResult.error) {
    return { data: null, error: authResult.error };
  }

  if (!UUID_REGEX.test(input.voyageId)) {
    return {
      data: null,
      error: { code: "VALIDATION_ERROR", message: "Invalid voyage ID" },
    };
  }

  const ownership = await verifyOwnership(input.voyageId, authResult.data.id);
  if (ownership.error) {
    return { data: null, error: ownership.error };
  }

  const { data, error } = await updateVoyageDb(input.voyageId, {
    is_public: input.isPublic,
  });

  if (error) {
    return {
      data: null,
      error: { code: "EXTERNAL_SERVICE_ERROR", message: error.message },
    };
  }

  return { data, error: null };
};
export const toggleVisibility = withLogging("toggleVisibility", _toggleVisibility);

const _uploadCoverImage = async (
  formData: FormData,
): Promise<ActionResponse<{ url: string }>> => {
  const authResult = await requireAuth();
  if (authResult.error) {
    return { data: null, error: authResult.error };
  }

  const voyageId = normalizeFormValue(formData.get("voyageId"));
  const file = formData.get("file");

  if (!UUID_REGEX.test(voyageId)) {
    return {
      data: null,
      error: { code: "VALIDATION_ERROR", message: "Invalid voyage ID" },
    };
  }

  if (!file || !(file instanceof File) || file.size === 0) {
    return {
      data: null,
      error: {
        code: "VALIDATION_ERROR",
        message: messages.cover.noFileError,
      },
    };
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      data: null,
      error: {
        code: "VALIDATION_ERROR",
        message: messages.cover.invalidTypeError,
      },
    };
  }

  if (file.size > MAX_ORIGINAL_IMAGE_SIZE_BYTES) {
    return {
      data: null,
      error: {
        code: "VALIDATION_ERROR",
        message: messages.cover.tooLargeError,
      },
    };
  }

  const ownership = await verifyOwnership(voyageId, authResult.data.id);
  if (ownership.error) {
    return { data: null, error: ownership.error };
  }

  const ext = file.type.split("/")[1] === "jpeg" ? "jpg" : file.type.split("/")[1];
  const storagePath = `${authResult.data.id}/${voyageId}/cover.${ext}`;

  const uploadResult = await uploadFile("voyage-covers", storagePath, file, {
    contentType: file.type,
    upsert: true,
  });

  if (uploadResult.error) {
    return { data: null, error: uploadResult.error };
  }

  const { error } = await updateVoyageDb(voyageId, {
    cover_image_url: uploadResult.data.publicUrl,
  });

  if (error) {
    return {
      data: null,
      error: { code: "EXTERNAL_SERVICE_ERROR", message: error.message },
    };
  }

  return { data: { url: uploadResult.data.publicUrl }, error: null };
};
export const uploadCoverImage = withLogging("uploadCoverImage", _uploadCoverImage);
