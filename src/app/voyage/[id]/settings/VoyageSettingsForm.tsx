"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import type { Voyage } from "@/lib/data/voyages";
import { generateSlug } from "@/lib/utils/slug";
import { validateImageFile, compressImage } from "@/lib/utils/image";
import {
  updateVoyage,
  deleteVoyage,
  toggleVisibility,
  uploadCoverImage,
} from "./actions";
import { messages } from "./messages";

interface VoyageSettingsFormProps {
  voyage: Voyage;
  username: string | null;
}

export function VoyageSettingsForm({ voyage, username }: VoyageSettingsFormProps) {
  const router = useRouter();
  const [name, setName] = useState(voyage.name);
  const [description, setDescription] = useState(voyage.description ?? "");
  const [slug, setSlug] = useState(voyage.slug);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPublic, setIsPublic] = useState(voyage.is_public);
  const [togglingVisibility, setTogglingVisibility] = useState(false);
  const [coverUrl, setCoverUrl] = useState(voyage.cover_image_url ?? "");
  const [uploadingCover, setUploadingCover] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSlugError(null);
    setIsSubmitting(true);

    const formData = new FormData();
    formData.set("voyageId", voyage.id);
    formData.set("name", name);
    formData.set("description", description);
    formData.set("slug", slug);

    const result = await updateVoyage(formData);

    setIsSubmitting(false);

    if (result.error) {
      if (result.error.message.includes("slug")) {
        setSlugError(result.error.message);
      } else {
        toast.error(result.error.message);
      }
      return;
    }

    toast.success(messages.details.savedToast);
    router.refresh();
  }

  async function handleToggleVisibility(checked: boolean) {
    setTogglingVisibility(true);
    setIsPublic(checked);

    const result = await toggleVisibility({
      voyageId: voyage.id,
      isPublic: checked,
    });

    setTogglingVisibility(false);

    if (result.error) {
      setIsPublic(!checked);
      toast.error(result.error.message);
      return;
    }

    toast.success(
      checked
        ? messages.visibility.publicToast
        : messages.visibility.privateToast,
    );
  }

  async function handleCoverUpload(file: File) {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    setUploadingCover(true);

    try {
      const compressed = await compressImage(file);
      const formData = new FormData();
      formData.set("voyageId", voyage.id);
      formData.set("file", compressed);

      const result = await uploadCoverImage(formData);

      if (result.error) {
        toast.error(messages.cover.errorToast);
        return;
      }

      setCoverUrl(result.data.url);
      toast.success(messages.cover.uploadedToast);
    } catch {
      toast.error(messages.cover.errorToast);
    } finally {
      setUploadingCover(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);

    const result = await deleteVoyage({ voyageId: voyage.id });

    if (result.error) {
      setIsDeleting(false);
      toast.error(messages.danger.deleteErrorToast);
      return;
    }

    toast.success(messages.danger.deletedToast);
    router.push("/dashboard");
  }

  function handleNameChange(value: string) {
    setName(value);
    // Auto-update slug if it was derived from the original name
    if (slug === generateSlug(voyage.name) || slug === generateSlug(name)) {
      setSlug(generateSlug(value));
    }
  }

  return (
    <div className="mt-8 space-y-10">
      {/* Section 1: Voyage Details */}
      <section>
        <h2 className="font-heading text-h2 text-navy">
          {messages.details.title}
        </h2>
        <form onSubmit={handleSave} className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="settings-name"
              className="text-small font-semibold text-slate"
            >
              {messages.details.nameLabel}
              <span className="ml-1 text-coral">*</span>
            </Label>
            <Input
              id="settings-name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder={messages.details.namePlaceholder}
              required
              maxLength={100}
              className="min-h-[44px]"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="settings-description"
              className="text-small font-semibold text-slate"
            >
              {messages.details.descriptionLabel}
            </Label>
            <Textarea
              id="settings-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={messages.details.descriptionPlaceholder}
              maxLength={500}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="settings-slug"
              className="text-small font-semibold text-slate"
            >
              {messages.details.slugLabel}
            </Label>
            <Input
              id="settings-slug"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugError(null);
              }}
              placeholder={messages.details.slugPlaceholder}
              className="min-h-[44px]"
            />
            <p className="text-tiny text-mist">{messages.details.slugHint}</p>
            {slugError ? (
              <p className="text-small text-error">{slugError}</p>
            ) : null}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className="min-h-[44px] bg-coral text-white hover:bg-coral/90"
          >
            {isSubmitting ? messages.details.saving : messages.details.save}
          </Button>
        </form>
      </section>

      {/* Section 2: Visibility */}
      <section>
        <h2 className="font-heading text-h2 text-navy">
          {messages.visibility.title}
        </h2>
        <div className="mt-4 flex items-center justify-between rounded-xl border border-navy/10 p-4">
          <div>
            <p className="text-body font-semibold text-navy">
              {messages.visibility.label}
            </p>
            <p className="text-small text-mist">
              {messages.visibility.description}
            </p>
          </div>
          <Switch
            checked={isPublic}
            onCheckedChange={handleToggleVisibility}
            disabled={togglingVisibility}
            className="data-checked:bg-success"
          />
        </div>

        {isPublic && username && (
          <div className="mt-3">
            <p className="mb-1 text-small font-semibold text-slate">
              {messages.visibility.publicLinkLabel}
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 truncate rounded-lg border border-navy/10 bg-foam px-3 py-2 text-small text-navy">
                {`${typeof window !== "undefined" ? window.location.origin : ""}/${username}/${slug}`}
              </code>
              <Button
                type="button"
                variant="outline"
                className="min-h-[44px] shrink-0 border-navy/20 text-small"
                onClick={async () => {
                  const url = `${window.location.origin}/${username}/${slug}`;
                  await navigator.clipboard.writeText(url);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
              >
                {copied ? (
                  <span className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                    {messages.visibility.copied}
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                    {messages.visibility.copy}
                  </span>
                )}
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* Section 3: Cover Image */}
      <section>
        <h2 className="font-heading text-h2 text-navy">
          {messages.cover.title}
        </h2>
        <p className="mt-1 text-small text-mist">
          {messages.cover.description}
        </p>
        <div className="mt-4">
          {coverUrl ? (
            <div className="space-y-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coverUrl}
                alt={messages.cover.previewAlt}
                className="h-40 w-full rounded-xl object-cover"
              />
            </div>
          ) : null}
          <label className="mt-3 inline-block cursor-pointer">
            <input
              type="file"
              className="hidden"
              accept="image/jpeg,image/png,image/webp"
              disabled={uploadingCover}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleCoverUpload(file);
              }}
            />
            <span className="inline-flex min-h-[44px] items-center rounded-[var(--radius-button)] border border-navy/20 px-4 py-2 text-small font-semibold text-navy transition-colors hover:bg-foam">
              {uploadingCover
                ? messages.cover.uploading
                : coverUrl
                  ? messages.cover.change
                  : messages.cover.upload}
            </span>
          </label>
        </div>
      </section>

      {/* Section 4: Danger Zone */}
      <section className="rounded-xl border border-error/30 p-6">
        <h2 className="font-heading text-h2 text-error">
          {messages.danger.title}
        </h2>
        <div className="mt-4">
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button
                  variant="destructive"
                  className="min-h-[44px] bg-error text-white hover:bg-error/90"
                  disabled={isDeleting}
                />
              }
            >
              {messages.danger.deleteButton}
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {messages.danger.confirmTitle}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {messages.danger.confirmDescription}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{messages.danger.cancelButton}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-error text-white hover:bg-error/90"
                >
                  {messages.danger.confirmButton}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </section>
    </div>
  );
}
