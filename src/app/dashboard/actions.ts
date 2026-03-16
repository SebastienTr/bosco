"use server";

import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import {
  insertVoyage,
  checkSlugAvailability,
} from "@/lib/data/voyages";
import { generateSlug } from "@/lib/utils/slug";
import type { ActionResponse } from "@/types";
import type { Voyage } from "@/lib/data/voyages";

const DUPLICATE_SLUG_MESSAGE = "This slug is already used by another voyage";

const CreateVoyageSchema = z.object({
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

export async function createVoyage(
  formData: FormData,
): Promise<ActionResponse<Voyage>> {
  const authResult = await requireAuth();
  if (authResult.error) {
    return { data: null, error: authResult.error };
  }

  const raw: Record<string, unknown> = {
    name: normalizeFormValue(formData.get("name")),
    description: normalizeFormValue(formData.get("description")),
    slug: normalizeFormValue(formData.get("slug")),
  };

  // Auto-generate slug from name if not provided
  if (!raw.slug || (typeof raw.slug === "string" && raw.slug.trim() === "")) {
    raw.slug = generateSlug(String(raw.name));
  }

  const parsed = CreateVoyageSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      data: null,
      error: {
        code: "VALIDATION_ERROR",
        message: parsed.error.issues[0].message,
      },
    };
  }

  // Check slug uniqueness for this user
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
        message: DUPLICATE_SLUG_MESSAGE,
      },
    };
  }

  const { data, error } = await insertVoyage({
    user_id: authResult.data.id,
    name: parsed.data.name,
    description: parsed.data.description || null,
    slug: parsed.data.slug,
  });

  if (error) {
    if (error.code === "23505") {
      return {
        data: null,
        error: {
          code: "VALIDATION_ERROR",
          message: DUPLICATE_SLUG_MESSAGE,
        },
      };
    }

    return {
      data: null,
      error: { code: "EXTERNAL_SERVICE_ERROR", message: error.message },
    };
  }

  return { data, error: null };
}
