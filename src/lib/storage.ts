"use server";

import type { ActionResponse } from "@/types";
import { createClient } from "@/lib/supabase/server";

type StorageListEntry = {
  id: string | null;
  name: string;
};

type StorageBucketClient = {
  getPublicUrl: (path: string) => { data: { publicUrl: string } };
  list: (
    path?: string,
    options?: { limit?: number },
  ) => Promise<{ data: StorageListEntry[] | null; error: { message: string } | null }>;
  remove: (
    paths: string[],
  ) => Promise<{ data: unknown; error: { message: string } | null }>;
  upload: (
    path: string,
    file: File | Blob,
    options: {
      cacheControl: string;
      contentType?: string;
      upsert: boolean;
    },
  ) => Promise<{ data: { path: string } | null; error: { message: string } | null }>;
};

type StorageClientLike = {
  storage: {
    from: (bucket: string) => StorageBucketClient;
  };
};

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

function isFolderEntry(entry: StorageListEntry) {
  return entry.id === null;
}

async function collectStoragePaths(
  bucketClient: StorageBucketClient,
  prefix: string,
): Promise<ActionResponse<string[]>> {
  const { data, error } = await bucketClient.list(prefix, {
    limit: 100,
  });

  if (error) {
    return {
      data: null,
      error: {
        code: "EXTERNAL_SERVICE_ERROR",
        message: error.message,
      },
    };
  }

  const collectedPaths: string[] = [];

  for (const entry of data ?? []) {
    const nextPath = prefix ? `${prefix}/${entry.name}` : entry.name;

    if (isFolderEntry(entry)) {
      const nestedPaths = await collectStoragePaths(bucketClient, nextPath);
      if (nestedPaths.error) {
        return nestedPaths;
      }
      collectedPaths.push(...nestedPaths.data);
      continue;
    }

    collectedPaths.push(nextPath);
  }

  return {
    data: collectedPaths,
    error: null,
  };
}

export async function deleteFilesRecursively(
  bucket: string,
  prefix: string,
  options?: {
    batchSize?: number;
    client?: StorageClientLike;
  },
): Promise<ActionResponse<{ deletedPaths: string[] }>> {
  const supabase = options?.client ?? await createClient();
  const bucketClient = supabase.storage.from(bucket);
  const collectedPaths = await collectStoragePaths(bucketClient, prefix);

  if (collectedPaths.error) {
    return { data: null, error: collectedPaths.error };
  }

  if (collectedPaths.data.length === 0) {
    return {
      data: { deletedPaths: [] },
      error: null,
    };
  }

  const batchSize = options?.batchSize ?? 100;

  for (let index = 0; index < collectedPaths.data.length; index += batchSize) {
    const batch = collectedPaths.data.slice(index, index + batchSize);
    const { error } = await bucketClient.remove(batch);

    if (error) {
      return {
        data: null,
        error: {
          code: "EXTERNAL_SERVICE_ERROR",
          message: error.message,
        },
      };
    }
  }

  return {
    data: { deletedPaths: collectedPaths.data },
    error: null,
  };
}
