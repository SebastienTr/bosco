import type { ActionResponse } from "@/types";
import { deleteFilesRecursively } from "@/lib/storage";
import { createAdminClient } from "@/lib/supabase/admin";

const ACCOUNT_STORAGE_BUCKETS = [
  "avatars",
  "voyage-covers",
  "log-photos",
] as const;

export async function deleteAccountData(
  userId: string,
): Promise<ActionResponse<{ success: true }>> {
  let adminClient: ReturnType<typeof createAdminClient>;

  try {
    adminClient = createAdminClient();
  } catch (error) {
    return {
      data: null,
      error: {
        code: "EXTERNAL_SERVICE_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "Missing Supabase admin configuration",
      },
    };
  }

  for (const bucket of ACCOUNT_STORAGE_BUCKETS) {
    const cleanupResult = await deleteFilesRecursively(bucket, userId, {
      client: adminClient,
    });

    if (cleanupResult.error) {
      return { data: null, error: cleanupResult.error };
    }
  }

  const { error } = await adminClient.auth.admin.deleteUser(userId);

  if (error) {
    return {
      data: null,
      error: {
        code: "EXTERNAL_SERVICE_ERROR",
        message: error.message,
      },
    };
  }

  return { data: { success: true }, error: null };
}
