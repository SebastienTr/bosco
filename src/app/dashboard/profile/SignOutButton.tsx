"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/app/auth/actions";
import { messages } from "./messages";

export function SignOutButton() {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      className="w-full text-slate"
      disabled={pending}
      onClick={() => startTransition(() => signOutAction())}
    >
      {messages.actions.signOut}
    </Button>
  );
}
