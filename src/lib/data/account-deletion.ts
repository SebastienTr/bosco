import type { ActionResponse } from "@/types";
import { deleteFilesRecursively } from "@/lib/storage";
import { createAdminClient } from "@/lib/supabase/admin";

const ACCOUNT_STORAGE_BUCKETS = [
  "avatars",
  "voyage-covers",
  "log-photos",
] as const;

function getAccountDeletionAdminClient() {
  try {
    return {
      client: createAdminClient(),
      error: null,
    } as const;
  } catch (error) {
    return {
      client: null,
      error: {
        code: "EXTERNAL_SERVICE_ERROR" as const,
        message:
          error instanceof Error
            ? error.message
            : "Missing Supabase admin configuration",
      },
    } as const;
  }
}

export async function validateAccountDeletionSetup(): Promise<
  ActionResponse<{ ready: true }>
> {
  const adminClientResult = getAccountDeletionAdminClient();

  if (adminClientResult.error) {
    return {
      data: null,
      error: adminClientResult.error,
    };
  }

  return {
    data: { ready: true },
    error: null,
  };
}

export async function disableAccountProfile(
  userId: string,
): Promise<ActionResponse<{ disabledAt: string }>> {
  const adminClientResult = getAccountDeletionAdminClient();

  if (adminClientResult.error) {
    return {
      data: null,
      error: adminClientResult.error,
    };
  }

  const disabledAt = new Date().toISOString();
  const { error } = await adminClientResult.client
    .from("profiles")
    .update({
      disabled_at: disabledAt,
      updated_at: disabledAt,
    })
    .eq("id", userId);

  if (error) {
    return {
      data: null,
      error: {
        code: "EXTERNAL_SERVICE_ERROR",
        message: error.message,
      },
    };
  }

  return {
    data: { disabledAt },
    error: null,
  };
}

export async function deleteAccountData(
  userId: string,
): Promise<ActionResponse<{ success: true }>> {
  const adminClientResult = getAccountDeletionAdminClient();

  if (adminClientResult.error) {
    return {
      data: null,
      error: adminClientResult.error,
    };
  }

  const adminClient = adminClientResult.client;

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
