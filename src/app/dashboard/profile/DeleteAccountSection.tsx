"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteAccount } from "./actions";
import { messages } from "./messages";

const DELETE_ACCOUNT_CONFIRMATION = "delete-account";

export function DeleteAccountSection() {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDeleteAccount() {
    setIsDeleting(true);

    const result = await deleteAccount({
      confirmation: DELETE_ACCOUNT_CONFIRMATION,
    });

    if (result.error) {
      setIsDeleting(false);
      toast.error(messages.toast.accountDeletedError);
      return;
    }

    toast.success(messages.toast.accountDeletedSuccess);
    router.replace("/?accountDeleted=1");
  }

  return (
    <section className="mt-8 border-t border-foam pt-6">
      <h2 className="font-heading text-h2 text-navy">
        {messages.danger.title}
      </h2>
      <p className="mt-2 text-small text-slate">
        {messages.danger.description}
      </p>

      <div className="mt-4 rounded-[var(--radius-card)] border border-coral/30 bg-coral/5 p-4">
        <p className="text-small text-slate">
          {messages.danger.warning}
        </p>

        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button
                type="button"
                className="mt-4 min-h-[44px] bg-[#D14343] px-4 text-white hover:bg-[#D14343]/90"
              >
                {messages.danger.trigger}
              </Button>
            }
          />
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {messages.danger.dialog.title}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {messages.danger.dialog.description}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                {messages.danger.dialog.cancel}
              </AlertDialogCancel>
              <AlertDialogAction
                disabled={isDeleting}
                onClick={handleDeleteAccount}
                className="bg-[#D14343] text-white hover:bg-[#D14343]/90"
              >
                {isDeleting
                  ? messages.danger.dialog.deleting
                  : messages.danger.dialog.confirm}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </section>
  );
}
