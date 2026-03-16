"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import type { ActionResponse } from "@/types";
import { signIn, signOut } from "@/lib/auth";

const EmailSchema = z.object({
  email: z.email("Please enter a valid email address"),
});

export async function sendMagicLink(
  formData: FormData,
): Promise<ActionResponse<{ email: string }>> {
  const parsed = EmailSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return {
      data: null,
      error: {
        code: "VALIDATION_ERROR",
        message: parsed.error.issues[0].message,
      },
    };
  }

  return signIn(parsed.data.email);
}

export async function signOutAction(): Promise<never> {
  await signOut();
  redirect("/");
}
