import { createClient } from "@/lib/supabase/server";
import type { ActionResponse } from "@/types";
import type { Tables, TablesUpdate } from "@/types/supabase";

export type Profile = Tables<"profiles">;
export type PublicProfile = Tables<"public_profiles">;
export type ProfileUpdate = Omit<
  TablesUpdate<"profiles">,
  "created_at" | "id" | "updated_at" | "is_admin" | "disabled_at"
>;

export async function getProfileByUserId(userId: Profile["id"]) {
  const supabase = await createClient();

  return supabase.from("profiles").select("*").eq("id", userId).single();
}

export async function getPublicProfileByUsername(username: string) {
  const supabase = await createClient();

  return supabase
    .from("public_profiles")
    .select("*")
    .eq("username", username)
    .single();
}

export async function checkUsernameAvailability(
  username: string,
  excludeUserId?: string,
): Promise<ActionResponse<boolean>> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("check_pseudo_availability", {
    input_pseudo: username,
    exclude_user_id: excludeUserId,
  });

  if (error) {
    return {
      data: null,
      error: { code: "EXTERNAL_SERVICE_ERROR", message: error.message },
    };
  }

  if (typeof data !== "boolean") {
    return {
      data: null,
      error: {
        code: "EXTERNAL_SERVICE_ERROR",
        message: "Invalid username availability response",
      },
    };
  }

  return { data, error: null };
}

export async function updateProfile(userId: Profile["id"], data: ProfileUpdate) {
  const supabase = await createClient();
  const updateData: TablesUpdate<"profiles"> = {
    ...data,
    updated_at: new Date().toISOString(),
  };

  return supabase
    .from("profiles")
    .update(updateData)
    .eq("id", userId)
    .select()
    .single();
}

export async function disableProfile(
  userId: Profile["id"],
): Promise<ActionResponse<{ disabledAt: string }>> {
  const supabase = await createClient();
  const disabledAt = new Date().toISOString();

  const { error } = await supabase
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
