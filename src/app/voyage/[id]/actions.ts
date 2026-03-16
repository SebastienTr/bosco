"use server";

import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { deleteLeg as deleteLegDb } from "@/lib/data/legs";
import type { ActionResponse } from "@/types";

const DeleteLegSchema = z.object({
  legId: z.string().uuid(),
});

export async function deleteLeg(
  input: z.input<typeof DeleteLegSchema>,
): Promise<ActionResponse<null>> {
  const authResult = await requireAuth();
  if (authResult.error) return { data: null, error: authResult.error };

  const parsed = DeleteLegSchema.safeParse(input);
  if (!parsed.success) {
    return {
      data: null,
      error: {
        code: "VALIDATION_ERROR",
        message: parsed.error.issues[0].message,
      },
    };
  }

  const { error } = await deleteLegDb(parsed.data.legId);
  if (error) {
    return {
      data: null,
      error: { code: "EXTERNAL_SERVICE_ERROR", message: error.message },
    };
  }

  return { data: null, error: null };
}
