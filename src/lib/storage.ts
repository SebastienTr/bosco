"use server";

import type { ActionResponse } from "@/types";
import { createClient } from "@/lib/supabase/server";

export async function uploadFile(
  bucket: string,
  path: string,
  file: File | Blob,
  options?: { contentType?: string; upsert?: boolean },
): Promise<ActionResponse<{ path: string; publicUrl: string }>> {
  const supabase = await createClient();

  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    contentType: options?.contentType,
    upsert: options?.upsert ?? true,
  });

  if (error) {
    return {
      data: null,
      error: { code: "EXTERNAL_SERVICE_ERROR", message: error.message },
    };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(data.path);

  return { data: { path: data.path, publicUrl }, error: null };
}

export async function getPublicUrl(bucket: string, path: string): Promise<string> {
  const supabase = await createClient();
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(path);
  return publicUrl;
}

export async function deleteFile(
  bucket: string,
  paths: string[],
): Promise<ActionResponse<null>> {
  const supabase = await createClient();

  const { error } = await supabase.storage.from(bucket).remove(paths);

  if (error) {
    return {
      data: null,
      error: { code: "EXTERNAL_SERVICE_ERROR", message: error.message },
    };
  }

  return { data: null, error: null };
}
