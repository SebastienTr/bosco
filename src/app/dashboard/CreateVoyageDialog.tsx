"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { generateSlug } from "@/lib/utils/slug";
import { createVoyage } from "./actions";
import { messages } from "./messages";

interface CreateVoyageDialogProps {
  trigger: React.ReactNode;
}

export function CreateVoyageDialog({ trigger }: CreateVoyageDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugEdited) {
      setSlug(generateSlug(value));
    }
  }

  function handleSlugChange(value: string) {
    setSlugEdited(true);
    setSlug(value);
  }

  function resetForm() {
    setName("");
    setDescription("");
    setSlug("");
    setSlugEdited(false);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData();
    formData.set("name", name);
    formData.set("description", description);
    formData.set("slug", slug);

    const result = await createVoyage(formData);

    setIsSubmitting(false);

    if (result.error) {
      if (result.error.message.includes("slug")) {
        setError(result.error.message);
      } else {
        toast.error(result.error.message);
      }
      return;
    }

    toast.success(messages.createDialog.successToast);
    setOpen(false);
    resetForm();
    router.push(`/voyage/${result.data.id}`);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) resetForm();
      }}
    >
      <DialogTrigger render={<span />}>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-h2 text-navy">
            {messages.createDialog.title}
          </DialogTitle>
          <DialogDescription>
            {messages.createDialog.description}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="voyage-name" className="text-small font-semibold text-slate">
              {messages.createDialog.nameLabel}
              <span className="ml-1 text-coral">*</span>
            </Label>
            <Input
              id="voyage-name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder={messages.createDialog.namePlaceholder}
              required
              maxLength={100}
              className="min-h-[44px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="voyage-description" className="text-small font-semibold text-slate">
              {messages.createDialog.descriptionLabel}
            </Label>
            <Textarea
              id="voyage-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={messages.createDialog.descriptionPlaceholder}
              maxLength={500}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="voyage-slug" className="text-small font-semibold text-slate">
              {messages.createDialog.slugLabel}
            </Label>
            <Input
              id="voyage-slug"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder={messages.createDialog.slugPlaceholder}
              className="min-h-[44px]"
            />
            <p className="text-tiny text-mist">
              {messages.createDialog.slugHint}
            </p>
            {error ? (
              <p className="text-small text-error">{error}</p>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              className="min-h-[44px] text-navy"
            >
              {messages.createDialog.cancel}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="min-h-[44px] bg-coral text-white hover:bg-coral/90"
            >
              {isSubmitting
                ? messages.createDialog.creating
                : messages.createDialog.submit}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
