"use server";

import { requireAuth } from "@/lib/auth";
import { getVoyageById } from "@/lib/data/voyages";
import {
  insertLogEntry,
  updateLogEntry as updateLogEntryDb,
  deleteLogEntry as deleteLogEntryDb,
  getLogEntryById,
} from "@/lib/data/log-entries";
import type { LogEntry } from "@/lib/data/log-entries";
import { uploadFile, deleteFile } from "@/lib/storage";
import type { ActionResponse } from "@/types";
import type { Voyage } from "@/lib/data/voyages";
import { withLogging } from "@/lib/logging";
import {
  CreateLogEntrySchema,
  UpdateLogEntrySchema,
  DeleteLogEntrySchema,
  DeleteLogPhotoSchema,
  normalizeFormValue,
} from "./validation";
import { messages } from "./messages";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_ORIGINAL_IMAGE_SIZE_BYTES = 18 * 1024 * 1024;
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

function getPhotoUrlsFromEntry(
  photoUrls: LogEntry["photo_urls"],
): string[] {
  return Array.isArray(photoUrls)
    ? photoUrls.filter((url): url is string => typeof url === "string")
    : [];
}

function parsePhotoUrls(
  value: FormDataEntryValue | null,
):
  | { data: string[]; error: null }
  | {
      data: null;
      error: { code: "VALIDATION_ERROR"; message: string };
    } {
  if (value === null) {
    return { data: [], error: null };
  }

  if (typeof value !== "string") {
    return {
      data: null,
      error: {
        code: "VALIDATION_ERROR",
        message: messages.validation.invalidPhotoUrls,
      },
    };
  }

  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed) || !parsed.every((url) => typeof url === "string")) {
      return {
        data: null,
        error: {
          code: "VALIDATION_ERROR",
          message: messages.validation.invalidPhotoUrls,
        },
      };
    }

    return { data: parsed, error: null };
  } catch {
    return {
      data: null,
      error: {
        code: "VALIDATION_ERROR",
        message: messages.validation.invalidPhotoUrls,
      },
    };
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

const _createLogEntry = async (
  formData: FormData,
): Promise<ActionResponse<LogEntry>> => {
  const authResult = await requireAuth();
  if (authResult.error) {
    return { data: null, error: authResult.error };
  }

  const parsedPhotoUrls = parsePhotoUrls(formData.get("photoUrls"));
  if (parsedPhotoUrls.error) {
    return { data: null, error: parsedPhotoUrls.error };
  }

  const raw = {
    voyageId: normalizeFormValue(formData.get("voyageId")),
    entryDate: normalizeFormValue(formData.get("entryDate")),
    text: normalizeFormValue(formData.get("text")),
    legId: formData.get("legId") ? normalizeFormValue(formData.get("legId")) : null,
    stopoverId: formData.get("stopoverId")
      ? normalizeFormValue(formData.get("stopoverId"))
      : null,
    photoUrls: parsedPhotoUrls.data,
  };

  const parsed = CreateLogEntrySchema.safeParse(raw);
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

  const { data, error } = await insertLogEntry({
    voyage_id: parsed.data.voyageId,
    entry_date: parsed.data.entryDate,
    text: parsed.data.text,
    leg_id: parsed.data.legId,
    stopover_id: parsed.data.stopoverId,
    photo_urls: parsed.data.photoUrls,
  });

  if (error) {
    return {
      data: null,
      error: { code: "EXTERNAL_SERVICE_ERROR", message: error.message },
    };
  }

  return { data, error: null };
};
export const createLogEntry = withLogging("createLogEntry", _createLogEntry);

const _updateLogEntry = async (
  formData: FormData,
): Promise<ActionResponse<LogEntry>> => {
  const authResult = await requireAuth();
  if (authResult.error) {
    return { data: null, error: authResult.error };
  }

  const parsedPhotoUrls = parsePhotoUrls(formData.get("photoUrls"));
  if (parsedPhotoUrls.error) {
    return { data: null, error: parsedPhotoUrls.error };
  }

  const raw = {
    id: normalizeFormValue(formData.get("id")),
    voyageId: normalizeFormValue(formData.get("voyageId")),
    entryDate: normalizeFormValue(formData.get("entryDate")),
    text: normalizeFormValue(formData.get("text")),
    legId: formData.get("legId") ? normalizeFormValue(formData.get("legId")) : null,
    stopoverId: formData.get("stopoverId")
      ? normalizeFormValue(formData.get("stopoverId"))
      : null,
    photoUrls: parsedPhotoUrls.data,
  };

  const parsed = UpdateLogEntrySchema.safeParse(raw);
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

  const { data: existingEntry, error: existingEntryError } =
    await getLogEntryById(parsed.data.id);
  if (existingEntryError) {
    return {
      data: null,
      error: { code: "NOT_FOUND", message: "Log entry not found" },
    };
  }

  if (!existingEntry || existingEntry.voyage_id !== parsed.data.voyageId) {
    return {
      data: null,
      error: { code: "NOT_FOUND", message: "Log entry not found" },
    };
  }

  const currentPhotoUrls = getPhotoUrlsFromEntry(existingEntry.photo_urls);
  const removedPhotoUrls = currentPhotoUrls.filter(
    (url) => !parsed.data.photoUrls.includes(url),
  );

  const { data, error } = await updateLogEntryDb(parsed.data.id, {
    entry_date: parsed.data.entryDate,
    text: parsed.data.text,
    leg_id: parsed.data.legId,
    stopover_id: parsed.data.stopoverId,
    photo_urls: parsed.data.photoUrls,
  });

  if (error) {
    return {
      data: null,
      error: { code: "EXTERNAL_SERVICE_ERROR", message: error.message },
    };
  }

  if (removedPhotoUrls.length > 0) {
    const storagePaths = removedPhotoUrls
      .map((url) => getStoragePathFromPublicUrl(url, "log-photos"))
      .filter((path): path is string => path !== null);

    if (storagePaths.length > 0) {
      const deleteResult = await deleteFile("log-photos", storagePaths);
      if (deleteResult.error) {
        await updateLogEntryDb(parsed.data.id, {
          photo_urls: currentPhotoUrls,
        });

        return { data: null, error: deleteResult.error };
      }
    }
  }

  return { data, error: null };
};
export const updateLogEntry = withLogging("updateLogEntry", _updateLogEntry);

const _deleteLogEntry = async (input: {
  id: string;
  voyageId: string;
}): Promise<ActionResponse<null>> => {
  const authResult = await requireAuth();
  if (authResult.error) {
    return { data: null, error: authResult.error };
  }

  const parsed = DeleteLogEntrySchema.safeParse(input);
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

  const { data: entry, error: entryError } = await getLogEntryById(parsed.data.id);
  if (entryError) {
    return {
      data: null,
      error: { code: "NOT_FOUND", message: "Log entry not found" },
    };
  }

  if (!entry || entry.voyage_id !== parsed.data.voyageId) {
    return {
      data: null,
      error: { code: "NOT_FOUND", message: "Log entry not found" },
    };
  }

  if (entry) {
    const photoUrls = getPhotoUrlsFromEntry(entry.photo_urls);
    if (photoUrls.length > 0) {
      const storagePaths = photoUrls
        .map((url) => getStoragePathFromPublicUrl(url, "log-photos"))
        .filter((p): p is string => p !== null);

      if (storagePaths.length > 0) {
        const deleteResult = await deleteFile("log-photos", storagePaths);
        if (deleteResult.error) {
          return { data: null, error: deleteResult.error };
        }
      }
    }
  }

  const { error } = await deleteLogEntryDb(parsed.data.id);

  if (error) {
    return {
      data: null,
      error: { code: "EXTERNAL_SERVICE_ERROR", message: error.message },
    };
  }

  return { data: null, error: null };
};
export const deleteLogEntry = withLogging("deleteLogEntry", _deleteLogEntry);

const _deleteLogPhoto = async (input: {
  voyageId: string;
  url: string;
  entryId?: string;
}): Promise<ActionResponse<{ photoUrls: string[] | null }>> => {
  const authResult = await requireAuth();
  if (authResult.error) {
    return { data: null, error: authResult.error };
  }

  const parsed = DeleteLogPhotoSchema.safeParse(input);
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

  const storagePath = getStoragePathFromPublicUrl(parsed.data.url, "log-photos");
  if (!storagePath) {
    return {
      data: null,
      error: {
        code: "VALIDATION_ERROR",
        message: messages.validation.invalidPhotoUrl,
      },
    };
  }

  if (parsed.data.entryId) {
    const { data: entry, error: entryError } = await getLogEntryById(parsed.data.entryId);
    if (entryError) {
      return {
        data: null,
        error: { code: "NOT_FOUND", message: "Log entry not found" },
      };
    }

    if (!entry || entry.voyage_id !== parsed.data.voyageId) {
      return {
        data: null,
        error: { code: "NOT_FOUND", message: "Log entry not found" },
      };
    }

    const currentPhotoUrls = getPhotoUrlsFromEntry(entry.photo_urls);
    if (!currentPhotoUrls.includes(parsed.data.url)) {
      return {
        data: null,
        error: {
          code: "VALIDATION_ERROR",
          message: messages.validation.invalidPhotoUrl,
        },
      };
    }

    const nextPhotoUrls = currentPhotoUrls.filter((url) => url !== parsed.data.url);

    const { error: updateError } = await updateLogEntryDb(parsed.data.entryId, {
      photo_urls: nextPhotoUrls,
    });
    if (updateError) {
      return {
        data: null,
        error: {
          code: "EXTERNAL_SERVICE_ERROR",
          message: updateError.message,
        },
      };
    }

    const deleteResult = await deleteFile("log-photos", [storagePath]);
    if (deleteResult.error) {
      await updateLogEntryDb(parsed.data.entryId, {
        photo_urls: currentPhotoUrls,
      });

      return { data: null, error: deleteResult.error };
    }

    return { data: { photoUrls: nextPhotoUrls }, error: null };
  }

  const deleteResult = await deleteFile("log-photos", [storagePath]);
  if (deleteResult.error) {
    return { data: null, error: deleteResult.error };
  }

  return { data: { photoUrls: null }, error: null };
};
export const deleteLogPhoto = withLogging("deleteLogPhoto", _deleteLogPhoto);

const _uploadLogPhoto = async (
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
      error: {
        code: "VALIDATION_ERROR",
        message: messages.validation.invalidVoyageId,
      },
    };
  }

  if (!file || !(file instanceof File) || file.size === 0) {
    return {
      data: null,
      error: {
        code: "VALIDATION_ERROR",
        message: messages.validation.noFileProvided,
      },
    };
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      data: null,
      error: {
        code: "VALIDATION_ERROR",
        message: messages.validation.invalidFileType,
      },
    };
  }

  if (file.size > MAX_ORIGINAL_IMAGE_SIZE_BYTES) {
    return {
      data: null,
      error: {
        code: "VALIDATION_ERROR",
        message: messages.validation.fileTooLarge,
      },
    };
  }

  const ownership = await verifyOwnership(voyageId, authResult.data.id);
  if (ownership.error) {
    return { data: null, error: ownership.error };
  }

  const ext = file.type.split("/")[1] === "jpeg" ? "jpg" : file.type.split("/")[1];
  const storagePath = `${authResult.data.id}/${voyageId}/logs/${Date.now()}.${ext}`;

  const uploadResult = await uploadFile("log-photos", storagePath, file, {
    contentType: file.type,
    upsert: false,
  });

  if (uploadResult.error) {
    return { data: null, error: uploadResult.error };
  }

  return { data: { url: uploadResult.data.publicUrl }, error: null };
};
export const uploadLogPhoto = withLogging("uploadLogPhoto", _uploadLogPhoto);
